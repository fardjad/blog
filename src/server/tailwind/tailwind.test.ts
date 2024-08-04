import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertNotEquals } from "@std/assert";
import { generateTailwindCss } from "./tailwind.ts";

describe("Tailwind CSS generator", () => {
  it("should generate a non-empty string without throwing an error", async () => {
    const css = await generateTailwindCss();
    assertNotEquals(css, "");
  });

  it("should generate at least one line with --tw- in it", async () => {
    const css = await generateTailwindCss();
    assertEquals(css.includes("--tw-"), true);
  });
});
