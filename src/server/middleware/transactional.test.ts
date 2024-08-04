import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { Hono } from "hono";
import { transactional } from "./transactional.ts";
import { Client, LibsqlError, Transaction } from "@libsql/client";
import { Spy, spy, Stub, stub } from "@std/testing/mock";
import { assertEquals } from "@std/assert";

type Variables = {
  tx: Transaction;
};

describe("Transactional middleware", () => {
  const app = new Hono<{ Variables: Variables }>();

  const fakeClient = {} as unknown as Client;

  app.use(transactional(fakeClient));
  app.onError((err, c) => {
    return c.text(err.message, 500);
  });

  app.get("/ok", (c) => {
    if (c.get("tx") == null) {
      throw new Error("Transaction not found");
    }

    return c.text("OK");
  });

  app.get("/error", (c) => {
    if (c.get("tx") == null) {
      return c.text("Transaction not found", 200);
    }

    throw new Error("Error");
  });

  describe("when the handler returns successfully", () => {
    let transactionStub: Stub<typeof fakeClient>;
    let commitSpy: Spy<Transaction["commit"]>;
    let closeSpy: Spy<Transaction["close"]>;
    let response: Response;

    beforeEach(async () => {
      commitSpy = spy();
      closeSpy = spy();

      const fakeTransaction = {
        commit: commitSpy,
        close: closeSpy,
      } as unknown as Transaction;

      transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.resolve(fakeTransaction),
      );

      response = await app.request("/ok");
    });

    afterEach(() => {
      transactionStub.restore();
    });

    it("should response with 200", () => {
      assertEquals(response.status, 200);
    });

    it("should commit the transaction", () => {
      assertEquals(commitSpy.calls.length, 1);
    });

    it("should close the transaction", () => {
      assertEquals(closeSpy.calls.length, 1);
    });
  });

  describe("when the handler returns an error", () => {
    let transactionStub: Stub<typeof fakeClient>;
    let commitSpy: Spy<Transaction["commit"]>;
    let rollbackSpy: Spy<Transaction["rollback"]>;
    let closeSpy: Spy<Transaction["close"]>;
    let response: Response;

    beforeEach(async () => {
      commitSpy = spy();
      rollbackSpy = spy();
      closeSpy = spy();

      const fakeTransaction = {
        commit: commitSpy,
        rollback: rollbackSpy,
        close: closeSpy,
      } as unknown as Transaction;

      transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.resolve(fakeTransaction),
      );

      response = await app.request("/error");
    });

    afterEach(() => {
      transactionStub.restore();
    });

    it("should response with 500", () => {
      assertEquals(response.status, 500);
    });

    it("should rollback the transaction", () => {
      assertEquals(rollbackSpy.calls.length, 1);
    });

    it("should close the transaction", () => {
      assertEquals(closeSpy.calls.length, 1);
    });

    it("should not commit the transaction", () => {
      assertEquals(commitSpy.calls.length, 0);
    });
  });

  describe("when the transaction cannot be committed", () => {
    it("should respond with 429 when the error is a LibsqlError", async () => {
      const closeSpy = spy();

      const fakeTransaction = {
        commit: () => {
          throw new LibsqlError("Message", "Code");
        },
        close: closeSpy,
      } as unknown as Transaction;
      const transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.resolve(fakeTransaction),
      );

      const response = await app.request("/ok");
      assertEquals(response.status, 429);
      assertEquals(closeSpy.calls.length, 1);

      transactionStub.restore();
    });

    it("should respond with 500 when the error is not a LibsqlError", async () => {
      const closeSpy = spy();

      const fakeTransaction = {
        commit: () => {
          throw new Error();
        },
        close: closeSpy,
      } as unknown as Transaction;
      const transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.resolve(fakeTransaction),
      );

      const response = await app.request("/ok");
      assertEquals(response.status, 500);
      assertEquals(closeSpy.calls.length, 1);

      transactionStub.restore();
    });
  });

  describe("when the transaction cannot start", () => {
    it("should give a 429 response when the error is a LibsqlError", async () => {
      const transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.reject(new LibsqlError("Message", "Code")),
      );

      const response = await app.request("/ok");
      assertEquals(response.status, 429);

      transactionStub.restore();
    });

    it("should respond with 500 when the error is not a LibsqlError", async () => {
      const transactionStub = stub(
        fakeClient,
        "transaction",
        () => Promise.reject(new Error()),
      );

      const response = await app.request("/ok");
      assertEquals(response.status, 500);

      transactionStub.restore();
    });
  });
});
