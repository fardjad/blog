import { createFactory } from "hono/factory";
import { cacheMaxAge } from "../../config/values.ts";
import { Context, Env } from "hono";
import { sha256 } from "../../hash/sha256.ts";

export type CacheVariables = {
  cacheHitResponse?: Response;
  contentHash?: string;
};

const factory = createFactory();

/**
 * This can be used as the ETag header for resources that stay the same across
 * deployments.
 */
export const deploymentIdContentHash = await sha256(
  Deno.env.get("DENO_DEPLOYMENT_ID") ?? `UNKNOWN-${Date.now()}`,
);

/**
 * Adds a `Cache-Control` header to the responses
 */
export const cacheControl = factory.createMiddleware(async (c, next) => {
  const cacheControlHeader = `public, max-age=${cacheMaxAge}`;
  c.res.headers.set("Cache-Control", cacheControlHeader);

  await next();
});

/**
 * A middleware that helps with ETag caching. It can/should be used with the
 * {@link cacheControl} middleware.
 *
 * It automatically parses and extracts the If-None-Match header from the
 * request and calls the provided `isFresh` function to determine whether the
 * content is fresh. Upon a cache hit, it sets the `cacheHitResponse` variable
 * in the context to a 304 response.
 *
 * A response handler should check for the `cacheHitResponse` variable and
 * return it if it exists. To set the ETag header in the response, the response
 * handler should set the `contentHash` variable in the context and this
 * middleware will automatically set the ETag header in the response.
 *
 * @param isFresh A function that receives the request context and the content
 *                hash to match and returns whether the content is fresh.
 *
 * @example
 * ```ts
 * import { cacheControl, type CacheVariables, etagCache } from "./middleware/cache.ts";
 * type Variables = { someVariable: string } & CacheVariables;
 * const hono = new Hono<{ Variables: Variables }>();
 * hono.use(cacheControl);
 * hono.get("/", etagCache((c, contentHashToMatch) => {
 *   return contentHashToMatch === "some-content-hash";
 * }), async (c) => {
 *   if (c.get("cacheHitResponse")) {
 *     return c.get("cacheHitResponse");
 *   }
 *
 *   c.set("contentHash", "some-content-hash");
 *   return c.body("Hello, World!");
 * });
 * ```
 */
export const etagCache = <T extends Env>(
  isFresh: (
    context: Context<T>,
    contentHashToMatch: string,
  ) => boolean | Promise<boolean>,
) => {
  return factory.createMiddleware(
    async (c, next) => {
      if (!c.res.headers.has("cache-control")) {
        await next();
        return;
      }

      const middlewareContext = c as Context<{ Variables: CacheVariables }>;

      const etagToMatch = middlewareContext.req.header("if-none-match") ?? "";
      if (etagToMatch && etagToMatch.length > '""'.length) {
        const contentHashToMatch = etagToMatch
          // Remove the surrounding quotes
          .substring(1, etagToMatch.length - 1)
          // For our purposes, there's no difference between strong and weak ETags
          .replace(/^W\//, "");

        if (await Promise.resolve(isFresh(c, contentHashToMatch))) {
          middlewareContext.set(
            "cacheHitResponse",
            new Response(null, {
              status: 304,
              headers: {
                ETag: etagToMatch,
              },
            }),
          );
        }
      }

      await next();

      const contentHash = middlewareContext.get("contentHash");
      if (contentHash) {
        middlewareContext.res.headers.set("ETag", `"${contentHash}"`);
      }
    },
  );
};
