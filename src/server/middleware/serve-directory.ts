import { serveStatic } from "hono/deno";
import { relative } from "@std/path";

/**
 * Serves a directory of files.
 *
 * @param pathPrefix The prefix to remove from the request path.
 * @param directoryPath The full path to the directory to serve.
 *
 * @example
 * ```ts
 * const app = new Hono();
 * app.use("/static/*", serveDirectory("/static", new URL("./static", import.meta.url).pathname));
 * ```
 */
export const serveDirectory = (pathPrefix: string, directoryPath: string) => {
  return serveStatic({
    rewriteRequestPath: (path) => {
      const pathWithoutTrailingSlashes = path.replace(/\/+$/, "");

      let pathWithoutPrefix = pathWithoutTrailingSlashes;
      if (pathWithoutPrefix.startsWith(pathPrefix)) {
        pathWithoutPrefix = pathWithoutPrefix.slice(pathPrefix.length);
      }

      if (pathWithoutPrefix === "") {
        return "/index.html";
      }

      return pathWithoutPrefix;
    },
    root: relative(
      Deno.cwd(),
      directoryPath,
    ),
  });
};
