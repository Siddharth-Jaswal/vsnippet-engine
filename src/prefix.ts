import * as vscode from "vscode";

export interface TriggerRegion {
  keyPrefix: string;
  range: vscode.Range;
}

export function extractTriggerRegion(
  document: vscode.TextDocument,
  position: vscode.Position
): TriggerRegion | undefined {
  const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
  const match = linePrefix.match(/([A-Za-z_][\w\-]*)([^\w]*)$/);
  if (!match) {
    return undefined;
  }

  const keyPrefix = match[1];
  const trailing = match[2] ?? "";
  const startOffset = keyPrefix.length + trailing.length;
  const start = position.translate(0, -startOffset);
  const end = position.translate(0, -trailing.length);
  return {
    keyPrefix,
    range: new vscode.Range(start, end)
  };
}
