import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { EXTENSION } from "./constants";
import { readLanguageSnippets } from "./snippetLoader";
import { Trie } from "./trie";
import { SnippetRecord } from "./types";

function expandHome(inputPath: string): string {
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function normalizeSnippetName(name: string): string {
  return name.trim().replace(/[^\w\-]+/g, "_");
}

export class SnippetManager {
  private snippetFolder = "";
  private readonly snippetByLanguage = new Map<string, Map<string, SnippetRecord>>();
  private readonly trieByLanguage = new Map<string, Trie>();

  public async initialize(): Promise<void> {
    this.snippetFolder = this.getConfiguredFolder();
    await fs.mkdir(this.snippetFolder, { recursive: true });
    await this.reloadAllFromDisk();
  }

  public getConfiguredFolder(): string {
    const configured = vscode.workspace
      .getConfiguration(EXTENSION.configRoot)
      .get<string>("snippetFolder", "~/.codesnippet-engine");
    return expandHome(configured);
  }

  public async reloadAllFromDisk(): Promise<void> {
    this.snippetFolder = this.getConfiguredFolder();
    this.snippetByLanguage.clear();
    this.trieByLanguage.clear();

    let entries: string[] = [];
    try {
      entries = await fs.readdir(this.snippetFolder);
    } catch {
      return;
    }

    const languageDirs = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(this.snippetFolder, entry);
        try {
          const stat = await fs.stat(full);
          return stat.isDirectory() ? entry : undefined;
        } catch {
          return undefined;
        }
      })
    );

    await Promise.all(
      languageDirs
        .filter((value): value is string => Boolean(value))
        .map((languageId) => this.reloadLanguage(languageId))
    );
  }

  public async reloadLanguage(languageId: string): Promise<void> {
    const snippets = await readLanguageSnippets(this.snippetFolder, languageId);
    const byKey = new Map<string, SnippetRecord>();
    const trie = new Trie();

    for (const snippet of snippets) {
      byKey.set(snippet.key, snippet);
      trie.insert(snippet.key);
    }

    this.snippetByLanguage.set(languageId, byKey);
    this.trieByLanguage.set(languageId, trie);
  }

  public getSnippetsForLanguage(languageId: string): SnippetRecord[] {
    const canonical = this.canonicalLanguage(languageId);
    const map = this.snippetByLanguage.get(canonical);
    if (!map) {
      return [];
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }

  public findByPrefix(languageId: string, prefix: string, limit = 10): SnippetRecord[] {
    const isTrieEnabled = vscode.workspace
      .getConfiguration(EXTENSION.configRoot)
      .get<boolean>("enableTrieMatching", true);
    const canonical = this.canonicalLanguage(languageId);
    const map = this.snippetByLanguage.get(canonical);
    if (!map) {
      return [];
    }

    const cleanPrefix = prefix.trim();
    if (!cleanPrefix) {
      return [];
    }

    if (!isTrieEnabled) {
      return Array.from(map.values())
        .filter((snippet) => snippet.key.startsWith(cleanPrefix))
        .slice(0, limit);
    }

    const trie = this.trieByLanguage.get(canonical);
    if (!trie) {
      return [];
    }

    return trie
      .getByPrefix(cleanPrefix, limit)
      .map((key) => map.get(key))
      .filter((value): value is SnippetRecord => Boolean(value));
  }

  public getByKey(languageId: string, key: string): SnippetRecord | undefined {
    const canonical = this.canonicalLanguage(languageId);
    return this.snippetByLanguage.get(canonical)?.get(key);
  }

  public async saveSnippet(languageId: string, requestedName: string, body: string): Promise<SnippetRecord> {
    const canonical = this.canonicalLanguage(languageId);
    const normalizedName = normalizeSnippetName(requestedName);
    if (!normalizedName) {
      throw new Error("Snippet name cannot be empty.");
    }

    const ext = this.extensionForLanguage(canonical);
    const languageFolder = path.join(this.snippetFolder, canonical);
    await fs.mkdir(languageFolder, { recursive: true });

    const fileName = `${normalizedName}${ext ? `.${ext}` : ""}`;
    const filePath = path.join(languageFolder, fileName);
    await fs.writeFile(filePath, body, "utf8");

    const snippet: SnippetRecord = {
      key: normalizedName,
      languageId: canonical,
      name: normalizedName,
      filePath,
      body,
      preview: body.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim().slice(0, 80) ?? ""
    };

    if (!this.snippetByLanguage.has(canonical)) {
      this.snippetByLanguage.set(canonical, new Map());
      this.trieByLanguage.set(canonical, new Trie());
    }

    this.snippetByLanguage.get(canonical)?.set(snippet.key, snippet);
    this.trieByLanguage.get(canonical)?.insert(snippet.key);

    return snippet;
  }

  private canonicalLanguage(languageId: string): string {
    const mapped: Record<string, string> = {
      typescriptreact: "typescript",
      javascriptreact: "javascript",
      cplusplus: "cpp",
      plaintext: "text"
    };
    return mapped[languageId] ?? languageId;
  }

  private extensionForLanguage(languageId: string): string {
    const mapped: Record<string, string> = {
      cpp: "cpp",
      c: "c",
      python: "py",
      javascript: "js",
      typescript: "ts",
      java: "java",
      csharp: "cs",
      go: "go",
      rust: "rs"
    };
    return mapped[languageId] ?? "txt";
  }
}

