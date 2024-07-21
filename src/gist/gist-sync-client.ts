import type { Octokit } from "octokit";
import { GistSyncRepository } from "./gist-sync-repository.ts";
import type { GistInfo } from "./model/gist_info.ts";

export interface GistSyncClientOptions {
  octokit: Octokit;
  username: string;
  gistSyncRepository: GistSyncRepository;
  pageSize?: number;
}

export class GistSyncClient {
  constructor(private options: GistSyncClientOptions) {
    this.options = {
      pageSize: 10,
      ...options,
    };
  }

  /**
   * List gists that have been updated since the last sync time.
   *
   * Make sure to call {@link updateLastSyncTime} after using this method to
   * update the last sync time.
   *
   * @returns Gists that have been updated since the last sync time.
   */
  async listUpdatedGists(): Promise<GistInfo[]> {
    const since = await this.options.gistSyncRepository.getLastSyncTime();

    const response = await this.options.octokit.rest.gists.listForUser({
      username: this.options.username,
      since,
      per_page: this.options.pageSize,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch gists: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Sets the last sync time to the updated time of the newest gist.
   *
   * @param gists a list of gists.
   */
  async updateLastSyncTime(gists: GistInfo[]): Promise<void> {
    if (gists.length === 0) {
      return;
    }

    const sortedGists = gists.toSorted((a, b) => {
      return (
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    });
    const lastGist = sortedGists[sortedGists.length - 1];

    await this.options.gistSyncRepository.setLastSyncTime(lastGist.updated_at);
  }
}
