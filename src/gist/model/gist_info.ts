import type { Octokit } from "octokit";

export type GistInfo = Awaited<
  ReturnType<Octokit["rest"]["gists"]["listForUser"]>
>["data"][number];
