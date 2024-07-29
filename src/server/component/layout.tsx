import { html } from "hono/html";
import { type PropsWithChildren, useContext } from "hono/jsx";
import { OpenGraphContext } from "./opengraph-context.tsx";

const Document = ({ children }: PropsWithChildren) =>
  html`<!DOCTYPE html>${children}`;

const OpenGraph = () => {
  const { type, url, title, image, description } = useContext(OpenGraphContext);
  return (
    <>
      <meta property="og:type" content={type} />
      <meta
        property="og:url"
        content={url}
      />
      <meta
        property="og:title"
        content={title}
      />
      <meta
        property="og:description"
        content={description}
      />
      <meta
        property="og:image"
        content={image}
      />
    </>
  );
};

export const Layout = (
  props: PropsWithChildren,
) => {
  const { title, description } = useContext(OpenGraphContext);
  return (
    <Document>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <meta name="description" content={description}></meta>
          <OpenGraph />
          <title>{title}</title>
          <link rel="stylesheet" href="/static/tailwind.css" />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown-dark.css"
          />
          <link rel="stylesheet" href="/static/custom.css" />
        </head>
        <body class="markdown-body tw-box-border tw-min-w-[200px] tw-max-w-[980px] tw-mx-auto tw-p-[45px] sm:tw-p-[15px]">
          {props.children}
        </body>
      </html>
    </Document>
  );
};
