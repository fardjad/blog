import tailwind, { Config } from "tailwindcss";
import postcss from "postcss";
import { join, relative } from "@std/path";

const __dirname = new URL(".", import.meta.url).pathname;
const serverDirAbsolute = join(__dirname, "..");
const serverDirRelative = relative(Deno.cwd(), serverDirAbsolute);

const config = {
  content: [join(serverDirRelative, "**/*.tsx")],
  corePlugins: {
    preflight: false,
  },
  prefix: "tw-",
  important: true,
} satisfies Config;

export const buildTailwind = async () => {
  const result = await postcss([
    tailwind(config),
  ]).process(`@tailwind base;@tailwind components;@tailwind utilities;`, {
    from: undefined,
  });

  return result.css;
};

const css = await buildTailwind();
const stylePath = join(__dirname, "../static/tailwind.css");
await Deno.writeTextFile(stylePath, css);
