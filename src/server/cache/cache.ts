import { createFactory } from "hono/factory";
import { cacheMaxAge } from "../../config/values.ts";
import { Context, Env } from "hono";
import { sha256 } from "../../hash/sha256.ts";

export type CacheVariables = {
  cacheHitResponse?: Response;
  contentHash?: string;
};

const factory = createFactory();

export const cacheControl = factory.createMiddleware(async (c, next) => {
  const cacheControlHeader = `public, max-age=${cacheMaxAge}`;
  c.res.headers.set("Cache-Control", cacheControlHeader);

  await next();
});

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

      const etagToMatch = middlewareContext.req.header("if-none-match");
      if (etagToMatch) {
        const contentHashToMatch = etagToMatch.replaceAll('"', "").replace(
          /^W\//, // For our purposes, there's no difference between strong and weak ETags
          "",
        );
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

export const deploymentIdContentHash = await sha256(
  Deno.env.get("DENO_DEPLOYMENT_ID") ?? `UNKNOWN-${Date.now()}`,
);

export const deploymentIdCache = () => {
  return etagCache((_c, contentHashToMatch) => {
    return contentHashToMatch === deploymentIdContentHash;
  });
};
