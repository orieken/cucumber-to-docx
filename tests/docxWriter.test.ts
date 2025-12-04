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
      scenarios: [
        {
          name: 'Register a new pokemon to user account',
          steps: [
            'Given I am a user with an active account',
            'When I navigate to the "Add Pokemon" section',
            'Then I should see a confirmation message "Pokemon registered successfully!"',
            'And the new pokemon "Pikachu" should be listed in my pokemon library'
          ]
        },
        {
          name: 'Register a new pokemon and assign to active team',
          steps: [
            'Given I am on the dashboard',
            'When I click on the "Register Pokemon" button',
            'Then I should see a confirmation message "Pokemon registered successfully!"',
            'And the pokemon "Charizard" should be assigned to the active team "Team Alpha"'
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
      scenarios: [
        { name: 'Simple scenario', steps: ['Given something', 'Then result is shown'] }
      ]
    };

    await expect(createDocxFromFeature(feature, outPath)).resolves.toBeUndefined();
    expect(Packer.toBuffer).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
