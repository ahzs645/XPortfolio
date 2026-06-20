/**
 * One-shot: move per-app START_MENU_CATALOG `program` entries into the owning
 * app's manifest as a `startMenu` block. Non-app entries (separators, the
 * projects openFolder, external/applet spreads) stay curated in
 * startMenuConfig.js, as do all placement arrays (order, folder items, pins).
 *
 * Run once: node scripts/migrate-startmenu.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const APPS_DIR = path.resolve('src/WinXP/apps');
const SRC = fs.readFileSync(path.resolve('src/WinXP/config/__legacyStartMenu.js'), 'utf8');

// --- string/comment-aware brace matcher (shared with the app generator) -----
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

function blockBody(text, decl) {
  const idx = text.indexOf(decl);
  if (idx < 0) throw new Error(`not found: ${decl}`);
  const open = text.indexOf('{', idx);
  return text.slice(open + 1, matchBraces(text, open));
}

// Parse `key: { ... }` entries, skipping `...spread,` elements.
function parseObjectEntries(body) {
  const entries = [];
  const N = body.length;
  let i = 0;
  const skip = () => {
    for (;;) {
      while (i < N && ' \n\t\r,'.includes(body[i])) i++;
      if (body[i] === '/' && body[i + 1] === '/') { while (i < N && body[i] !== '\n') i++; continue; }
      if (body[i] === '/' && body[i + 1] === '*') { i += 2; while (i < N && !(body[i] === '*' && body[i + 1] === '/')) i++; i += 2; continue; }
      if (body[i] === '.' && body[i + 1] === '.' && body[i + 2] === '.') { while (i < N && body[i] !== ',') i++; continue; }
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
    if (body[i] !== '{') throw new Error(`expected object for ${key}`);
    const close = matchBraces(body, i);
    entries.push({ key, value: body.slice(i, close + 1) });
    i = close + 1;
  }
  return entries;
}

// --- appKey -> folder, by reading each manifest's apps block ---------------
const appKeyToFolder = {};
for (const folder of fs.readdirSync(APPS_DIR)) {
  const file = path.join(APPS_DIR, folder, 'manifest.js');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const { key } of parseObjectEntries(blockBody(text, 'apps: {'))) {
    appKeyToFolder[key] = folder;
  }
}

// --- split catalog entries into moved (per folder) vs kept -----------------
const moved = {};
const kept = [];
for (const { key, value } of parseObjectEntries(blockBody(SRC, 'export const START_MENU_CATALOG = {'))) {
  const type = value.match(/type:\s*'([^']+)'/)?.[1];
  const appKey = value.match(/appKey:\s*'([^']+)'/)?.[1];
  const folder = appKey && appKeyToFolder[appKey];
  if (type === 'program' && folder) {
    (moved[folder] ??= {})[key] = value;
  } else {
    kept.push(key);
  }
}

// --- inject startMenu blocks into manifests --------------------------------
let movedCount = 0;
for (const [folder, ents] of Object.entries(moved)) {
  const file = path.join(APPS_DIR, folder, 'manifest.js');
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('startMenu:')) { console.log(`skip ${folder} (already migrated)`); continue; }
  const block = `  startMenu: {\n${Object.entries(ents).map(([k, v]) => `    ${JSON.stringify(k)}: ${v},`).join('\n')}\n  },\n`;
  if (!/\n};\s*$/.test(text)) throw new Error(`no export close in ${folder}`);
  text = text.replace(/\n};\s*$/, `\n${block}};\n`);
  fs.writeFileSync(file, text);
  movedCount += Object.keys(ents).length;
}

console.log(`Moved ${movedCount} program entries into ${Object.keys(moved).length} manifests`);
console.log(`Kept curated in startMenuConfig (${kept.length}):`, kept.join(', '));
