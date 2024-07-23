import { describe, it } from "@std/testing/bdd";
import { assertSpyCall, spy } from "@std/testing/mock";
import { assertObjectMatch } from "@std/assert";
import { GistPostSyncer } from "./gist-posts-syncer.ts";
import { GistSyncClient } from "../gist/gist-sync-client.ts";
import { PostRepository } from "./post-repository.ts";
import { Gist } from "../gist/model/gist.ts";
import { generateRandomString } from "../test-support/random-generator.ts";

describe("GistPostsSyncer", () => {
  describe("when no blog gists are found", () => {
    const updatedGists = [
      // this should be excluded because it has no tags and no title
      new Gist({ id: generateRandomString(32) } as Gist),
      // this should be excluded because it has no title
      new Gist({
        id: generateRandomString(32),
        description: "No title #blog",
      } as Gist),
      // this should be excluded because it does not have the blog tag
      new Gist({
        id: generateRandomString(32),
        description: "[title] #some #tag",
      } as Gist),
      // this should be excluded because it does not have a valid markdown file
      new Gist({
        id: generateRandomString(32),
        description: "[title] #some #blog",
        files: {
          "file-name.md": {
            type: "not-markdown",
            raw_url: `https://gist.githubusercontent.com/username/${
              generateRandomString(
                32,
              )
            }/raw/${generateRandomString(40)}/file-name.md`,
          },
        },
      } as unknown as Gist),
    ];
    const gistSyncClient = {
      listUpdatedGists: () => Promise.resolve(updatedGists),
      updateLastSyncTime: () => Promise.resolve(),
    } as unknown as GistSyncClient;

    const updateLastSyncTimeSpy = spy(gistSyncClient, "updateLastSyncTime");

    const postRepository = {} as unknown as PostRepository;

    it("should update the last sync time", async () => {
      const syncer = new GistPostSyncer(gistSyncClient, postRepository);
      await syncer.sync();

      assertSpyCall(updateLastSyncTimeSpy, 0, { args: [updatedGists] });
    });
  });

  describe("when valid blog gists are found", () => {
    const updatedGists = [
      new Gist({
        id: generateRandomString(32),
        description: "[title] #blog",
        created_at: new Date(0),
        updated_at: new Date(24 * 60 * 60 * 1000),
        public: true,
        html_url: `https://gist.github.com/username/${
          generateRandomString(
            32,
          )
        }`,
        files: {
          "file-name.md": {
            type: "text/markdown",
            raw_url: `https://gist.githubusercontent.com/username/${
              generateRandomString(
                32,
              )
            }/raw/${generateRandomString(40)}/file-name.md`,
          },
        },
      } as unknown as Gist),
    ];
    const gistSyncClient = {
      listUpdatedGists: () => Promise.resolve(updatedGists),
      updateLastSyncTime: () => Promise.resolve(),
    } as unknown as GistSyncClient;

    describe("when no other posts with the same title exist", () => {
      const postRepository = {
        getSlugCounter: () => Promise.resolve(undefined),
        getPost: () => Promise.resolve(undefined), // no existing post with the same gist id
        savePost: () => Promise.resolve(),
      } as unknown as PostRepository;
      const savePostSpy = spy(postRepository, "savePost");

      it("should save the post with slug_counter=0", async () => {
        const syncer = new GistPostSyncer(gistSyncClient, postRepository);
        await syncer.sync();

        assertObjectMatch(savePostSpy.calls[0].args[0], {
          slug: "title",
          slugCounter: 0,
        });
      });
    });

    describe("when another post with the same title exists", () => {
      const postRepository = {
        getSlugCounter: () => Promise.resolve(0),
        getPost: () => Promise.resolve(undefined), // no existing post with the same gist id
        savePost: () => Promise.resolve(),
      } as unknown as PostRepository;
      const savePostSpy = spy(postRepository, "savePost");

      it("should save the post with slug_counter=1", async () => {
        const syncer = new GistPostSyncer(gistSyncClient, postRepository);
        await syncer.sync();

        assertObjectMatch(savePostSpy.calls[0].args[0], {
          slug: "title",
          slugCounter: 1,
        });
      });
    });

    describe("when the same post gets updated", () => {
      const postRepository = {
        getSlugCounter: () => Promise.resolve(10),
        getPost: () => Promise.resolve({ slugCounter: 5 }),
        savePost: () => Promise.resolve(),
      } as unknown as PostRepository;
      const savePostSpy = spy(postRepository, "savePost");

      it("should save the post with slug_counter=5", async () => {
        const syncer = new GistPostSyncer(gistSyncClient, postRepository);
        await syncer.sync();

        assertObjectMatch(savePostSpy.calls[0].args[0], {
          slug: "title",
          slugCounter: 5,
        });
      });
    });
  });
});
