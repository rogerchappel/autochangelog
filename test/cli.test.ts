import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const tmpRepos: string[] = [];
const repoRoot = process.cwd();
const tsxLoader = join(repoRoot, "node_modules/tsx/dist/loader.mjs");

describe("autochangelog CLI", () => {
  afterEach(() => {
    for (const repo of tmpRepos.splice(0)) {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("generates markdown and json from a local git repository", () => {
    const repo = createRepo();

    const markdown = execFileSync("node", [join(process.cwd(), "src/cli.ts")], {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: `--import=${tsxLoader}` }
    });
    const json = execFileSync("node", [join(process.cwd(), "src/cli.ts"), "--format", "json"], {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: `--import=${tsxLoader}` }
    });

    expect(markdown).toContain("Suggested bump: major");
    expect(markdown).toContain("add local parser");
    expect(JSON.parse(json)).toMatchObject({ suggestedBump: "major" });
  });

  it("supports path scoping", () => {
    const repo = createRepo();
    const json = execFileSync("node", [join(process.cwd(), "src/cli.ts"), "--scope", "docs", "--format", "json"], {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: `--import=${tsxLoader}` }
    });

    expect(JSON.parse(json).commits).toHaveLength(1);
  });

  it("fails clearly when --since-last-tag is used in a tagless repository", () => {
    const repo = createRepo(false);
    const result = spawnSync("node", [join(process.cwd(), "src/cli.ts"), "--since-last-tag"], {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: `--import=${tsxLoader}` }
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("no git tags found for --since-last-tag");
  });

  it("uses the latest tag and honors an explicit --from with --since-last-tag", () => {
    const repo = createRepo();
    const latestTag = runJson(repo, "--since-last-tag");
    const explicitFrom = runJson(repo, "--since-last-tag", "--from", "v0.1.0");

    expect(latestTag.from).toBe("v0.1.0");
    expect(latestTag.commits).toHaveLength(2);
    expect(explicitFrom.from).toBe("v0.1.0");
    expect(explicitFrom.commits).toHaveLength(2);
  });
});

function createRepo(withTag = true): string {
  const repo = mkdtempSync(join(tmpdir(), "autochangelog-"));
  tmpRepos.push(repo);

  git(repo, "init");
  git(repo, "config", "user.name", "Test User");
  git(repo, "config", "user.email", "test@example.com");

  writeFileSync(join(repo, "README.md"), "# Fixture\n");
  git(repo, "add", "README.md");
  git(repo, "commit", "-m", "chore: initial commit");
  if (withTag) {
    git(repo, "tag", "v0.1.0");
  }

  writeFileSync(join(repo, "index.ts"), "export const parser = true;\n");
  git(repo, "add", "index.ts");
  git(repo, "commit", "-m", "feat(core)!: add local parser", "-m", "BREAKING CHANGE: output schema changed");

  execFileSync("mkdir", ["-p", "docs"], { cwd: repo });
  writeFileSync(join(repo, "docs", "usage.md"), "# Usage\n");
  git(repo, "add", "docs/usage.md");
  git(repo, "commit", "-m", "docs: add usage guide");

  return repo;
}

function runJson(repo: string, ...args: string[]): Record<string, any> {
  const output = execFileSync("node", [join(process.cwd(), "src/cli.ts"), ...args, "--format", "json"], {
    cwd: repo,
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: `--import=${tsxLoader}` }
  });
  return JSON.parse(output);
}

function git(cwd: string, ...args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}
