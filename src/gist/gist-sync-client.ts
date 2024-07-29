import type { Octokit } from "octokit";
import { GistSyncRepository } from "./gist-sync-repository.ts";
import { Gist } from "./model/gist.ts";

export interface GistSyncClientOptions {
  octokit: Octokit;
  username: string;
  gistSyncRepository: GistSyncRepository;
  pageSize?: number;
}

/**
 * A client for getting updated gists from GitHub incrementally.
 */
export class GistSyncClient {
  constructor(private options: GistSyncClientOptions) {
    this.options = {
      pageSize: 100,
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
  async listUpdatedGists(): Promise<Gist[]> {
    const lastSyncTime = await this.options.gistSyncRepository
      .getLastSyncTime();

    // GitHub API returns gists that are updated since and including the given
    // time so we'll add 1 millisecond to the last sync time to avoid fetching
    // the same gist again.
    const since = new Date(Date.parse(lastSyncTime) + 1).toISOString();

    const response = await this.options.octokit.rest.gists.listForUser({
      username: this.options.username,
      since,
      per_page: this.options.pageSize,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch gists: ${response.status}`);
    }

    return response.data.map((gistData) => new Gist(gistData));
  }

  /**
   * Sets the last sync time to the updated time of the newest gist.
   *
   * @param gists a list of gists.
   */
  async updateLastSyncTime(gists: Gist[]): Promise<void> {
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

  async fetchContent(url: string): Promise<string> {
    const response = await this.options.octokit.request<string>({
      method: "GET",
      url: url,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }

    return response.data;
  }
}
