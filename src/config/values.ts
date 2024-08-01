import { load } from "@std/dotenv";
const env = await load();

// Blog information
export const blogTitle = "Gistful Musings";
export const blogDescription =
  "A selected list of my gists that are written in the style of a blog post";
export const authorName = "Fardjad Davari";
export const authorEmail = env["EMAIL"] ?? Deno.env.get("EMAIL");
export const blogUrl = "https://blog.fardjad.com";
export const websiteUrl = "https://www.fardjad.com";
export const sourceCodeUrl = "https://github.com/fardjad/blog";

// Cache
export const cacheMaxAge = 300;
export const cacheKey = "blog";

// The tag in Gist description (without the leading `#`) that indicates the
// Gist is a blog post
export const blogTag = "blog";

// GitHub
export const githubUsername = env["GITHUB_USERNAME"] ??
  Deno.env.get("GITHUB_USERNAME");
export const githubAuthToken = env["GITHUB_AUTH_TOKEN"] ??
  Deno.env.get("GITHUB_AUTH_TOKEN");

// Turso
export const tursoDatabaseUrl = env["TURSO_DATABASE_URL"] ??
  Deno.env.get("TURSO_DATABASE_URL");
export const tursoAuthToken = env["TURSO_AUTH_TOKEN"] ??
  Deno.env.get("TURSO_AUTH_TOKEN");

// Gravatar
// https://docs.gravatar.com/api/avatars/images/
export const defaultAvatarImage = "robohash";

// Dev Mode
export const devMode = env["DEV"] != null || Deno.env.has("DEV");
