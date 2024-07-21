import type { Octokit } from "octokit";
import { GistSyncRepository } from "./gist-sync-repository.ts";

export interface GistSyncClientOptions {
  octokit: Octokit;
  username: string;
  gistSyncRepository: GistSyncRepository;
  pageSize?: number;
}

export class GistSyncClient {
  constructor(private options: GistSyncClientOptions) {
    this.options = {
      pageSize: 100,
      ...options,
    };
  }

  async listUpdatedGists() {
    const since = await this.options.gistSyncRepository.getLastSyncTime();

    const response = await this.options.octokit.rest.gists.listForUser({
      username: this.options.username,
      since,
      per_page: this.options.pageSize,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch gists: ${response.status}`);
    }

    const sortedGists = response.data.toSorted((a, b) => {
      return (
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    });

    if (sortedGists.length > 0) {
      await this.options.gistSyncRepository.setLastSyncTime(
        sortedGists[sortedGists.length - 1].updated_at,
      );
    }

    return sortedGists;
  }
}
