import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, ShadingType, BorderStyle } from 'docx';
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
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

function stepsTable(steps: string[], theme: ThemeConfig, doc: DocumentSettings): Table {
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

  steps.forEach((step, idx) => {
    const n = idx + 1;
    const checkboxStep = `${doc.checkbox} ${n}. ${step}`;

    // Expected result heuristic: from Then/And following Then, strip the keyword
    let expected = '';
    if (/^(Then|And)\s+/.test(step)) {
      expected = step.replace(/^(Then|And)\s+/, '');
    }

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: checkboxStep, color: theme.stepText, font: doc.font, size: doc.sizes.tableText })] })],
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: theme.dataBgStep }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: expected, color: theme.expectedText, font: doc.font, size: doc.sizes.tableText })] })],
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
