# Release Notes

## 0.1.0

Initial public build of `@rogerchappel/autochangelog`.

### Added

- Conventional commit parser over local git history.
- Grouped Markdown changelog output.
- JSON summary output for automation.
- Semver bump suggestions for major, minor, patch, prerelease, and no-change
  ranges.
- `--from`, `--to`, `--since-last-tag`, `--scope`, `--template`, `--format`,
  and `--prerelease` CLI flags.
- Fixture-backed parser, grouping, reporter, semver, and CLI tests.
- Release checks for the scoped npm identity and the installed package binary.

### Notes

- The CLI does not publish releases, create tags, push branches, or rewrite git
  history.
