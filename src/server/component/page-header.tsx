import { useContext } from "hono/jsx";
import { OpenGraphContext } from "./opengraph-context.tsx";

export const PageHeader = () => {
  const { title } = useContext(OpenGraphContext);
  return (
    <header class="tw-mb-4">
      <h1>{title}</h1>
    </header>
  );
};
