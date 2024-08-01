import { createContext } from "hono/jsx";
import { blogUrl } from "../../../config/values.ts";

export type OpenGraphContextValue = {
  type: "article";
  url: string;
  title: string;
  description: string;
  image: string;
};

export const OpenGraphContext = createContext<OpenGraphContextValue>({
  type: "article",
  url: blogUrl,
  title: "Untitled",
  description: "",
  image: `${blogUrl}/og-image`,
});
