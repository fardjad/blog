import { client } from "./database/client.ts";
import { createApp } from "./server/app.ts";

const app = createApp(client);
Deno.serve(app.fetch);
