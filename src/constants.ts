export const EXTENSION = {
  configRoot: "vsnippetEngine",
  context: {
    hasInlineCandidate: "vsnippetEngine.hasInlineCandidate"
  },
  commands: {
    insertSnippet: "vsnippetEngine.insertSnippet",
    saveSnippet: "vsnippetEngine.saveSnippet",
    reloadSnippets: "vsnippetEngine.reloadSnippets",
    openSnippetFolder: "vsnippetEngine.openSnippetFolder"
  },
  config: {
    snippetFolder: "vsnippetEngine.snippetFolder",
    enableInlineAutocomplete: "vsnippetEngine.enableInlineAutocomplete",
    enableTrieMatching: "vsnippetEngine.enableTrieMatching",
    prioritizeInlineCompletions: "vsnippetEngine.prioritizeInlineCompletions"
  }
} as const;
