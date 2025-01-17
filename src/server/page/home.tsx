import { Hono } from "hono";
import { transactional } from "../middleware/transactional.ts";
import type { Client, Transaction } from "@libsql/client";
import { LibSQLPostRepository } from "../../blog/post-repository.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Layout } from "../component/layout.tsx";
import { OpenGraphContext } from "../component/opengraph/opengraph-context.tsx";
import { FormattedDate } from "../component/formatted-date.tsx";
import { PageHeader } from "../component/page-header.tsx";
import { Pager } from "../component/pager.tsx";
import { ShowIf } from "../component/show-if.tsx";
import {
  authorName,
  blogDescription,
  blogTitle,
  githubUsername,
  sourceCodeUrl,
  websiteUrl,
} from "../../config/values.ts";

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

export const createHomeRoute = (client: Client) => {
  const app = new Hono<{ Variables: Variables }>();
  app.use(transactional(client));

  return app.get("/", postsQueryValidator, async (c) => {
    const tx = c.get("tx");
    const postRepository = new LibSQLPostRepository(tx);

    const { page, page_size: pageSize } = c.req.valid("query");
    const { posts, totalPages } = await postRepository.listPosts(
      page,
      pageSize,
    );

    return c.html(
      <OpenGraphContext.Provider
        value={{
          url: c.req.url,
          description: blogDescription,
          title: blogTitle,
          image: `${new URL(`/og-image`, c.req.url).toString()}`,
          type: "article",
        }}
      >
        <Layout>
          <PageHeader />
          <main>
            <p>
              Hey there! I'm{" "}
              <a href={websiteUrl}>{authorName}</a>. I'm a pragmatic software
              engineer and a hands-on architect. I have a passion for
              socio-technical systems and collaborative software design.
            </p>
            <p>
              This page contains a selected list of my{" "}
              <a href={`https://gist.github.com/${githubUsername}`}>
                GitHub Gists
              </a>{" "}
              that are written in the style of a blog post. The source code of
              the blog is available <a href={sourceCodeUrl}>here</a>.
            </p>
            <h2>Posts</h2>
            <ul class="tw-list-none tw-p-0 tw-m-0">
              {posts.map((post) => {
                const postUrl = new URL(c.req.url);
                postUrl.hash = "";
                postUrl.search = "";
                postUrl.pathname = `/posts/${post.slug}`;

                return (
                  <li class="hover-underline tw-flex tw-justify-between tw-items-center tw-py-2">
                    <a
                      href={postUrl.toString()}
                      class="tw-truncate tw-w-full tw-overflow-hidden tw-text-ellipsis"
                    >
                      {post.title}
                    </a>
                    <FormattedDate
                      date={post.createdAt}
                      className="tw-text-gray-500 tw-text-sm tw-whitespace-nowrap tw-ml-4"
                    />
                  </li>
                );
              })}
            </ul>
            <ShowIf condition={totalPages > 1}>
              <Pager
                currentPage={page}
                totalPages={totalPages}
                pageUrl={c.req.url}
              />
            </ShowIf>
          </main>
        </Layout>
      </OpenGraphContext.Provider>,
    );
  });
};
