import { html, raw } from "hono/html";

export const PostBody = (props: { content: string }) => {
  return (
    <main>
      <article>{html`${raw(props.content)}`}</article>
    </main>
  );
};
