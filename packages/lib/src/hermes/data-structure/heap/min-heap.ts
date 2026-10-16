import { Heap } from "./heap";

export class MinHeap<T> extends Heap<T> {
  compare(aIndex: number, bIndex: number): number {
    return this.compareBy(this.items[aIndex]) - this.compareBy(this.items[bIndex]);
  }
}
