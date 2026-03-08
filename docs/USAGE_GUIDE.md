# Usage Guide

## Goal

Validate all high-impact user flows for VSnippet Engine in a development host.

## Prerequisites

- VS Code `>= 1.90.0`
- Extension compiled: `npm run compile`
- `editor.inlineSuggest.enabled: true`
- `vsnippetEngine.enableInlineAutocomplete: true`
- `vsnippetEngine.prioritizeInlineCompletions: true`

## Recommended Test Setup

Use an isolated snippet folder for reproducible tests:

```json
"vsnippetEngine.snippetFolder": "d:/Repos/VSnippet/.tmp-snippets"
```

## Scenario 1: Save Snippet

1. Open `test.ts`.
2. Write reusable code and select it.
3. Run `Save Snippet`.
4. Enter key `add`.

Expected:

- Success notification appears.
- Snippet file is created under the language folder.

## Scenario 2: Ghost Text Suggestion

1. In the same language file, type `ad`.

Expected:

- Ghost text appears from matching snippet key.

## Scenario 3: Tab Commit

1. With ghost text visible, press `Tab`.

Expected:

- Suggestion is committed.
- Typed trigger text is replaced/expanded correctly.

## Scenario 4: Prefix Overlap Correctness

1. Create a snippet whose body starts with `int add`.
2. Type `int add`.
3. Press `Tab`.

Expected:

- Already typed prefix is not duplicated.
- Only remaining snippet body is inserted.

## Scenario 5: Interference with Other Tools

1. Enable other AI/snippet extensions in Extension Host.
2. Type a known snippet prefix.
3. Press `Tab` while VSnippet ghost text is visible.

Expected:

- VSnippet suggestion commits when `prioritizeInlineCompletions` is enabled.
- No conflicting insertion from other tools in this context.

## Scenario 6: Reload on Disk Change

1. Add or edit snippet files inside configured snippet folder.
2. Run `Reload Snippets` or wait for watcher update.

Expected:

- New/updated snippets become searchable and suggestible.

## Scenario 7: QuickPick Insert

1. Run `Insert Snippet`.
2. Search and pick a snippet.

Expected:

- Snippet inserts at cursor/selection.

## Known Constraints

- Trigger prefix is currently at least 2 characters.
- Suggestion quality depends on matching current `document.languageId` mapping.
