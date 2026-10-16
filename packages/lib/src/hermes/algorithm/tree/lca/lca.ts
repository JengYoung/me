export class LowestCommonAncestor {
  private parents: number[][];
  private depths: number[];

  constructor(graph: number[][], root = 0) {
    if (graph.length === 0) {
      throw new RangeError("graph must contain at least one node");
    }

    this.assertNode(root, graph.length);

    const maxLevel = Math.max(1, Math.ceil(Math.log2(graph.length)) + 1);
    this.parents = Array.from({ length: maxLevel }, () => Array(graph.length).fill(-1));
    this.depths = Array(graph.length).fill(-1);

    this.build(graph, root);
  }

  lca(a: number, b: number) {
    this.assertConnectedNode(a);
    this.assertConnectedNode(b);

    let left = a;
    let right = b;

    if (this.depths[left] < this.depths[right]) {
      [left, right] = [right, left];
    }

    left = this.lift(left, this.depths[left] - this.depths[right]);

    if (left === right) {
      return left;
    }

    for (let level = this.parents.length - 1; level >= 0; level -= 1) {
      if (this.parents[level][left] !== this.parents[level][right]) {
        left = this.parents[level][left];
        right = this.parents[level][right];
      }
    }

    return this.parents[0][left];
  }

  distance(a: number, b: number) {
    const ancestor = this.lca(a, b);

    return this.depths[a] + this.depths[b] - this.depths[ancestor] * 2;
  }

  depth(node: number) {
    this.assertConnectedNode(node);

    return this.depths[node];
  }

  private build(graph: number[][], root: number) {
    const stack = [root];
    this.parents[0][root] = root;
    this.depths[root] = 0;

    while (stack.length > 0) {
      const node = stack.pop() as number;

      for (const next of graph[node]) {
        this.assertNode(next, graph.length);

        if (next === this.parents[0][node]) {
          continue;
        }

        if (this.depths[next] !== -1) {
          continue;
        }

        this.parents[0][next] = node;
        this.depths[next] = this.depths[node] + 1;
        stack.push(next);
      }
    }

    for (let level = 1; level < this.parents.length; level += 1) {
      for (let node = 0; node < graph.length; node += 1) {
        const parent = this.parents[level - 1][node];
        this.parents[level][node] = parent === -1 ? -1 : this.parents[level - 1][parent];
      }
    }
  }

  private lift(node: number, distance: number) {
    let current = node;
    let remainingDistance = distance;

    for (let level = 0; remainingDistance > 0; level += 1) {
      if (remainingDistance % 2 === 1) {
        current = this.parents[level][current];
      }

      remainingDistance = Math.floor(remainingDistance / 2);
    }

    return current;
  }

  private assertConnectedNode(node: number) {
    this.assertNode(node, this.depths.length);

    if (this.depths[node] === -1) {
      throw new RangeError("node is not connected to the root");
    }
  }

  private assertNode(node: number, nodeCount: number) {
    if (!Number.isInteger(node) || node < 0 || node >= nodeCount) {
      throw new RangeError("node is out of range");
    }
  }
}
