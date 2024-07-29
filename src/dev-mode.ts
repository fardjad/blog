import { load } from "@std/dotenv";
const env = await load();

export const devMode = env["DEV"] != null || Deno.env.has("DEV");
