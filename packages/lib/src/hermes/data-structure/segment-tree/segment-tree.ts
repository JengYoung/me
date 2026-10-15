type SegmentTreeOptions<T> = {
  identity: T;
  combine: (left: T, right: T) => T;
};

export class SegmentTree<T> {
  private tree: T[];
  private length: number;
  private identity: T;
  private combine: (left: T, right: T) => T;

  constructor(values: T[], options: SegmentTreeOptions<T>) {
    this.length = values.length;
    this.identity = options.identity;
    this.combine = options.combine;
    this.tree = Array(Math.max(1, this.length * 2)).fill(this.identity);

    for (let index = 0; index < this.length; index += 1) {
      this.tree[this.length + index] = values[index];
    }

    for (let index = this.length - 1; index > 0; index -= 1) {
      this.tree[index] = this.combine(this.tree[index * 2], this.tree[index * 2 + 1]);
    }
  }

  size() {
    return this.length;
  }

  update(index: number, value: T) {
    this.assertIndex(index);

    let current = index + this.length;
    this.tree[current] = value;

    while (current > 1) {
      current = Math.floor(current / 2);
      this.tree[current] = this.combine(this.tree[current * 2], this.tree[current * 2 + 1]);
    }
  }

  query(left: number, right: number): T {
    if (left > right) {
      return this.identity;
    }

    this.assertIndex(left);
    this.assertIndex(right);

    let start = left + this.length;
    let end = right + this.length;
    let leftResult = this.identity;
    let rightResult = this.identity;

    while (start <= end) {
      if (start % 2 === 1) {
        leftResult = this.combine(leftResult, this.tree[start]);
        start += 1;
      }

      if (end % 2 === 0) {
        rightResult = this.combine(this.tree[end], rightResult);
        end -= 1;
      }

      start = Math.floor(start / 2);
      end = Math.floor(end / 2);
    }

    return this.combine(leftResult, rightResult);
  }

  private assertIndex(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      throw new RangeError("index is out of range");
    }
  }
}
