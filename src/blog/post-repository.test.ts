import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { type Client } from "@libsql/client";
import { LibSQLPostRepository } from "./post-repository.ts";
import { createTestClient } from "../test-support/test-libsql-client.ts";
import { assertEquals, assertRejects } from "@std/assert";
import { Post } from "./model/post.ts";
import { createFakePostData } from "../test-support/fake-post-data.ts";
import { generateRandomString } from "../test-support/random-generator.ts";

describe("PostRepository", () => {
  let client: Client;
  let postRepository: LibSQLPostRepository;

  beforeEach(async () => {
    client = await createTestClient();
    postRepository = new LibSQLPostRepository(client);
  });

  afterEach(() => {
    client.close();
  });

  it("should save a post", async () => {
    const post = new Post(
      createFakePostData({
        title: "New Post",
      }),
    );
    await postRepository.savePost(post);
  });

  it("should retrieve a previously saved post", async () => {
    const post = new Post(
      createFakePostData({
        title: "New Post",
      }),
    );
    await postRepository.savePost(post);
    const retrievedPost = await postRepository.getPost(post.gistId);
    assertEquals(retrievedPost?.title, post.title);
  });

  it("should update the post when a post with the same id exists", async () => {
    const postData = createFakePostData({
      title: "New Post",
    });

    await postRepository.savePost(new Post(postData));
    await postRepository.savePost(
      new Post({ ...postData, title: "Updated Post" }),
    );

    const post = await postRepository.getPost(postData.gistId);
    assertEquals(post?.title, "Updated Post");
  });

  it("should make sure that '${slug}-${slug_counter}' is unique", async () => {
    const postData = createFakePostData({
      title: "New Post",
    });
    await postRepository.savePost(new Post(postData));
    await assertRejects(async () => {
      await postRepository.savePost(
        new Post({ ...postData, gistId: generateRandomString(32) }),
      );
    });
  });

  it("should get the slug counter", async () => {
    const postData = createFakePostData({
      title: "New Post",
    });
    await postRepository.savePost(new Post(postData));
    const counter = await postRepository.getSlugCounter(postData.slug);
    assertEquals(counter, 0);
  });

  it("should get a post by '${slug}-${slug_counter}'", async () => {
    const postData = createFakePostData({
      title: "New Post",
      slugCounter: 1,
    });
    await postRepository.savePost(new Post(postData));
    const post = await postRepository.getPostBySlug("new-post-1");
    assertEquals(post?.title, "New Post");
  });

  describe("listing posts", () => {
    describe("when there are no posts", () => {
      it("should return an empty list", async () => {
        const listResults = await postRepository.listPosts();
        assertEquals(listResults, { totalPages: 0, posts: [] });
      });
    });

    describe("when there are multiple posts", () => {
      let generatedPosts: Post[];

      beforeEach(async () => {
        generatedPosts = [];
        for (let i = 0; i < 95; i++) {
          const generatedPost = new Post(
            createFakePostData({
              title: `Post ${i}`,
              createdAt: new Date(Date.now() + i),
            }),
          );
          generatedPosts.push(generatedPost);
          await postRepository.savePost(generatedPost);
        }
      });

      const pageSizeTable = [
        [1, 95],
        [10, 10],
        [100, 1],
      ];

      for (const [pageSize, expectedPages] of pageSizeTable) {
        it(`should return totalPages=${expectedPages} when pageSize=${pageSize}`, async () => {
          const listResults = await postRepository.listPosts(0, pageSize);
          assertEquals(listResults.totalPages, expectedPages);
        });
      }

      it("should get each page correctly", async () => {
        const pageSize = 10;
        const firstPage = await postRepository.listPosts(0, pageSize);
        const sortedGeneratedPosts = generatedPosts.toSorted(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        assertEquals(firstPage.posts, sortedGeneratedPosts.slice(0, pageSize));
        for (let i = 1; i < firstPage.totalPages; i++) {
          const listResults = await postRepository.listPosts(i, pageSize);
          assertEquals(
            listResults.posts,
            sortedGeneratedPosts.slice(i * pageSize, (i + 1) * pageSize),
          );
        }
      });
    });
  });
});
