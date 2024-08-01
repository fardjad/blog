import { Octokit } from "octokit";
import { githubAuthToken } from "../config/values.ts";

export const octokit = new Octokit({ auth: githubAuthToken });
