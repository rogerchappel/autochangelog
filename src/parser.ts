import { execFileSync } from "node:child_process";
import type { GitCommit, ParsedCommit } from "./types.js";

const recordSeparator = "\u001e";
const fieldSeparator = "\u001f";

export interface GitLogOptions {
  cwd?: string;
  from?: string;
  to?: string;
  sinceLastTag?: boolean;
  scope?: string;
}

export function getLastTag(cwd = process.cwd()): string | undefined {
  try {
    return execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return undefined;
  }
}

export function getHeadRef(cwd = process.cwd()): string {
  return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd,
    encoding: "utf8"
  }).trim();
}

export function readGitLog(options: GitLogOptions = {}): GitCommit[] {
  const cwd = options.cwd ?? process.cwd();
  const from = options.sinceLastTag ? options.from ?? getLastTag(cwd) : options.from;
  const to = options.to ?? "HEAD";
  const range = from ? `${from}..${to}` : to;
  const args = ["log", range, `--format=${recordSeparator}%H${fieldSeparator}%an${fieldSeparator}%ae${fieldSeparator}%aI${fieldSeparator}%B`];

  if (options.scope) {
    args.push("--", options.scope);
  }

  const output = execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return parseGitLog(output);
}

export function parseGitLog(output: string): GitCommit[] {
  return output
    .split(recordSeparator)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash = "", authorName = "", authorEmail = "", date = "", ...messageParts] = record.split(fieldSeparator);
      return {
        hash,
        authorName,
        authorEmail,
        date,
        message: messageParts.join(fieldSeparator).trim()
      };
    })
    .filter((commit) => commit.hash && commit.message);
}

export function parseConventionalCommit(commit: GitCommit): ParsedCommit | undefined {
  const [header = "", ...bodyLines] = commit.message.split(/\r?\n/);
  const match = /^(?<type>[a-z][a-z0-9-]*)(?:\((?<scope>[^)]+)\))?(?<bang>!)?: (?<subject>.+)$/.exec(header.trim());

  if (!match?.groups) {
    return undefined;
  }

  const body = bodyLines.join("\n").trim();
  const breakingNotes = extractBreakingNotes(body);
  const scopes = splitScopes(match.groups.scope);

  return {
    ...commit,
    type: match.groups.type,
    scopes,
    subject: match.groups.subject.trim(),
    body,
    breaking: Boolean(match.groups.bang) || breakingNotes.length > 0,
    breakingNotes
  };
}

export function parseConventionalCommits(commits: GitCommit[]): ParsedCommit[] {
  return commits
    .map((commit) => parseConventionalCommit(commit))
    .filter((commit): commit is ParsedCommit => Boolean(commit));
}

function splitScopes(scope?: string): string[] {
  if (!scope) {
    return ["general"];
  }

  return scope
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractBreakingNotes(body: string): string[] {
  if (!body) {
    return [];
  }

  const notes: string[] = [];
  const pattern = /^BREAKING[ -]CHANGE:\s*(.+(?:\n(?![A-Z][A-Z -]+:).+)*)/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    notes.push(match[1].trim());
  }

  return notes;
}
