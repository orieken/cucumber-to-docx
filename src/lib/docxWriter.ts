import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, ShadingType, BorderStyle } from 'docx';

import type { ParsedFeature } from './featureParser.js';
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

export function stepsTable(steps: string[], theme: ThemeConfig, doc: DocumentSettings): Table {
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

  let effectiveContext = 'Given'; // defaults to Given until we see When or Then
  let lastActionStepIndex: number | null = null; // track most recent action step (Given/When) for attaching Then results
  
  // First pass: build step data with expected results
  interface StepData {
    stepText: string;
    expected: string[];
    checkboxStep: string;
    keyword: string;
  }
  
  const stepDataList: StepData[] = [];
  
  steps.forEach((step, idx) => {
    const n = idx + 1;
    
    // Determine current keyword
    const match = step.match(/^(Given|When|Then|And)\s+/);
    let keyword = '';
    let stepText = step;
    
    if (match) {
      keyword = match[1]!;
      if (keyword !== 'And') {
        effectiveContext = keyword;
      }
      
      // Remove keyword if configured
      if (doc.removeGherkinKeywords) {
        stepText = step.replace(/^(Given|When|Then|And)\s+/, '');
        // Capitalize first letter
        stepText = stepText.charAt(0).toUpperCase() + stepText.slice(1);
      }
    }
    
    const checkboxStep = doc.showStepNumbers 
      ? `${doc.checkbox} ${n}. ${stepText}`
      : `${doc.checkbox} ${stepText}`;

    // Handle expected results
    let expected: string[] = [];
    if (doc.thenStepsAsExpectedResults && effectiveContext === 'Then') {
      // Append this Then/And-under-Then to the latest action step
      if (lastActionStepIndex !== null) {
        const prevStep = stepDataList[lastActionStepIndex];
        if (prevStep) {
          prevStep.expected = [...(prevStep.expected ?? []), stepText];
        }
      }
      // Skip adding this Then step as a separate row
      return;
    } else if (!doc.thenStepsAsExpectedResults && effectiveContext === 'Then') {
      // Old behavior: put Then step text in expected column
      expected = [doc.removeGherkinKeywords ? stepText : step.replace(/^(Then|And)\s+/, '')];
    }
    
    stepDataList.push({ stepText, expected, checkboxStep, keyword: effectiveContext });

    // Update pointer to most recent action step (any Given or When step can have expected results)
    lastActionStepIndex = stepDataList.length - 1;
  });
  
  // Second pass: create table rows from step data
  stepDataList.forEach((stepData) => {
    // Create multiple paragraphs for expected results (one per line)
    const expectedParagraphs = stepData.expected.length > 0
      ? stepData.expected.map(line => new Paragraph({ 
          children: [new TextRun({ text: line, color: theme.expectedText, font: doc.font, size: doc.sizes.tableText })],
          spacing: { before: 0, after: 0 }
        }))
      : [new Paragraph({ children: [new TextRun({ text: '', color: theme.expectedText, font: doc.font, size: doc.sizes.tableText })] })];

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: stepData.checkboxStep, color: theme.stepText, font: doc.font, size: doc.sizes.tableText })] })],
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

  return new Table({
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
}

export async function createDocxFromFeature(
  feature: ParsedFeature,
  outPath: string,
  options?: DocxOptions
): Promise<void> {
  const { theme, document } = mergeOptions(options);
  const children: (Paragraph | Table)[] = [];

  // Title
  if (feature.name) children.push(titleParagraph(feature.name, theme, document));

  // Description
  if (feature.description.length) {
    feature.description.forEach((d) => children.push(descriptionParagraph(d, theme, document)));
  }

  // Background
  if (feature.background) {
    children.push(backgroundHeading(feature.background.name, theme, document));
    children.push(stepsTable(feature.background.steps, theme, document));
  }

  // Scenarios
  for (const sc of feature.scenarios) {
    children.push(scenarioHeading(sc.name, theme, document));
    children.push(stepsTable(sc.steps, theme, document));
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
