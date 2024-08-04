import { Hono } from "hono";
import { transactional } from "../middleware/transactional.ts";
import type { Client, Transaction } from "@libsql/client";
import { LibSQLPostRepository } from "../../blog/post-repository.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Layout } from "../component/layout.tsx";
import { PostHeader } from "../component/post/post-header.tsx";
import { PostBody } from "../component/post/post-body.tsx";
import { renderTrustedMarkdown } from "../../markdown/markdown-renderer.ts";
import { OpenGraphContext } from "../component/opengraph/opengraph-context.tsx";
import { PostFooter } from "../component/post/post-footer.tsx";
import { CacheVariables, etagCache } from "../middleware/cache.ts";

type Variables = {
  tx: Transaction;
} & CacheVariables;

const postsQueryValidator = zValidator(
  "param",
  z.object({
    slug: z.string(),
  }),
  (result, c) => {
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
  },
);

export const createPostRoute = (client: Client) => {
  const app = new Hono<{ Variables: Variables }>();
  app.use(transactional(client));

  return app.get(
    "/:slug",
    postsQueryValidator,
    etagCache<{ Variables: Variables }>((c, contentHashToMatch) => {
      const { slug } = c.req.param();
      const tx = c.get("tx");
      const postRepository = new LibSQLPostRepository(tx);
      return postRepository.hasPostWithContentHash(
        slug,
        contentHashToMatch,
      );
    }),
    async (c) => {
      if (c.get("cacheHitResponse")) {
        return c.get("cacheHitResponse");
      }

      const tx = c.get("tx");
      const postRepository = new LibSQLPostRepository(tx);

      const { slug } = c.req.valid("param");
      const post = await postRepository.getPostBySlug(slug);

      if (!post) {
        return c.body("Not Found", 404);
      }

      const renderedMarkdown = await renderTrustedMarkdown(post.content);

      c.set("contentHash", post.contentHash);

      return c.html(
        <OpenGraphContext.Provider
          value={{
            url: c.req.url,
            description: post.description,
            title: post.title,
            image: `${new URL(`/og-image/${post.slug}`, c.req.url).toString()}`,
            type: "article",
          }}
        >
          <Layout>
            <PostHeader
              gistHtmlUrl={post.htmlUrl}
              publishDate={post.createdAt}
            />
            <PostBody content={renderedMarkdown} />
            <PostFooter />
          </Layout>
        </OpenGraphContext.Provider>,
      );
    },
  );
};
