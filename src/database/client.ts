import { load } from "@std/dotenv";
import { createClient } from "@libsql/client";
import {
  createMigrationScriptIterator,
  LibSQLMigrator,
} from "@fardjad/libsql-migrator";

const env = await load();

const client = createClient({
  url: env["TURSO_DATABASE_URL"] ?? Deno.env.get("TURSO_DATABASE_URL"),
  authToken: env["TURSO_AUTH_TOKEN"] ?? Deno.env.get("TURSO_AUTH_TOKEN"),
});

const migrator = new LibSQLMigrator(
  client,
  createMigrationScriptIterator(
    new URL("./migrations", import.meta.url).pathname,
  ),
);
await migrator.migrate();

export { client };
