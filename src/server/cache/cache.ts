import { cache as honoCache } from "hono/cache";

export const cacheKey = "blog";
export const cache = honoCache({
  cacheName: cacheKey,
  cacheControl: "public, max-age=300",
  wait: true,
});

export const clearCache = async () => {
  await caches.delete(cacheKey);
};
