import { describe, it } from "@std/testing/bdd";
import { GistPostSyncer } from "./gist-posts-syncer.ts";
import type { GistPostsRepository } from "./gist-posts-repository.ts";
import type { GistSyncClient } from "./gist-sync-client.ts";
import { GistPost } from "./model/gist-post.ts";
import { Gist, GistData } from "./model/gist.ts";
import { assertSpyCall, spy } from "@std/testing/mock";

describe("GistPostSyncer", () => {
  describe("when no updated gists are found", () => {
    const gistPostsSyncer = new GistPostSyncer(
      {
        listUpdatedGists: () => Promise.resolve([]),
      } as unknown as GistSyncClient, // calling a method on this object will throw an error
      {} as unknown as GistPostsRepository, // calling a method on this object will throw an error
    );
    it("should not update the database", async () => {
      await gistPostsSyncer.sync();
    });
  });

  describe("when no GistPosts are found", () => {
    const gists = [
      new Gist({
        description: "[Title] #note",
      } as GistData),
    ];
    const gistSyncClient = {
      listUpdatedGists: () => Promise.resolve(gists),
      updateLastSyncTime: (_gists: Gist[]) => Promise.resolve(),
    } as unknown as GistSyncClient;

    const updateLastSyncTimeSpy = spy(gistSyncClient, "updateLastSyncTime");

    const gistPostsSyncer = new GistPostSyncer(
      gistSyncClient,
      {} as unknown as GistPostsRepository, // calling a method on this object will throw an error
    );

    it("should update the last sync time but should not modify the database", async () => {
      await gistPostsSyncer.sync();

      assertSpyCall(updateLastSyncTimeSpy, 0, {
        args: [gists],
      });
    });
  });

  describe("when GistPosts are found", () => {
    const gists = [
      new Gist({
        description: "[Title] #blog",
      } as GistData),
    ];
    const gistSyncClient = {
      listUpdatedGists: () => Promise.resolve(gists),
      updateLastSyncTime: (_gists: Gist[]) => Promise.resolve(),
    } as unknown as GistSyncClient;
    const updateLastSyncTimeSpy = spy(gistSyncClient, "updateLastSyncTime");

    const gistPostsRepository = {
      saveGist: (_gist: GistPost) => Promise.resolve(),
    } as GistPostsRepository;
    const saveGistSpy = spy(gistPostsRepository, "saveGist");

    const gistPostsSyncer = new GistPostSyncer(
      gistSyncClient,
      gistPostsRepository,
    );

    it("should update the last sync time and store the gist in the database", async () => {
      await gistPostsSyncer.sync();

      assertSpyCall(updateLastSyncTimeSpy, 0, {
        args: [gists],
      });

      assertSpyCall(saveGistSpy, 0, {
        args: [gists[0]],
      });
    });
  });
});
