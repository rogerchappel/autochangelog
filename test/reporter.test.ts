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
    expect(markdown).toContain("Ada Lovelace \\<ada@example\\.com\\>");
  });

  it("preserves multi-paragraph breaking notes in Markdown", () => {
    const input = commit();
    input.breakingNotes = ["use OAuth tokens\n\nMigrate clients before upgrading"];

    expect(renderMarkdown(buildSummary([input]))).toContain(
      "  - use OAuth tokens\n    \n    Migrate clients before upgrading"
    );
  });

  it("renders git-derived metacharacters as literal Markdown text", () => {
    const input = commit();
    input.scopes = ["api | [docs](https://example.invalid) **bold** `code` <tag>"];
    input.subject = "close ](https://example.invalid) *carefully* with `ticks` <script>";
    input.authorName = "Eve | [Ops](https://example.invalid) **Lead** `root` <admin>";
    input.authorEmail = "eve+alerts@example.test";

    const markdown = renderMarkdown(buildSummary([input]));

    expect(markdown).toContain(
      "### api \\| \\[docs\\]\\(https://example\\.invalid\\) \\*\\*bold\\*\\* \\`code\\` \\<tag\\>"
    );
    expect(markdown).toContain(
      "close \\]\\(https://example\\.invalid\\) \\*carefully\\* with \\`ticks\\` \\<script\\>"
    );
    expect(markdown).toContain(
      "Eve \\| \\[Ops\\]\\(https://example\\.invalid\\) \\*\\*Lead\\*\\* \\`root\\` \\<admin\\>"
    );
  });

  it("keeps multiline breaking notes inside their list item", () => {
    const input = commit();
    input.breakingNotes = ["first | line\n# not a heading\n- not another item\n<tag> **bold**"];

    expect(renderMarkdown(buildSummary([input]))).toContain(
      "  - first \\| line\n    \\# not a heading\n    \\- not another item\n    \\<tag\\> \\*\\*bold\\*\\*"
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

  it("leaves metacharacters unchanged in json output", () => {
    const input = commit();
    input.scopes = ["api | [docs](url) **bold** `code` <tag>"];
    input.subject = "ship *literal* Markdown";
    input.authorName = "Eve <Ops>";

    const output = renderSummary(buildSummary([input]), { format: "json" });

    expect(JSON.parse(output).commits[0]).toMatchObject({
      scopes: input.scopes,
      subject: input.subject,
      authorName: input.authorName
    });
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
