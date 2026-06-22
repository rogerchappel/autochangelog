#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8'
});
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));

const required = [
  'dist/cli.js',
  'dist/index.js',
  'README.md',
  'LICENSE',
  'package.json'
];

const missing = required.filter((file) => !files.has(file));
if (missing.length > 0) {
  console.error(`Package smoke failed: missing ${missing.join(', ')}`);
  process.exit(1);
}

const forbidden = [...files].filter((file) => file.startsWith('src/'));
if (forbidden.length > 0) {
  console.error(`Package smoke failed: source files should not be packed: ${forbidden.join(', ')}`);
  process.exit(1);
}

console.log(`Package smoke passed with ${files.size} files.`);
