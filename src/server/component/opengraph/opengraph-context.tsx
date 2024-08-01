import { createContext } from "hono/jsx";

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
  image: "https://blog.fardjad.com/og-image",
});
