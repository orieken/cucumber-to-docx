import { promises as fs } from 'node:fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the docx writer so we don't build real documents in this test
vi.mock('../src/lib/docxWriter.js', () => {
  return {
    createDocxFromFeature: vi.fn().mockResolvedValue(undefined)
  };
});

// Import after mocks so the SUT wires to the mocked dependency
import { convertFeatureFile } from '../src/index.js';
import { createDocxFromFeature } from '../src/lib/docxWriter.js';

describe('convertFeatureFile (index.ts)', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(
      `Feature: My Feature\n\n  Some context line.\n\n  Scenario: First\n    Given a precondition\n    Then a result\n` as unknown as any
    );
    vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads input, parses it and delegates to createDocxFromFeature with options', async () => {
    const options = { theme: { headerBg: '70AD47' }, document: { font: 'Calibri' } } as any;
    const inputPath = 'features/tmp.feature';
    const outPath = 'docx/features/tmp.docx';

    await expect(convertFeatureFile(inputPath, outPath, options)).resolves.toBeUndefined();

    expect(fs.readFile).toHaveBeenCalled();
    expect(fs.mkdir).toHaveBeenCalled();

    // Assert our mocked writer was called with a parsed object and the same paths/options
    expect(createDocxFromFeature).toHaveBeenCalledTimes(1);
    const args = (createDocxFromFeature as any).mock.calls[0];
    expect(typeof args[0]).toBe('object'); // parsed feature
    expect(args[1]).toBe(outPath);
    expect(args[2]).toEqual(options);
  });
});
