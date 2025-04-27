import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderTrustedMarkdown } from "./markdown-renderer.ts";

describe("renderTrustedMarkdown", () => {
  it("should render basic markdown", async () => {
    const markdown = "# Title\n\nHello, World!";
    const result = await renderTrustedMarkdown(markdown);

    assertStringIncludes(result, "Hello, World!");
  });

  it("should remove the first h1", async () => {
    const markdown = "# Title";
    const result = await renderTrustedMarkdown(markdown);
    assertEquals(result, "");
  });

  it("should render raw HTML", async () => {
    const markdown = '<span class="test">Test</span>';
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, '<span class="test">Test</span>');
  });

  it("should render GitHub Flavored Markdown", async () => {
    const markdown = "- [x] Task 1\n- [ ] Task 2";
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, 'input type="checkbox" checked disabled');
    assertStringIncludes(result, 'input type="checkbox" disabled');
  });

  it("should render alerts", async () => {
    const markdown = "> [!WARNING]\n> Warning!";
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, "markdown-alert markdown-alert-warning");
    assertStringIncludes(result, "octicon mr-2");
  });

  it("should highlight code blocks", async () => {
    const markdown = "```ts\nconst foo = 'bar';\n```";
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, "language-ts");
  });

  it("should wrap headings with a link to themselves", async () => {
    const markdown = "## Some heading";
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, 'id="some-heading"');
    assertStringIncludes(result, 'href="#some-heading"');
  });

  it("should add dir=auto everywhere", async () => {
    const markdown = "Hello";
    const result = await renderTrustedMarkdown(markdown);
    assertStringIncludes(result, 'dir="auto"');
  });
});
