import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStarryNight from "rehype-starry-night";
import rehypeGithubDir from "rehype-github-dir";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { remarkRemoveTitle } from "./remark-remove-title.ts";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeAddMarginClassToOcticons } from "./rehype-octicon-margin.ts";

export const renderTrustedMarkdown = async (
  document: string,
): Promise<string> => {
  const processed = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkGfm)
    .use(remarkRemoveTitle)
    .use(remarkAlert)
    .use(remarkRehype, { allowDangerousHtml: true, clobberPrefix: "" })
    .use(rehypeAddMarginClassToOcticons)
    .use(rehypeRaw)
    .use(rehypeStarryNight)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["autolink-heading"] },
    })
    .use(rehypeGithubDir)
    .use(rehypeStringify)
    .process(document);

  return String(processed);
};
