import { createMiddleware } from "hono/factory";
import { type Client, LibsqlError, type Transaction } from "@libsql/client";

/**
 * Creates a Hono middleware that wraps the request in a transaction. The
 * transaction is stored in the context under the given key. If the request
 * handler throws an error, the transaction is rolled back. Otherwise, it is
 * committed.
 *
 * @param client LibSQL client to use
 * @param contextKey the name of the Hono context key to store the transaction under
 */
export const transactional = (client: Client) => {
  return createMiddleware<{ Variables: { tx: Transaction } }>(
    async (c, next) => {
      let tx: Transaction;
      try {
        tx = await client.transaction();
      } catch (e) {
        if (!(e instanceof LibsqlError)) {
          throw e;
        }

        return c.body(null, 429);
      }

      c.set("tx", tx);

      try {
        await next();

        if (c.error) {
          await tx.rollback();
        } else {
          await tx.commit();
        }
      } catch (e) {
        if (!(e instanceof LibsqlError)) {
          throw e;
        }

        // after calling next(), the response can only be set by reassiging c.res
        c.res = new Response(null, { status: 429 });
      } finally {
        tx.close();
      }
    },
  );
};
