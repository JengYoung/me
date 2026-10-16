class TrieNode {
  children = new Map<string, TrieNode>();
  isWord = false;
}

export class Trie {
  private root = new TrieNode();
  private words = 0;

  size() {
    return this.words;
  }

  insert(word: string) {
    let node = this.root;

    for (const char of word) {
      const next = node.children.get(char) ?? new TrieNode();
      node.children.set(char, next);
      node = next;
    }

    if (!node.isWord) {
      this.words += 1;
    }

    node.isWord = true;
  }

  has(word: string) {
    return this.findNode(word)?.isWord ?? false;
  }

  startsWith(prefix: string) {
    return this.findNode(prefix) !== null;
  }

  delete(word: string) {
    if (!this.has(word)) {
      return false;
    }

    const remove = (node: TrieNode, index: number): boolean => {
      if (index === word.length) {
        node.isWord = false;
        this.words -= 1;

        return node.children.size === 0;
      }

      const char = word[index];
      const next = node.children.get(char) as TrieNode;
      const shouldDeleteChild = remove(next, index + 1);

      if (shouldDeleteChild) {
        node.children.delete(char);
      }

      return !node.isWord && node.children.size === 0;
    };

    remove(this.root, 0);

    return true;
  }

  collect(prefix = "") {
    const node = this.findNode(prefix);
    if (!node) {
      return [];
    }

    const result: string[] = [];

    const visit = (current: TrieNode, word: string) => {
      if (current.isWord) {
        result.push(word);
      }

      for (const [char, next] of current.children) {
        visit(next, word + char);
      }
    };

    visit(node, prefix);

    return result;
  }

  private findNode(value: string): TrieNode | null {
    let node = this.root;

    for (const char of value) {
      const next = node.children.get(char);
      if (!next) {
        return null;
      }

      node = next;
    }

    return node;
  }
}
