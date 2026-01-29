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
    expect(parsed.scenarios).toHaveLength(4);

    // Check first scenario with data table (multi-row with headers)
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

    // Check single-row data table scenario
    const singleRowScenario = parsed.scenarios[2];
    expect(singleRowScenario?.name).toBe('passing a single-row data table');
    const singleRowStep = singleRowScenario?.steps.find(s => s.text.startsWith('When'));
    expect(singleRowStep?.dataTable).toBeDefined();
    expect(singleRowStep?.dataTable?.headers).toEqual(['abc', '123']);
    expect(singleRowStep?.dataTable?.rows).toHaveLength(0);

    // Check multiple data tables scenario
    const multiTableScenario = parsed.scenarios[3];
    expect(multiTableScenario?.name).toBe('multiple steps with different data tables');
    const stepsWithTables = multiTableScenario?.steps.filter(s => s.dataTable);
    expect(stepsWithTables?.length).toBe(3); // Three steps should have data tables

    // Check examples
    expect(parsed.examples).toBeDefined();
    expect(parsed.examples?.length).toBe(1);
    expect(parsed.examples?.[0]?.headers).toEqual(['api_endpoint_name', 'http_method', 'apiRoute', 'status_code']);
    expect(parsed.examples?.[0]?.rows).toHaveLength(3);
  });
});
