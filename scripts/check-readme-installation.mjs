import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`;
const response = await fetch(registryUrl, {
  headers: { accept: 'application/vnd.npm.install-v1+json' },
});

if (response.status !== 404 && !response.ok) {
  throw new Error(`npm registry documentation check failed: ${response.status} ${response.statusText}`);
}

const registryInstall = `npm install --save-dev ${pkg.name}`;
const registryNpx = `npx --package ${pkg.name}`;

if (response.status === 404) {
  for (const unavailableCommand of [registryInstall, registryNpx]) {
    if (readme.includes(unavailableCommand)) {
      throw new Error(
        `README advertises unavailable registry command while ${pkg.name} is unpublished: ${unavailableCommand}`,
      );
    }
  }

  const requiredSourceCommands = [
    'npm pack --pack-destination artifacts',
    'npm install --save-dev /path/to/autochangelog/artifacts/',
    'npx --no-install autochangelog',
  ];
  for (const command of requiredSourceCommands) {
    if (!readme.includes(command)) {
      throw new Error(`README must document the pre-publication workflow command: ${command}`);
    }
  }
  console.log(`README documents the local tarball workflow while ${pkg.name} is unpublished.`);
} else {
  console.log(`${pkg.name} is published; README registry commands are permitted.`);
}
