# AutoChangelog - Implementation Tasks

## Phase 0: PRD (done)
- [x] Write PRD.md

## Phase 1: Package Setup
- [x] Set up package.json: name=autochangelog, type=module
- [x] Configure tsconfig.json
- [x] Create src/cli.ts, src/parser.ts, src/grouper.ts, src/reporter.ts, src/semver.ts
- [x] Set up vitest config

## Phase 2: Git Log Parser
- [x] Use execSync to run `git log --format=...` with custom formatting
- [x] Parse conventional commits: `type(scope): message`
- [x] Extract: type, scope, subject, body, footer, breaking, author, hash, date
- [x] Support commit body/footer parsing for BREAKING CHANGE: detection
- [x] Handle multi-scope commits: `feat(api,ui): message`

## Phase 3: Grouper
- [x] Group commits by type: feat, fix, docs, test, chore, refactor, perf, style, ci, build, revert
- [x] Group by scope within each type section
- [x] Detect breaking changes and flag them prominently
- [x] Deduplicate commits (by hash)
- [x] Sort by date within groups

## Phase 4: Semver Calculator
- [x] Determine suggested bump: major (breaking), minor (feat), patch (other)
- [x] Handle --prerelease flag for prerelease tags
- [x] Support --from, --to, --since-last-tag scoping

## Phase 5: Reporter
- [x] Markdown output (default): formatted changelog with headers, lists, contributors
- [x] JSON output (--format json)
- [x] Custom template support via --template file
- [x] Include contributor list at bottom
- [x] Handle empty commit ranges gracefully

## Phase 6: CLI
- [x] Main command: generate from current repo
- [x] Flags: --from, --to, --since-last-tag, --format, --template, --scope, --prerelease
- [x] Help text and examples

## Phase 7: Tests & Fixtures
- [x] Create fixtures/ with:
  - simple conventional commit history
  - multi-scope and breaking changes
  - mixed type commits
  - empty repo (no conventional commits)
- [x] Unit tests for git log parser
- [x] Unit tests for grouper
- [x] Unit tests for semver calculator
- [x] Integration test for CLI with fixtures
- [x] Run vitest

## Phase 8: Docs & Polish
- [x] Write README with practical examples
- [x] Keep existing CONTRIBUTING.md
- [ ] Add to GitHub: description, topics
- [x] npm test, npm run build, npm run check
- [x] npm run smoke
