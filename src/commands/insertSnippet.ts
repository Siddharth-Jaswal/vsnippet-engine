import * as vscode from "vscode";
import { EXTENSION } from "../constants";
import { SnippetManager } from "../snippetManager";

export function registerInsertSnippetCommand(
  context: vscode.ExtensionContext,
  manager: SnippetManager
): void {
  const disposable = vscode.commands.registerCommand(EXTENSION.commands.insertSnippet, async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const languageId = editor.document.languageId;
    const snippets = manager.getSnippetsForLanguage(languageId);

    if (snippets.length === 0) {
      vscode.window.showInformationMessage(`No snippets found for language "${languageId}".`);
      return;
    }

    const selected = await vscode.window.showQuickPick(
      snippets.map((snippet) => ({
        label: snippet.key,
        detail: snippet.preview || snippet.filePath
      })),
      {
        title: `Insert Snippet (${languageId})`,
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: "Search snippets by name"
      }
    );

    if (!selected) {
      return;
    }

    const snippet = manager.getByKey(languageId, selected.label);
    if (!snippet) {
      return;
    }

    await editor.insertSnippet(new vscode.SnippetString(snippet.body), editor.selection);
  });

  context.subscriptions.push(disposable);
}


