import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { Client } from "@libsql/client";
import { createHomeRoute } from "./route/home.tsx";
import { createPostRoute } from "./route/post.tsx";
// @deno-types="npm:@types/html-minifier-terser"
import { minify } from "html-minifier-terser";
import { cache } from "hono/cache";
import { relative } from "@std/path";

export const createApp = (client: Client) => {
  const app = new Hono();

  app.use(trimTrailingSlash());

  app.get(
    "*",
    cache({
      cacheName: "blog",
      cacheControl: "public, max-age=300",
      wait: true,
    }),
  );

  app.use(async (c, next) => {
    await next();

    if (!c.res.headers.get("Content-Type")?.startsWith("text/html")) {
      return;
    }

    const html = await c.res.text();
    const minifiedHtml = await minify(html, {
      collapseWhitespace: true,
    });
    c.res = new Response(minifiedHtml, c.res);
  });

  app.use(
    "/static/*",
    serveStatic({
      rewriteRequestPath: (path) => {
        const pathWithoutTrailingSlashes = path.replace(/\/+$/, "");
        const pathWithoutStatic = pathWithoutTrailingSlashes.replace(
          /^\/static/,
          "",
        );
        if (pathWithoutStatic === "") {
          return "/index.html";
        }

        return pathWithoutStatic;
      },
      root: relative(Deno.cwd(), new URL("./static", import.meta.url).pathname),
    }),
  );

  const homeRoute = createHomeRoute(client);
  const postRoute = createPostRoute(client);

  return app.route("/", homeRoute).route("/", postRoute);
};
