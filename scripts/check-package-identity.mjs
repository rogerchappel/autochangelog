import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const expectedName = '@rogerchappel/autochangelog';
const expectedRepository = 'github.com/rogerchappel/autochangelog';

if (pkg.name !== expectedName) {
  throw new Error(`Package name must be ${expectedName}, received ${pkg.name ?? '(missing)'}.`);
}
if (pkg.publishConfig?.access !== 'public') {
  throw new Error('Scoped package must set publishConfig.access to "public".');
}
if (pkg.bin?.autochangelog !== './dist/cli.js') {
  throw new Error('The documented autochangelog command must map to ./dist/cli.js.');
}

const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`;
const response = await fetch(registryUrl, {
  headers: { accept: 'application/vnd.npm.install-v1+json' },
});

if (response.status === 404) {
  console.log(`${pkg.name} is available on the npm registry.`);
  process.exit(0);
}
if (!response.ok) {
  throw new Error(`npm registry identity check failed: ${response.status} ${response.statusText}`);
}

const registryPackage = await response.json();
const repository =
  typeof registryPackage.repository === 'string'
    ? registryPackage.repository
    : registryPackage.repository?.url;

if (!repository?.toLowerCase().includes(expectedRepository)) {
  throw new Error(
    `${pkg.name} already exists with an unexpected repository: ${repository ?? '(missing)'}.`,
  );
}

console.log(`${pkg.name} is already associated with ${expectedRepository}.`);
