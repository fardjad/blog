import type { Octokit } from "octokit";
import { Gist } from "./gist.ts";

/**
 * A GistPost is a Gist that has a "blog" tag.
 */
export class GistPost extends Gist {
  constructor(gist: Gist, private octokit: Octokit) {
    super(gist);

    if (!this.isBlogPost) {
      throw new Error("This Gist is not a blog post.");
    }
  }

  /**
   * Fetches the content of the Gist.
   */
  public async fetchContent() {
    const markdownFile = this.markdownFile;
    if (!markdownFile || !markdownFile.raw_url) {
      throw new Error("This Gist has no valid Markdown files.");
    }

    const response = await this.octokit.request<string>({
      url: markdownFile.raw_url,
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch Gist content.");
    }

    return response.data;
  }

  private get isBlogPost() {
    return this.tags.has("blog");
  }

  private get markdownFile() {
    return Object.values(this.files).find(
      (file) => file.type === "text/markdown",
    );
  }
}
