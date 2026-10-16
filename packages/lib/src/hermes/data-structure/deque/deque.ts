export class Deque<T> {
  private items = new Map<number, T>();
  private head = 0;
  private tail = 0;

  size() {
    return this.tail - this.head;
  }

  isEmpty() {
    return this.size() === 0;
  }

  pushFront(value: T) {
    this.head -= 1;
    this.items.set(this.head, value);
  }

  pushBack(value: T) {
    this.items.set(this.tail, value);
    this.tail += 1;
  }

  popFront(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const value = this.items.get(this.head) as T;
    this.items.delete(this.head);
    this.head += 1;

    return value;
  }

  popBack(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    this.tail -= 1;
    const value = this.items.get(this.tail) as T;
    this.items.delete(this.tail);

    return value;
  }

  front(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.items.get(this.head) as T;
  }

  back(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.items.get(this.tail - 1) as T;
  }

  clear() {
    this.items.clear();
    this.head = 0;
    this.tail = 0;
  }

  toArray() {
    const result: T[] = [];

    for (let index = this.head; index < this.tail; index += 1) {
      result.push(this.items.get(index) as T);
    }

    return result;
  }
}
