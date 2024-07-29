import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStarryNight from "rehype-starry-night";
import rehypeGithubHeading from "rehype-github-heading";
import rehypeGithubDir from "rehype-github-dir";
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
    .use(rehypeGithubHeading)
    .use(rehypeGithubDir)
    .use(rehypeStringify)
    .process(document);

  return String(processed);
};
