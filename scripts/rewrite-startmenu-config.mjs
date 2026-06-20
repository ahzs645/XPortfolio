/**
 * One-shot: rewrite START_MENU_CATALOG in startMenuConfig.js to pull per-app
 * program entries from the registry (`startMenuEntries`), keeping only the
 * non-app entries (projects folder shortcut + separators) curated inline.
 *
 * Run once after migrate-startmenu.mjs: node scripts/rewrite-startmenu-config.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const CFG = path.resolve('src/WinXP/config/startMenuConfig.js');
let text = fs.readFileSync(CFG, 'utf8');

function matchBraces(s, openIdx) {
  let depth = 0;
  let inStr = null;
  let inLine = false;
  let inBlock = false;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    const n = s[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inLine = true; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('unbalanced');
}

function parseEntries(body) {
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
    i++; // ':'
    skip();
    const close = matchBraces(body, i);
    entries.push({ key, value: body.slice(i, close + 1) });
    i = close + 1;
  }
  return entries;
}

const KEEP = new Set(['projects', 'divider-main', 'divider-trailing']);

const declStart = text.indexOf('export const START_MENU_CATALOG = {');
const open = text.indexOf('{', declStart);
const close = matchBraces(text, open);
const entries = parseEntries(text.slice(open + 1, close));
const keptText = entries
  .filter((e) => KEEP.has(e.key))
  .map((e) => `  ${JSON.stringify(e.key)}: ${e.value},`)
  .join('\n');

const newBlock = `export const START_MENU_CATALOG = {
  ...externalProjectEntries,
  ...appletEntries,
  // Per-app program entries are co-located in each app's manifest.js and
  // assembled by the app registry.
  ...startMenuEntries,
  // Non-app entries stay curated here (folder shortcut + separators):
${keptText}
}`;

text = text.slice(0, declStart) + newBlock + text.slice(close + 1);

// Add the registry import (once).
if (!text.includes("import { startMenuEntries }")) {
  text = text.replace(
    "import { APPLETS, DEFAULT_APPLET_ICON } from './applets';",
    "import { APPLETS, DEFAULT_APPLET_ICON } from './applets';\nimport { startMenuEntries } from '../apps';",
  );
}

fs.writeFileSync(CFG, text);
console.log('Rewrote START_MENU_CATALOG; kept inline:', [...KEEP].join(', '));
