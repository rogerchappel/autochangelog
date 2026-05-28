import { readFileSync } from "node:fs";
import type { ChangelogSummary, ParsedCommit } from "./types.js";

const sectionTitles = new Map<string, string>([
  ["feat", "Features"],
  ["fix", "Fixes"],
  ["perf", "Performance"],
  ["refactor", "Refactors"],
  ["docs", "Documentation"],
  ["test", "Tests"],
  ["build", "Build"],
  ["ci", "CI"],
  ["style", "Style"],
  ["chore", "Chores"],
  ["revert", "Reverts"]
]);

export interface RenderOptions {
  format?: "markdown" | "json";
  template?: string;
}

export function renderSummary(summary: ChangelogSummary, options: RenderOptions = {}): string {
  if (options.template) {
    return renderTemplate(summary, options.template);
  }

  if (options.format === "json") {
    return `${JSON.stringify(summary, null, 2)}\n`;
  }

  return renderMarkdown(summary);
}

export function renderMarkdown(summary: ChangelogSummary): string {
  const lines: string[] = [
    "# Changelog",
    "",
    `Generated: ${summary.generatedAt}`,
    `Range: ${summary.from ? `${summary.from}..${summary.to}` : summary.to}`,
    `Suggested bump: ${summary.suggestedBump}`,
    ""
  ];

  if (summary.commits.length === 0) {
    lines.push("No conventional commits found for this range.", "");
    return lines.join("\n");
  }

  const breaking = summary.commits.filter((commit) => commit.breaking);
  if (breaking.length > 0) {
    lines.push("## Breaking Changes", "");
    for (const commit of breaking) {
      lines.push(formatCommit(commit));
      for (const note of commit.breakingNotes) {
        lines.push(`  - ${note}`);
      }
    }
    lines.push("");
  }

  for (const group of summary.groups) {
    lines.push(`## ${sectionTitles.get(group.type) ?? titleCase(group.type)}`, "");

    for (const scope of group.scopes) {
      lines.push(`### ${scope.scope}`, "");
      for (const commit of scope.commits) {
        lines.push(formatCommit(commit));
      }
      lines.push("");
    }
  }

  lines.push("## Contributors", "");
  for (const contributor of summary.contributors) {
    lines.push(`- ${contributor.name} <${contributor.email}> (${contributor.commits})`);
  }
  lines.push("");

  return lines.join("\n");
}

function renderTemplate(summary: ChangelogSummary, templatePath: string): string {
  const template = readFileSync(templatePath, "utf8");
  return template
    .replaceAll("{{generatedAt}}", summary.generatedAt)
    .replaceAll("{{range}}", summary.from ? `${summary.from}..${summary.to}` : summary.to)
    .replaceAll("{{suggestedBump}}", summary.suggestedBump)
    .replaceAll("{{changes}}", renderMarkdown(summary).trim())
    .replaceAll("{{contributors}}", summary.contributors.map((contributor) => `${contributor.name} <${contributor.email}>`).join(", "))
    .replaceAll("{{json}}", JSON.stringify(summary, null, 2));
}

function formatCommit(commit: ParsedCommit): string {
  const scope = commit.scopes.length > 0 ? `**${commit.scopes.join(", ")}:** ` : "";
  const marker = commit.breaking ? " **BREAKING**" : "";
  return `- ${scope}${commit.subject} (${commit.hash.slice(0, 7)})${marker}`;
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
