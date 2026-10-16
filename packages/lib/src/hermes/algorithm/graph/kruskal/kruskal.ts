import { UnionFind } from "../../../data-structure/union-find/index";

export type WeightedUndirectedEdge<T> = {
  from: T;
  to: T;
  weight: number;
};

export const kruskal = <T>(nodes: Iterable<T>, edges: WeightedUndirectedEdge<T>[]) => {
  const unionFind = new UnionFind(nodes);
  const selected: WeightedUndirectedEdge<T>[] = [];
  let totalWeight = 0;

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  for (const edge of sortedEdges) {
    if (!unionFind.union(edge.from, edge.to)) {
      continue;
    }

    selected.push(edge);
    totalWeight += edge.weight;
  }

  return {
    edges: selected,
    totalWeight,
  };
};
