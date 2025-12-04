#!/usr/bin/env node
// Smoke-test runner: executes the built CLI against all .feature files under ./features
// Usage:
//   node scripts/smoke-cli.mjs [--config path/to/config.json] [--concurrency N]
// Notes:
// - Requires the project to be built so that dist/cli/cuke-docx.js exists.

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promises as fs } from 'node:fs';
import { relative, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { config: undefined, concurrency: 1 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config') {
      out.config = argv[++i];
    } else if (a === '--concurrency') {
      const v = Number(argv[++i]);
      if (Number.isFinite(v) && v > 0) out.concurrency = Math.max(1, Math.floor(v));
    }
  }
  return out;
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile() && full.endsWith('.feature')) {
      yield full;
    }
  }
}

function runCli(file, configPath) {
  return new Promise((resolveRun) => {
    const cliPath = resolve(projectRoot, 'dist', 'cli', 'cuke-docx.js');
    const args = [cliPath, file];
    if (configPath) {
      args.push('--config', configPath);
    }

    const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      resolveRun({ code, out, err });
    });
  });
}

async function main() {
  const { config, concurrency } = parseArgs(process.argv);
  const featuresDir = resolve(projectRoot, 'features');
  let hasFeaturesDir = false;
  try {
    const stat = await fs.stat(featuresDir);
    hasFeaturesDir = stat.isDirectory();
  } catch {}

  if (!hasFeaturesDir) {
    console.error('No features directory found at', featuresDir);
    process.exit(2);
  }

  const features = [];
  for await (const f of walk(featuresDir)) features.push(f);
  if (features.length === 0) {
    console.warn('No .feature files found under', featuresDir);
    return;
  }

  console.log(`Running CLI on ${features.length} feature file(s)...`);

  const pending = new Set();
  const failures = [];
  let idx = 0;

  async function scheduleNext() {
    if (idx >= features.length) return;
    const file = features[idx++];
    const rel = relative(projectRoot, file);
    const p = runCli(file, config).then((res) => {
      if (res.code === 0) {
        process.stdout.write(`✓ ${rel}\n`);
      } else {
        process.stderr.write(`✗ ${rel} (exit ${res.code})\n`);
        if (res.err) process.stderr.write(res.err + '\n');
        failures.push({ file: rel, ...res });
      }
    }).finally(() => {
      pending.delete(p);
    });
    pending.add(p);
  }

  const initial = Math.min(concurrency, features.length);
  for (let i = 0; i < initial; i++) scheduleNext();
  while (pending.size) {
    await Promise.race(pending);
    scheduleNext();
  }

  if (failures.length) {
    console.error(`\n${failures.length} failure(s).`);
    process.exit(1);
  } else {
    console.log('\nAll CLI runs succeeded.');
  }
}

main().catch((e) => {
  console.error(e?.stack || e?.message || String(e));
  process.exit(1);
});
