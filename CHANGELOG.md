# Changelog

## Unreleased

- Ongoing improvements and fixes.

## 0.2.0 - 2026-03-08

- Improved inline completion behavior for snippet expansion.
- Added overlap-aware insertion to avoid duplicated already typed text.
- Added inline prioritization flow for `Tab` commit when a VSnippet candidate is active.
- Improved trigger-range handling so trailing punctuation is preserved during replacement.
- Added production documentation:
  - Usage guide
  - Production checklist
  - Demo capture guide
- Updated README to a release-ready product format.

## 0.1.0

- Initial public release.
- Local language-aware snippet storage under `~/.codesnippet-engine`.
- Trie-based prefix matching for fast lookup.
- Inline ghost completion and IntelliSense snippet completion.
- Commands:
  - Insert Snippet
  - Save Snippet
  - Reload Snippets
  - Open Snippet Folder
- Configurable settings:
  - `vsnippetEngine.snippetFolder`
  - `vsnippetEngine.enableInlineAutocomplete`
  - `vsnippetEngine.enableTrieMatching`
