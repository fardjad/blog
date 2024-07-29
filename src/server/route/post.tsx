import { Hono } from "hono";
import { transactional } from "../middleware/transactional.ts";
import type { Client, Transaction } from "@libsql/client";
import { LibSQLPostRepository } from "../../blog/post-repository.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Layout } from "../component/layout.tsx";
import { PostHeader } from "../component/post-header.tsx";
import { PostBody } from "../component/post-body.tsx";
import { renderTrustedMarkdown } from "../../markdown/markdown-renderer.ts";
import { OpenGraphContext } from "../component/opengraph-context.tsx";
import { generateGravatarImageLink } from "../../gravatar/avatar.ts";
import { PostFooter } from "../component/post-footer.tsx";

type Variables = {
  tx: Transaction;
};

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

  return app.get("/posts/:slug", postsQueryValidator, async (c) => {
    const tx = c.get("tx");
    const postRepository = new LibSQLPostRepository(tx);

    const { slug } = c.req.valid("param");
    const post = await postRepository.getPostBySlug(slug);

    if (!post) {
      return c.body("Not Found", 404);
    }

    const renderedMarkdown = await renderTrustedMarkdown(post.content);

    return c.html(
      <OpenGraphContext.Provider
        value={{
          url: c.req.url,
          description: post.description,
          title: post.title,
          image: await generateGravatarImageLink("public@fardjad.com", 256),
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
  });
};
