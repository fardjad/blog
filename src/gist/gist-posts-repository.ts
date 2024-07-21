import type { Client, Transaction } from "@libsql/client";
import type { GistInfo } from "./model/gist_info.ts";

export interface GistPostsRepository {
  getGistInfo(gistId: string): Promise<GistInfo | undefined>;
  saveGistInfo(gistId: string, gistInfo: GistInfo): Promise<void>;
}

export class LibSQLGistPostsRepository implements GistPostsRepository {
  constructor(private db: Client | Transaction) {}

  async getGistInfo(gistId: string): Promise<GistInfo | undefined> {
    const result = await this.db.execute({
      sql: "SELECT gist_info FROM gist_posts WHERE gist_id = ?",
      args: [gistId],
    });

    if (result.rows.length === 0) {
      return undefined;
    }

    return JSON.parse(result.rows[0].gist_info as string) as GistInfo;
  }

  async saveGistInfo(gistId: string, gistInfo: GistInfo) {
    await this.db.execute({
      sql:
        "INSERT INTO gist_posts (gist_id, gist_info) VALUES (?, ?) ON CONFLICT (gist_id) DO UPDATE SET gist_info = excluded.gist_info",
      args: [gistId, JSON.stringify(gistInfo)],
    });
  }
}
