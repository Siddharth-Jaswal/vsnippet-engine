export function longestSuffixPrefixOverlap(beforeCursor: string, snippetBody: string): number {
  const max = Math.min(beforeCursor.length, snippetBody.length);
  for (let len = max; len > 0; len -= 1) {
    if (beforeCursor.slice(-len) === snippetBody.slice(0, len)) {
      return len;
    }
  }
  return 0;
}
