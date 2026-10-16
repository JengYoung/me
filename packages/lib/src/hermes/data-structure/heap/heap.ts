export abstract class Heap<T> {
  items: T[];
  compareBy: (item: T) => number;

  constructor(options: { compareBy: Heap<T>["compareBy"] }) {
    this.items = [];
    this.compareBy = options.compareBy;
  }

  size() {
    return this.items.length;
  }

  peek(): T | null {
    if (!this.size()) {
      return null;
    }

    return this.items[0];
  }

  push(value: T) {
    this.items.push(value);
    this.bubbleUp();
  }

  pop(): T | null {
    if (!this.size()) {
      return null;
    }

    const top = this.items[0];
    const last = this.items[this.size() - 1];
    this.items.pop();

    if (this.size()) {
      this.items[0] = last;
      this.bubbleDown();
    }

    return top;
  }

  swap(a: number, b: number) {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }

  /**
   * 루트에 더 가까워야 하는(우선순위가 높은) 쪽을 음수로 반환합니다.
   * MinHeap은 값이 작을수록, MaxHeap은 값이 클수록 우선순위가 높습니다.
   */
  abstract compare(aIndex: number, bIndex: number): number;

  bubbleUp() {
    let index = this.size() - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.compare(parentIndex, index) <= 0) {
        break;
      }

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  bubbleDown() {
    let index = 0;

    while (index * 2 + 1 < this.size()) {
      const leftIndex = index * 2 + 1;
      const rightIndex = index * 2 + 2;

      const isRightHigherPriority = rightIndex < this.size() && this.compare(rightIndex, leftIndex) < 0;

      const targetIndex = isRightHigherPriority ? rightIndex : leftIndex;

      if (this.compare(index, targetIndex) <= 0) {
        break;
      }

      this.swap(index, targetIndex);
      index = targetIndex;
    }
  }
}
