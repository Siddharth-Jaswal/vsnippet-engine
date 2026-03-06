# VSnippet Engine

VSnippet Engine is a VS Code extension that provides local, language-aware snippet autocomplete with Trie-based prefix matching.

## Features

- Trie-backed prefix lookup for snippet names
- Inline ghost-style completion from local snippets
- IntelliSense completion entries for snippet triggers
- QuickPick command to insert snippets
- Command to save selected code as a snippet
- Command to reload snippets from disk
- Command to open the snippet folder in your OS file explorer
- Configurable storage folder and feature toggles

## Snippet Storage

Default folder:

```text
~/.codesnippet-engine/
```

Structure:

```text
.codesnippet-engine/
  cpp/
    binary_search.cpp
  python/
    binary_search.py
  javascript/
  typescript/
```

Each file is a snippet body. The file name (without extension) is used as the snippet key.

## Commands

- `Insert Snippet` (`Ctrl+Alt+S`)
- `Save Snippet` (`Ctrl+Alt+A`)
- `Reload Snippets`
- `Open Snippet Folder`
- Reliable alternates:
  - Insert: `Ctrl+K Ctrl+I`
  - Save: `Ctrl+K Ctrl+A`

## Settings

```json
{
  "vsnippetEngine.snippetFolder": "~/.codesnippet-engine",
  "vsnippetEngine.enableInlineAutocomplete": true,
  "vsnippetEngine.enableTrieMatching": true
}
```

## Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

## Publish Checklist

Before publishing, update these fields in `package.json`:

- `publisher`
- `repository.url`
- `homepage`
- `bugs.url`

Package and publish:

```bash
npm run package
npm run publish:patch
```

