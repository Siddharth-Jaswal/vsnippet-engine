import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SnippetRecord } from "./types";

function firstMeaningfulLine(text: string): string {
  const line = text
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0);
  return line ?? "";
}

export async function readLanguageSnippets(baseFolder: string, languageId: string): Promise<SnippetRecord[]> {
  const languageDir = path.join(baseFolder, languageId);
  let files: string[];

  try {
    files = await fs.readdir(languageDir);
  } catch {
    return [];
  }

  const snippets: SnippetRecord[] = [];

  await Promise.all(
    files.map(async (fileName) => {
      const fullPath = path.join(languageDir, fileName);
      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isFile()) {
          return;
        }

        const body = await fs.readFile(fullPath, "utf8");
        const key = path.parse(fileName).name;
        snippets.push({
          key,
          languageId,
          name: key,
          filePath: fullPath,
          body,
          preview: firstMeaningfulLine(body).slice(0, 80)
        });
      } catch {
        // Ignore malformed or unreadable snippet files.
      }
    })
  );

  snippets.sort((a, b) => a.key.localeCompare(b.key));
  return snippets;
}
