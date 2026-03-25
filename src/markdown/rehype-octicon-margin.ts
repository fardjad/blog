import type { Plugin } from "unified";

type HtmlNode = {
  type?: string;
  tagName?: string;
  children?: HtmlNode[];
  properties: Record<string, unknown>;
};

const addOcticonMargin = (node: HtmlNode, parent?: HtmlNode) => {
  if (
    node.tagName === "svg" && parent?.type === "element" &&
    parent.tagName === "p"
  ) {
    const className = [
      node.properties.className ?? node.properties.class,
    ].flat().filter((value): value is string => typeof value === "string");

    if (className.includes("octicon")) {
      node.properties.className = [...className, "mr-2"];
    }
  }

  for (const child of node.children ?? []) {
    addOcticonMargin(child, node);
  }
};

export const rehypeAddMarginClassToOcticons: Plugin = () => {
  return (tree) => {
    addOcticonMargin(tree as HtmlNode);
  };
};
