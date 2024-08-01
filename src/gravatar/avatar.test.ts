import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertMatch } from "@std/assert";
import { generateGravatarImageLink } from "./avatar.ts";
import { defaultAvatarImage } from "../config/values.ts";

describe("generateGravatarImageLink", () => {
  it("should generate the correct Gravatar link with default size", async () => {
    const email = "example@example.com";
    const result = await generateGravatarImageLink(email);
    const url = new URL(result);

    assertMatch(
      url.href,
      /^https:\/\/www\.gravatar\.com\/avatar\/[0-9a-f]+/,
    );
    assertEquals(Object.fromEntries(url.searchParams.entries()), {
      s: "64",
      d: "robohash",
    });
  });

  it("should generate the correct Gravatar link with custom size", async () => {
    const email = "example@example.com";
    const result = await generateGravatarImageLink(email, 128);
    const url = new URL(result);

    assertMatch(
      url.href,
      /^https:\/\/www\.gravatar\.com\/avatar\/[0-9a-f]+/,
    );
    assertEquals(Object.fromEntries(url.searchParams.entries()), {
      s: "128",
      d: defaultAvatarImage,
    });
  });
});
