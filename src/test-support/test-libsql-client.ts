import {
  createMigrationScriptIterator,
  LibSQLMigrator,
} from "@fardjad/libsql-migrator";
import { createClient } from "@libsql/client/node";

export const createTestClient = async () => {
  const client = createClient({ url: ":memory:" });

  const schemaMigrator = new LibSQLMigrator(
    client,
    createMigrationScriptIterator(
      new URL("../database/migrations", import.meta.url).pathname,
    ),
  );
  await schemaMigrator.migrate();

  return client;
};
