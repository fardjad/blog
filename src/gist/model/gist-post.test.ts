import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { Gist, type GistData } from "./gist.ts";
import { GistPost } from "./gist-post.ts";
import type { Octokit } from "octokit";

describe("GistPost", () => {
  describe("when the Gist is not a blog post", () => {
    const gist = new Gist({} as unknown as GistData);
    it("should throw an error if the Gist is not a blog post", () => {
      assertThrows(() => {
        new GistPost(gist, {} as unknown as Octokit);
      });
    });
  });

  describe("when the Gist is a blog post", () => {
    const gist = new Gist({
      description: "[Title] #blog",
    } as unknown as GistData);

    it("should not throw an error if the Gist is a blog post", () => {
      new GistPost(gist, {} as unknown as Octokit);
    });
  });

  describe("when the gist has no files", () => {
    const gist = new Gist({
      description: "[Title] #blog",
    } as unknown as GistData);

    const post = new GistPost(gist, {} as unknown as Octokit);

    it("should throw an error when fetching the content", async () => {
      await assertRejects(() => post.fetchContent());
    });
  });

  describe("when the gist has no valid Markdown files", () => {
    const gist = new Gist({
      description: "[Title] #blog",
      files: {
        "post.txt": {
          type: "text/plain",
        },
      },
    } as unknown as GistData);

    const post = new GistPost(gist, {} as unknown as Octokit);

    it("should throw an error when fetching the content", async () => {
      await assertRejects(() => post.fetchContent());
    });
  });

  describe("when the gist has a valid Markdown file", () => {
    const octokit = {
      request: () => Promise.resolve({ status: 200, data: "Hello, world!" }),
    } as unknown as Octokit;

    const gist = new Gist({
      description: "[Title] #blog",
      files: {
        "post.md": {
          type: "text/markdown",
          raw_url: "https://example.com/post.md",
        },
      },
    } as unknown as GistData);

    it("should fetch the contents of the Gist", async () => {
      const post = new GistPost(gist, octokit);
      const content = await post.fetchContent();

      assertEquals(content, "Hello, world!");
    });
  });

  describe("when the gist has multiple valid Markdown files", () => {
    const octokit = {
      request: ({ url }: { url: string }) => {
        if (url === "https://example.com/post1.md") {
          return Promise.resolve({ status: 200, data: "Post1 Contents" });
        } else if (url === "https://example.com/post2.md") {
          return Promise.resolve({ status: 200, data: "Post2 Contents" });
        }

        return Promise.resolve({ status: 404 });
      },
    } as unknown as Octokit;

    const gist = new Gist({
      description: "[Title] #blog",
      files: {
        "non-markdown-file.txt": {
          type: "text/plain",
        },
        "post1.md": {
          type: "text/markdown",
          raw_url: "https://example.com/post1.md",
        },
        "post2.md": {
          type: "text/markdown",
          raw_url: "https://example.com/post2.md",
        },
      },
    } as unknown as GistData);

    it("should fetch the contents of the first Markdown file", async () => {
      const post = new GistPost(gist, octokit);
      const content = await post.fetchContent();

      assertEquals(content, "Post1 Contents");
    });
  });
});
