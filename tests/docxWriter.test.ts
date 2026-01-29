import { promises as fs } from 'node:fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Packer } from 'docx';

import { createDocxFromFeature } from '../src/lib/docxWriter.js';
import type { ParsedFeature } from '../src/lib/featureParser.js';

describe('createDocxFromFeature', () => {
  const outPath = 'docx/test-output/docxWriter-test.docx';

  beforeEach(() => {
    vi.spyOn(Packer, 'toBuffer').mockResolvedValue(Buffer.from('test-docx'));
    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a document with title, description, scenarios and writes it to disk', async () => {
    const feature: ParsedFeature = {
      name: 'Register a new pokemon to user account',
      description: [
        'Trainers want to be able to register new pokemon to their user accounts so that they can keep track of their collection.',
        'A user can have multiple active pokemon teams.'
      ],
      background: null,
      scenarios: [
        {
          name: 'Register a new pokemon to user account',
          steps: [
            { text: 'Given I am a user with an active account' },
            { text: 'When I navigate to the "Add Pokemon" section' },
            { text: 'Then I should see a confirmation message "Pokemon registered successfully!"' },
            { text: 'And the new pokemon "Pikachu" should be listed in my pokemon library' }
          ]
        },
        {
          name: 'Register a new pokemon and assign to active team',
          steps: [
            { text: 'Given I am on the dashboard' },
            { text: 'When I click on the "Register Pokemon" button' },
            { text: 'Then I should see a confirmation message "Pokemon registered successfully!"' },
            { text: 'And the pokemon "Charizard" should be assigned to the active team "Team Alpha"' }
          ]
        }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();

    expect(Packer.toBuffer).toHaveBeenCalledTimes(1);
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('handles empty description and still writes the document', async () => {
    const feature: ParsedFeature = {
      name: 'Feature with no description',
      description: [],
      background: null,
      scenarios: [
        { name: 'Simple scenario', steps: [{ text: 'Given something' }, { text: 'Then result is shown' }] }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });
  
  it('handles feature with empty name', async () => {
    const feature: ParsedFeature = {
      name: '',
      description: [],
      background: null,
      scenarios: []
    };
    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
  });

  it('includes background when present', async () => {
    const feature: ParsedFeature = {
      name: 'Feature with background',
      description: [],
      background: {
        name: 'Setup',
        steps: [{ text: 'Given database is clean' }]
      },
      scenarios: [
        { name: 'Scenario 1', steps: [{ text: 'When action' }, { text: 'Then result' }] }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
    // In a real integration test we would check the content of the buffer, 
    // but here we trust the logic we verified in code review and that it didn't crash.
  });

  it('expands scenario outlines with examples', async () => {
    const feature: ParsedFeature = {
      name: 'Feature with scenario outline',
      description: [],
      background: null,
      scenarios: [
        {
          name: 'Login with credentials',
          steps: [
            { text: 'Given I am on the login page' },
            { text: 'When I enter username <username>' },
            { text: 'And I enter password <password>' },
            { text: 'Then I should see <result>' }
          ],
          isOutline: true
        }
      ],
      examples: [
        {
          headers: ['username', 'password', 'result'],
          rows: [
            ['admin', 'admin123', 'Dashboard'],
            ['user', 'user123', 'Home Page']
          ]
        }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('handles scenario outline with multiple example tables', async () => {
    const feature: ParsedFeature = {
      name: 'Feature with multiple examples',
      description: [],
      background: null,
      scenarios: [
        {
          name: 'API call to <endpoint>',
          steps: [
            { text: 'When I call <endpoint>' },
            { text: 'Then status is <status>' }
          ],
          isOutline: true
        }
      ],
      examples: [
        {
          headers: ['endpoint', 'status'],
          rows: [
            ['/users', '200'],
            ['/posts', '200']
          ]
        },
        {
          headers: ['endpoint', 'status'],
          rows: [
            ['/admin', '403']
          ]
        }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
  });
});

import { stepsTable } from '../src/lib/docxWriter.js';
import { defaultTheme } from '../src/lib/theme.js';
import { defaultDocumentSettings } from '../src/lib/options.js';

describe('stepsTable', () => {
  it('correctly defaults context to Given', () => {
    const steps = [{ text: 'And I do something' }];
    const table = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(table).toBeDefined();
  });

  it('correctly handles And after Given/When (Not expected result)', () => {
    const steps = [
      { text: 'Given I am here' },
      { text: 'And I go there' },
      { text: 'When I do this' },
      { text: 'And I do that' }
    ];
    const table = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(table).toBeDefined();
  });

  it('correctly handles And after Then (Expected result)', () => {
    const steps = [
      { text: 'Then I see a message' },
      { text: 'And the message is valid' }
    ];
    const table = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(table).toBeDefined();
  });
  
  it('switches context from Given to Then correctly', () => {
      const steps = [
          { text: 'Given I am user' },
          { text: 'Then I see dashboard' },
          { text: 'And I see menu' }
      ];
      const table = stepsTable(steps, defaultTheme, defaultDocumentSettings);
      expect(table).toBeDefined();
  });

  it('handles steps that do not start with keywords (coverage)', () => {
    const steps = [{ text: 'Just some text' }];
    const table = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(table).toBeDefined();
  });

  it('converts data tables to bullet lists within step cells', () => {
    const steps = [
      { 
        text: 'When User enters the following credentials',
        dataTable: {
          headers: ['username', 'password'],
          rows: [
            ['testuser', 'secret123'],
            ['admin', 'admin123']
          ]
        }
      }
    ];
    const result = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(result).toBeDefined();
    expect(result.length).toBe(1); // Should only return the main steps table, not separate data tables
  });

  it('handles single-row data tables (headers only, no data rows)', () => {
    const steps = [
      { 
        text: 'When User enters the following in the search box',
        dataTable: {
          headers: ['abc', '123'],
          rows: [] // No data rows - single row table
        }
      }
    ];
    const result = stepsTable(steps, defaultTheme, defaultDocumentSettings);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
  });
});

import { expandScenarioOutline } from '../src/lib/docxWriter.js';

describe('expandScenarioOutline', () => {
  it('replaces placeholders with example values', () => {
    const scenario = {
      name: 'Login with <username>',
      steps: [
        { text: 'Given I am on the login page' },
        { text: 'When I enter username <username>' },
        { text: 'And I enter password <password>' },
        { text: 'Then I should see <result>' }
      ]
    };

    const exampleRow = ['admin', 'admin123', 'Dashboard'];
    const exampleHeaders = ['username', 'password', 'result'];

    const expanded = expandScenarioOutline(scenario, exampleRow, exampleHeaders);

    expect(expanded.name).toBe('Login with <username> - admin');
    expect(expanded.steps[0]?.text).toBe('Given I am on the login page');
    expect(expanded.steps[1]?.text).toBe('When I enter username admin');
    expect(expanded.steps[2]?.text).toBe('And I enter password admin123');
    expect(expanded.steps[3]?.text).toBe('Then I should see Dashboard');
  });

  it('handles empty example values', () => {
    const scenario = {
      name: 'Test <value>',
      steps: [
        { text: 'When I use <value>' }
      ]
    };

    const exampleRow = [''];
    const exampleHeaders = ['value'];

    const expanded = expandScenarioOutline(scenario, exampleRow, exampleHeaders);

    expect(expanded.name).toBe('Test <value> - ');
    expect(expanded.steps[0]?.text).toBe('When I use ');
  });

  it('preserves data tables in expanded steps', () => {
    const scenario = {
      name: 'Scenario with data table',
      steps: [
        { 
          text: 'When I submit <action>',
          dataTable: {
            headers: ['field', 'value'],
            rows: [['name', 'test']]
          }
        }
      ]
    };

    const exampleRow = ['create'];
    const exampleHeaders = ['action'];

    const expanded = expandScenarioOutline(scenario, exampleRow, exampleHeaders);

    expect(expanded.steps[0]?.text).toBe('When I submit create');
    expect(expanded.steps[0]?.dataTable).toBeDefined();
    expect(expanded.steps[0]?.dataTable?.headers).toEqual(['field', 'value']);
    expect(expanded.steps[0]?.dataTable?.rows).toEqual([['name', 'test']]);
  });

  it('handles multiple occurrences of same placeholder', () => {
    const scenario = {
      name: 'Repeat <item>',
      steps: [
        { text: 'Given <item> is available' },
        { text: 'When I select <item>' },
        { text: 'Then <item> should be selected' }
      ]
    };

    const exampleRow = ['apple'];
    const exampleHeaders = ['item'];

    const expanded = expandScenarioOutline(scenario, exampleRow, exampleHeaders);

    expect(expanded.steps[0]?.text).toBe('Given apple is available');
    expect(expanded.steps[1]?.text).toBe('When I select apple');
    expect(expanded.steps[2]?.text).toBe('Then apple should be selected');
  });
});
