import type { Octokit } from "octokit";
import hashtagRegex from "hashtag-regex";

export type GistData = Awaited<
  ReturnType<Octokit["rest"]["gists"]["listForUser"]>
>["data"][number];

/**
 * A Gist is a GitHub Gist with a description that contains a title and tags.
 */
interface Gist extends GistData {
  title: string;
  tags: Set<string>;
}

const Gist = function Gist(this: GistData, gistInfoData: GistData) {
  Object.assign(this, gistInfoData);
} as unknown as { new (gistInfoData: GistData): Gist };

Object.defineProperty(Gist.prototype, "title", {
  get(this: GistData) {
    const description = this.description ?? "";
    const regexForTitle = description.match(/\[.*\]/);
    const titleWithBrackets = regexForTitle?.[0] ?? "";
    const title = titleWithBrackets.length > 0
      ? titleWithBrackets.substring(1, titleWithBrackets.length - 1)
      : "";

    return title;
  },
});

Object.defineProperty(Gist.prototype, "tags", {
  get(this: GistData) {
    const description = this.description ?? "";
    const tags = description.matchAll(hashtagRegex()) ?? [];
    return new Set(Array.from(tags, (tag) => tag[0].substring(1)));
  },
});

export { Gist };
