# Release Notes

## 0.1.0

Initial public build of `autochangelog`.

### Added

- Conventional commit parser over local git history.
- Grouped Markdown changelog output.
- JSON summary output for automation.
- Semver bump suggestions for major, minor, patch, prerelease, and no-change
  ranges.
- `--from`, `--to`, `--since-last-tag`, `--scope`, `--template`, `--format`,
  and `--prerelease` CLI flags.
- Fixture-backed parser, grouping, reporter, semver, and CLI tests.

### Notes

- The CLI does not publish releases, create tags, push branches, or rewrite git
  history.
