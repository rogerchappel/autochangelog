import { describe, expect, it } from "vitest";
import { suggestBump } from "../src/semver.js";
import type { ParsedCommit } from "../src/types.js";

describe("suggestBump", () => {
  it("returns none for empty ranges", () => {
    expect(suggestBump([])).toBe("none");
  });

  it("prioritizes breaking changes over features", () => {
    expect(suggestBump([commit("feat", true)])).toBe("major");
  });

  it("suggests minor for features and patch for other conventional commits", () => {
    expect(suggestBump([commit("feat")])).toBe("minor");
    expect(suggestBump([commit("fix")])).toBe("patch");
  });

  it("allows prerelease override when commits exist", () => {
    expect(suggestBump([commit("fix")], { prerelease: true })).toBe("prerelease");
  });
});

function commit(type: string, breaking = false): ParsedCommit {
  return {
    hash: "abc",
    authorName: "Ada",
    authorEmail: "ada@example.com",
    date: "2026-05-27T10:00:00Z",
    message: `${type}: example`,
    type,
    scopes: ["general"],
    subject: "example",
    body: "",
    breaking,
    breakingNotes: []
  };
}
