import { describe, expect, it } from "vitest";
import { buildSummary, collectContributors, groupCommits } from "../src/grouper.js";
import type { ParsedCommit } from "../src/types.js";

const commits: ParsedCommit[] = [
  makeCommit({ hash: "a", type: "fix", scopes: ["ui"], subject: "repair button", date: "2026-05-27T10:00:00Z" }),
  makeCommit({ hash: "b", type: "feat", scopes: ["api", "ui"], subject: "add endpoint", date: "2026-05-28T10:00:00Z" }),
  makeCommit({ hash: "b", type: "feat", scopes: ["api", "ui"], subject: "add endpoint", date: "2026-05-28T10:00:00Z" })
];

describe("groupCommits", () => {
  it("groups by ordered type and then scope", () => {
    const groups = groupCommits(commits.slice(0, 2));

    expect(groups.map((group) => group.type)).toEqual(["feat", "fix"]);
    expect(groups[0].scopes.map((scope) => scope.scope)).toEqual(["api", "ui"]);
  });
});

describe("collectContributors", () => {
  it("counts commits per contributor", () => {
    expect(collectContributors(commits.slice(0, 2))).toEqual([
      { name: "Ada", email: "ada@example.com", commits: 2 }
    ]);
  });
});

describe("buildSummary", () => {
  it("deduplicates commits and suggests a semver bump", () => {
    const summary = buildSummary(commits, { generatedAt: "2026-05-28T00:00:00Z" });

    expect(summary.commits).toHaveLength(2);
    expect(summary.suggestedBump).toBe("minor");
  });
});

function makeCommit(overrides: Partial<ParsedCommit>): ParsedCommit {
  return {
    hash: "a",
    authorName: "Ada",
    authorEmail: "ada@example.com",
    date: "2026-05-27T10:00:00Z",
    message: "fix(ui): repair button",
    type: "fix",
    scopes: ["ui"],
    subject: "repair button",
    body: "",
    breaking: false,
    breakingNotes: [],
    ...overrides
  };
}
