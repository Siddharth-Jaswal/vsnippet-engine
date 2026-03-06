import * as vscode from "vscode";
import { EXTENSION } from "../constants";
import { SnippetManager } from "../snippetManager";

export function registerOpenSnippetFolderCommand(
  context: vscode.ExtensionContext,
  manager: SnippetManager
): void {
  const disposable = vscode.commands.registerCommand(EXTENSION.commands.openSnippetFolder, async () => {
    const folder = manager.getConfiguredFolder();
    const ok = await vscode.env.openExternal(vscode.Uri.file(folder));
    if (!ok) {
      vscode.window.showErrorMessage(`Could not open snippet folder: ${folder}`);
    }
  });

  context.subscriptions.push(disposable);
}
