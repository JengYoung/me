export const dfs = <T>(start: T, getNeighbors: (node: T) => Iterable<T>) => {
  const visited = new Set<T>();
  const stack: T[] = [start];
  const order: T[] = [];

  while (stack.length) {
    const node = stack.pop() as T;
    if (visited.has(node)) {
      continue;
    }

    visited.add(node);
    order.push(node);

    const neighbors = [...getNeighbors(node)];
    for (let index = neighbors.length - 1; index >= 0; index -= 1) {
      stack.push(neighbors[index]);
    }
  }

  return order;
};
