import { describe, it, expect } from 'vitest';
import { parseFeatureFile } from '../src/lib/featureParser.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Scenario Outline expansion', () => {
  it('parses scenario outline with examples', () => {
    const featurePath = resolve(process.cwd(), 'features/odd-cases.feature');
    const content = readFileSync(featurePath, 'utf8');
    const parsed = parseFeatureFile(content);

    expect(parsed.name).toBe('Odd scenarios for testing edge cases');
    expect(parsed.scenarios).toHaveLength(2);

    // Check regular scenario with data table
    const dataTableScenario = parsed.scenarios[0];
    expect(dataTableScenario?.name).toBe('passing a data table in login');
    expect(dataTableScenario?.steps).toHaveLength(5);
    
    // The 'When' step should have a data table
    const whenStep = dataTableScenario?.steps.find(s => s.text.startsWith('When'));
    expect(whenStep).toBeDefined();
    expect(whenStep?.dataTable).toBeDefined();
    expect(whenStep?.dataTable?.headers).toEqual(['username', 'password']);
    expect(whenStep?.dataTable?.rows).toEqual([['testuser', 'secret123']]);

    // Check scenario outline
    const outlineScenario = parsed.scenarios[1];
    expect(outlineScenario?.name).toBe('making simple api calls');
    expect(outlineScenario?.isOutline).toBe(true);

    // Check examples
    expect(parsed.examples).toBeDefined();
    expect(parsed.examples?.length).toBe(1);
    expect(parsed.examples?.[0]?.headers).toEqual(['api_endpoint_name', 'http_method', 'apiRoute', 'status_code']);
    expect(parsed.examples?.[0]?.rows).toHaveLength(3);
  });
});
