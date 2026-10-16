export class FenwickTree {
  private tree: number[];
  private values: number[];

  constructor(sizeOrValues: number | number[]) {
    const size = Array.isArray(sizeOrValues) ? sizeOrValues.length : sizeOrValues;
    this.tree = Array(size + 1).fill(0);
    this.values = Array(size).fill(0);

    if (Array.isArray(sizeOrValues)) {
      sizeOrValues.forEach((value, index) => {
        this.set(index, value);
      });
    }
  }

  size() {
    return this.values.length;
  }

  update(index: number, delta: number) {
    this.assertIndex(index);

    this.values[index] += delta;

    for (let current = index + 1; current < this.tree.length; current += current & -current) {
      this.tree[current] += delta;
    }
  }

  set(index: number, value: number) {
    this.assertIndex(index);
    this.update(index, value - this.values[index]);
  }

  get(index: number) {
    this.assertIndex(index);

    return this.values[index];
  }

  prefixSum(index: number) {
    if (index < 0) {
      return 0;
    }

    if (index >= this.size()) {
      throw new RangeError("index is out of range");
    }

    let result = 0;

    for (let current = index + 1; current > 0; current -= current & -current) {
      result += this.tree[current];
    }

    return result;
  }

  rangeSum(left: number, right: number) {
    if (left > right) {
      return 0;
    }

    this.assertIndex(left);
    this.assertIndex(right);

    return this.prefixSum(right) - this.prefixSum(left - 1);
  }

  private assertIndex(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= this.size()) {
      throw new RangeError("index is out of range");
    }
  }
}
