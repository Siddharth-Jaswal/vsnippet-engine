class TrieNode {
  public readonly children = new Map<string, TrieNode>();
  public isTerminal = false;
}

export class Trie {
  private readonly root = new TrieNode();

  public insert(word: string): void {
    if (!word) {
      return;
    }

    let node = this.root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (!next) {
        next = new TrieNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    node.isTerminal = true;
  }

  public getByPrefix(prefix: string, limit = 25): string[] {
    const results: string[] = [];
    let node = this.root;

    for (const ch of prefix) {
      const next = node.children.get(ch);
      if (!next) {
        return results;
      }
      node = next;
    }

    this.collect(prefix, node, results, limit);
    return results;
  }

  private collect(prefix: string, node: TrieNode, out: string[], limit: number): void {
    if (out.length >= limit) {
      return;
    }

    if (node.isTerminal) {
      out.push(prefix);
    }

    const ordered = Array.from(node.children.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (const [ch, child] of ordered) {
      if (out.length >= limit) {
        break;
      }
      this.collect(`${prefix}${ch}`, child, out, limit);
    }
  }
}
