import * as vscode from "vscode";
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
        const item = new vscode.CompletionItem(snippet.key, vscode.CompletionItemKind.Snippet);
        item.detail = "VSnippet Engine";
        item.documentation = new vscode.MarkdownString(
          `Snippet from local store\n\n\`${snippet.filePath.replace(/\\/g, "/")}\``
        );
        if (snippet.body.startsWith(linePrefix)) {
          item.insertText = new vscode.SnippetString(snippet.body.slice(linePrefix.length));
          item.range = new vscode.Range(position, position);
        } else {
          item.insertText = new vscode.SnippetString(snippet.body);
          item.range = trigger.range;
        }
        return item;
      });
    }
  };
}

