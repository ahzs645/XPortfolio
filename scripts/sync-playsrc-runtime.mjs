#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLAYSRC_DIR = join(PROJECT_ROOT, 'external', 'playsrc');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'tf2');
const MARKER_PATH = join(OUTPUT_DIR, 'runtime-source.json');
const PUBLIC_ORIGIN = 'https://playsrc.online';
const RUNTIME_PATH = '/tf2/';
const CONFIG_PATH = '/tf2/playsrc-config.json';
const ASSET_PATTERN = /\/tf2\/assets\/[A-Za-z0-9._-]+/g;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function submoduleCommit() {
  try {
    return execFileSync('git', ['-C', PLAYSRC_DIR, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    throw new Error(
      'The playsrc submodule is unavailable. Run git submodule update --init external/playsrc.',
    );
  }
}

async function fetchOk(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'XPortfolio playsrc runtime sync' },
  });

  if (!response.ok) {
    throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  }

  return response;
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function assetOutputPath(assetPath) {
  const relativePath = assetPath.replace(/^\/tf2\//, '');
  const outputPath = resolve(OUTPUT_DIR, relativePath);
  const relativeToOutput = relative(OUTPUT_DIR, outputPath);

  if (
    relativeToOutput === '..'
    || relativeToOutput.startsWith(`..${sep}`)
    || relativeToOutput.includes(`.${sep}`)
  ) {
    throw new Error(`Refusing unsafe playsrc asset path: ${assetPath}`);
  }

  return outputPath;
}

async function canReuseRuntime(commit, applicationBuild) {
  try {
    const marker = JSON.parse(await readFile(MARKER_PATH, 'utf8'));
    return (
      marker.commit === commit
      && marker.applicationBuild === applicationBuild
      && await pathExists(join(OUTPUT_DIR, 'index.html'))
      && await pathExists(join(OUTPUT_DIR, 'playsrc-config.json'))
      && await pathExists(join(OUTPUT_DIR, 'assets'))
    );
  } catch {
    return false;
  }
}

async function main() {
  const commit = submoduleCommit();
  const configResponse = await fetchOk(new URL(CONFIG_PATH, PUBLIC_ORIGIN));
  const config = await configResponse.json();
  const expectedApplicationBuild = sha256(commit);

  if (config.applicationBuild !== expectedApplicationBuild) {
    throw new Error(
      [
        `The public playsrc runtime does not match submodule commit ${commit}.`,
        `Expected applicationBuild ${expectedApplicationBuild},`,
        `but playsrc.online reports ${config.applicationBuild}.`,
        'Build the fork locally or publish that commit before syncing it into XPortfolio.',
      ].join(' '),
    );
  }

  if (await canReuseRuntime(commit, config.applicationBuild)) {
    console.log(`playsrc runtime already matches ${commit.slice(0, 12)}.`);
    return;
  }

  const indexResponse = await fetchOk(new URL(RUNTIME_PATH, PUBLIC_ORIGIN));
  const indexHtml = await indexResponse.text();
  const queuedAssets = [...new Set(indexHtml.match(ASSET_PATTERN) || [])];
  const visitedAssets = new Set();
  const downloadedAssets = new Map();

  while (queuedAssets.length > 0) {
    const assetPath = queuedAssets.shift();
    if (visitedAssets.has(assetPath)) continue;
    visitedAssets.add(assetPath);

    const response = await fetchOk(new URL(assetPath, PUBLIC_ORIGIN));
    const bytes = new Uint8Array(await response.arrayBuffer());
    downloadedAssets.set(assetPath, bytes);

    if (assetPath.endsWith('.js') || assetPath.endsWith('.css')) {
      const source = new TextDecoder().decode(bytes);
      for (const nestedAsset of source.match(ASSET_PATTERN) || []) {
        if (!visitedAssets.has(nestedAsset)) queuedAssets.push(nestedAsset);
      }
    }
  }

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(join(OUTPUT_DIR, 'index.html'), indexHtml);
  await writeFile(
    join(OUTPUT_DIR, 'playsrc-config.json'),
    `${JSON.stringify(config)}\n`,
  );

  for (const [assetPath, bytes] of downloadedAssets) {
    const outputPath = assetOutputPath(assetPath);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, bytes);
  }

  await writeFile(
    MARKER_PATH,
    `${JSON.stringify({
      source: `${PUBLIC_ORIGIN}${RUNTIME_PATH}`,
      commit,
      applicationBuild: config.applicationBuild,
      assets: downloadedAssets.size,
    }, null, 2)}\n`,
  );

  console.log(
    `Synced playsrc ${commit.slice(0, 12)} frontend (${downloadedAssets.size} assets) to public/tf2.`,
  );
}

main().catch((error) => {
  console.error(`playsrc runtime sync failed: ${error.message}`);
  process.exitCode = 1;
});
