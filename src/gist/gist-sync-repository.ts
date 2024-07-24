import type { Client, Transaction } from "@libsql/client";

export interface GistSyncRepository {
  getLastSyncTime(): Promise<string>;
  setLastSyncTime(time: string): Promise<void>;
}

export class LibSQLGistSyncRepository implements GistSyncRepository {
  constructor(private db: Client | Transaction) {}

  async getLastSyncTime() {
    const result = await this.db.execute(
      "SELECT last_sync FROM gist_sync WHERE row_id = 1",
    );

    if (result.rows.length === 0) {
      return new Date(0).toISOString();
    }

    return result.rows[0].last_sync as string;
  }

  async setLastSyncTime(time: string) {
    await this.db.execute({
      sql:
        "INSERT INTO gist_sync (row_id, last_sync) VALUES (?, ?) ON CONFLICT(row_id) DO UPDATE SET last_sync = excluded.last_sync",
      args: [1, time],
    });
  }
}
