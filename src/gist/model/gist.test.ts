import { Gist, type GistData } from "./gist.ts";
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

describe("GistInfo", () => {
  describe("when description is empty", () => {
    const gistData = {
      description: "",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("should have an empty title", () => {
      assertEquals(gist.title, "");
    });

    it("should not have any tags", () => {
      assertEquals(gist.tags, new Set());
    });
  });

  describe("when description has a title", () => {
    const gistData = {
      description: "[title]",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("should have the title 'title'", () => {
      assertEquals(gist.title, "title");
    });

    it("should not have any tags", () => {
      assertEquals(gist.tags, new Set());
    });
  });

  describe("when description has tags", () => {
    const gistData = {
      description: "#tag1 #tag2",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("should have an empty title", () => {
      assertEquals(gist.title, "");
    });

    it("should have tag1 and tag2 tags", () => {
      assertEquals(gist.tags, new Set<string>(["tag1", "tag2"]));
    });
  });

  describe("when description has a title and tags", () => {
    const gistData = {
      description: "some text [title] more text #tag1 #tag2",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("should have the title 'title'", () => {
      assertEquals(gist.title, "title");
    });

    it("should have tag1 and tag2 tags", () => {
      assertEquals(gist.tags, new Set<string>(["tag1", "tag2"]));
    });
  });

  describe("extracting the processed description", () => {
    const gistData = {
      description: "[Title] Some description #tag1 #tag2",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("should remove the title and tags and return the text in between", () => {
      assertEquals(gist.processedDescription, "Some description");
    });
  });

  describe("JSON serialization", () => {
    const gistData = {
      description: "some text [title] more text #tag1 #tag2",
    } as unknown as GistData;

    const gist = new Gist(gistData);

    it("the serialized object should have the same keys as the gistData object", () => {
      assertEquals(
        Object.keys(JSON.parse(JSON.stringify(gist))),
        Object.keys(gistData),
      );
    });
  });
});
