import type { Client, Transaction } from "@libsql/client";
import { Gist, GistData } from "./model/gist.ts";

export interface GistPostsRepository {
  getGist(gistId: string): Promise<Gist | undefined>;
  saveGist(gist: Gist): Promise<void>;
}

export class LibSQLGistPostsRepository implements GistPostsRepository {
  constructor(private db: Client | Transaction) {}

  async getGist(gistId: string): Promise<Gist | undefined> {
    const result = await this.db.execute({
      sql: "SELECT gist_info FROM gist_posts WHERE gist_id = ?",
      args: [gistId],
    });

    if (result.rows.length === 0) {
      return undefined;
    }

    const gistData: GistData = JSON.parse(result.rows[0].gist_info as string);
    return new Gist(gistData);
  }

  async saveGist(gist: Gist) {
    await this.db.execute({
      sql:
        "INSERT INTO gist_posts (gist_id, gist_info) VALUES (?, ?) ON CONFLICT (gist_id) DO UPDATE SET gist_info = excluded.gist_info",
      args: [gist.id, JSON.stringify(gist)],
    });
  }
}
