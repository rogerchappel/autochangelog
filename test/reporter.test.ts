import { describe, expect, it } from "vitest";
import { buildSummary } from "../src/grouper.js";
import { renderMarkdown, renderSummary } from "../src/reporter.js";
import type { ParsedCommit } from "../src/types.js";

describe("renderMarkdown", () => {
  it("renders changes, contributors, and breaking changes", () => {
    const markdown = renderMarkdown(buildSummary([commit()], { from: "v1.0.0", to: "HEAD", generatedAt: "2026-05-28T00:00:00Z" }));

    expect(markdown).toContain("Suggested bump: major");
    expect(markdown).toContain("## Breaking Changes");
    expect(markdown).toContain("## Features");
    expect(markdown).toContain("Ada Lovelace <ada@example.com>");
  });

  it("preserves multi-paragraph breaking notes in Markdown", () => {
    const input = commit();
    input.breakingNotes = ["use OAuth tokens\n\nMigrate clients before upgrading"];

    expect(renderMarkdown(buildSummary([input]))).toContain(
      "  - use OAuth tokens\n    \n    Migrate clients before upgrading"
    );
  });
});

describe("renderSummary", () => {
  it("renders json output", () => {
    const output = renderSummary(buildSummary([commit()]), { format: "json" });

    expect(JSON.parse(output)).toMatchObject({ suggestedBump: "major" });
  });

  it("preserves multi-paragraph breaking notes in json output", () => {
    const input = commit();
    input.breakingNotes = ["use OAuth tokens\n\nMigrate clients before upgrading"];

    const output = renderSummary(buildSummary([input]), { format: "json" });

    expect(JSON.parse(output).commits[0].breakingNotes).toEqual(input.breakingNotes);
  });

  it("renders custom templates", () => {
    const output = renderSummary(buildSummary([commit()], { from: "v1.0.0", to: "HEAD" }), {
      template: "fixtures/templates/release.md"
    });

    expect(output).toContain("Release window: v1.0.0..HEAD");
    expect(output).toContain("Bump: major");
  });
});

function commit(): ParsedCommit {
  return {
    hash: "abc123456",
    authorName: "Ada Lovelace",
    authorEmail: "ada@example.com",
    date: "2026-05-27T10:00:00Z",
    message: "feat(api)!: rotate tokens",
    type: "feat",
    scopes: ["api"],
    subject: "rotate tokens",
    body: "BREAKING CHANGE: token lifetime changed",
    breaking: true,
    breakingNotes: ["token lifetime changed"]
  };
}
