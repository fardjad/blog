import type { Plugin } from "unified";

type MarkdownNode = {
  type?: string;
  depth?: number;
  children?: MarkdownNode[];
};

const removeTitle = (node: MarkdownNode) => {
  if (node.children == null) {
    return;
  }

  node.children = node.children.filter((child) =>
    !(child.type === "heading" && child.depth === 1)
  );

  for (const child of node.children) {
    removeTitle(child);
  }
};

export const remarkRemoveTitle: Plugin = () => {
  return (tree) => {
    removeTitle(tree as MarkdownNode);
  };
};
