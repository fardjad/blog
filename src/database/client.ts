import { createClient } from "@libsql/client";
import {
  createMigrationScriptIterator,
  LibSQLMigrator,
} from "@fardjad/libsql-migrator";
import { tursoAuthToken, tursoDatabaseUrl } from "../config/values.ts";

const client = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoAuthToken,
});

const migrator = new LibSQLMigrator(
  client,
  createMigrationScriptIterator(
    new URL("./migrations", import.meta.url).pathname,
  ),
);
await migrator.migrate();

export { client };
