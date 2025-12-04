export { parseFeatureFile } from './lib/featureParser.js';
export type { ParsedFeature, Scenario } from './lib/featureParser.js';
export { createDocxFromFeature } from './lib/docxWriter.js';
export { defaultTheme, mergeTheme } from './lib/theme.js';
export type { ThemeConfig, PartialTheme } from './lib/theme.js';
export {
  defaultDocumentSettings,
  defaultOptions,
  mergeOptions,
  mergeDocumentSettings
} from './lib/options.js';
export type { DocxOptions } from './lib/options.js';

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseFeatureFile } from './lib/featureParser.js';
import { createDocxFromFeature } from './lib/docxWriter.js';
import type { DocxOptions } from './lib/options.js';

export async function convertFeatureFile(
  inputPath: string,
  outPath: string,
  options?: DocxOptions
): Promise<void> {
  const absIn = resolve(inputPath);
  const content = await fs.readFile(absIn, 'utf8');
  const parsed = parseFeatureFile(content);
  await fs.mkdir(dirname(outPath), { recursive: true });
  await createDocxFromFeature(parsed, outPath, options);
}
