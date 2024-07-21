import { describe, it } from "@std/testing/bdd";
import {
  createMigrationScriptIterator,
  LibSQLMigrator,
} from "@fardjad/libsql-migrator";
import { createClient } from "npm:@libsql/client/node";

describe("Migrator Smoke Test", () => {
  it("should apply migrations without throwing errors", async () => {
    const client = createClient({
      url: ":memory:",
    });

    const migrator = new LibSQLMigrator(
      client,
      createMigrationScriptIterator(
        new URL("./migrations", import.meta.url).pathname,
      ),
    );

    await migrator.migrate();
    client.close();
  });
});
