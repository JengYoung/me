export const floydWarshall = (matrix: number[][]) => {
  const distance = matrix.map((row) => [...row]);
  const size = distance.length;

  for (let mid = 0; mid < size; mid += 1) {
    for (let from = 0; from < size; from += 1) {
      for (let to = 0; to < size; to += 1) {
        const next = distance[from][mid] + distance[mid][to];
        if (next < distance[from][to]) {
          distance[from][to] = next;
        }
      }
    }
  }

  return distance;
};
