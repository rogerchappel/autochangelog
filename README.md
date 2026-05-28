# autochangelog

Local-first TypeScript CLI that generates changelogs from conventional commits.

`autochangelog` reads local git history, parses conventional commit messages,
groups changes by type and scope, lists contributors, and suggests a semver
bump. It emits Markdown by default and JSON for automation.

## Status

Early public build. The CLI is useful for local release notes and pull request
summaries, but it does not publish releases or rewrite git history.

## Install

```sh
npm install --save-dev autochangelog
```

For local development in this repository:

```sh
npm install
npm run build
```

## Use

Generate a changelog for the current repository:

```sh
npx autochangelog
```

Generate JSON between two refs:

```sh
npx autochangelog --from v1.2.0 --to HEAD --format json
```

Use the latest tag as the starting point:

```sh
npx autochangelog --since-last-tag
```

Limit the git log to a path:

```sh
npx autochangelog --scope packages/api
```

Render through a template:

```sh
npx autochangelog --template fixtures/templates/release.md
```

## Supported Commits

The parser accepts conventional commit headers:

```text
feat(api): add token refresh
fix(ui): prevent empty state flicker
feat(api,ui)!: remove legacy session shape
```

It also detects `BREAKING CHANGE:` and `BREAKING-CHANGE:` notes in commit
bodies.

## Output

- Markdown changelog with grouped sections and contributors.
- JSON summary for release automation.
- Template rendering with simple placeholders such as `{{changes}}`,
  `{{contributors}}`, `{{suggestedBump}}`, and `{{json}}`.

## Verify

Run the release check before opening a pull request:

```sh
npm run release:check
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Task checklist](docs/TASKS.md)
- [Orchestration plan](docs/ORCHESTRATION.md)
- [Release notes](RELEASE_NOTES.md)

## License

MIT
