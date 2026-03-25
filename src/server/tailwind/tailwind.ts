import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { join } from "@std/path";
import themeCss from "tailwindcss/theme.css" with { type: "text" };
import utilitiesCss from "tailwindcss/utilities.css" with { type: "text" };

const __dirname = new URL(".", import.meta.url).pathname;
const serverDirAbsolute = join(__dirname, "..");
const generatedCssPath = join(serverDirAbsolute, "tailwind.generated.css");
const prefixedThemeCss = themeCss.replace(
  /@theme\s+([^{}]+)\{/g,
  (_match, params: string) => `@theme ${params.trim()} prefix(tw) {`,
);
const inputCss = `
@layer theme, base, components, utilities;
${prefixedThemeCss}
@source ".";
@media important {
${utilitiesCss}
}
`;

export const generateTailwindCss = async () => {
  const result = await postcss([
    tailwind(),
  ]).process(inputCss, {
    from: generatedCssPath,
  });

  return result.css;
};
