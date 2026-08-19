#!/usr/bin/env node

import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const TF2_DIR = join(DIST_DIR, 'tf2');
const OBJECT_DIR = join(DIST_DIR, 'objects', 'sha256');
const HASH_PATTERN = /^[0-9a-f]{64}$/;

function fail(message) {
  throw new Error(`TF2 deployment verification failed: ${message}`);
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`${label} is missing or invalid (${error.message})`);
  }
}

function normalizeDescriptor(descriptor, label) {
  const byteLength = Number(descriptor?.byteLength);
  if (!HASH_PATTERN.test(descriptor?.sha256) || !Number.isSafeInteger(byteLength) || byteLength < 0) {
    fail(`${label} has an invalid immutable object descriptor`);
  }

  return { sha256: descriptor.sha256, byteLength };
}

async function verifyObject(descriptor, label) {
  const normalized = normalizeDescriptor(descriptor, label);
  const objectPath = join(OBJECT_DIR, normalized.sha256);
  let objectStat;

  try {
    objectStat = await stat(objectPath);
  } catch {
    fail(`${label} object ${normalized.sha256} is absent from dist`);
  }

  if (!objectStat.isFile() || objectStat.size !== normalized.byteLength) {
    fail(
      `${label} object ${normalized.sha256} has ${objectStat.size} bytes; expected ${normalized.byteLength}`,
    );
  }

  return objectPath;
}

async function main() {
  const config = await readJson(join(TF2_DIR, 'playsrc-config.json'), 'playsrc config');
  const marker = await readJson(join(TF2_DIR, 'runtime-source.json'), 'runtime marker');

  if (config.application !== 'tf2' || !/^[a-z0-9_-]+$/.test(config.target)) {
    fail('playsrc config does not identify a valid TF2 target');
  }
  if (!HASH_PATTERN.test(config.applicationBuild)) {
    fail('playsrc config has an invalid application build');
  }
  if (
    marker.applicationBuild !== config.applicationBuild
    || marker.assetOrigin !== config.assetOrigin
    || !/^[0-9a-f]{40}$/.test(marker.commit)
  ) {
    fail('runtime marker does not match the embedded playsrc configuration');
  }

  const indexHtml = await readFile(join(TF2_DIR, 'index.html'), 'utf8');
  const assetNames = await readdir(join(TF2_DIR, 'assets'));
  const runtimeAssets = assetNames.filter((name) => /\.(?:css|js)$/.test(name));
  if (runtimeAssets.length === 0 || !runtimeAssets.some((name) => indexHtml.includes(`/tf2/assets/${name}`))) {
    fail('TF2 index does not reference an embedded JavaScript or CSS asset');
  }
  if (marker.assets !== runtimeAssets.length) {
    fail(`runtime marker records ${marker.assets} assets, but dist contains ${runtimeAssets.length}`);
  }

  await verifyObject(config.bsp, 'BSP');
  await verifyObject(config.wasm, 'WASM');
  const catalogPath = await verifyObject(config.catalog, 'catalog');
  const catalog = await readJson(catalogPath, 'asset catalog');
  const resources = catalog.entries?.find((entry) => entry.target === config.target)?.resources;
  if (!resources) fail(`asset catalog has no resource graph for ${config.target}`);

  const graphPath = await verifyObject(resources, 'resource graph');
  const graph = await readJson(graphPath, 'resource graph');
  if (!Array.isArray(graph.chunks) || graph.chunks.length === 0) {
    fail('resource graph contains no chunks');
  }

  for (const [index, chunk] of graph.chunks.entries()) {
    await verifyObject({
      sha256: chunk.encodedSha256,
      byteLength: chunk.encodedByteLength,
    }, `resource chunk ${index + 1}`);
  }

  const deployedObjects = (await readdir(OBJECT_DIR)).filter((name) => HASH_PATTERN.test(name));
  console.log(
    `Verified TF2 ${config.target}: ${runtimeAssets.length} runtime assets, `
      + `${graph.chunks.length + 4} required immutable objects, ${deployedObjects.length} objects deployed.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
