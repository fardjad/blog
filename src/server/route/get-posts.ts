import { Hono } from "hono";
import { transactional } from "../middleware/transactional.ts";
import type { Client, Transaction } from "@libsql/client";
import { LibSQLPostRepository } from "../../blog/post-repository.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Variables = {
  tx: Transaction;
};

const postsQueryValidator = zValidator(
  "query",
  z.object({
    page: z.number({ coerce: true }).int().min(0).optional().default(0),
    page_size: z
      .number({ coerce: true })
      .int()
      .min(0)
      .max(100)
      .optional()
      .default(10),
  }),
  (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
  },
);

export const createGetPostsRoute = (client: Client) => {
  const app = new Hono<{ Variables: Variables }>();
  app.use(transactional(client));

  return app.get("/posts", postsQueryValidator, async (c) => {
    const tx = c.get("tx");
    const postRepository = new LibSQLPostRepository(tx);

    const { page, page_size: pageSize } = c.req.valid("query");
    const posts = await postRepository.listPosts(page, pageSize);

    return c.json(posts);
  });
};
