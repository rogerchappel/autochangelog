# AutoChangelog - Implementation Tasks

## Phase 0: PRD (done)
- [x] Write PRD.md

## Phase 1: Package Setup
- [ ] Set up package.json: name=autochangelog, type=module
- [ ] Configure tsconfig.json
- [ ] Create src/cli.ts, src/parser.ts, src/grouper.ts, src/reporter.ts, src/semver.ts
- [ ] Set up vitest config

## Phase 2: Git Log Parser
- [ ] Use execSync to run `git log --format=...` with custom formatting
- [ ] Parse conventional commits: `type(scope): message`
- [ ] Extract: type, scope, subject, body, footer, breaking, author, hash, date
- [ ] Support commit body/footer parsing for BREAKING CHANGE: detection
- [ ] Handle multi-scope commits: `feat(api,ui): message`

## Phase 3: Grouper
- [ ] Group commits by type: feat, fix, docs, test, chore, refactor, perf, style, ci, build, revert
- [ ] Group by scope within each type section
- [ ] Detect breaking changes and flag them prominently
- [ ] Deduplicate commits (by hash)
- [ ] Sort by date within groups

## Phase 4: Semver Calculator
- [ ] Determine suggested bump: major (breaking), minor (feat), patch (other)
- [ ] Handle --prerelease flag for prerelease tags
- [ ] Support --from, --to, --since-last-tag scoping

## Phase 5: Reporter
- [ ] Markdown output (default): formatted changelog with headers, lists, contributors
- [ ] JSON output (--format json)
- [ ] Custom template support via --template file
- [ ] Include contributor list at bottom
- [ ] Handle empty commit ranges gracefully

## Phase 6: CLI
- [ ] Main command: generate from current repo
- [ ] Flags: --from, --to, --since-last-tag, --format, --template, --scope, --prerelease
- [ ] Help text and examples

## Phase 7: Tests & Fixtures
- [ ] Create fixtures/ with:
  - simple conventional commit history
  - multi-scope and breaking changes
  - mixed type commits
  - empty repo (no conventional commits)
- [ ] Unit tests for git log parser
- [ ] Unit tests for grouper
- [ ] Unit tests for semver calculator
- [ ] Integration test for CLI with fixtures
- [ ] Run vitest

## Phase 8: Docs & Polish
- [ ] Write README with personality
- [ ] Write CONTRIBUTING.md
- [ ] Add to GitHub: description, topics
- [ ] npm test, npm run build, npm run check
