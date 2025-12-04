#!/usr/bin/env node
import { basename, dirname, join, relative, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { convertFeatureFile } from '../index.js';
import { defaultTheme } from '../index.js';
import { defaultDocumentSettings } from '../index.js';

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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const arg = args[0];

  if (!arg || arg === '-h' || arg === '--help') {
    usage();
    process.exit(arg ? 0 : 1);
  }

  // Support flags
  let optionsOverrides: Record<string, unknown> | undefined;
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--print-config') {
      const full = { theme: defaultTheme, document: defaultDocumentSettings };
      console.log(JSON.stringify(full, null, 2));
      process.exit(0);
    }
    if (a === '--config') {
      const p = args[i + 1];
      if (!p) {
        console.error('Missing value for --config');
        process.exit(2);
      }
      const cfgPath = resolve(process.cwd(), p);
      if (!existsSync(cfgPath)) {
        console.error(`Config not found: ${p}`);
        process.exit(2);
      }
      try {
        const raw = readFileSync(cfgPath, 'utf8');
        optionsOverrides = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to read or parse config JSON:', e instanceof Error ? e.message : String(e));
        process.exit(2);
      }
      i++; // skip value
      continue;
    }
  }

  const inputAbs = resolve(process.cwd(), arg);
  if (!existsSync(inputAbs)) {
    console.error(`Input not found: ${arg}`);
    process.exit(2);
  }

  // Only file mode for now. TODO: if directory, walk and convert all .feature files.
  const rel = relative(process.cwd(), inputAbs);
  const base = basename(rel, '.feature');
  const outRelDir = dirname(rel);
  const outPath = join(process.cwd(), 'docx', outRelDir === '.' ? '' : outRelDir, `${base}.docx`);

  // Backward compatibility: if the JSON does not contain "theme" or "document",
  // treat it as theme-only overrides.
  let options: any = undefined;
  if (optionsOverrides) {
    const hasGrouped = Object.prototype.hasOwnProperty.call(optionsOverrides, 'theme') ||
      Object.prototype.hasOwnProperty.call(optionsOverrides, 'document');
    options = hasGrouped ? optionsOverrides : { theme: optionsOverrides };
  }

  await convertFeatureFile(inputAbs, outPath, options);
  console.log(`✓ Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
