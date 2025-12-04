import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFeatureFile } from '../src/lib/featureParser.js';

describe('parseFeatureFile', () => {
  const featurePath = resolve(__dirname, '..', 'features', 'pokemon.feature');
  const text = readFileSync(featurePath, 'utf8');
  const parsed = parseFeatureFile(text);

  it('captures feature name', () => {
    expect(parsed.name).toMatch(/Register a new pokemon/);
  });

  it('captures description lines', () => {
    expect(parsed.description.length).toBeGreaterThan(0);
  });

  it('finds scenarios and steps', () => {
    expect(parsed.scenarios.length).toBeGreaterThanOrEqual(2);
    for (const sc of parsed.scenarios) {
      expect(sc.name.length).toBeGreaterThan(0);
      expect(sc.steps.length).toBeGreaterThan(0);
    }
  });
});
