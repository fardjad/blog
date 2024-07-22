import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  assertSpyCall,
  resolvesNext,
  Spy,
  spy,
  Stub,
  stub,
} from "@std/testing/mock";
import { Octokit } from "octokit";
import { GistSyncClient } from "./gist-sync-client.ts";
import { GistSyncRepository } from "./gist-sync-repository.ts";
import { Gist } from "./model/gist.ts";

const fakeListForUserReponse = {
  url: "https://api.github.com/users/...",
  status: 200,
  headers: {},
  data: [
    {
      id: "1",
      updated_at: "2000-01-02T00:00:00Z", // newer
    },
    {
      id: "2",
      updated_at: "2000-01-01T00:00:00Z", // older
    },
  ],
} as unknown as Awaited<ReturnType<Octokit["rest"]["gists"]["listForUser"]>>;

describe("GistSyncClient", () => {
  let octokit: Octokit;

  beforeEach(() => {
    octokit = new Octokit({
      throttle: { enabled: false },
      retry: { enabled: false },
    });
  });

  describe("when syncing gists for the first time", () => {
    let octokitStub: Stub<Octokit["rest"]["gists"]>;
    let gistSyncRepository: GistSyncRepository;
    let gistSyncClient: GistSyncClient;

    beforeEach(() => {
      octokitStub = stub(
        octokit.rest.gists,
        "listForUser",
        resolvesNext([fakeListForUserReponse]),
      );

      gistSyncRepository = {
        getLastSyncTime: () => Promise.resolve(new Date(0).toISOString()),
        setLastSyncTime: () => Promise.resolve(),
      };

      gistSyncClient = new GistSyncClient({
        octokit,
        username: "test",
        gistSyncRepository,
      });
    });

    afterEach(() => {
      octokitStub.restore();
    });

    it("should return all gists and update the last sync time", async () => {
      const actual = await gistSyncClient.listUpdatedGists();

      assertSpyCall(octokitStub, 0, {
        args: [
          {
            per_page: 10,
            since: new Date(0).toISOString(),
            username: "test",
          },
        ],
      });

      assertEquals(
        actual.map(({ id }) => id),
        ["1", "2"],
      );
    });
  });

  describe("when the first gist is synchronized before", () => {
    let octokitStub: Stub<Octokit["rest"]["gists"]>;
    let gistSyncRepository: GistSyncRepository;
    let gistSyncClient: GistSyncClient;

    beforeEach(() => {
      octokitStub = stub(
        octokit.rest.gists,
        "listForUser",
        // return the newer gist
        resolvesNext([
          { ...fakeListForUserReponse, data: [fakeListForUserReponse.data[0]] },
        ]),
      );

      gistSyncRepository = {
        // return the update time of the older gist
        getLastSyncTime: () =>
          Promise.resolve(fakeListForUserReponse.data[1].updated_at),
        setLastSyncTime: () => Promise.resolve(),
      };

      gistSyncClient = new GistSyncClient({
        octokit,
        username: "test",
        gistSyncRepository,
      });
    });

    afterEach(() => {
      octokitStub.restore();
    });

    it("should return the newer gist and update the last sync time", async () => {
      const actual = await gistSyncClient.listUpdatedGists();

      assertSpyCall(octokitStub, 0, {
        args: [
          {
            per_page: 10,
            since: fakeListForUserReponse.data[1].updated_at,
            username: "test",
          },
        ],
      });

      assertEquals(
        actual.map(({ id }) => id),
        ["1"],
      );
    });
  });

  describe("when updateLastSyncTime is called", () => {
    let octokitStub: Stub<Octokit["rest"]["gists"]>;
    let gistSyncRepository: GistSyncRepository;
    let gistSyncClient: GistSyncClient;
    let setLastSyncTimeSpy: Spy;

    beforeEach(() => {
      octokitStub = stub(
        octokit.rest.gists,
        "listForUser",
        resolvesNext([fakeListForUserReponse]),
      );

      gistSyncRepository = {
        getLastSyncTime: () => Promise.resolve(new Date(0).toISOString()),
        setLastSyncTime: () => Promise.resolve(),
      };

      setLastSyncTimeSpy = spy(gistSyncRepository, "setLastSyncTime");

      gistSyncClient = new GistSyncClient({
        octokit,
        username: "test",
        gistSyncRepository,
      });
    });

    afterEach(() => {
      setLastSyncTimeSpy.restore();
      octokitStub.restore();
    });

    it("should update the last sync time to the updated time of the newest gist", async () => {
      const gists = fakeListForUserReponse.data.map(
        (gistData) => new Gist(gistData),
      );
      await gistSyncClient.updateLastSyncTime(gists);

      assertSpyCall(setLastSyncTimeSpy, 0, {
        args: [gists[0].updated_at],
      });
    });
  });
});
