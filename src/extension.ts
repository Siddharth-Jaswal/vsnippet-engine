import * as vscode from "vscode";
import { registerInsertSnippetCommand } from "./commands/insertSnippet";
import { registerOpenSnippetFolderCommand } from "./commands/openSnippetFolder";
import { registerReloadSnippetsCommand } from "./commands/reloadSnippets";
import { registerSaveSnippetCommand } from "./commands/saveSnippet";
import { createCompletionProvider } from "./completionProvider";
import { EXTENSION } from "./constants";
import { createInlineCompletionProvider } from "./inlineCompletionProvider";
import { SnippetManager } from "./snippetManager";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const manager = new SnippetManager();
  await manager.initialize();

  const selector: vscode.DocumentSelector = [{ scheme: "file" }];

  const completionTriggers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("");
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    selector,
    createCompletionProvider(manager),
    ...completionTriggers
  );

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    selector,
    createInlineCompletionProvider(manager)
  );

  const onConfigChange = vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (
      event.affectsConfiguration(EXTENSION.config.snippetFolder) ||
      event.affectsConfiguration(EXTENSION.config.enableTrieMatching)
    ) {
      await manager.reloadAllFromDisk();
    }
  });

  const watcherPattern = new vscode.RelativePattern(manager.getConfiguredFolder(), "**/*");
  const snippetWatcher = vscode.workspace.createFileSystemWatcher(watcherPattern);
  const triggerReload = async (): Promise<void> => {
    await manager.reloadAllFromDisk();
  };
  const onSnippetCreate = snippetWatcher.onDidCreate(triggerReload);
  const onSnippetChange = snippetWatcher.onDidChange(triggerReload);
  const onSnippetDelete = snippetWatcher.onDidDelete(triggerReload);

  const onDocChange = vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (event.contentChanges.length === 0) {
      return;
    }
    if (event.document.isUntitled || event.document.uri.scheme !== "file") {
      return;
    }

    const pathLower = event.document.uri.fsPath.toLowerCase();
    const folderLower = manager.getConfiguredFolder().toLowerCase();
    if (pathLower.startsWith(folderLower)) {
      await manager.reloadAllFromDisk();
    }
  });

  registerInsertSnippetCommand(context, manager);
  registerSaveSnippetCommand(context, manager);
  registerReloadSnippetsCommand(context, manager);
  registerOpenSnippetFolderCommand(context, manager);

  context.subscriptions.push(
    completionProvider,
    inlineProvider,
    onConfigChange,
    onDocChange,
    snippetWatcher,
    onSnippetCreate,
    onSnippetChange,
    onSnippetDelete
  );
}

export function deactivate(): void {
  // No-op
}

