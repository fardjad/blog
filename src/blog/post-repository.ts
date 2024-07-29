import type { Client, Transaction } from "@libsql/client";
import { Post } from "./model/post.ts";

export interface PostRepository {
  getPost(gistId: string): Promise<Post | undefined>;
  savePost(post: Post): Promise<void>;
  getSlugCounter(slug: string): Promise<number | undefined>;
  getPostBySlug(slugWithCounter: string): Promise<Post | undefined>;
  listPosts(
    page?: number,
    pageSize?: number,
  ): Promise<{ totalPages: number; posts: Post[] }>;
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
      content: result.rows[0].content as string,

      title: result.rows[0].title as string,
      description: result.rows[0].description as string,
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
            (gist_id, html_url, content_url, content, title, description, tags, created_at, updated_at, owner_id, public, slug, slug_counter)
        VALUES
            (:gist_id, :html_url, :content_url, :content, :title, :description, :tags, :created_at, :updated_at, :owner_id, :public, :slug, :slug_counter)
        ON CONFLICT(gist_id) DO UPDATE SET
            html_url = excluded.html_url,
            content_url = excluded.content_url,
            content = excluded.content,
            title = excluded.title,
            description = excluded.description,
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
        content: post.content,
        title: post.title,
        description: post.description,
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
      content: result.rows[0].content as string,

      title: result.rows[0].title as string,
      description: result.rows[0].description as string,
      tags: new Set(JSON.parse(result.rows[0].tags as string) as string[]),
      createdAt: new Date(result.rows[0].created_at as string),
      updatedAt: new Date(result.rows[0].updated_at as string),
      ownerId: result.rows[0].owner_id as number,
      public: Boolean(result.rows[0].public),
      slug: result.rows[0].slug as string,
      slugCounter: result.rows[0].slug_counter as number,
    });
  }

  async listPosts(page = 0, pageSize = 100) {
    if (pageSize < 1) {
      throw new Error("pageSize must be at least 1");
    }
    if (!Number.isInteger(pageSize)) {
      throw new Error("pageSize must be an integer");
    }

    if (page < 0) {
      throw new Error("page must be at least 0");
    }
    if (!Number.isInteger(page)) {
      throw new Error("page must be an integer");
    }

    const postsCountResultSet = await this.db.execute({
      sql: "SELECT COUNT(*) as count FROM posts;",
      args: [],
    });

    const totalPages = Math.ceil(
      (postsCountResultSet.rows[0].count as number) / pageSize,
    );

    const postsResultSet = await this.db.execute({
      sql: `
        SELECT * FROM posts
        ORDER BY created_at DESC
        LIMIT :pageSize OFFSET :offset
      `,
      args: {
        pageSize,
        offset: page * pageSize,
      },
    });

    const posts = postsResultSet.rows.map((row) => {
      return new Post({
        gistId: row.gist_id as string,
        htmlUrl: row.html_url as string,
        contentUrl: row.content_url as string,
        content: row.content as string,

        title: row.title as string,
        description: row.description as string,
        tags: new Set(JSON.parse(row.tags as string) as string[]),
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        ownerId: row.owner_id as number,
        public: Boolean(row.public),
        slug: row.slug as string,
        slugCounter: row.slug_counter as number,
      });
    });

    return { totalPages, posts };
  }
}
