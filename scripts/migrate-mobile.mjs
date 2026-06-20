/**
 * One-shot: co-locate mobile fullscreen behavior into manifests.
 * Inserts `mobileFullscreen: false` into each app that previously lived in
 * mobileConfig's MOBILE_APP_OVERRIDES. Targets are keyed by folder; the
 * 'Windows Media Player Classic' + 'Error Dialog' entries fix overrides that
 * the old name-based lookup never matched.
 *
 * Run once: node scripts/migrate-mobile.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const APPS_DIR = path.resolve('src/WinXP/apps');
const TARGETS = ['Calculator', 'Minesweeper', 'Solitaire', 'Run', 'Winamp', 'Properties', 'MediaPlayerClassic', 'ErrorDialog'];

for (const folder of TARGETS) {
  const file = path.join(APPS_DIR, folder, 'manifest.js');
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('mobileFullscreen')) {
    console.log(`skip ${folder} (already has mobileFullscreen)`);
    continue;
  }
  // Insert after the first `multiInstance: ...,` line (the apps entry).
  const replaced = text.replace(
    /(\n(\s*)multiInstance: (?:true|false),)/,
    `$1\n$2mobileFullscreen: false,`,
  );
  if (replaced === text) throw new Error(`no multiInstance anchor in ${folder}`);
  fs.writeFileSync(file, replaced);
  console.log(`updated ${folder}`);
}
