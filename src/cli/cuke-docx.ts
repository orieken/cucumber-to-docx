#!/usr/bin/env node
import { basename, dirname, join, relative, resolve, extname } from 'node:path';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

import { convertFeatureFile, parseFeatureFile, createDocxFromFeature } from '../index.js';
import { defaultTheme } from '../index.js';
import { defaultDocumentSettings } from '../index.js';
import type { DocxOptions } from '../lib/options.js';

function usage(): void {
  console.log('Usage: cuke-docx <input.feature|directory>');
  console.log('  Converts the given .feature file (or all .feature files in a directory)');
  console.log('  into .docx files under the docx/ folder, preserving the relative folder structure.');
  console.log('');
  console.log('Example:');
  console.log('  cuke-docx pokemon.feature     # → docx/pokemon.docx');
  console.log('  cuke-docx features/           # → converts all features in features/ to docx/features/');
  console.log('');
  console.log('Options:');
  console.log('  --config <path>      Path to a JSON file with config overrides');
  console.log('                       Accepted shapes:');
  console.log('                         1) { "theme": { ... }, "document": { ... } }');
  console.log('                         2) { ...themeKeys } (legacy: theme-only)');
  console.log('  --print-config       Print the full default configuration and exit');
  console.log('  --split-scenarios    Create a separate .docx file for each scenario');
  console.log('');
}

type ParsedArgs = {
  input?: string;
  optionsOverrides?: Record<string, unknown>;
  printConfig?: boolean;
  help?: boolean;
  splitScenarios?: boolean;
};

// ... (parseArgs function remains the same, assuming it's correctly closed in previous steps) ...
// The ReplaceFileContent tool requires exact matching strings to target content. 
// Since I am replacing almost everything from main down, I will rely on replacing the imports and then main function logic.
// However, the tool shows I can replace blocks.
// I will rewrite the whole file structure related to main and adding helper functions.

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
    if (a === '--split-scenarios') {
      result.splitScenarios = true;
    }
  }

  // Auto-discovery of cuke-config.json if not explicitly provided
  if (!result.optionsOverrides) {
    const autoPath = resolve(process.cwd(), 'cuke-config.json');
    if (existsSync(autoPath)) {
      try {
        const raw = readFileSync(autoPath, 'utf8');
        result.optionsOverrides = JSON.parse(raw) as Record<string, unknown>;
      } catch (e) {
        console.warn(`Warning: Found cuke-config.json but failed to parse it: ${e}`);
      }
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

function computeOutPath(inputAbs: string): string {
  const rel = relative(process.cwd(), inputAbs);
  const base = basename(rel, '.feature');
  const outRelDir = dirname(rel);
  // If absolute path is outside cwd, this might be partial. 
  // Assuming standard usage within project.
  const outPath = join(process.cwd(), 'docx', outRelDir === '.' ? '' : outRelDir, `${base}.docx`);
  return outPath;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
}

function getAllFeatureFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const full = join(dir, file);
    const stat = statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFeatureFiles(full));
    } else {
      if (full.endsWith('.feature')) {
        results.push(full);
      }
    }
  }
  return results;
}

async function processSingleFile(inputAbs: string, options: DocxOptions | undefined, splitScenarios?: boolean): Promise<void> {
  const outPath = computeOutPath(inputAbs);
  
  if (!splitScenarios) {
    await convertFeatureFile(inputAbs, outPath, options);
    console.log(`✓ Wrote ${outPath}`);
  } else {
    const content = readFileSync(inputAbs, 'utf8');
    const feature = parseFeatureFile(content);

    if (feature.scenarios.length === 0) {
      console.warn(`No scenarios found in ${basename(inputAbs)}.`);
      return;
    }

    // e.g. docx/features/pokemon.docx -> docx/features/pokemon
    const baseDir = outPath.replace(/\.docx$/, '');

    for (let i = 0; i < feature.scenarios.length; i++) {
      const sc = feature.scenarios[i];
      if (!sc) continue;

      let safeName = sanitizeFilename(sc.name);
      if (!safeName) {
        safeName = `Scenario_${i + 1}`;
      }
      
      const scenarioOutPath = join(baseDir, `${safeName}.docx`);
      
      // specific feature object for just this scenario, preserving details like name/desc/background if needed
      // Ideally we want to keep the background for context in each split file? 
      // The current implementation copies the whole feature but overrides scenarios.
      const single = { ...feature, scenarios: [sc] };
      
      await createDocxFromFeature(single, scenarioOutPath, options);
      console.log(`✓ Wrote ${scenarioOutPath}`);
    }
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

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

  const inputAbs = resolve(process.cwd(), arg);
  if (!existsSync(inputAbs)) {
    console.error(`Input not found: ${arg}`);
    process.exit(2);
  }

  const stats = statSync(inputAbs);
  let filesToProcess: string[] = [];

  if (stats.isDirectory()) {
    filesToProcess = getAllFeatureFiles(inputAbs);
    if (filesToProcess.length === 0) {
      console.warn(`No .feature files found in directory: ${arg}`);
    }
  } else {
    filesToProcess = [inputAbs];
  }

  const options = normalizeOptions(parsed.optionsOverrides);

  for (const file of filesToProcess) {
    try {
      await processSingleFile(file, options, parsed.splitScenarios);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
      // We continue processing other files
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
