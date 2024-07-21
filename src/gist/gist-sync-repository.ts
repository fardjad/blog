import type { Client, Transaction } from "@libsql/client";

export interface GistSyncRepository {
  getLastSyncTime(): Promise<string>;
  setLastSyncTime(time: string): Promise<void>;
}

export class LibSQLGistSyncRepository implements GistSyncRepository {
  constructor(private db: Client | Transaction) {}

  async getLastSyncTime() {
    const result = await this.db.execute(
      "SELECT last_sync FROM gist_sync ORDER BY last_sync DESC LIMIT 1",
    );

    if (result.rows.length === 0) {
      return new Date(0).toISOString();
    }

    return result.rows[0].last_sync as string;
  }

  async setLastSyncTime(time: string) {
    await this.db.execute("DELETE FROM gist_sync");
    await this.db.execute({
      sql: "INSERT INTO gist_sync (last_sync) VALUES (?)",
      args: [time],
    });
  }
}
