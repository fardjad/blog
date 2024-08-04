import { beforeEach, describe, it } from "@std/testing/bdd";
import { createRewriteRequestPath, serveDirectory } from "./serve-directory.ts";
import { serveStatic } from "hono/deno";
import { Spy, spy } from "@std/testing/mock";
import { assert, assertEquals } from "@std/assert";
import { exists } from "@std/fs";

describe("Rewrite request path", () => {
  const prefix = "/some-prefix";
  const rewriteRequestPath = createRewriteRequestPath(prefix);

  it("should remove the trailing slashes", () => {
    const actual = rewriteRequestPath("/a/b///");
    assertEquals(actual, "/a/b");
  });

  it("should remove the prefix from the path", () => {
    const actual = rewriteRequestPath(`${prefix}/a/b`);
    assertEquals(actual, "/a/b");
  });

  it("should return the path as is when it doesn't start with the prefix", () => {
    const actual = rewriteRequestPath(`not-${prefix}/a/b`);
    assertEquals(actual, `not-${prefix}/a/b`);
  });

  it("should return index.html for the root path", () => {
    const actual = rewriteRequestPath(prefix);
    assertEquals(actual, "/index.html");
  });
});

describe("Serve directory middleware", () => {
  let serveStaticSpy: Spy<typeof serveStatic>;

  beforeEach(() => {
    serveStaticSpy = spy();
    serveDirectory(
      "/static",
      new URL("../static", import.meta.url).pathname,
      serveStaticSpy,
    );
  });

  it("should call serveStatic with the correct arguments", async () => {
    const rewriteRequestPath = serveStaticSpy.calls[0].args[0]
      .rewriteRequestPath as (path: string) => string;
    const root = serveStaticSpy.calls[0].args[0].root as string;
    assertEquals(typeof rewriteRequestPath, "function");
    assertEquals(typeof root, "string");

    assert(await exists(root));
  });
});
