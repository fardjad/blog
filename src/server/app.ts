import { Hono } from "hono";
import type { Client } from "@libsql/client";
import { createGetPostsRoute } from "./route/get-posts.ts";

export const createApp = (client: Client) => {
  const app = new Hono();

  const getPostsRoute = createGetPostsRoute(client);

  return app.route("/", getPostsRoute);
};
