import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, ShadingType, BorderStyle } from 'docx';

import type { ParsedFeature, Step, Scenario, Example } from './featureParser.js';
import type { ThemeConfig } from './theme.js';
import { mergeOptions, type DocxOptions, type DocumentSettings } from './options.js';

function titleParagraph(text: string, theme: ThemeConfig, doc: DocumentSettings): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({ text, bold: true, size: doc.sizes.title, font: doc.font, color: theme.bodyText })
    ],
    spacing: { before: doc.spacing.titleBefore, after: doc.spacing.titleAfter }
  });
}

function descriptionParagraph(line: string, theme: ThemeConfig, doc: DocumentSettings): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: line, italics: true, size: doc.sizes.description, font: doc.font, color: theme.bodyText })],
    spacing: { before: doc.spacing.descriptionBefore, after: doc.spacing.descriptionAfter }
  });
}

function scenarioHeading(text: string, theme: ThemeConfig, doc: DocumentSettings): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: `${doc.labels.scenarioPrefix}${text}`, bold: true, size: doc.sizes.scenario, font: doc.font, color: theme.bodyText })],
    spacing: { before: doc.spacing.scenarioBefore, after: doc.spacing.scenarioAfter }
  });
}

function backgroundHeading(text: string, theme: ThemeConfig, doc: DocumentSettings): Paragraph {
  const label = doc.labels.backgroundHeader;
  const headingText = text ? `${label}: ${text}` : label;
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: headingText, bold: true, size: doc.sizes.scenario, font: doc.font, color: theme.bodyText })],
    spacing: { before: doc.spacing.scenarioBefore, after: doc.spacing.scenarioAfter }
  });
}

/**
 * Expand scenario outline with example data
 */
export function expandScenarioOutline(scenario: Scenario, exampleRow: string[], exampleHeaders: string[]): Scenario {
  const replacements = new Map<string, string>();
  exampleHeaders.forEach((header, idx) => {
    replacements.set(`<${header}>`, exampleRow[idx] || '');
  });

  const expandedSteps: Step[] = scenario.steps.map(step => {
    let expandedText = step.text;
    replacements.forEach((value, placeholder) => {
      expandedText = expandedText.replace(new RegExp(placeholder, 'g'), value);
    });
    return {
      text: expandedText,
      dataTable: step.dataTable
    };
  });

  // Create name from first example value or row number
  const firstValue = exampleRow[0] || '';
  return {
    name: `${scenario.name} - ${firstValue}`,
    steps: expandedSteps
  };
}

