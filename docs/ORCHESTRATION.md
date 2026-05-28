# AutoChangelog Orchestration

AutoChangelog is designed for local release-note generation in agentic build
and release workflows.

## Agent Flow

1. Run `npm run release:check`.
2. Generate Markdown with `autochangelog --since-last-tag`.
3. Generate JSON with `autochangelog --since-last-tag --format json` when a
   release system needs structured data.
4. Attach the Markdown output to the pull request, release checklist, or draft
   GitHub release.
5. Have a maintainer review the generated notes before publishing.

## Safety Properties

- The CLI reads local git history only.
- It does not push, tag, publish, or mutate git history.
- Template rendering reads the supplied template path and writes only to stdout.

## Release Gate

```sh
npm run release:check
```

The release gate runs typecheck, tests, build, smoke, and package dry-run.
