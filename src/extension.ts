import * as vscode from "vscode";
import { registerInsertSnippetCommand } from "./commands/insertSnippet";
import { registerOpenSnippetFolderCommand } from "./commands/openSnippetFolder";
import { registerReloadSnippetsCommand } from "./commands/reloadSnippets";
import { registerSaveSnippetCommand } from "./commands/saveSnippet";
import { createCompletionProvider } from "./completionProvider";
import { EXTENSION } from "./constants";
import { createInlineCompletionProvider } from "./inlineCompletionProvider";
import { extractTriggerRegion } from "./prefix";
import { SnippetManager } from "./snippetManager";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const manager = new SnippetManager();
  await manager.initialize();

  const selector: vscode.DocumentSelector = [{ scheme: "file" }];

  const completionTriggers = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-".split("");
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    selector,
    createCompletionProvider(manager),
    ...completionTriggers
  );

  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    selector,
    createInlineCompletionProvider(manager)
  );

  const updateInlineContext = async (editor?: vscode.TextEditor): Promise<void> => {
    const activeEditor = editor ?? vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.uri.scheme !== "file") {
      await vscode.commands.executeCommand("setContext", EXTENSION.context.hasInlineCandidate, false);
      return;
    }

    const enabled = vscode.workspace
      .getConfiguration(EXTENSION.configRoot)
      .get<boolean>("enableInlineAutocomplete", true);
    if (!enabled) {
      await vscode.commands.executeCommand("setContext", EXTENSION.context.hasInlineCandidate, false);
      return;
    }

    const position = activeEditor.selection.active;
    const trigger = extractTriggerRegion(activeEditor.document, position);
    if (!trigger || trigger.keyPrefix.length < 2) {
      await vscode.commands.executeCommand("setContext", EXTENSION.context.hasInlineCandidate, false);
      return;
    }

    const matches = manager.findByPrefix(activeEditor.document.languageId, trigger.keyPrefix, 1);
    const hasCandidate = Boolean(matches[0]?.body);
    await vscode.commands.executeCommand("setContext", EXTENSION.context.hasInlineCandidate, hasCandidate);
  };

  await updateInlineContext(vscode.window.activeTextEditor);

  const onConfigChange = vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (
      event.affectsConfiguration(EXTENSION.config.snippetFolder) ||
      event.affectsConfiguration(EXTENSION.config.enableTrieMatching) ||
      event.affectsConfiguration(EXTENSION.config.enableInlineAutocomplete)
    ) {
      await manager.reloadAllFromDisk();
    }
    await updateInlineContext(vscode.window.activeTextEditor);
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

    if (vscode.window.activeTextEditor?.document.uri.toString() === event.document.uri.toString()) {
      await updateInlineContext(vscode.window.activeTextEditor);
      const shouldPrioritize = vscode.workspace
        .getConfiguration(EXTENSION.configRoot)
        .get<boolean>("prioritizeInlineCompletions", true);
      if (shouldPrioritize) {
        await vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
      }
    }
  });

  const onSelectionChange = vscode.window.onDidChangeTextEditorSelection(async (event) => {
    if (event.textEditor === vscode.window.activeTextEditor) {
      await updateInlineContext(event.textEditor);
    }
  });

  const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    await updateInlineContext(editor);
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
    onSelectionChange,
    onActiveEditorChange,
    snippetWatcher,
    onSnippetCreate,
    onSnippetChange,
    onSnippetDelete
  );
}

export function deactivate(): void {
  // No-op
}

