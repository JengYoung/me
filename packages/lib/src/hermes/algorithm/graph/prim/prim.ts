import { PriorityQueue } from "../../../data-structure/priority-queue/index";
import type { WeightedEdge } from "../dijkstra/index";

type QueueItem<T> = {
  from: T | null;
  to: T;
  weight: number;
};

export const prim = <T>(start: T, getEdges: (node: T) => Iterable<WeightedEdge<T>>) => {
  const visited = new Set<T>();
  const selected: Array<{ from: T; to: T; weight: number }> = [];
  const queue = new PriorityQueue<QueueItem<T>>({
    compare: (a, b) => a.weight - b.weight,
  });
  let totalWeight = 0;

  queue.enqueue({ from: null, to: start, weight: 0 });

  while (!queue.isEmpty()) {
    const current = queue.dequeue() as QueueItem<T>;
    if (visited.has(current.to)) {
      continue;
    }

    visited.add(current.to);

    if (current.from !== null) {
      selected.push({ from: current.from, to: current.to, weight: current.weight });
      totalWeight += current.weight;
    }

    for (const edge of getEdges(current.to)) {
      if (!visited.has(edge.to)) {
        queue.enqueue({ from: current.to, to: edge.to, weight: edge.weight });
      }
    }
  }

  return {
    edges: selected,
    totalWeight,
  };
};
