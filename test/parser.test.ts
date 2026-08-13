import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseConventionalCommit, parseConventionalCommits, parseGitLog } from "../src/parser.js";
import type { GitCommit } from "../src/types.js";

describe("parseGitLog", () => {
  it("parses git log records with commit body content", () => {
    const log = readFileSync("fixtures/git-log/simple.fixture", "utf8");
    const commits = parseGitLog(log);

    expect(commits).toHaveLength(2);
    expect(commits[0]).toMatchObject({
      hash: "abc1234",
      authorName: "Ada Lovelace",
      authorEmail: "ada@example.com"
    });
    expect(commits[0].message).toContain("BREAKING CHANGE");
  });
});

describe("parseConventionalCommit", () => {
  it("extracts type, multi-scope, subject, and breaking footers", () => {
    const commit = parseConventionalCommit({
      hash: "def5678",
      authorName: "Grace Hopper",
      authorEmail: "grace@example.com",
      date: "2026-05-26T09:00:00+10:00",
      message: "feat(api,ui): add release panel\n\nBREAKING-CHANGE: config moved"
    });

    expect(commit).toMatchObject({
      type: "feat",
      scopes: ["api", "ui"],
      subject: "add release panel",
      breaking: true,
      breakingNotes: ["config moved"]
    });
  });

  it("preserves multi-paragraph breaking notes up to the next footer", () => {
    const commit = parseConventionalCommit({
      hash: "abc1234",
      authorName: "Ada Lovelace",
      authorEmail: "ada@example.com",
      date: "2026-05-26T09:00:00+10:00",
      message: [
        "feat(api): replace authentication",
        "",
        "BREAKING CHANGE: use OAuth tokens.",
        "",
        "Existing API keys stop working.",
        "Migrate clients before upgrading.",
        "",
        "Refs: #42"
      ].join("\n")
    });

    expect(commit?.breakingNotes).toEqual([
      "use OAuth tokens.\n\nExisting API keys stop working.\nMigrate clients before upgrading."
    ]);
  });

  it("extracts multiple breaking note markers deterministically", () => {
    const commit = parseConventionalCommit({
      hash: "abc1234",
      authorName: "Ada Lovelace",
      authorEmail: "ada@example.com",
      date: "2026-05-26T09:00:00+10:00",
      message: [
        "feat(api): replace authentication",
        "",
        "BREAKING CHANGE: remove API keys",
        "",
        "BREAKING-CHANGE: rename the token field",
        "continuation details",
        "Reviewed-by: Grace Hopper"
      ].join("\n")
    });

    expect(commit?.breakingNotes).toEqual(["remove API keys", "rename the token field\ncontinuation details"]);
  });

  it("ignores non-conventional commits", () => {
    const commit: GitCommit = {
      hash: "abc",
      authorName: "Linus",
      authorEmail: "linus@example.com",
      date: "2026-05-26T09:00:00+10:00",
      message: "merge branch main"
    };

    expect(parseConventionalCommit(commit)).toBeUndefined();
  });

  it("parses fixture commits into conventional commits", () => {
    const commits = parseConventionalCommits(parseGitLog(readFileSync("fixtures/git-log/simple.fixture", "utf8")));

    expect(commits.map((commit) => commit.type)).toEqual(["feat", "fix"]);
    expect(commits[1].scopes).toEqual(["ui", "docs"]);
  });
});
