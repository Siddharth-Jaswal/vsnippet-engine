import * as vscode from "vscode";
import { EXTENSION } from "./constants";
import { longestSuffixPrefixOverlap } from "./overlap";
import { extractTriggerRegion } from "./prefix";
import { SnippetManager } from "./snippetManager";

export function createInlineCompletionProvider(manager: SnippetManager): vscode.InlineCompletionItemProvider {
  return {
    provideInlineCompletionItems(document, position) {
      const enabled = vscode.workspace
        .getConfiguration(EXTENSION.configRoot)
        .get<boolean>("enableInlineAutocomplete", true);
      if (!enabled) {
        return [];
      }

      const trigger = extractTriggerRegion(document, position);
      if (!trigger || trigger.keyPrefix.length < 2) {
        return [];
      }

      const matches = manager.findByPrefix(document.languageId, trigger.keyPrefix, 1);
      const first = matches[0];
      if (!first) {
        return [];
      }

      const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
      const overlap = longestSuffixPrefixOverlap(linePrefix, first.body);
      const insertText = overlap > 0 ? first.body.slice(overlap) : first.body;
      const range = overlap > 0 ? new vscode.Range(position, position) : trigger.range;
      if (!insertText) {
        return [];
      }

      const completion = new vscode.InlineCompletionItem(insertText, range);
      return [completion];
    }
  };
}

