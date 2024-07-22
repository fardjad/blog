import { GistPostsRepository } from "./gist-posts-repository.ts";
import { GistSyncClient } from "./gist-sync-client.ts";

/**
 * Synchronizes the blog post gists with the database.
 */
export interface GistPostSyncer {
  sync(): Promise<void>;
}

export class GistPostSyncer implements GistPostSyncer {
  constructor(
    private readonly gistSyncClient: GistSyncClient,
    private readonly gistPostRepository: GistPostsRepository,
  ) {}

  async sync(): Promise<void> {
    const updatedGists = await this.gistSyncClient.listUpdatedGists();
    if (updatedGists.length === 0) {
      return;
    }

    const gistPosts = updatedGists.filter((gist) => gist.tags.has("blog"));

    for (const gistPost of gistPosts) {
      await this.gistPostRepository.saveGist(gistPost);
    }

    await this.gistSyncClient.updateLastSyncTime(updatedGists);
  }
}
