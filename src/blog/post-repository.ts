import type { Client, Transaction } from "@libsql/client";
import { Post } from "./model/post.ts";

export interface PostRepository {
  getPost(gistId: string): Promise<Post | undefined>;
  savePost(post: Post): Promise<void>;
  getSlugCounter(slug: string): Promise<number | undefined>;
  getPostBySlug(slugWithCounter: string): Promise<Post | undefined>;
}

export class LibSQLPostRepository implements PostRepository {
  constructor(private db: Client | Transaction) {}

  async getPost(gistId: string) {
    const result = await this.db.execute({
      sql: "SELECT * FROM posts WHERE gist_id = ?",
      args: [gistId],
    });

    if (result.rows.length === 0) {
      return undefined;
    }

    return new Post({
      gistId: result.rows[0].gist_id as string,
      htmlUrl: result.rows[0].html_url as string,
      contentUrl: result.rows[0].content_url as string,

      title: result.rows[0].title as string,
      tags: new Set(JSON.parse(result.rows[0].tags as string) as string[]),
      createdAt: new Date(result.rows[0].created_at as string),
      updatedAt: new Date(result.rows[0].updated_at as string),
      ownerId: result.rows[0].owner_id as number,
      public: Boolean(result.rows[0].public),
      slug: result.rows[0].slug as string,
      slugCounter: result.rows[0].slug_counter as number,
    });
  }

  async savePost(post: Post) {
    await this.db.execute({
      sql: `
        INSERT INTO posts
            (gist_id, html_url, content_url, title, tags, created_at, updated_at, owner_id, public, slug, slug_counter)
        VALUES
            (:gist_id, :html_url, :content_url, :title, :tags, :created_at, :updated_at, :owner_id, :public, :slug, :slug_counter)
        ON CONFLICT(gist_id) DO UPDATE SET
            html_url = excluded.html_url,
            content_url = excluded.content_url,
            title = excluded.title,
            tags = excluded.tags,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            owner_id = excluded.owner_id,
            public = excluded.public,
            slug = excluded.slug,
            slug_counter = excluded.slug_counter;
      `,
      args: {
        gist_id: post.gistId,
        html_url: post.htmlUrl,
        content_url: post.contentUrl,
        title: post.title,
        tags: JSON.stringify(Array.from(post.tags)),
        created_at: post.createdAt.toISOString(),
        updated_at: post.updatedAt.toISOString(),
        owner_id: post.ownerId,
        public: post.public,
        slug: post.slug,
        slug_counter: post.slugCounter,
      },
    });
  }

  async getSlugCounter(slug: string) {
    const result = await this.db.execute({
      sql:
        "SELECT slug_counter FROM posts WHERE slug = ? ORDER BY slug_counter DESC LIMIT 1",
      args: [slug],
    });

    if (result.rows.length === 0) {
      return;
    }

    return result.rows[0].slug_counter as number;
  }

  async getPostBySlug(slugWithCounter: string) {
    const result = await this.db.execute({
      sql: "SELECT * FROM posts WHERE slug_with_counter = ?",
      args: [slugWithCounter],
    });

    if (result.rows.length === 0) {
      return undefined;
    }

    return new Post({
      gistId: result.rows[0].gist_id as string,
      htmlUrl: result.rows[0].html_url as string,
      contentUrl: result.rows[0].content_url as string,

      title: result.rows[0].title as string,
      tags: new Set(JSON.parse(result.rows[0].tags as string) as string[]),
      createdAt: new Date(result.rows[0].created_at as string),
      updatedAt: new Date(result.rows[0].updated_at as string),
      ownerId: result.rows[0].owner_id as number,
      public: Boolean(result.rows[0].public),
      slug: result.rows[0].slug as string,
      slugCounter: result.rows[0].slug_counter as number,
    });
  }
}
