export class UnionFind<T> {
  private parents = new Map<T, T>();
  private sizes = new Map<T, number>();
  private components = 0;

  constructor(values: Iterable<T> = []) {
    for (const value of values) {
      this.add(value);
    }
  }

  add(value: T) {
    if (this.parents.has(value)) {
      return;
    }

    this.parents.set(value, value);
    this.sizes.set(value, 1);
    this.components += 1;
  }

  find(value: T): T {
    this.add(value);

    const parent = this.parents.get(value) as T;
    if (parent === value) {
      return value;
    }

    const root = this.find(parent);
    this.parents.set(value, root);

    return root;
  }

  union(a: T, b: T): boolean {
    let aRoot = this.find(a);
    let bRoot = this.find(b);

    if (aRoot === bRoot) {
      return false;
    }

    if ((this.sizes.get(aRoot) as number) < (this.sizes.get(bRoot) as number)) {
      [aRoot, bRoot] = [bRoot, aRoot];
    }

    this.parents.set(bRoot, aRoot);
    this.sizes.set(aRoot, (this.sizes.get(aRoot) as number) + (this.sizes.get(bRoot) as number));
    this.components -= 1;

    return true;
  }

  connected(a: T, b: T) {
    return this.find(a) === this.find(b);
  }

  sizeOf(value: T) {
    return this.sizes.get(this.find(value)) as number;
  }

  count() {
    return this.components;
  }

  groups() {
    const groups = new Map<T, T[]>();

    for (const value of this.parents.keys()) {
      const root = this.find(value);
      const values = groups.get(root) ?? [];
      values.push(value);
      groups.set(root, values);
    }

    return [...groups.values()];
  }
}
