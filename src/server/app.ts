import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import type { Client } from "@libsql/client";
import { createHomeRoute } from "./page/home.tsx";
import { createPostRoute } from "./page/post.tsx";
import { minifyHtml } from "./middleware/minify-html.ts";
import { serveDirectory } from "./middleware/serve-directory.ts";
import { prettifyHtml } from "./middleware/prettify-html.ts";
import { generateTailwindCss } from "./tailwind/tailwind.ts";
import { cache } from "./cache/cache.ts";
import { devMode } from "../dev-mode.ts";

export const createApp = (client: Client) => {
  const app = new Hono();

  app.use(trimTrailingSlash());

  const serveDirectoryHandler = serveDirectory(
    "/static",
    new URL("./static", import.meta.url).pathname,
  );

  if (devMode) {
    app.use(prettifyHtml());
    app.get("/static/tailwind.css", async (c) => {
      c.res.headers.set("Content-Type", "text/css");
      return c.body(await generateTailwindCss(), 200);
    });
    app.use("/static/*", serveDirectoryHandler);
  } else {
    app.use("/static/*", serveDirectoryHandler);
    app.use(minifyHtml());
    app.get("*", cache);
  }

  return app
    // / => home
    .route("/", createHomeRoute(client))
    // /posts/:slug => post
    .route("/posts", createPostRoute(client));
};
