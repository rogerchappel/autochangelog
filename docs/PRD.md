# AutoChangelog PRD

Status: MVP implemented

## Summary

AutoChangelog is a local-first TypeScript CLI that generates structured changelogs from conventional commits in a git repository. It groups changes by type (feat, fix, chore, etc.), lists contributors, and supports semver bump suggestions.

## Motivation

Writing changelogs manually is tedious and often forgotten. Many projects use `conventional-changelog` tooling but it's heavy and tightly coupled to the npm ecosystem. AutoChangelog is a lightweight, zero-dependency-on-heavy-tooling alternative that works entirely offline from local git history.

## Target users

- OSS maintainers releasing packages
- Teams using conventional commits who want automatic release notes
- DevOps pipelines that need structured change summaries
- Agentic workflows that generate release bundles

## Goals

- Parse git log for conventional commit messages (`feat:`, `fix:`, `BREAKING CHANGE:`, etc.)
- Group changes by type with clear section headers
- Detect breaking changes and suggest semver (major/minor/patch) bump
- Support `--from`, `--to`, `--since-last-tag` for scoping
- Output human-readable markdown and machine-readable JSON
- Support multi-scope prefixes (`feat(api):`, `fix(ui):`) and aggregate by scope
- Handle commit body/footer for breaking change detection
- Respect `.gitignore`-aware path filtering (`--scope <path>`)
- Support `--template` for custom output formatting

## Non-goals

- Publishing to npm/GitHub Releases (output only; pipes to other tools)
- Commit linting (use commitlint or similar)
- Rewriting git history

## MVP Scope

The initial public build ships:

- local git log parsing with conventional commit extraction
- type and scope grouping
- breaking change detection from `!`, `BREAKING CHANGE:`, and
  `BREAKING-CHANGE:` markers
- semver bump suggestions
- Markdown, JSON, and template output
- `--from`, `--to`, `--since-last-tag`, `--scope`, `--template`, `--format`,
  and `--prerelease` flags
- fixture-backed unit and CLI tests

## Source attribution

Inspired by conventional-changelog-cli and semantic-release changelog generators. This is a reframed local-first take focused on standalone CLI usage without bundler/npm ecosystem dependencies.
Decision: selected for 2026-05-22 AM OSS factory run
