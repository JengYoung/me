type Compare<T> = (a: T, b: T) => number;

type BinarySearchTreeNode<T> = {
  value: T;
  left: BinarySearchTreeNode<T> | null;
  right: BinarySearchTreeNode<T> | null;
};

const defaultCompare = <T>(a: T, b: T) => {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
};

const createNode = <T>(value: T): BinarySearchTreeNode<T> => ({
  value,
  left: null,
  right: null,
});

export class BinarySearchTree<T> {
  private root: BinarySearchTreeNode<T> | null = null;
  private length = 0;
  private compare: Compare<T>;

  constructor(options: { compare?: Compare<T> } = {}) {
    this.compare = options.compare ?? defaultCompare;
  }

  insert(value: T): boolean {
    if (this.root === null) {
      this.root = createNode(value);
      this.length += 1;

      return true;
    }

    let current = this.root;

    while (true) {
      const compared = this.compare(value, current.value);

      if (compared === 0) {
        return false;
      }

      if (compared < 0) {
        if (current.left === null) {
          current.left = createNode(value);
          this.length += 1;

          return true;
        }

        current = current.left;
        continue;
      }

      if (current.right === null) {
        current.right = createNode(value);
        this.length += 1;

        return true;
      }

      current = current.right;
    }
  }

  has(value: T): boolean {
    let current = this.root;

    while (current !== null) {
      const compared = this.compare(value, current.value);

      if (compared === 0) {
        return true;
      }

      current = compared < 0 ? current.left : current.right;
    }

    return false;
  }

  inOrder(): T[] {
    const values: T[] = [];
    const stack: Array<BinarySearchTreeNode<T>> = [];
    let current = this.root;

    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }

      const node = stack.pop() as BinarySearchTreeNode<T>;
      values.push(node.value);
      current = node.right;
    }

    return values;
  }

  min(): T | null {
    let current = this.root;
    if (current === null) {
      return null;
    }

    while (current.left !== null) {
      current = current.left;
    }

    return current.value;
  }

  max(): T | null {
    let current = this.root;
    if (current === null) {
      return null;
    }

    while (current.right !== null) {
      current = current.right;
    }

    return current.value;
  }

  size() {
    return this.length;
  }

  isEmpty() {
    return this.length === 0;
  }
}
