import slugify from "@sindresorhus/slugify";
import type { PostData } from "../blog/model/post.ts";
import { generateRandomString } from "./random-generator.ts";

export const createFakePostData = (
  overrides: Partial<PostData> = {},
): PostData => {
  const gistId = generateRandomString(32);
  const markdownId = generateRandomString(40);
  const title = overrides.title ?? "Title";
  const contentHash = generateRandomString(32);

  return {
    gistId: gistId,
    htmlUrl: `https://gist.github.com/username/${gistId}`,
    contentUrl:
      `https://gist.githubusercontent.com/username/${gistId}/raw/${markdownId}/file-name.md`,
    content: "# Content",
    description: "Description",
    title,
    tags: new Set(["blog"]),
    createdAt: new Date(0),
    updatedAt: new Date(24 * 60 * 60 * 1000),
    ownerId: 123456,
    public: true,
    slug: slugify(title),
    slugCounter: 0,
    contentHash,

    ...overrides,
  };
};