export function stepsTable(steps: Step[], theme: ThemeConfig, doc: DocumentSettings): (Table | Paragraph)[] {
  const results: (Table | Paragraph)[] = [];
  
  const headerCells = [
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: doc.labels.stepHeader, bold: true, color: theme.headerText, font: doc.font, size: doc.sizes.tableText })], spacing: { before: 0, after: 0 } })],
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.headerBg }
    }),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: doc.labels.expectedHeader, bold: true, color: theme.headerText, font: doc.font, size: doc.sizes.tableText })], spacing: { before: 0, after: 0 } })],
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.headerBg }
    }),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: doc.labels.actualHeader, bold: true, color: theme.headerText, font: doc.font, size: doc.sizes.tableText })], spacing: { before: 0, after: 0 } })],
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.headerBg }
    })
  ];

  const rows: TableRow[] = [new TableRow({ children: headerCells })];

  let effectiveContext = 'Given';
  let lastActionStepIndex: number | null = null;
  
  interface StepData {
    stepText: string;
    expected: string[];
    checkboxStep: string;
    keyword: string;
    dataTable?: { headers: string[]; rows: string[][] };
  }
  
  const stepDataList: StepData[] = [];
  
  steps.forEach((step, idx) => {
    const n = idx + 1;
    
    const match = step.text.match(/^(Given|When|Then|And)\s+/);
    let keyword = '';
    let stepText = step.text;
    
    if (match) {
      keyword = match[1]!;
      if (keyword !== 'And') {
        effectiveContext = keyword;
      }
      
      if (doc.removeGherkinKeywords) {
        stepText = step.text.replace(/^(Given|When|Then|And)\s+/, '');
        stepText = stepText.charAt(0).toUpperCase() + stepText.slice(1);
      }
    }
    
    const checkboxStep = doc.showStepNumbers 
      ? `${doc.checkbox} ${n}. ${stepText}`
      : `${doc.checkbox} ${stepText}`;

    let expected: string[] = [];
    if (doc.thenStepsAsExpectedResults && effectiveContext === 'Then') {
      if (lastActionStepIndex !== null) {
        const prevStep = stepDataList[lastActionStepIndex];
        if (prevStep) {
          prevStep.expected = [...(prevStep.expected ?? []), stepText];
        }
      }
      return;
    } else if (!doc.thenStepsAsExpectedResults && effectiveContext === 'Then') {
      expected = [doc.removeGherkinKeywords ? stepText : step.text.replace(/^(Then|And)\s+/, '')];
    }
    
    stepDataList.push({ 
      stepText, 
      expected, 
      checkboxStep, 
      keyword: effectiveContext,
      dataTable: step.dataTable
    });

    lastActionStepIndex = stepDataList.length - 1;
  });
  
  stepDataList.forEach((stepData) => {
    const expectedParagraphs = stepData.expected.length > 0
      ? stepData.expected.map(line => new Paragraph({ 
          children: [new TextRun({ text: line, color: theme.expectedText, font: doc.font, size: doc.sizes.tableText })],
          spacing: { before: 0, after: 0 }
        }))
      : [new Paragraph({ children: [new TextRun({ text: '', color: theme.expectedText, font: doc.font, size: doc.sizes.tableText })] })];

    // Build step cell children - includes step text and optional data table as bullets
    const stepCellChildren: Paragraph[] = [
      new Paragraph({ 
        children: [new TextRun({ text: stepData.checkboxStep, color: theme.stepText, font: doc.font, size: doc.sizes.tableText })],
        spacing: { before: 0, after: 0 }
      })
    ];

    // If there's a data table, convert it to bullet points
    if (stepData.dataTable && stepData.dataTable.headers.length > 0) {
      stepData.dataTable.rows.forEach(row => {
        // Create a bullet for each header:value pair
        stepData.dataTable!.headers.forEach((header, idx) => {
          const bulletText = `      * ${header}: ${row[idx] || ''}`;
          
          stepCellChildren.push(
            new Paragraph({
              children: [new TextRun({ text: bulletText, color: theme.stepText, font: doc.font, size: doc.sizes.tableText })],
              spacing: { before: 0, after: 0 }
            })
          );
        });
      });
    }

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: stepCellChildren,
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.dataBgStep }
          }),
          new TableCell({
            children: expectedParagraphs,
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.dataBgExpected }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '', color: theme.actualText, font: doc.font, size: doc.sizes.tableText })] })],
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.dataBgActual }
          })
        ]
      })
    );
  });

  const stepsTableElement = new Table({
    width: { size: doc.table.widthPct, type: WidthType.PERCENTAGE },
    borders: {
      top: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE },
      bottom: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE },
      left: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE },
      right: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE },
      insideHorizontal: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE },
      insideVertical: { color: theme.tableBorder, size: doc.table.borderSize, style: BorderStyle.SINGLE }
    },
    rows
  });

  results.push(stepsTableElement);

  return results;
}

export async function createDocxFromFeature(
  feature: ParsedFeature,
  outPath: string,
  options?: Partial<DocxOptions>
): Promise<void> {
  const { theme, document } = mergeOptions(options);

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(titleParagraph(feature.name, theme, document));

  // Description
  if (feature.description.length) {
    feature.description.forEach((d) => children.push(descriptionParagraph(d, theme, document)));
  }

  // Background
  if (feature.background && feature.background.steps.length > 0) {
    children.push(backgroundHeading(feature.background.name, theme, document));

    const bgElements = stepsTable(feature.background.steps, theme, document);
    children.push(...bgElements);
  }

  // Handle Scenario Outlines - expand each example into a separate scenario
  const expandedScenarios: Scenario[] = [];
  for (const sc of feature.scenarios) {
    if (sc.isOutline && feature.examples && feature.examples.length > 0) {
      // Expand each example row into a separate scenario
      feature.examples.forEach(example => {
        example.rows.forEach(row => {
          expandedScenarios.push(expandScenarioOutline(sc, row, example.headers));
        });
      });
    } else {
      expandedScenarios.push(sc);
    }
  }

  // Scenarios
  for (const sc of expandedScenarios) {
    children.push(scenarioHeading(sc.name, theme, document));
    const scElements = stepsTable(sc.steps, theme, document);
    children.push(...scElements);
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buffer);
}
