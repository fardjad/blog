import { cache as honoCache } from "hono/cache";
import { createFactory } from "hono/factory";
import { cacheKey, cacheMaxAge } from "../../config/values.ts";

const factory = createFactory();

// Deno Deploy does not support Cache API yet so we need to check if it is
// available
export const cache = globalThis.caches
  ? honoCache({
    cacheName: cacheKey,
    cacheControl: `public, max-age=${cacheMaxAge}`,
    wait: true,
  })
  : factory.createMiddleware(async (_c, next) => {
    await next();
  });

export const clearCache = async () => {
  await globalThis.caches?.delete(cacheKey);
};
