import { load } from "@std/dotenv";
import { Octokit } from "octokit";

const env = await load();

export const octokit = new Octokit({
  auth: env["GITHUB_AUTH_TOKEN"] ?? Deno.env.get("GITHUB_AUTH_TOKEN"),
});
