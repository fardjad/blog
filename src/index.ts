import { syncPosts } from "./cron/sync-posts.ts";
import { client } from "./database/client.ts";
import { createApp } from "./server/app.ts";

await syncPosts();
Deno.cron("Sync posts", "* * * * *", syncPosts);

const app = await createApp(client);
Deno.serve(app.fetch);
