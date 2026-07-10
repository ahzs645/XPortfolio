/**
 * Converts the editable YAML CV into JSON for the browser build.
 *
 * The YAML source remains the canonical, full-quality authoring format. The
 * generated JSON lets the startup path avoid shipping a YAML parser to every
 * visitor. ConfigContext still falls back to YAML for custom deployments that
 * do not provide a generated JSON file.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');
const yamlPath = join(publicDir, 'CV.yaml');
const jsonPath = join(publicDir, 'CV.json');

if (!existsSync(yamlPath)) {
  console.warn('[CV] public/CV.yaml was not found; keeping any existing CV.json');
  process.exit(0);
}

const parsed = yaml.load(readFileSync(yamlPath, 'utf8'));
writeFileSync(jsonPath, `${JSON.stringify(parsed, null, 2)}\n`);

console.log('[CV] Generated public/CV.json from public/CV.yaml');
