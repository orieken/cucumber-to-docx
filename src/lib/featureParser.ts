export interface DataTable {
  headers: string[];
  rows: string[][];
}

export interface Step {
  text: string;
  dataTable?: DataTable;
}

export interface Scenario {
  name: string;
  steps: Step[];
  isOutline?: boolean;
}

export interface Example {
  headers: string[];
  rows: string[][];
}

export interface ParsedFeature {
  name: string;
  description: string[];
  background: Scenario | null;
  scenarios: Scenario[];
  examples?: Example[];
}

/**
 * Parse a Cucumber/Gherkin feature file into a structured object.
 * Handles Feature, Scenario, Scenario Outline, Background, Given/When/Then/And lines, data tables, and examples.
 */
export function parseFeatureFile(content: string): ParsedFeature {
  const lines = content.split(/\r?\n/);
  const feature: ParsedFeature = { name: '', description: [], background: null, scenarios: [] };

  let inDescription = false;
  let currentScenario: Scenario | null = null;
  let currentStep: Step | null = null;
  let inDataTable = false;
  let inExamples = false;
  let currentExamples: Example | null = null;

  for (let raw of lines) {
    const line = raw.trim();
    
    // Handle empty lines
    if (!line) {
      if (inDataTable) {
        inDataTable = false;
        currentStep = null;
      }
      if (!inDescription) continue;
    }

    if (line.startsWith('Feature:')) {
      feature.name = line.replace('Feature:', '').trim();
      inDescription = true;
      currentScenario = null;
      continue;
    }

    if (line.startsWith('Background:')) {
      inDescription = false;
      inExamples = false;
      const bgName = line.replace('Background:', '').trim();
      feature.background = { name: bgName, steps: [] };
      currentScenario = feature.background;
      continue;
    }

    if (line.startsWith('Scenario Outline:')) {
      inDescription = false;
      inExamples = false;
      currentScenario = { 
        name: line.replace('Scenario Outline:', '').trim(), 
        steps: [],
        isOutline: true
      };
      feature.scenarios.push(currentScenario);
      continue;
    }

    if (line.startsWith('Scenario:')) {
      inDescription = false;
      inExamples = false;
      currentScenario = { name: line.replace('Scenario:', '').trim(), steps: [] };
      feature.scenarios.push(currentScenario);
      continue;
    }

    if (line.startsWith('Examples:')) {
      inExamples = true;
      currentExamples = { headers: [], rows: [] };
      if (currentScenario && currentScenario.isOutline) {
        if (!feature.examples) {
          feature.examples = [];
        }
        feature.examples.push(currentExamples);
      }
      continue;
    }

    // Handle example table rows
    if (inExamples && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (currentExamples) {
        if (currentExamples.headers.length === 0) {
          currentExamples.headers = cells;
        } else {
          currentExamples.rows.push(cells);
        }
      }
      continue;
    }

    // Handle data table rows
    if (inDataTable && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (currentStep && currentStep.dataTable) {
        if (currentStep.dataTable.headers.length === 0) {
          currentStep.dataTable.headers = cells;
        } else {
          currentStep.dataTable.rows.push(cells);
        }
      }
      continue;
    }

    const isStep = /^(Given|When|Then|And)\s+/.test(line);
    if (currentScenario && isStep) {
      inDataTable = false;
      currentStep = { text: line };
      currentScenario.steps.push(currentStep);
      // Check if next line might be a data table
      const nextLineIdx = lines.indexOf(raw) + 1;
      if (nextLineIdx < lines.length) {
        const nextLine = lines[nextLineIdx]?.trim() || '';
        if (nextLine.startsWith('|')) {
          inDataTable = true;
          currentStep.dataTable = { headers: [], rows: [] };
        }
      }
      continue;
    }

    if (inDescription && line && !line.startsWith('Scenario:') && !line.startsWith('Scenario Outline:') && !line.startsWith('Background:')) {
      feature.description.push(line);
    }
  }

  return feature;
}
