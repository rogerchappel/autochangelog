export type ConventionalType =
  | "feat"
  | "fix"
  | "docs"
  | "test"
  | "chore"
  | "refactor"
  | "perf"
  | "style"
  | "ci"
  | "build"
  | "revert"
  | string;

export interface GitCommit {
  hash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  message: string;
}

export interface ParsedCommit extends GitCommit {
  type: ConventionalType;
  scopes: string[];
  subject: string;
  body: string;
  breaking: boolean;
  breakingNotes: string[];
}

export interface CommitGroup {
  type: string;
  scopes: ScopeGroup[];
}

export interface ScopeGroup {
  scope: string;
  commits: ParsedCommit[];
}

export interface ChangelogSummary {
  commits: ParsedCommit[];
  groups: CommitGroup[];
  contributors: Contributor[];
  suggestedBump: SemverBump;
  from?: string;
  to: string;
  generatedAt: string;
}

export interface Contributor {
  name: string;
  email: string;
  commits: number;
}

export type SemverBump = "none" | "patch" | "minor" | "major" | "prerelease";
