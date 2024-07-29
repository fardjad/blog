import { createContext } from "hono/jsx";
import { generateGravatarImageLink } from "../../gravatar/avatar.ts";

export type OpenGraphContextValue = {
  type: "article";
  url: string;
  title: string;
  description: string;
  image: string;
};

export const OpenGraphContext = createContext<OpenGraphContextValue>({
  type: "article",
  url: "https://blog.fardjad.com",
  title: "Untitled",
  description: "",
  image: await generateGravatarImageLink("public@fardjad.com", 256),
});
