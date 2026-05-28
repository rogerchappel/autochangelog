#!/usr/bin/env node
import { Command, InvalidArgumentError } from "commander";
import { buildSummary } from "./grouper.js";
import { getHeadRef, getLastTag, readGitLog, parseConventionalCommits } from "./parser.js";
import { renderSummary } from "./reporter.js";

interface CliOptions {
  from?: string;
  to?: string;
  sinceLastTag?: boolean;
  format: "markdown" | "json";
  template?: string;
  scope?: string;
  prerelease?: boolean;
}

const program = new Command();

program
  .name("autochangelog")
  .description("Generate local changelogs from conventional commits in git history.")
  .option("--from <ref>", "start git ref, exclusive")
  .option("--to <ref>", "end git ref, inclusive", "HEAD")
  .option("--since-last-tag", "use the most recent git tag as --from")
  .option("--format <format>", "output format: markdown or json", parseFormat, "markdown")
  .option("--template <file>", "render output through a template file")
  .option("--scope <path>", "limit git log to a path")
  .option("--prerelease", "suggest a prerelease bump when commits exist")
  .addHelpText(
    "after",
    `

Examples:
  $ autochangelog
  $ autochangelog --since-last-tag
  $ autochangelog --from v1.2.0 --to HEAD --format json
  $ autochangelog --scope packages/api --template release-template.md
`
  )
  .action((options: CliOptions) => {
    try {
      const cwd = process.cwd();
      const from = options.sinceLastTag ? options.from ?? getLastTag(cwd) : options.from;
      const to = options.to ?? "HEAD";
      const commits = parseConventionalCommits(
        readGitLog({
          cwd,
          from,
          to,
          sinceLastTag: options.sinceLastTag,
          scope: options.scope
        })
      );
      const summary = buildSummary(commits, {
        from,
        to: to === "HEAD" ? getHeadRef(cwd) : to,
        prerelease: options.prerelease
      });

      process.stdout.write(renderSummary(summary, options));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`autochangelog: ${message}\n`);
      process.exitCode = 1;
    }
  });

program.parse();

function parseFormat(value: string): "markdown" | "json" {
  if (value === "markdown" || value === "json") {
    return value;
  }

  throw new InvalidArgumentError("format must be markdown or json");
}
