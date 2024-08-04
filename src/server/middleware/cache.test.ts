import { describe, it } from "@std/testing/bdd";
import { Hono } from "hono";
import { cacheControl, CacheVariables, etagCache } from "./cache.ts";
import { assert, assertEquals } from "@std/assert";

const body = "Hello, World!";
const bodyHash = "body-hash";

type Variables = CacheVariables;

describe("Cache middleware", () => {
  const app = new Hono<{ Variables: Variables }>();
  app.use(cacheControl);

  app.get("/", (c) => {
    return c.body("Hello, World!");
  });

  app.get(
    "/etag",
    etagCache((_c, contentHashToMatch) => {
      return contentHashToMatch === bodyHash;
    }),
    // deno-lint-ignore require-await
    async (c) => {
      if (c.get("cacheHitResponse")) {
        return c.get("cacheHitResponse");
      }

      c.set("contentHash", bodyHash);
      return c.body(body);
    },
  );

  it("should add a Cache-Control header to the responses", async () => {
    const response = await app.request("/");
    assert(response.headers.has("Cache-Control"));
  });

  const table = [
    ["etag without quotes", 200],
    [`"something else"`, 200],
    [`"${bodyHash}"`, 304],
    [`${bodyHash}"`, 200],
    [`"W/${bodyHash}"`, 304],
    // `W/` directive is case sensitive.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag#w
    [`"w/${bodyHash}"`, 200],
    ["", 200],
  ];
  for (const [ifNoneMatch, status] of table) {
    it(`should return a response with code ${status} when the If-None-Match header is set to '${ifNoneMatch}'`, async () => {
      const response = await app.request("/etag", {
        headers: {
          "If-None-Match": ifNoneMatch as string,
        },
      });
      assertEquals(response.status, status);
      assertEquals(
        response.headers.get("etag")?.replaceAll('"', "").replace(
          /^W\//,
          "",
        ),
        bodyHash,
      );
    });
  }
});
