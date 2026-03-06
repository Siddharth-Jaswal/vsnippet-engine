# VSnippet Engine

VSnippet Engine is a local-first VS Code extension for saving, searching, and inserting reusable code snippets with intelligent autocomplete.

It is designed as a lightweight personal snippet assistant:
- no cloud dependency
- fast in-memory lookup
- language-aware snippet organization

## Why VSnippet Engine

- Local snippet storage under your own machine
- Trie-based prefix matching for low-latency suggestions
- Inline ghost completion while typing
- Quick snippet insertion using searchable command palette UI
- One-step save flow from selected code

## Core Features

- Prefix autocomplete powered by an in-memory Trie
- Inline ghost text suggestions (`Tab` to accept)
- IntelliSense completion items for snippet keys
- Save selected code as snippet
- Insert snippet with QuickPick fuzzy search
- Reload snippets from disk without restarting VS Code
- Open snippet folder directly from command palette

## Snippet Storage Model

Default root:

```text
~/.codesnippet-engine/
```

Language-based structure:

```text
.codesnippet-engine/
  cpp/
    binary_search.cpp
    dsu_union.cpp
  python/
    binary_search.py
  javascript/
  typescript/
```

Notes:
- Each file is treated as one snippet.
- File name (without extension) is used as snippet key.
- Snippets are cached in memory at startup and refreshed on relevant changes.

## Installation

From VS Code Marketplace (after publication):
- Open Extensions view
- Search `VSnippet Engine`
- Click Install

Local `.vsix` install:
- `Extensions: Install from VSIX...`
- Select your packaged `.vsix` file

## Quick Start

1. Open any code file (for example, `cpp`, `python`, `javascript`, `typescript`).
2. Select reusable code and run `Save Snippet`.
3. Enter a snippet name (example: `binary_search`).
4. Start typing the snippet key prefix in the same language file.
5. Accept inline suggestion with `Tab`, or run `Insert Snippet`.

## Commands

| Command | ID | Default Keybinding |
|---|---|---|
| Insert Snippet | `vsnippetEngine.insertSnippet` | `Ctrl+Alt+S` / `Ctrl+K Ctrl+I` |
| Save Snippet | `vsnippetEngine.saveSnippet` | `Ctrl+Alt+A` / `Ctrl+K Ctrl+A` |
| Reload Snippets | `vsnippetEngine.reloadSnippets` | Command Palette |
| Open Snippet Folder | `vsnippetEngine.openSnippetFolder` | Command Palette |

## Extension Settings

```json
{
  "vsnippetEngine.snippetFolder": "~/.codesnippet-engine",
  "vsnippetEngine.enableInlineAutocomplete": true,
  "vsnippetEngine.enableTrieMatching": true
}
```

| Setting | Type | Default | Description |
|---|---|---|---|
| `vsnippetEngine.snippetFolder` | `string` | `~/.codesnippet-engine` | Root folder for all language snippet directories |
| `vsnippetEngine.enableInlineAutocomplete` | `boolean` | `true` | Enables ghost-text inline completion |
| `vsnippetEngine.enableTrieMatching` | `boolean` | `true` | Enables Trie-based prefix matching |

## Language Handling

The extension uses `document.languageId` and normalizes common variants:
- `typescriptreact -> typescript`
- `javascriptreact -> javascript`
- `cplusplus -> cpp`

## Architecture (High Level)

- `src/trie.ts`: Trie implementation for prefix search
- `src/snippetLoader.ts`: Loads snippets from disk
- `src/snippetManager.ts`: In-memory snippet/trie cache + persistence
- `src/completionProvider.ts`: IntelliSense completion items
- `src/inlineCompletionProvider.ts`: Ghost text inline suggestions
- `src/commands/*`: Insert, save, reload, and open-folder commands
- `src/extension.ts`: Extension activation and provider/command wiring

## Development

```bash
npm install
npm run compile
```

Run extension in development:
- Press `F5` to open an Extension Development Host
- Test commands and inline completion in that host window

## Packaging and Publishing

```bash
npm run package
npm run publish:patch
```

Before publishing, confirm these fields in `package.json`:
- `publisher`
- `repository.url`
- `homepage`
- `bugs.url`

## License

MIT. See [LICENSE](LICENSE).

