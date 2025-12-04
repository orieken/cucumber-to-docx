import { describe, it, expect } from 'vitest';
import { mergeDocumentSettings, mergeOptions, defaultDocumentSettings } from '../src/lib/options.js';

describe('options merging', () => {
  it('mergeDocumentSettings returns defaults when no overrides', () => {
    const merged = mergeDocumentSettings();
    expect(merged).toEqual(defaultDocumentSettings);
  });

  it('mergeDocumentSettings deep merges nested objects', () => {
    const merged = mergeDocumentSettings({
      sizes: { title: 40 },
      spacing: { titleAfter: 100 },
      labels: { scenarioPrefix: 'Test: ' },
      table: { borderSize: 8 },
      font: 'Calibri',
      checkbox: '[ ]'
    });

    expect(merged.font).toBe('Calibri');
    expect(merged.checkbox).toBe('[ ]');
    expect(merged.sizes.title).toBe(40);
    expect(merged.sizes.tableText).toBe(defaultDocumentSettings.sizes.tableText);
    expect(merged.spacing.titleAfter).toBe(100);
    expect(merged.labels.scenarioPrefix).toBe('Test: ');
    expect(merged.table.borderSize).toBe(8);
    expect(merged.table.widthPct).toBe(defaultDocumentSettings.table.widthPct);
  });

  it('mergeOptions merges theme and document separately', () => {
    const res = mergeOptions({
      theme: { headerBg: 'FF0000' },
      document: { font: 'Calibri' }
    });
    expect(res.theme.headerBg).toBe('FF0000');
    expect(res.document.font).toBe('Calibri');
  });
});
