#!/usr/bin/env node
import { basename, dirname, join, relative, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import { convertFeatureFile } from '../index.js';
import { defaultTheme } from '../index.js';
import { defaultDocumentSettings } from '../index.js';
import type { DocxOptions } from '../lib/options.js';

function usage(): void {
  console.log('Usage: cuke-docx <input.feature>');
  console.log('  Converts the given .feature file into a .docx under the docx/ folder,');
  console.log('  preserving the relative folder structure.');
  console.log('');
  console.log('Example:');
  console.log('  cuke-docx pokemon.feature     # → docx/pokemon.docx');
  console.log('  cuke-docx features/a.feature  # → docx/features/a.docx');
  console.log('');
  console.log('Options:');
  console.log('  --config <path>      Path to a JSON file with config overrides');
  console.log('                       Accepted shapes:');
  console.log('                         1) { "theme": { ... }, "document": { ... } }');
  console.log('                         2) { ...themeKeys } (legacy: theme-only)');
  console.log('  --print-config       Print the full default configuration and exit');
  console.log('');
  console.log('TODO: support passing a directory and converting all .feature files.');
}

type ParsedArgs = {
  input?: string;
  optionsOverrides?: Record<string, unknown>;
  printConfig?: boolean;
  help?: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {};
  if (argv.length === 0) return result;

  result.input = argv[0];
  // iterate flags after the positional input
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--print-config') {
      result.printConfig = true;
      continue;
    }
    if (a === '--config') {
      const p = argv[i + 1];
      if (p) {
        result.optionsOverrides = tryReadJson(p);
        i++; // skip value
        continue;
      }
      throw new Error('Missing value for --config');
    }
    if (a === '-h' || a === '--help') {
      result.help = true;
    }
  }
  return result;
}

function tryReadJson(p: string): Record<string, unknown> {
  const cfgPath = resolve(process.cwd(), p);
  if (!existsSync(cfgPath)) throw new Error(`Config not found: ${p}`);
  const raw = readFileSync(cfgPath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

function normalizeOptions(overrides?: Record<string, unknown>): DocxOptions | undefined {
  if (!overrides) return undefined;
  const hasGrouped = Object.prototype.hasOwnProperty.call(overrides, 'theme') ||
    Object.prototype.hasOwnProperty.call(overrides, 'document');
  return (hasGrouped ? overrides : { theme: overrides }) as DocxOptions;
}

function computeOutPath(inputArg: string): { inputAbs: string; outPath: string } {
  const inputAbs = resolve(process.cwd(), inputArg);
  const rel = relative(process.cwd(), inputAbs);
  const base = basename(rel, '.feature');
  const outRelDir = dirname(rel);
  const outPath = join(process.cwd(), 'docx', outRelDir === '.' ? '' : outRelDir, `${base}.docx`);
  return { inputAbs, outPath };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // Quick help/usage handling
  if (argv.length === 0) {
    usage();
    process.exit(1);
  }

  const parsed = parseArgs(argv);
  if (parsed.help) {
    usage();
    process.exit(0);
  }
  if (parsed.printConfig) {
    const full = { theme: defaultTheme, document: defaultDocumentSettings };
    console.log(JSON.stringify(full, null, 2));
    process.exit(0);
  }

  const arg = parsed.input;
  if (!arg) {
    usage();
    process.exit(1);
  }

  const { inputAbs, outPath } = computeOutPath(arg);
  if (!existsSync(inputAbs)) {
    console.error(`Input not found: ${arg}`);
    process.exit(2);
  }

  const options = normalizeOptions(parsed.optionsOverrides);
  await convertFeatureFile(inputAbs, outPath, options);
  console.log(`✓ Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
