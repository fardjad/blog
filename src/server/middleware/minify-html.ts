import { createFactory } from "hono/factory";
// @deno-types="npm:@types/html-minifier-terser"
import { minify } from "html-minifier-terser";

const factory = createFactory();

export const minifyHtml = factory.createMiddleware(async (c, next) => {
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
