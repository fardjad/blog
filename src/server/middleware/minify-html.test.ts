import { describe, it } from "@std/testing/bdd";
import { Hono } from "hono";
import { assertEquals } from "@std/assert";
import { minifyHtml } from "./minify-html.ts";

describe("Minify HTML middleware", () => {
  const app = new Hono();

  app.onError((err, c) => {
    return c.text(err.message, 500);
  });

  app.use(minifyHtml);

  const htmlBody = "<h1>Hello, World!</h1>\n<p>This is a paragraph.</p>";
  const minfiedHtmlBody = "<h1>Hello, World!</h1><p>This is a paragraph.</p>";
  const jsonBody = { message: "This should be left alone" };
  const invalidHtmlBody = "< h1 >hello</ h1 >";

  app.get("/html", (c) => {
    return c.html(htmlBody);
  });

  app.get("/non-html", (c) => {
    return c.json(jsonBody);
  });

  app.get("/invalid-html", (c) => {
    return c.html(invalidHtmlBody);
  });

  it("should minify html content", async () => {
    const response = await app.request("/html");
    assertEquals(await response.text(), minfiedHtmlBody);
  });

  it("should leave alone non-html content", async () => {
    const response = await app.request("/non-html");
    assertEquals(await response.text(), JSON.stringify(jsonBody));
  });

  it("should throw an error when minifying invalid html content", async () => {
    const response = await app.request("/invalid-html");
    assertEquals(response.status, 500);
  });
});
