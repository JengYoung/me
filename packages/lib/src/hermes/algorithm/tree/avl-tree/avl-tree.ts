type Compare<T> = (a: T, b: T) => number;

type AvlTreeNode<T> = {
  value: T;
  height: number;
  left: AvlTreeNode<T> | null;
  right: AvlTreeNode<T> | null;
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

const createNode = <T>(value: T): AvlTreeNode<T> => ({
  value,
  height: 1,
  left: null,
  right: null,
});

export class AvlTree<T> {
  private root: AvlTreeNode<T> | null = null;
  private length = 0;
  private compare: Compare<T>;

  constructor(options: { compare?: Compare<T> } = {}) {
    this.compare = options.compare ?? defaultCompare;
  }

  insert(value: T): boolean {
    const result = this.insertNode(this.root, value);
    this.root = result.node;

    if (result.inserted) {
      this.length += 1;
    }

    return result.inserted;
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
    const stack: Array<AvlTreeNode<T>> = [];
    let current = this.root;

    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.left;
      }

      const node = stack.pop() as AvlTreeNode<T>;
      values.push(node.value);
      current = node.right;
    }

    return values;
  }

  height() {
    return this.getHeight(this.root);
  }

  size() {
    return this.length;
  }

  isEmpty() {
    return this.length === 0;
  }

  private insertNode(node: AvlTreeNode<T> | null, value: T): { node: AvlTreeNode<T>; inserted: boolean } {
    if (node === null) {
      return {
        node: createNode(value),
        inserted: true,
      };
    }

    const compared = this.compare(value, node.value);

    if (compared === 0) {
      return {
        node,
        inserted: false,
      };
    }

    if (compared < 0) {
      const result = this.insertNode(node.left, value);
      node.left = result.node;

      return {
        node: this.balance(node),
        inserted: result.inserted,
      };
    }

    const result = this.insertNode(node.right, value);
    node.right = result.node;

    return {
      node: this.balance(node),
      inserted: result.inserted,
    };
  }

  private balance(node: AvlTreeNode<T>) {
    this.updateHeight(node);

    const balanceFactor = this.getBalanceFactor(node);

    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left as AvlTreeNode<T>);
      }

      return this.rotateRight(node);
    }

    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right as AvlTreeNode<T>);
      }

      return this.rotateLeft(node);
    }

    return node;
  }

  private rotateLeft(node: AvlTreeNode<T>) {
    const pivot = node.right as AvlTreeNode<T>;
    const pivotLeft = pivot.left;

    pivot.left = node;
    node.right = pivotLeft;

    this.updateHeight(node);
    this.updateHeight(pivot);

    return pivot;
  }

  private rotateRight(node: AvlTreeNode<T>) {
    const pivot = node.left as AvlTreeNode<T>;
    const pivotRight = pivot.right;

    pivot.right = node;
    node.left = pivotRight;

    this.updateHeight(node);
    this.updateHeight(pivot);

    return pivot;
  }

  private updateHeight(node: AvlTreeNode<T>) {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
  }

  private getBalanceFactor(node: AvlTreeNode<T> | null) {
    if (node === null) {
      return 0;
    }

    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private getHeight(node: AvlTreeNode<T> | null) {
    return node?.height ?? 0;
  }
}
