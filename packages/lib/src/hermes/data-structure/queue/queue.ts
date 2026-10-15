class Node<T> {
  value: T;
  next: Node<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class Queue<T> {
  _size: number;
  _head: Node<T> | null;
  _tail: Node<T> | null;

  constructor() {
    this._size = 0;
    this._head = null;
    this._tail = null;
  }

  enqueue(newValue: T) {
    const newNode = new Node(newValue);

    if (this._head === null) {
      this._head = this._tail = newNode;
      this._size += 1;
      return;
    }

    if (this._tail) {
      this._tail.next = newNode;
    }

    this._tail = newNode;
    this._size += 1;
  }

  dequeue(): T | null {
    if (this._head) {
      const value = this._head.value;
      this._head = this._head.next;
      this._size -= 1;

      return value;
    }

    return null;
  }

  peek() {
    if (this._head) {
      return this._head;
    }

    return null;
  }

  size() {
    return this._size;
  }

  isEmpty() {
    return this._size === 0;
  }
}
