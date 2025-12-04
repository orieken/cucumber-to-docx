export interface ThemeConfig {
  // Text colors
  headerText: string; // e.g., 'FFFFFF'
  bodyText: string; // default paragraph text, e.g., '000000'
  stepText: string; // step column text color
  expectedText: string; // expected result text color
  actualText: string; // actual result text color

  // Backgrounds
  headerBg: string; // header row background
  dataBgStep: string; // step column background in data rows
  dataBgExpected: string; // expected column background in data rows
  dataBgActual: string; // actual column background in data rows

  // Borders
  tableBorder: string; // table/cell border color
}

export const defaultTheme: ThemeConfig = {
  headerText: 'FFFFFF',
  bodyText: '000000',
  stepText: '000000',
  expectedText: '000000',
  actualText: '000000',

  headerBg: '4472C4', // blue
  dataBgStep: 'FFFFFF',
  dataBgExpected: 'F2F2F2', // light gray
  dataBgActual: 'FFFFFF',

  tableBorder: '000000'
};

export type PartialTheme = Partial<ThemeConfig>;

export function mergeTheme(theme?: PartialTheme): ThemeConfig {
  return { ...defaultTheme, ...(theme ?? {}) };
}

// Options are defined in options.ts to avoid circular deps.
