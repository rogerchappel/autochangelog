import type { ChangelogSummary, CommitGroup, Contributor, ParsedCommit } from "./types.js";
import { suggestBump } from "./semver.js";

const typeOrder = ["feat", "fix", "perf", "refactor", "docs", "test", "build", "ci", "style", "chore", "revert"];

export interface BuildSummaryOptions {
  from?: string;
  to?: string;
  generatedAt?: string;
  prerelease?: boolean;
}

export function buildSummary(commits: ParsedCommit[], options: BuildSummaryOptions = {}): ChangelogSummary {
  const deduped = dedupeByHash(commits).sort((a, b) => b.date.localeCompare(a.date));

  return {
    commits: deduped,
    groups: groupCommits(deduped),
    contributors: collectContributors(deduped),
    suggestedBump: suggestBump(deduped, { prerelease: options.prerelease }),
    from: options.from,
    to: options.to ?? "HEAD",
    generatedAt: options.generatedAt ?? new Date().toISOString()
  };
}

export function groupCommits(commits: ParsedCommit[]): CommitGroup[] {
  const byType = new Map<string, Map<string, ParsedCommit[]>>();

  for (const commit of commits) {
    const scopeNames = commit.scopes.length > 0 ? commit.scopes : ["general"];
    const scopeMap = byType.get(commit.type) ?? new Map<string, ParsedCommit[]>();
    byType.set(commit.type, scopeMap);

    for (const scope of scopeNames) {
      const scopedCommits = scopeMap.get(scope) ?? [];
      scopedCommits.push(commit);
      scopeMap.set(scope, scopedCommits);
    }
  }

  return [...byType.entries()]
    .sort(([a], [b]) => typeRank(a) - typeRank(b) || a.localeCompare(b))
    .map(([type, scopes]) => ({
      type,
      scopes: [...scopes.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([scope, scopedCommits]) => ({
          scope,
          commits: scopedCommits.sort((a, b) => b.date.localeCompare(a.date))
        }))
    }));
}

export function collectContributors(commits: ParsedCommit[]): Contributor[] {
  const contributors = new Map<string, Contributor>();

  for (const commit of commits) {
    const key = `${commit.authorName}<${commit.authorEmail}>`;
    const contributor = contributors.get(key) ?? {
      name: commit.authorName,
      email: commit.authorEmail,
      commits: 0
    };

    contributor.commits += 1;
    contributors.set(key, contributor);
  }

  return [...contributors.values()].sort((a, b) => b.commits - a.commits || a.name.localeCompare(b.name));
}

function dedupeByHash(commits: ParsedCommit[]): ParsedCommit[] {
  const seen = new Set<string>();
  const deduped: ParsedCommit[] = [];

  for (const commit of commits) {
    if (seen.has(commit.hash)) {
      continue;
    }

    seen.add(commit.hash);
    deduped.push(commit);
  }

  return deduped;
}

function typeRank(type: string): number {
  const index = typeOrder.indexOf(type);
  return index === -1 ? typeOrder.length : index;
}
