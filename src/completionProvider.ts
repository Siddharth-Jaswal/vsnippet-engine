import * as vscode from "vscode";
import { longestSuffixPrefixOverlap } from "./overlap";
import { extractTriggerRegion } from "./prefix";
import { SnippetManager } from "./snippetManager";

export function createCompletionProvider(manager: SnippetManager): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document, position) {
      const trigger = extractTriggerRegion(document, position);
      if (!trigger || trigger.keyPrefix.length < 2) {
        return [];
      }

      const languageId = document.languageId;
      const matches = manager.findByPrefix(languageId, trigger.keyPrefix, 15);
      const linePrefix = document.lineAt(position.line).text.slice(0, position.character);

      return matches.map((snippet) => {
        const overlap = longestSuffixPrefixOverlap(linePrefix, snippet.body);
        const item = new vscode.CompletionItem(snippet.key, vscode.CompletionItemKind.Snippet);
        item.detail = "VSnippet Engine";
        item.documentation = new vscode.MarkdownString(
          `Snippet from local store\n\n\`${snippet.filePath.replace(/\\/g, "/")}\``
        );
        item.insertText = new vscode.SnippetString(overlap > 0 ? snippet.body.slice(overlap) : snippet.body);
        item.range = overlap > 0 ? new vscode.Range(position, position) : trigger.range;
        item.preselect = true;
        item.sortText = `0000_${snippet.key}`;
        return item;
      });
    }
  };
}

