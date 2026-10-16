export type DirectedWeightedEdge<T> = {
  from: T;
  to: T;
  weight: number;
};

export const bellmanFord = <T>(nodes: Iterable<T>, edges: DirectedWeightedEdge<T>[], start: T) => {
  const distances = new Map<T, number>();

  for (const node of nodes) {
    distances.set(node, Number.POSITIVE_INFINITY);
  }
  distances.set(start, 0);

  const nodeList = [...distances.keys()];

  for (let count = 0; count < nodeList.length - 1; count += 1) {
    let updated = false;

    for (const edge of edges) {
      const fromDistance = distances.get(edge.from) ?? Number.POSITIVE_INFINITY;
      const toDistance = distances.get(edge.to) ?? Number.POSITIVE_INFINITY;

      if (fromDistance !== Number.POSITIVE_INFINITY && fromDistance + edge.weight < toDistance) {
        distances.set(edge.to, fromDistance + edge.weight);
        updated = true;
      }
    }

    if (!updated) {
      break;
    }
  }

  const hasNegativeCycle = edges.some((edge) => {
    const fromDistance = distances.get(edge.from) ?? Number.POSITIVE_INFINITY;
    const toDistance = distances.get(edge.to) ?? Number.POSITIVE_INFINITY;

    return fromDistance !== Number.POSITIVE_INFINITY && fromDistance + edge.weight < toDistance;
  });

  return {
    distances,
    hasNegativeCycle,
  };
};
