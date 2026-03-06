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
  const fullMatch = match[0];
  const start = position.translate(0, -fullMatch.length);
  return {
    keyPrefix,
    range: new vscode.Range(start, position)
  };
}
