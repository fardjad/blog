import { hasProperty } from "hast-util-has-property";
import { visit } from "unist-util-visit";
import type { Root } from "npm:@types/hast";

export const rehypeAddMarginClassToOcticons = () => {
  return (tree: Root) => {
    visit(tree, "element", (node, _index, parent) => {
      if (
        node.tagName !== "svg" || parent?.type !== "element" ||
        parent?.tagName !== "p"
      ) {
        return;
      }

      if (!hasProperty(node, "class")) {
        return;
      }

      const className = [node.properties.class].flat() as string[];

      if (!className.includes("octicon")) {
        return;
      }

      node.properties.className = [...className, "mr-2"];
    });
  };
};
