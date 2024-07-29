import { join } from "@std/path";
import { generateTailwindCss } from "./tailwind.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const css = await generateTailwindCss();
const stylePath = join(__dirname, "../static/tailwind.css");
await Deno.writeTextFile(stylePath, css);
