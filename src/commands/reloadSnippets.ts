import * as vscode from "vscode";
import { EXTENSION } from "../constants";
import { SnippetManager } from "../snippetManager";

export function registerReloadSnippetsCommand(context: vscode.ExtensionContext, manager: SnippetManager): void {
  const disposable = vscode.commands.registerCommand(EXTENSION.commands.reloadSnippets, async () => {
    await manager.reloadAllFromDisk();
    vscode.window.showInformationMessage("VSnippet Engine: snippets reloaded.");
  });

  context.subscriptions.push(disposable);
}
