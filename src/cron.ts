import { GistPostsSyncer } from "./blog/gist-posts-syncer.ts";
import { LibSQLPostRepository } from "./blog/post-repository.ts";
import { githubUsername } from "./config/values.ts";
import { client } from "./database/client.ts";
import { GistSyncClient } from "./gist/gist-sync-client.ts";
import { LibSQLGistSyncRepository } from "./gist/gist-sync-repository.ts";
import { octokit } from "./gist/octokit.ts";

export const syncPosts = async () => {
  const tx = await client.transaction();

  const gistSyncRepository = new LibSQLGistSyncRepository(tx);
  const gistSyncClient = new GistSyncClient({
    gistSyncRepository,
    octokit,
    username: githubUsername,
  });
  const postRepository = new LibSQLPostRepository(tx);

  const syncer = new GistPostsSyncer(gistSyncClient, postRepository);
  try {
    await syncer.sync();
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
};
