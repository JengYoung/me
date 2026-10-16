import { recoverValue } from './collection';
export interface TreeNode {
  readonly value: string;
  readonly label: string;
  readonly children?: readonly TreeNode[];
  /** A branch whose children may be loaded by the consumer after expansion. */
  readonly hasChildren?: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly posInSet?: number;
  readonly setSize?: number;
}
export interface TreeEntry {
  readonly node: TreeNode;
  readonly parent: string | null;
  readonly level: number;
  readonly posInSet: number;
  readonly setSize: number;
  readonly visible: boolean;
}
export const isTreeBranch = (node: TreeNode) => !!node.hasChildren || !!node.children?.length;
/** Preorder metadata shared by Tree View and Treegrid; no DOM or framework state. */
export function flattenTree(nodes: readonly TreeNode[], expanded: readonly string[] = []): TreeEntry[] {
  const result: TreeEntry[] = [];
  const values = new Set<string>();
  const opened = new Set(expanded);
  function visit(siblings: readonly TreeNode[], parent: string | null, level: number, visible: boolean) {
    for (const [index, node] of siblings.entries()) {
      if (!node.value || typeof node.value !== 'string' || values.has(node.value))
        throw new Error('Tree nodes need globally unique nonempty values.');
      if (typeof node.label !== 'string' || !node.label.trim()) throw new Error('Tree nodes need accessible labels.');
      const posInSet = node.posInSet ?? index + 1;
      const setSize = node.setSize ?? siblings.length;
      if (
        !Number.isInteger(posInSet) ||
        posInSet < 1 ||
        !Number.isInteger(setSize) ||
        (setSize !== -1 && setSize < posInSet)
      )
        throw new Error('Invalid tree sibling position or size.');
      values.add(node.value);
      result.push({ node, parent, level, posInSet, setSize, visible });
      if (node.children) visit(node.children, node.value, level + 1, visible && opened.has(node.value));
    }
  }
  visit(nodes, null, 1, true);
  return result;
}
export function sameTreeEntries(first: readonly TreeEntry[], second: readonly TreeEntry[]) {
  return (
    first.length === second.length &&
    first.every((entry, i) => {
      const next = second[i]!;
      return (
        entry.node.value === next.node.value &&
        entry.node.label === next.node.label &&
        !!entry.node.disabled === !!next.node.disabled &&
        isTreeBranch(entry.node) === isTreeBranch(next.node) &&
        entry.parent === next.parent &&
        entry.level === next.level &&
        entry.posInSet === next.posInSet &&
        entry.setSize === next.setSize &&
        entry.visible === next.visible
      );
    })
  );
}
export function recoverTreeValue(
  entries: readonly TreeEntry[],
  previous: readonly TreeEntry[],
  current: string | null,
): string | null {
  const enabled = entries.filter((entry) => entry.visible && !entry.node.disabled);
  if (enabled.some((entry) => entry.node.value === current)) return current;
  let entry =
    entries.find((item) => item.node.value === current) ?? previous.find((item) => item.node.value === current);
  const visited = new Set<string>();
  while (entry?.parent && !visited.has(entry.parent)) {
    visited.add(entry.parent);
    if (enabled.some((item) => item.node.value === entry!.parent)) return entry.parent;
    const parent = entry.parent;
    entry = entries.find((item) => item.node.value === parent) ?? previous.find((item) => item.node.value === parent);
  }
  return recoverValue(
    enabled.map((item) => item.node),
    previous.filter((item) => item.visible).map((item) => item.node),
    current,
  );
}
