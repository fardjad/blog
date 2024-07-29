import type { Transformer } from "unified";
import { SKIP, visit, type Visitor } from "unist-util-visit";
import type { Heading } from "npm:@types/mdast";

export const remarkRemoveTitle = (): Transformer => {
  return function transformer(tree): void {
    const visitor: Visitor<Heading> = (node, _index, parent) => {
      if (node.type === "heading" && node.depth === 1 && parent != null) {
        parent.children = parent.children.filter((child) => child !== node);
      }

      return SKIP;
    };

    visit(tree, "heading", visitor);
  };
};
