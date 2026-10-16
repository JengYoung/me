import { Heap } from "./heap";

export class MaxHeap<T> extends Heap<T> {
  compare(aIndex: number, bIndex: number): number {
    return this.compareBy(this.items[bIndex]) - this.compareBy(this.items[aIndex]);
  }
}
