import { createFactory } from "hono/factory";
import { format } from "prettier";

const factory = createFactory();

export const prettifyHtml = factory.createMiddleware(async (c, next) => {
  await next();

  if (!c.res.headers.get("Content-Type")?.startsWith("text/html")) {
    return;
  }

  const html = await c.res.text();
  const prettifiedHtml = await format(html, { parser: "html" });
  c.res = new Response(prettifiedHtml, c.res);
});
