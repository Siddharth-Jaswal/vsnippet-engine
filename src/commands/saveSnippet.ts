import * as vscode from "vscode";
import { EXTENSION } from "../constants";
import { SnippetManager } from "../snippetManager";

export function registerSaveSnippetCommand(context: vscode.ExtensionContext, manager: SnippetManager): void {
  const disposable = vscode.commands.registerCommand(EXTENSION.commands.saveSnippet, async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText.trim()) {
      vscode.window.showWarningMessage("Select code first, then run Save Snippet.");
      return;
    }

    const languageId = editor.document.languageId;
    const snippetName = await vscode.window.showInputBox({
      title: "Save Snippet",
      prompt: `Enter snippet name for "${languageId}"`,
      placeHolder: "e.g. binary_search",
      validateInput: (value) => (!value.trim() ? "Snippet name is required." : undefined)
    });

    if (!snippetName) {
      return;
    }

    try {
      const saved = await manager.saveSnippet(languageId, snippetName, selectedText);
      vscode.window.showInformationMessage(`Saved snippet "${saved.key}" to ${saved.filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Failed to save snippet: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}


