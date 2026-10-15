export const bfs = <T>(start: T, getNeighbors: (node: T) => Iterable<T>) => {
  const visited = new Set<T>([start]);
  const queue: T[] = [start];
  const order: T[] = [];

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    order.push(node);

    for (const next of getNeighbors(node)) {
      if (visited.has(next)) {
        continue;
      }

      visited.add(next);
      queue.push(next);
    }
  }

  return order;
};
