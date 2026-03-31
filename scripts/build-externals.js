#!/usr/bin/env node
/**
 * Manifest-driven build script for external projects.
 *
 * Reads external/manifest.json and for each project:
 *   1. Installs dependencies (npm / pnpm / yarn / none)
 *   2. Runs the build command (if any)
 *   3. Copies build output to the deploy target directory
 *
 * Usage:
 *   node scripts/build-externals.js            # build all external projects
 *   node scripts/build-externals.js --only jspaint  # build a single project
 */
import { readFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ── helpers ─────────────────────────────────────────────────
const log = (msg) => console.log(`  ${msg}`);
const header = (msg) => console.log(`\n\x1b[33m${msg}\x1b[0m`);
const success = (msg) => console.log(`\x1b[32m  ✅ ${msg}\x1b[0m`);
const error = (msg) => console.error(`\x1b[31m  ❌ ${msg}\x1b[0m`);

function run(cmd, cwd, env = {}) {
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

function hasBinary(name) {
  try {
    execSync(`command -v ${name}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ── main ────────────────────────────────────────────────────
const manifestPath = join(PROJECT_ROOT, 'external', 'manifest.json');
if (!existsSync(manifestPath)) {
  error('external/manifest.json not found');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const onlyProject = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null;

// Initialize submodules
header('Initializing git submodules');
run('git submodule init && git submodule update --recursive', PROJECT_ROOT);

let built = 0;
let failed = 0;

for (const project of manifest.projects) {
  if (onlyProject && project.name !== onlyProject) continue;

  header(`Building: ${project.name}`);
  const projectDir = resolve(PROJECT_ROOT, project.path);

  if (!existsSync(projectDir)) {
    error(`Directory not found: ${project.path}`);
    failed++;
    continue;
  }

  try {
    // 1. Install dependencies
    if (project.packageManager && project.packageManager !== 'none') {
      const pm = project.packageManager;
      // Fall back to npm if preferred package manager isn't available
      const actualPm = (pm !== 'npm' && !hasBinary(pm)) ? 'npm' : pm;
      log(`Installing dependencies (${actualPm})...`);
      run(`${actualPm} install`, projectDir);
    }

    // 2. Build
    if (project.buildCommand) {
      log(`Running build: ${project.buildCommand}`);
      run(project.buildCommand, projectDir, project.envOverrides || {});
    }

    // 3. Copy output to deploy target
    const targetDir = resolve(PROJECT_ROOT, project.deployTarget);

    if (!project.copyFiles && !project.buildOutput) {
      log('No deploy artifacts configured; leaving existing committed files in place.');
    } else {
      // Clean target directory
      if (existsSync(targetDir)) {
        rmSync(targetDir, { recursive: true, force: true });
      }
      mkdirSync(targetDir, { recursive: true });

      if (project.copyFiles) {
        // Selective copy (e.g. jspaint – no build step, copy specific files)
        for (const entry of project.copyFiles) {
          const src = join(projectDir, entry);
          const dest = join(targetDir, entry);
          if (existsSync(src)) {
            cpSync(src, dest, { recursive: true });
          }
          // Silently skip missing optional files
        }
      } else if (project.buildOutput) {
        // Copy entire build output directory
        const buildDir = join(projectDir, project.buildOutput);
        if (!existsSync(buildDir)) {
          throw new Error(`Build output not found: ${buildDir}`);
        }
        cpSync(buildDir, targetDir, { recursive: true });
      }
    }

    success(`${project.name} built and deployed to ${project.deployTarget}`);
    built++;
  } catch (err) {
    error(`${project.name} failed: ${err.message}`);
    failed++;
  }
}

// ── summary ────────────────────────────────────────────────
console.log(`\n${'='.repeat(46)}`);
console.log(`  External projects: ${built} built, ${failed} failed`);
console.log(`${'='.repeat(46)}\n`);

if (failed > 0) process.exit(1);
