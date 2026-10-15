import { Heap } from "../heap/heap";

type Compare<T> = (a: T, b: T) => number;

const defaultCompare = <T>(a: T, b: T) => {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
};

export class PriorityQueue<T> extends Heap<T> {
  private compareItems: Compare<T>;

  constructor(options: { compare?: Compare<T> } = {}) {
    super({ compareBy: () => 0 });
    this.compareItems = options.compare ?? defaultCompare;
  }

  compare(aIndex: number, bIndex: number): number {
    return this.compareItems(this.items[aIndex], this.items[bIndex]);
  }

  enqueue(value: T) {
    this.push(value);
  }

  dequeue(): T | null {
    return this.pop();
  }

  isEmpty() {
    return this.size() === 0;
  }

  clear() {
    this.items = [];
  }
}
