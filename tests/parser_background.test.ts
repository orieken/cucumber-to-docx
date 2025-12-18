import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseFeatureFile } from '../src/lib/featureParser.js';

describe('parseFeatureFile with Background', () => {
  const featurePath = resolve(__dirname, '..', 'features', 'background.feature');
  const text = readFileSync(featurePath, 'utf8');
  const parsed = parseFeatureFile(text);

  it('captures background', () => {
    expect(parsed.background).not.toBeNull();
    expect(parsed.background?.name).toBe('Setup the database');
    expect(parsed.background?.steps.length).toBe(2);
    expect(parsed.background?.steps[0]).toContain('Given I have a clean database');
  });

  it('scenarios are still parsed correctly', () => {
    expect(parsed.scenarios.length).toBe(1);
    expect(parsed.scenarios[0].name).toBe('A simple scenario');
    expect(parsed.scenarios[0].steps.length).toBe(2);
  });
});
