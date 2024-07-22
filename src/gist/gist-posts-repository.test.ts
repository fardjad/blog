import { type Client, createClient } from "npm:@libsql/client/node";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import {
  createMigrationScriptIterator,
  LibSQLMigrator,
} from "@fardjad/libsql-migrator";
import { Gist, type GistData } from "./model/gist.ts";
import { LibSQLGistPostsRepository } from "./gist-posts-repository.ts";
import { assertEquals } from "@std/assert";

const fakeGistData: GistData = {
  url: "https://api.github.com/gists/00000000000000000000000000000000",
  forks_url:
    "https://api.github.com/gists/00000000000000000000000000000000/forks",
  commits_url:
    "https://api.github.com/gists/00000000000000000000000000000000/commits",
  id: "00000000000000000000000000000000",
  node_id: "G_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
  git_pull_url: "https://gist.github.com/00000000000000000000000000000000.git",
  git_push_url: "https://gist.github.com/00000000000000000000000000000000.git",
  html_url: "https://gist.github.com/test/00000000000000000000000000000000",
  files: {
    "my-file-1.md": {
      filename: "my-file-1.md",
      type: "text/markdown",
      language: "Markdown",
      raw_url:
        "https://gist.githubusercontent.com/test/00000000000000000000000000000000/raw/1111111111111111111111111111111111111111/my-file-1.md",
      size: 1234,
    },
    "my-file-2.md": {
      filename: "my-file-2.md",
      type: "text/markdown",
      language: "Markdown",
      raw_url:
        "https://gist.githubusercontent.com/test/00000000000000000000000000000000/raw/1111111111111111111111111111111111111112/my-file-2.md",
      size: 2345,
    },
  },
  public: true,
  created_at: "2024-04-05T15:42:07Z",
  updated_at: "2024-05-29T13:51:49Z",
  description: "my-description",
  comments: 0,
  user: null,
  comments_url:
    "https://api.github.com/gists/00000000000000000000000000000000/comments",
  owner: {
    login: "test",
    id: 222222,
    node_id: "XXXXXXXXXXXXXXXXXXXX",
    avatar_url: "https://avatars.githubusercontent.com/u/222222?v=4",
    gravatar_id: "",
    url: "https://api.github.com/users/test",
    html_url: "https://github.com/test",
    followers_url: "https://api.github.com/users/test/followers",
    following_url: "https://api.github.com/users/test/following{/other_user}",
    gists_url: "https://api.github.com/users/test/gists{/gist_id}",
    starred_url: "https://api.github.com/users/test/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/test/subscriptions",
    organizations_url: "https://api.github.com/users/test/orgs",
    repos_url: "https://api.github.com/users/test/repos",
    events_url: "https://api.github.com/users/test/events{/privacy}",
    received_events_url: "https://api.github.com/users/test/received_events",
    type: "User",
    site_admin: false,
  },
  truncated: false,
};

const gist = new Gist(fakeGistData);

describe("GistPostsRepository", () => {
  let db: Client;

  beforeEach(async () => {
    db = createClient({
      url: ":memory:",
    });
    const migrator = new LibSQLMigrator(
      db,
      createMigrationScriptIterator(
        new URL("../database/migrations", import.meta.url).pathname,
      ),
    );
    await migrator.migrate();
  });

  afterEach(() => {
    db.close();
  });

  it("should store and read a gist info object", async () => {
    const gistPostsRepository = new LibSQLGistPostsRepository(db);
    await gistPostsRepository.saveGist(gist);
    const result = await gistPostsRepository.getGist(gist.id);
    assertEquals(result, gist);
  });

  it("should upsert gist info objects", async () => {
    const gistPostsRepository = new LibSQLGistPostsRepository(db);
    await gistPostsRepository.saveGist(gist);

    const newGist = new Gist({
      ...fakeGistData,
      updated_at: "2000-01-03T00:00:00Z",
    });
    await gistPostsRepository.saveGist(newGist);

    const result = await gistPostsRepository.getGist(gist.id);
    assertEquals(result, newGist);
  });
});
