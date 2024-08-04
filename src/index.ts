import { syncPosts } from "./cron.ts";
import { client } from "./database/client.ts";
import { createApp } from "./server/app.ts";

// On Deno Deploy, the cron job will be executed in a separate process.
Deno.cron("Sync posts", "* * * * *", syncPosts);

// Run the job immediately on startup to have some posts available right away.
await syncPosts();

const app = await createApp(client);
Deno.serve(app.fetch);
