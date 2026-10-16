import { PriorityQueue } from "../../../data-structure/priority-queue/index";

export type WeightedEdge<T> = {
  to: T;
  weight: number;
};

export const dijkstra = <T>(start: T, getEdges: (node: T) => Iterable<WeightedEdge<T>>) => {
  const distances = new Map<T, number>([[start, 0]]);
  const queue = new PriorityQueue<{ node: T; distance: number }>({
    compare: (a, b) => a.distance - b.distance,
  });

  queue.enqueue({ node: start, distance: 0 });

  while (!queue.isEmpty()) {
    const current = queue.dequeue() as { node: T; distance: number };

    if (current.distance > (distances.get(current.node) as number)) {
      continue;
    }

    for (const edge of getEdges(current.node)) {
      const nextDistance = current.distance + edge.weight;
      const previousDistance = distances.get(edge.to);

      if (previousDistance !== undefined && previousDistance <= nextDistance) {
        continue;
      }

      distances.set(edge.to, nextDistance);
      queue.enqueue({ node: edge.to, distance: nextDistance });
    }
  }

  return distances;
};
