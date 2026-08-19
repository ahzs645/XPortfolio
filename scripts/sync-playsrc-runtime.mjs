#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLAYSRC_DIR = join(PROJECT_ROOT, 'external', 'playsrc');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'tf2');
const MARKER_PATH = join(OUTPUT_DIR, 'runtime-source.json');
const OBJECT_CACHE_ROOT = join(PLAYSRC_DIR, '.xportfolio-assets');
const OBJECT_CACHE_DIR = join(OBJECT_CACHE_ROOT, 'objects', 'sha256');
const OBJECT_CACHE_MARKER = join(OBJECT_CACHE_ROOT, 'object-source.json');
const PUBLIC_OBJECT_LINK = join(PROJECT_ROOT, 'public', 'objects');
const PUBLIC_ORIGIN = 'https://playsrc.online';
const OBJECT_ORIGIN = 'https://assets.playsrc.online';
const DEPLOYED_ASSET_ORIGIN = process.env.VITE_PLAYSRC_ASSET_ORIGIN?.trim()
  || 'https://xp.ahmadjalil.com';
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

function submoduleGitPath(path) {
  return execFileSync('git', ['-C', PLAYSRC_DIR, 'rev-parse', '--git-path', path], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
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
      && marker.assetOrigin === DEPLOYED_ASSET_ORIGIN
      && await pathExists(join(OUTPUT_DIR, 'index.html'))
      && await pathExists(join(OUTPUT_DIR, 'playsrc-config.json'))
      && await pathExists(join(OUTPUT_DIR, 'assets'))
    );
  } catch {
    return false;
  }
}

function objectDescriptor(sha, byteLength) {
  return {
    sha256: sha,
    byteLength: Number(byteLength),
  };
}

