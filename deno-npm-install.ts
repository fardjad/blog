/**
 * Reads deno.json, creates a temporary file with the dependencies, and runs
 * the script with `--node-modules-dir` flag. Doing so will create a
 * node_modules directory with the dependencies. This script is useful when
 * using npm dependencies that expect the node_modules directory to exist.
 */

import { join } from "@std/path";
import * as jsonc from "@std/jsonc";
const __dirname = new URL(".", import.meta.url).pathname;

const denoJson = jsonc.parse(
  await Deno.readTextFile(join(__dirname, "deno.jsonc")),
) as {
  imports: Record<string, string>;
};

const npmDependencies = Object.values(denoJson.imports)
  .filter((dependency) => dependency.startsWith("npm:"));

const lines = npmDependencies.map((dependency) => {
  return `import "${dependency}";`;
});

const tempFile = await Deno.makeTempFile({
  dir: __dirname,
  prefix: ".deno-npm-install-",
  suffix: ".ts",
});

await Deno.writeTextFile(tempFile, lines.join("\n"));

const command = new Deno.Command(Deno.execPath(), {
  args: [
    "cache",
    "--node-modules-dir",
    tempFile,
  ],
  stdin: "inherit",
  stdout: "inherit",
});
const child = command.spawn();
const status = await child.status;
await Deno.remove(tempFile);

if (!status.success) {
  Deno.exit(status.code);
}
