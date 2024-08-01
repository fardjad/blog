import { devMode } from "./config/values.ts";
import { syncPosts } from "./cron/sync-posts.ts";
import { client } from "./database/client.ts";
import { createApp } from "./server/app.ts";
import { exists } from "@std/fs";

const checkTailwindCss = async () => {
  if (
    !await exists(new URL("./server/static/tailwind.css", import.meta.url))
  ) {
    throw new Error(
      "Tailwind CSS not built. Run `deno task build:tailwind`",
    );
  }
};

const checkNodeModules = async () => {
  if (!await exists(new URL("../node_modules", import.meta.url))) {
    throw new Error(
      "Some dependencies cannot work without node_modules. Run `deno task npm:install`",
    );
  }
};

if (devMode) {
  console.log("Running in DEV mode");
} else {
  await checkTailwindCss();
}

await checkNodeModules();

await syncPosts();
Deno.cron("Sync posts", "* * * * *", syncPosts);

const app = createApp(client);
Deno.serve(app.fetch);
