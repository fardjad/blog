import { Hono } from "hono";
import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { generateGravatarImageLink } from "../../gravatar/avatar.ts";
import { OpenGraphImage } from "../component/opengraph/opengraph-image.tsx";
import { transactional } from "../middleware/transactional.ts";
import { Client, Transaction } from "@libsql/client";
import { LibSQLPostRepository } from "../../blog/post-repository.ts";
import {
  authorEmail,
  authorName,
  blogDescription,
  blogTitle,
} from "../../config/values.ts";
import {
  CacheVariables,
  deploymentIdCache,
  deploymentIdContentHash,
  etagCache,
} from "../cache/cache.ts";

type Variables = {
  tx: Transaction;
} & CacheVariables;

await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm"));
const robotoBold = await Deno.readFile(
  new URL("../static/fonts/Roboto/Roboto-Bold.ttf", import.meta.url),
);
const robotoMedium = await Deno.readFile(
  new URL("../static/fonts/Roboto/Roboto-Medium.ttf", import.meta.url),
);

const gravatarUrl = await generateGravatarImageLink(authorEmail, 128);

const createPngResponse = async (
  blogTitle: string,
  blogDescription: string,
) => {
  const svg = await satori(
    <OpenGraphImage
      title={blogTitle}
      description={blogDescription}
      gravatarUrl={gravatarUrl}
      name={authorName}
    />,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Roboto",
          data: robotoBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Roboto",
          data: robotoMedium,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    background: "white",
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const createOgImageRoute = (client: Client) => {
  const app = new Hono<{ Variables: Variables }>();
  app.use(transactional(client));

  return app.get(
    "/",
    deploymentIdCache,
    (c) => {
      if (c.get("cacheHitResponse")) {
        return Promise.resolve(c.get("cacheHitResponse"));
      }

      c.set("contentHash", deploymentIdContentHash);
      return createPngResponse(blogTitle, blogDescription);
    },
  )
    .get(
      "/:slug",
      etagCache<{ Variables: Variables }>(
        (c, contentHashToMatch) => {
          const { slug } = c.req.param();
          const tx = c.get("tx");
          const postRepository = new LibSQLPostRepository(tx);
          return postRepository.hasPostWithContentHash(
            slug,
            contentHashToMatch,
          );
        },
      ),
      async (c) => {
        if (c.get("cacheHitResponse")) {
          return c.get("cacheHitResponse");
        }

        const { slug } = c.req.param();
        const tx = c.get("tx");
        const postRepository = new LibSQLPostRepository(tx);
        const post = await postRepository.getPostBySlug(slug);

        if (post == null) {
          return c.body("Not Found", 404);
        }

        c.set("contentHash", post.contentHash);
        return createPngResponse(
          post.title,
          post.description,
        );
      },
    );
};
