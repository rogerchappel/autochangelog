import type { ParsedCommit, SemverBump } from "./types.js";

export interface SemverOptions {
  prerelease?: boolean;
}

export function suggestBump(commits: ParsedCommit[], options: SemverOptions = {}): SemverBump {
  if (commits.length === 0) {
    return "none";
  }

  if (options.prerelease) {
    return "prerelease";
  }

  if (commits.some((commit) => commit.breaking)) {
    return "major";
  }

  if (commits.some((commit) => commit.type === "feat")) {
    return "minor";
  }

  return "patch";
}
