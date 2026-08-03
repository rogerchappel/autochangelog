import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
};

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.scripts?.build) {
  run('npm', ['run', 'build']);
}
const output = run('npm', ['pack', '--dry-run', '--json']);
const [pack] = JSON.parse(output);
const included = new Set(pack.files.map((file) => file.path));

const expected = new Set();
const addPath = (value) => {
  if (typeof value === 'string' && !value.startsWith('#')) {
    expected.add(value.replace(/^\.\//, ''));
  }
};
const walkExports = (value) => {
  if (typeof value === 'string') {
    addPath(value);
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      walkExports(nested);
    }
  }
};

if (typeof pkg.bin === 'string') {
  addPath(pkg.bin);
} else if (pkg.bin && typeof pkg.bin === 'object') {
  for (const target of Object.values(pkg.bin)) {
    addPath(target);
  }
}
addPath(pkg.main);
addPath(pkg.types);
walkExports(pkg.exports);

const missing = [...expected].filter((file) => !included.has(file));
if (missing.length > 0) {
  console.error('Package tarball is missing declared entrypoints:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const installDirectory = mkdtempSync(join(tmpdir(), 'autochangelog-package-smoke-'));
try {
  const packOutput = run('npm', ['pack', '--json', '--pack-destination', installDirectory]);
  const [packed] = JSON.parse(packOutput);
  const tarball = join(installDirectory, packed.filename);

  run(
    'npm',
    [
      'install',
      '--save-dev',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--prefix',
      installDirectory,
      tarball,
    ],
    { cwd: installDirectory },
  );

  const documentedCommand = ['--no-install', 'autochangelog'];
  const help = run('npx', [...documentedCommand, '--help'], { cwd: installDirectory });
  if (!help.includes('Usage: autochangelog')) {
    throw new Error('Installed autochangelog CLI did not return the expected help output.');
  }

  run('git', ['init', '--initial-branch=main'], { cwd: installDirectory });
  run('git', ['config', 'user.name', 'Package Smoke'], { cwd: installDirectory });
  run('git', ['config', 'user.email', 'package-smoke@example.invalid'], { cwd: installDirectory });
  run('git', ['add', 'package.json', 'package-lock.json'], { cwd: installDirectory });
  run('git', ['commit', '-m', 'feat: initialize consumer'], { cwd: installDirectory });
  const changelog = run('npx', documentedCommand, { cwd: installDirectory });
  if (!changelog.includes('initialize consumer')) {
    throw new Error('Installed autochangelog CLI did not generate a changelog from consumer history.');
  }
} finally {
  rmSync(installDirectory, { recursive: true, force: true });
}

console.log(
  `Package tarball includes ${expected.size} declared entrypoint(s), installs, and runs documented help and changelog commands.`,
);
