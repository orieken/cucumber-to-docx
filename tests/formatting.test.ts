import { describe, it, expect } from 'vitest';
import { parseFeatureFile } from '../src/lib/featureParser.js';
import { stepsTable } from '../src/lib/docxWriter.js';
import { defaultTheme } from '../src/lib/theme.js';
import { defaultDocumentSettings } from '../src/lib/options.js';

describe('Step formatting options', () => {
  it('should create table with removeGherkinKeywords enabled', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click the button
    Then I see a message
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      removeGherkinKeywords: true 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    // The table should be created successfully
    expect(table).toBeDefined();
  });

  it('should create table with Gherkin keywords preserved', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click the button
    Then I see a message
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      removeGherkinKeywords: false 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    expect(table).toBeDefined();
  });

  it('should create table with Then steps as expected results', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click the button
    Then I see a message
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      thenStepsAsExpectedResults: true 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    expect(table).toBeDefined();
  });

  it('should create table with Then steps as separate rows', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click the button
    Then I see a message
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      thenStepsAsExpectedResults: false 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    expect(table).toBeDefined();
  });

  it('should create table with both removeGherkinKeywords and thenStepsAsExpectedResults', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click the button
    Then I see a message
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      removeGherkinKeywords: true,
      thenStepsAsExpectedResults: true 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    // Both options work together
    expect(table).toBeDefined();
  });
  
  it('should handle multiple When-Then pairs', () => {
    const feature = parseFeatureFile(`
Feature: Test Feature
  Scenario: Test Scenario
    Given I am logged in
    When I click button A
    Then I see message A
    When I click button B
    Then I see message B
`);

    const steps = feature.scenarios[0]?.steps || [];
    const settings = { 
      ...defaultDocumentSettings, 
      removeGherkinKeywords: true,
      thenStepsAsExpectedResults: true 
    };

    const table = stepsTable(steps, defaultTheme, settings);
    
    expect(table).toBeDefined();
  });
});
