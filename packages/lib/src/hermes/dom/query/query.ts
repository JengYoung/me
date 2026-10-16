export const queryElement = <T extends Element = Element>(root: ParentNode, selector: string): T | undefined => {
  return root.querySelector<T>(selector) ?? undefined;
};

export const queryElements = <T extends Element = Element>(root: ParentNode, selector: string): T[] => {
  return Array.from(root.querySelectorAll<T>(selector));
};
