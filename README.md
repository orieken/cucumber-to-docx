@orieken/cucumber-to-docx
=========================

Convert Cucumber/Gherkin `.feature` files into nicely formatted Word `.docx` documents for manual testing and audits.

Installation
------------

Prerequisites: Node.js 22+ and pnpm.

```bash
pnpm add -D @orieken/cucumber-to-docx
```

CLI Usage
---------

The CLI converts a single `.feature` file and writes the output into a `docx/` folder, preserving the relative folder structure.

```bash
# Single file
npx cuke-docx path/to/feature/pokemon.feature
# => docx/path/to/feature/pokemon.docx
```

- Default behavior: give it a file; it outputs with the same base name as `.docx` under `docx/`.
- TODO: Allow passing a directory to convert all `.feature` files while mirroring the folder structure under `docx/`.

Build and smoke-test the CLI (local project)
--------------------------------------------

Run the CLI against every `.feature` under the local `features/` folder.

```bash
# Build the library + CLI, then run the CLI for all features
pnpm cli:smoke:build

# If you already built, just run the smoke test
pnpm cli:smoke

# Clean generated docx/ then smoke test
pnpm cli:smoke:clean
```

Optional flags:

```bash
# Pass a custom config JSON to the CLI for all runs
pnpm cli:smoke --config path/to/config.json

# Increase parallelism (default 1)
pnpm cli:smoke --concurrency 4
```

Configuration (theme + document settings)
----------------------------------------

You can now customize both the document colors (theme) and document settings (fonts, sizes, labels, table width/borders, checkbox symbol) via JSON.

CLI options:

```bash
# Print the full default configuration (theme + document)
npx cuke-docx --print-config

# Use a custom config JSON. Unknown keys are ignored; missing keys fall back to defaults.
# Accepted shapes:
#  1) { "theme": { ... }, "document": { ... } }
#  2) { ...themeKeys } (legacy: theme-only file still supported)
npx cuke-docx features/pokemon.feature --config config.json
```

Default config (excerpt):

```json
{
  "theme": {
    "headerText": "FFFFFF",
    "bodyText": "000000",
    "stepText": "000000",
    "expectedText": "000000",
    "actualText": "000000",
    "headerBg": "4472C4",
    "dataBgStep": "FFFFFF",
    "dataBgExpected": "F2F2F2",
    "dataBgActual": "FFFFFF",
    "tableBorder": "000000"
  },
  "document": {
    "font": "Arial",
    "sizes": { "title": 32, "description": 22, "scenario": 28, "tableText": 22 },
    "spacing": {
      "titleBefore": 0, "titleAfter": 240,
      "descriptionBefore": 120, "descriptionAfter": 240,
      "scenarioBefore": 360, "scenarioAfter": 120
    },
    "labels": {
      "scenarioPrefix": "Scenario: ",
      "stepHeader": "Step",
      "expectedHeader": "Expected Result",
      "actualHeader": "Actual Result"
    },
    "table": { "widthPct": 100, "borderSize": 4 },
    "checkbox": "☐"
  }
}
```

Programmatic API configuration:

```ts
import { convertFeatureFile } from '@orieken/cucumber-to-docx';

await convertFeatureFile('features/a.feature', 'docx/features/a.docx', {
  theme: {
    headerBg: '70AD47',
    dataBgExpected: 'FFF2CC'
  },
  document: {
    font: 'Calibri',
    labels: { scenarioPrefix: 'Test Scenario: ' },
    table: { widthPct: 100, borderSize: 6 },
    checkbox: '[ ]'
  }
});
```

Programmatic API
----------------

```ts
import { parseFeatureFile, createDocxFromFeature, convertFeatureFile } from '@orieken/cucumber-to-docx';

// Parse a feature string
const parsed = parseFeatureFile(featureText);

// Write a .docx from parsed object
await createDocxFromFeature(parsed, 'docx/example.docx');

// Convert an input file directly
await convertFeatureFile('features/example.feature', 'docx/features/example.docx');
```

Scripts
-------

```bash
pnpm lint        # ESLint (TypeScript, clean-code leaning)
pnpm test        # Vitest (Node environment)
pnpm build       # Vite library build + tsc for CLI
pnpm clean       # Remove build artifacts and generated .docx files
pnpm cli:smoke   # Run the built CLI for all features under ./features (accepts --config, --concurrency)
pnpm cli:smoke:build  # Build first, then smoke
pnpm cli:smoke:clean  # Remove ./docx then smoke
```

Use in another Node project
---------------------------

You can use this tool either via the CLI or programmatically.

CLI (recommended):

```bash
# Install as a dev dependency in your project
pnpm add -D @orieken/cucumber-to-docx

# Convert a single file
npx cuke-docx path/to/feature/example.feature

# Convert many files (cross-platform Node script example)
# scripts/convert-features.mjs
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && full.endsWith('.feature')) yield full;
  }
}

for await (const f of walk('features')) {
  await new Promise((res, rej) => {
    const p = spawn(process.execPath, ['node_modules/@orieken/cucumber-to-docx/dist/cli/cuke-docx.js', f], { stdio: 'inherit' });
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`Fail ${code}`))));
  });
}
console.log('Done.');

# Then in package.json
{
  "scripts": {
    "build:test-docs": "node scripts/convert-features.mjs"
  }
}
```

Programmatic (library API):

```ts
import { convertFeatureFile } from '@orieken/cucumber-to-docx';

await convertFeatureFile('features/a.feature', 'docx/features/a.docx', {
  theme: { headerBg: '70AD47' },
  document: { font: 'Calibri', checkbox: '[ ]' }
});
```

Development Notes
-----------------

- Library is built with Vite (ESM).
- CLI is built with TypeScript (tsc) to preserve shebang.
- Output `.docx` files are placed under `docx/` to keep the repo clean.
- Documents and guides moved to `docs/` and are not published with the package.
- TODO: Add full CI/CD pipeline (GitHub Actions) once the project is stable.

ESM import specifiers and NodeNext
----------------------------------

This project uses TypeScript with `module`/`moduleResolution` set to `NodeNext`. That means all relative ESM imports in source must include a file extension that matches the emitted JavaScript. In TypeScript files, import internal modules using `.js` in the specifier, for example:

```ts
// Correct for NodeNext
import { parseFeatureFile } from './lib/featureParser.js';
```

If you omit the extension, TypeScript will report TS2835.

CI / CD
------

This repository includes two GitHub Actions workflows under `.github/workflows`:

- `ci.yml` — runs on pushes and pull requests to `main`. It checks out the code, sets up Node 22 and pnpm, installs dependencies, runs lint, tests, and builds, and uploads build artifacts.
- `publish.yml` — runs on tag pushes matching `v*.*.*` and on published releases. It runs the same checks and publishes the package to npm. The publish workflow requires a repository secret `NPM_TOKEN` with an npm automation token that has publish rights.

To add the `NPM_TOKEN` secret in GitHub:

1. Create an npm automation token at https://www.npmjs.com/settings/<your-user-or-org>/tokens (choose "Automation" and give it publish rights).
2. In your repository on GitHub: Settings → Secrets and variables → Actions → New repository secret. Add `NPM_TOKEN` with the token value.

How publishing is triggered:

- Push a tag that matches the SemVer pattern, e.g. `git tag v1.2.3 && git push origin v1.2.3`.
- Or create and publish a GitHub Release that has a tag like `v1.2.3`.

Notes:
- The workflows are conservative: they use `pnpm install --frozen-lockfile` to ensure reproducible installs.
- Make sure the `version` field in `package.json` matches the tag you push when publishing to npm.

License
-------

MIT © @orieken
