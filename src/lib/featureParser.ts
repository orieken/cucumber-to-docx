export interface Scenario {
  name: string;
  steps: string[];
}

export interface ParsedFeature {
  name: string;
  description: string[];
  scenarios: Scenario[];
}

/**
 * Parse a Cucumber/Gherkin feature file into a structured object.
 * Minimal parser that handles Feature, Scenario, and Given/When/Then/And lines.
 */
export function parseFeatureFile(content: string): ParsedFeature {
  const lines = content.split(/\r?\n/);
  const feature: ParsedFeature = { name: '', description: [], scenarios: [] };

  let inDescription = false;
  let currentScenario: Scenario | null = null;

  for (let raw of lines) {
    const line = raw.trim();
    if (!line && !inDescription) continue;

    if (line.startsWith('Feature:')) {
      feature.name = line.replace('Feature:', '').trim();
      inDescription = true;
      currentScenario = null;
      continue;
    }

    if (line.startsWith('Scenario:')) {
      inDescription = false;
      currentScenario = { name: line.replace('Scenario:', '').trim(), steps: [] };
      feature.scenarios.push(currentScenario);
      continue;
    }

    const isStep = /^(Given|When|Then|And)\s+/.test(line);
    if (currentScenario && isStep) {
      currentScenario.steps.push(line);
      continue;
    }

    if (inDescription && line && !line.startsWith('Scenario:')) {
      feature.description.push(line);
    }
  }

  return feature;
}
