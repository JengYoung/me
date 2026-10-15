export const topologicalSort = <T>(nodes: Iterable<T>, getNeighbors: (node: T) => Iterable<T>) => {
  const visited = new Set<T>();
  const visiting = new Set<T>();
  const result: T[] = [];

  const visit = (node: T) => {
    if (visited.has(node)) {
      return;
    }

    if (visiting.has(node)) {
      throw new Error("cycle detected");
    }

    visiting.add(node);

    for (const next of getNeighbors(node)) {
      visit(next);
    }

    visiting.delete(node);
    visited.add(node);
    result.push(node);
  };

  for (const node of nodes) {
    visit(node);
  }

  return result.reverse();
};