async function ensureCachedObject(descriptor) {
  const expectedHash = descriptor.sha256;
  const expectedLength = Number(descriptor.byteLength);
  const outputPath = join(OBJECT_CACHE_DIR, expectedHash);

  try {
    const existing = await stat(outputPath);
    if (existing.isFile() && existing.size === expectedLength) {
      return outputPath;
    }
  } catch {
    // Download missing or incomplete objects below.
  }

  const response = await fetchOk(
    new URL(`/objects/sha256/${expectedHash}`, OBJECT_ORIGIN),
  );
  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength !== expectedLength) {
    throw new Error(
      `Object ${expectedHash} has ${bytes.byteLength} bytes; expected ${expectedLength}.`,
    );
  }

  const actualHash = sha256(bytes);
  if (actualHash !== expectedHash) {
    throw new Error(`Object ${expectedHash} failed its SHA-256 integrity check.`);
  }

  const temporaryPath = `${outputPath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, bytes);
  await rename(temporaryPath, outputPath);
  return outputPath;
}

async function readJsonObject(descriptor) {
  const objectPath = await ensureCachedObject(descriptor);
  return JSON.parse(await readFile(objectPath, 'utf8'));
}

function addDescriptor(descriptors, descriptor) {
  const normalized = objectDescriptor(descriptor.sha256, descriptor.byteLength);
  const existing = descriptors.get(normalized.sha256);

  if (existing && existing.byteLength !== normalized.byteLength) {
    throw new Error(`Conflicting byte lengths for object ${normalized.sha256}.`);
  }

  descriptors.set(normalized.sha256, normalized);
}

async function ensureSubmoduleCacheIsIgnored() {
  const excludePath = submoduleGitPath('info/exclude');
  const exclusion = '.xportfolio-assets/';
  let contents = '';

  try {
    contents = await readFile(excludePath, 'utf8');
  } catch {
    await mkdir(dirname(excludePath), { recursive: true });
  }

  if (!contents.split(/\r?\n/).includes(exclusion)) {
    const prefix = contents.length > 0 && !contents.endsWith('\n') ? '\n' : '';
    await writeFile(excludePath, `${contents}${prefix}${exclusion}\n`);
  }
}

async function ensurePublicObjectLink() {
  const expectedTarget = relative(
    dirname(PUBLIC_OBJECT_LINK),
    join(OBJECT_CACHE_ROOT, 'objects'),
  );

  try {
    const entry = await lstat(PUBLIC_OBJECT_LINK);
    if (!entry.isSymbolicLink()) {
      throw new Error(
        'public/objects already exists and is not the generated playsrc symlink.',
      );
    }

    const currentTarget = await readlink(PUBLIC_OBJECT_LINK);
    if (currentTarget !== expectedTarget) {
      await rm(PUBLIC_OBJECT_LINK);
      await symlink(expectedTarget, PUBLIC_OBJECT_LINK, 'dir');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await symlink(expectedTarget, PUBLIC_OBJECT_LINK, 'dir');
  }
}

async function syncObjectStore(config) {
  await mkdir(OBJECT_CACHE_DIR, { recursive: true });
  await ensureSubmoduleCacheIsIgnored();

  const descriptors = new Map();
  addDescriptor(descriptors, config.bsp);
  addDescriptor(descriptors, config.wasm);
  addDescriptor(descriptors, config.catalog);

  const catalog = await readJsonObject(config.catalog);
  const resources = catalog.entries.find((entry) => entry.target === config.target)?.resources;

  if (!resources) {
    throw new Error(`The playsrc catalog has no resource graph for ${config.target}.`);
  }

  addDescriptor(descriptors, resources);
  const graph = await readJsonObject(resources);

  for (const chunk of graph.chunks) {
    addDescriptor(
      descriptors,
      objectDescriptor(chunk.encodedSha256, chunk.encodedByteLength),
    );
  }

  const pending = [...descriptors.values()];
  let cursor = 0;
  let completed = 0;

  const workers = Array.from(
    { length: Math.min(8, pending.length) },
    async () => {
      while (cursor < pending.length) {
        const descriptor = pending[cursor];
        cursor += 1;
        await ensureCachedObject(descriptor);
        completed += 1;
        if (completed % 25 === 0 || completed === pending.length) {
          console.log(`Cached ${completed}/${pending.length} playsrc objects.`);
        }
      }
    },
  );

  await Promise.all(workers);

  const expectedNames = new Set(descriptors.keys());
  for (const filename of await readdir(OBJECT_CACHE_DIR)) {
    if (!expectedNames.has(filename)) {
      await rm(join(OBJECT_CACHE_DIR, filename), { force: true });
    }
  }

  const totalBytes = [...descriptors.values()]
    .reduce((sum, descriptor) => sum + descriptor.byteLength, 0);

  await writeFile(
    OBJECT_CACHE_MARKER,
    `${JSON.stringify({
      commit: submoduleCommit(),
      applicationBuild: config.applicationBuild,
      contentBuild: graph.contentBuild,
      target: config.target,
      objects: descriptors.size,
      bytes: totalBytes,
    }, null, 2)}\n`,
  );

  await ensurePublicObjectLink();
  console.log(
    `playsrc object store is local (${descriptors.size} objects, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`,
  );
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

  const runtimeConfig = {
    ...config,
    assetOrigin: DEPLOYED_ASSET_ORIGIN,
  };

  if (await canReuseRuntime(commit, config.applicationBuild)) {
    console.log(`playsrc runtime already matches ${commit.slice(0, 12)}.`);
  } else {
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
      `${JSON.stringify(runtimeConfig)}\n`,
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
        assetOrigin: DEPLOYED_ASSET_ORIGIN,
        assets: downloadedAssets.size,
      }, null, 2)}\n`,
    );

    console.log(
      `Synced playsrc ${commit.slice(0, 12)} frontend (${downloadedAssets.size} assets) to public/tf2.`,
    );
  }

  await syncObjectStore(config);
}

main().catch((error) => {
  console.error(`playsrc runtime sync failed: ${error.message}`);
  process.exitCode = 1;
});
