import { defaultTheme, mergeTheme, type PartialTheme, type ThemeConfig } from './theme.js';

export interface DocumentSettings {
  font: string;
  sizes: {
    title: number;
    description: number;
    scenario: number;
    tableText: number;
  };
  spacing: {
    titleBefore: number;
    titleAfter: number;
    descriptionBefore: number;
    descriptionAfter: number;
    scenarioBefore: number;
    scenarioAfter: number;
  };
  labels: {
    scenarioPrefix: string;
    stepHeader: string;
    expectedHeader: string;
    actualHeader: string;
  };
  table: {
    widthPct: number;
    borderSize: number; // in eighths of a point as per docx spec
  };
  checkbox: string;
}

export const defaultDocumentSettings: DocumentSettings = {
  font: 'Arial',
  sizes: {
    title: 32,
    description: 22,
    scenario: 28,
    tableText: 22
  },
  spacing: {
    titleBefore: 0,
    titleAfter: 240,
    descriptionBefore: 120,
    descriptionAfter: 240,
    scenarioBefore: 360,
    scenarioAfter: 120
  },
  labels: {
    scenarioPrefix: 'Scenario: ',
    stepHeader: 'Step',
    expectedHeader: 'Expected Result',
    actualHeader: 'Actual Result'
  },
  table: {
    widthPct: 100,
    borderSize: 4
  },
  checkbox: '☐'
};

export type PartialDocumentSettings = Partial<{
  [K in keyof DocumentSettings]: DocumentSettings[K] extends object ? Partial<DocumentSettings[K]> : DocumentSettings[K]
}>;

export interface DocxOptions {
  theme?: PartialTheme;
  document?: PartialDocumentSettings;
}

export interface ResolvedOptions {
  theme: ThemeConfig;
  document: DocumentSettings;
}

export const defaultOptions: ResolvedOptions = {
  theme: defaultTheme,
  document: defaultDocumentSettings
};

export function mergeDocumentSettings(doc?: PartialDocumentSettings): DocumentSettings {
  return {
    ...defaultDocumentSettings,
    ...(doc ?? {}),
    sizes: { ...defaultDocumentSettings.sizes, ...(doc?.sizes ?? {}) },
    spacing: { ...defaultDocumentSettings.spacing, ...(doc?.spacing ?? {}) },
    labels: { ...defaultDocumentSettings.labels, ...(doc?.labels ?? {}) },
    table: { ...defaultDocumentSettings.table, ...(doc?.table ?? {}) }
  };
}

export function mergeOptions(opts?: DocxOptions): ResolvedOptions {
  return {
    theme: mergeTheme(opts?.theme),
    document: mergeDocumentSettings(opts?.document)
  };
}
