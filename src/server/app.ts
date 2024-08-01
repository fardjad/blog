import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { Client } from "@libsql/client";
import { createOgImageRoute } from "./page/og-image.tsx";
import { createHomeRoute } from "./page/home.tsx";
import { createPostRoute } from "./page/post.tsx";
import { minifyHtml } from "./middleware/minify-html.ts";
import { serveDirectory } from "./middleware/serve-directory.ts";
import { prettifyHtml } from "./middleware/prettify-html.ts";
import { generateTailwindCss } from "./tailwind/tailwind.ts";
import { cache } from "./cache/cache.ts";
import { devMode } from "../config/values.ts";

export const createApp = async (client: Client) => {
  const app = new Hono();

  app.use(trimTrailingSlash());

  let tailwindCss = await generateTailwindCss();
  app.get("/tailwind.css", async (c) => {
    if (devMode) {
      tailwindCss = await generateTailwindCss();
    }

    c.res.headers.set("Content-Type", "text/css");
    return c.body(tailwindCss, 200);
  });

  const serveDirectoryHandler = serveDirectory(
    "/static",
    new URL("./static", import.meta.url).pathname,
  );

  if (devMode) {
    app.use(prettifyHtml());
    app.use("/static/*", serveDirectoryHandler);
  } else {
    app.use("/static/*", serveDirectoryHandler);
    app.use(minifyHtml());
    app.get("*", cache);
  }

  return app
    .route("/og-image", createOgImageRoute(client))
    // / => home
    .route("/", createHomeRoute(client))
    // /posts/:slug => post
    .route("/posts", createPostRoute(client));
};
