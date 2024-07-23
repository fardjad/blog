import { describe, it } from "@std/testing/bdd";
import { createTestClient } from "../test-support/test-libsql-client.ts";

describe("Migrator Smoke Test", () => {
  it("should apply migrations without throwing errors", async () => {
    const client = await createTestClient();
    client.close();
  });
});
