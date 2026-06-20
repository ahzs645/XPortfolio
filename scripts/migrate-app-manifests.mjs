/**
 * One-shot migration: explode the monolithic apps/index.js maps into one
 * co-located `manifest.js` per app folder. Reads the legacy snapshot
 * (apps/__legacyRegistry.js) and writes apps/<Folder>/manifest.js verbatim,
 * resolving XP_ICONS.* references to string literals so each manifest is
 * self-contained. Prints any entries not owned by a folder ("extras") so they
 * can be inlined into the registry.
 *
 * Run once: node scripts/migrate-app-manifests.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const APPS_DIR = path.resolve('src/WinXP/apps');
const SRC = fs.readFileSync(path.join(APPS_DIR, '__legacyRegistry.js'), 'utf8');

// --- string/comment-aware brace matcher -----------------------------------
function matchBraces(text, openIdx) {
  let depth = 0;
  let inStr = null;
  let inLine = false;
  let inBlock = false;
  for (let i = openIdx; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('unbalanced braces');
}

function blockBody(decl) {
  const idx = SRC.indexOf(decl);
  if (idx < 0) throw new Error(`not found: ${decl}`);
  const open = SRC.indexOf('{', idx);
  const close = matchBraces(SRC, open);
  return SRC.slice(open + 1, close);
}

// --- parse an object map whose values are object literals ------------------
function parseObjectEntries(body) {
  const entries = [];
  const N = body.length;
  let i = 0;
  const skip = () => {
    while (i < N) {
      const c = body[i];
      const n = body[i + 1];
      if (c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === ',') { i++; continue; }
      if (c === '/' && n === '/') { while (i < N && body[i] !== '\n') i++; continue; }
      if (c === '/' && n === '*') { i += 2; while (i < N && !(body[i] === '*' && body[i + 1] === '/')) i++; i += 2; continue; }
      break;
    }
  };
  for (;;) {
    skip();
    if (i >= N) break;
    let key;
    if (body[i] === "'" || body[i] === '"') {
      const q = body[i];
      let j = i + 1;
      let s = '';
      while (j < N && body[j] !== q) { if (body[j] === '\\') { s += body[j + 1]; j += 2; } else { s += body[j]; j++; } }
      key = s;
      i = j + 1;
    } else {
      let j = i;
      while (j < N && /[A-Za-z0-9_$]/.test(body[j])) j++;
      key = body.slice(i, j);
      i = j;
    }
    skip();
    if (body[i] !== ':') throw new Error(`expected ':' after ${key}`);
    i++;
    skip();
    if (body[i] !== '{') throw new Error(`expected object value for ${key}, got: ${body.slice(i, i + 30)}`);
    const close = matchBraces(body, i);
    entries.push({ key, value: body.slice(i, close + 1) });
    i = close + 1;
  }
  return entries;
}

// --- parse a flat map: `key: value,` per line ------------------------------
function parseSimpleMap(body) {
  const out = {};
  for (const raw of body.split('\n')) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9_$]+))\s*:\s*(.+?),?$/);
    if (!m) continue;
    const key = m[1] ?? m[2] ?? m[3];
    out[key] = m[4].trim().replace(/,$/, '');
  }
  return out;
}

const stripQuotes = (s) => s.replace(/^['"]|['"]$/g, '');

// --- reference data --------------------------------------------------------
const XP_ICONS = Object.fromEntries(
  Object.entries(parseSimpleMap(blockBody('const XP_ICONS = {'))).map(([k, v]) => [k, stripQuotes(v)]),
);
const APP_CATEGORIES = Object.fromEntries(
  Object.entries(parseSimpleMap(blockBody('export const APP_CATEGORIES = {'))).map(([k, v]) => [k, stripQuotes(v)]),
);

const varPath = {};
for (const m of SRC.matchAll(/const (\w+) = lazy\(\(\) => import\('(\.\/[^']+)'\)\)/g)) {
  varPath[m[1]] = m[2];
}

function folderInfo(p) {
  const parts = p.slice(2).split('/');
  const folder = parts[0];
  const rest = parts.slice(1).join('/');
  return { folder, relImport: rest ? `./${rest}` : './index.jsx' };
}

const resolveIcons = (text) => text.replace(/XP_ICONS\.([A-Za-z0-9_$]+)/g, (_, k) => {
  if (!(k in XP_ICONS)) throw new Error(`unknown XP_ICONS.${k}`);
  return JSON.stringify(XP_ICONS[k]);
});

// --- assemble per-folder buckets ------------------------------------------
const folders = {};
const getFolder = (f) => (folders[f] ??= { vars: {}, apps: {}, icons: {}, catalogTargets: {}, categories: {} });

const componentVar = (objText) => {
  const m = objText.match(/component:\s*(\w+)/);
  if (!m) throw new Error(`no component in: ${objText.slice(0, 60)}`);
  return m[1];
};

const appKeyToFolder = {};
for (const { key, value } of parseObjectEntries(blockBody('export const appSettings = {'))) {
  const v = componentVar(value);
  const { folder, relImport } = folderInfo(varPath[v]);
  const F = getFolder(folder);
  F.vars[v] = relImport;
  F.apps[key] = resolveIcons(value);
  appKeyToFolder[key] = folder;
}

const idToFolder = {};
for (const { key, value } of parseObjectEntries(blockBody('export const desktopIconCatalog = {'))) {
  const v = componentVar(value);
  const { folder, relImport } = folderInfo(varPath[v]);
  const F = getFolder(folder);
  F.vars[v] = relImport;
  F.icons[key] = resolveIcons(value);
  idToFolder[key] = folder;
}

const extraCatalogTargets = {};
for (const [id, rawVal] of Object.entries(parseSimpleMap(blockBody('const CATALOG_TO_APP_KEY = {')))) {
  const appKey = stripQuotes(rawVal);
  const folder = idToFolder[id];
  if (folder) getFolder(folder).catalogTargets[id] = appKey;
  else extraCatalogTargets[id] = appKey;
}

const extraCategories = {};
for (const [name, expr] of Object.entries(parseSimpleMap(blockBody('export const appCategoryMap = {')))) {
  const cat = expr.startsWith('APP_CATEGORIES.') ? APP_CATEGORIES[expr.split('.')[1]] : stripQuotes(expr);
  const folder = appKeyToFolder[name];
  if (folder) getFolder(folder).categories[name] = cat;
  else extraCategories[name] = cat;
}

// --- emit manifests --------------------------------------------------------
let appCount = 0;
let iconCount = 0;
for (const [folder, F] of Object.entries(folders)) {
  const imports = Object.entries(F.vars)
    .map(([v, imp]) => `const ${v} = lazy(() => import('${imp}'));`)
    .join('\n');
  const apps = Object.entries(F.apps)
    .map(([k, txt]) => `  ${JSON.stringify(k)}: ${txt},`)
    .join('\n');
  const icons = Object.entries(F.icons)
    .map(([k, txt]) => `  ${JSON.stringify(k)}: ${txt},`)
    .join('\n');
  appCount += Object.keys(F.apps).length;
  iconCount += Object.keys(F.icons).length;

  const out = `import { lazy } from 'react';

${imports}

// Auto-generated by scripts/migrate-app-manifests.mjs — describes every window,
// desktop icon, and category this folder contributes to the app registry.
export default {
  apps: {
${apps}
  },
  icons: {
${icons}
  },
  catalogTargets: ${JSON.stringify(F.catalogTargets, null, 2).replace(/\n/g, '\n  ')},
  categories: ${JSON.stringify(F.categories, null, 2).replace(/\n/g, '\n  ')},
};
`;
  fs.writeFileSync(path.join(APPS_DIR, folder, 'manifest.js'), out);
}

// --- report ----------------------------------------------------------------
console.log(`Generated ${Object.keys(folders).length} manifests`);
console.log(`  appSettings entries: ${appCount}`);
console.log(`  desktop icons:       ${iconCount}`);
console.log('\nInline these into the registry (extras not owned by any folder):');
console.log('extraCatalogTargets =', JSON.stringify(extraCatalogTargets, null, 2));
console.log('extraCategories =', JSON.stringify(extraCategories, null, 2));
