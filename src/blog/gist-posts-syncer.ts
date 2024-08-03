import slugify from "@sindresorhus/slugify";
import { PostRepository } from "./post-repository.ts";
import { GistSyncClient } from "../gist/gist-sync-client.ts";
import { Post } from "./model/post.ts";
import { Gist } from "../gist/model/gist.ts";
import { blogTag } from "../config/values.ts";
import { sha256 } from "../hash/sha256.ts";

/**
 * Stores updated gists with blog tag into the database.
 */
export interface GistPostsSyncer {
  sync(): Promise<void>;
}

export class GistPostsSyncer implements GistPostsSyncer {
  constructor(
    private readonly gistSyncClient: GistSyncClient,
    private readonly postRepository: PostRepository,
  ) {}

  async sync(): Promise<void> {
    const updatedGists = await this.gistSyncClient.listUpdatedGists();

    for (const gist of updatedGists) {
      if (gist.title === "") {
        continue;
      }

      if (!gist.tags.has(blogTag)) {
        continue;
      }

      const gistFirstMarkdownUrl = this.getGistFirstMarkdownUrl(gist);
      if (gistFirstMarkdownUrl == null) {
        continue;
      }

      const existingPost = await this.postRepository.getPost(gist.id);
      const slug = slugify(gist.title);
      let slugCounter = 0;
      if (existingPost != null) {
        slugCounter = existingPost.slugCounter;
      } else {
        const currentSlugCounter = await this.postRepository.getSlugCounter(
          slug,
        );
        slugCounter = currentSlugCounter == null ? 0 : currentSlugCounter + 1;
      }

      const content = await this.gistSyncClient.fetchContent(
        gistFirstMarkdownUrl,
      );

      const post = new Post({
        gistId: gist.id,
        htmlUrl: gist.html_url,
        contentUrl: gistFirstMarkdownUrl,
        content,

        title: gist.title,
        description: gist.processedDescription,
        tags: gist.tags,
        createdAt: new Date(gist.created_at),
        updatedAt: new Date(gist.updated_at),
        ownerId: gist.owner?.id ?? 0,
        public: gist.public,

        slug: slug,
        slugCounter,
        contentHash: await sha256(content),
      });

      await this.postRepository.savePost(post);
    }

    await this.gistSyncClient.updateLastSyncTime(updatedGists);
  }

  private getGistFirstMarkdownUrl(gist: Gist) {
    return Object.values(gist.files ?? {}).find(
      (file) => file.type === "text/markdown" && file.raw_url !== undefined,
    )?.raw_url;
  }
}
