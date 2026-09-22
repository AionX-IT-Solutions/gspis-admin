import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  PageOrientation
} from 'docx'
import { getReportLogoDataUrl } from './reportLogo'

export interface DocxHeaderLine {
  text: string
  bold?: boolean
  size?: number
}

export async function headerParagraphs(lines: DocxHeaderLine[]): Promise<Paragraph[]> {
  const logo = await getReportLogoDataUrl()
  const logoParagraph = logo
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new ImageRun({ type: 'png', data: logo, transformation: { width: 60, height: 60 } })
          ]
        })
      ]
    : []

  return [
    ...logoParagraph,
    ...lines.map(
      (line) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: line.text, bold: line.bold, size: line.size ?? 20 })]
        })
    )
  ]
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function cell(
  text: string,
  opts?: {
    bold?: boolean
    color?: string
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
    doubleRuleBottom?: boolean
  }
): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: opts?.doubleRuleBottom
      ? { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '12122A' } }
      : undefined,
    children: [
      new Paragraph({
        alignment: opts?.align ?? AlignmentType.LEFT,
        children: [new TextRun({ text, bold: opts?.bold, color: opts?.color, size: 16 })]
      })
    ]
  })
}

export interface DocxGroupHeaderCell {
  label: string
  span: number
}

function headerCell(text: string, columnSpan?: number): TableCell {
  return new TableCell({
    columnSpan,
    shading: { fill: '10B981' },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16 })]
      })
    ]
  })
}

export function buildTable(
  head: string[],
  rows: (string | number)[][],
  footRow?: (string | number | null)[],
  groupHeader?: DocxGroupHeaderCell[],
  /** Row indices (0-based, matching `rows`) to render bold — for reports that bold
   *  running subtotal/heading lines mixed into the body instead of a trailing `footRow`
   *  (e.g. SCRD's narrative statement layout). */
  boldRowIndexes?: number[]
): Table {
  const boldRows = boldRowIndexes ? new Set(boldRowIndexes) : null
  const groupHeaderRow = groupHeader
    ? new TableRow({
        tableHeader: true,
        children: groupHeader.map((g) => headerCell(g.label, g.span > 1 ? g.span : undefined))
      })
    : null

  const headerRow =
    head.length > 0
      ? new TableRow({ tableHeader: true, children: head.map((h) => headerCell(h)) })
      : null

  const bodyRows = rows.map(
    (row, i) =>
      new TableRow({
        children: row.map((value) => cell(String(value), { bold: boldRows?.has(i) }))
      })
  )

  const rowsAll = [
    ...(groupHeaderRow ? [groupHeaderRow] : []),
    ...(headerRow ? [headerRow] : []),
    ...bodyRows
  ]
  if (footRow) {
    rowsAll.push(
      new TableRow({
        children: footRow.map((value) =>
          cell(value === null ? '' : String(value), { bold: true, doubleRuleBottom: true })
        )
      })
    )
  }

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rowsAll })
}

export interface DocxSignatoryColumn {
  label: string
  name: string
  role: string
}

export function signatoryTable(columns: DocxSignatoryColumn[]): Table {
  const blankCell = () =>
    new TableCell({ borders: noBorders, children: [new Paragraph({ text: '' })] })
  const textCell = (text: string, bold = false) =>
    new TableCell({
      borders: noBorders,
      children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18 })] })]
    })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({ children: columns.map((c) => textCell(c.label)) }),
      new TableRow({ children: columns.map(() => blankCell()) }),
      new TableRow({ children: columns.map((c) => textCell(c.name, true)) }),
      new TableRow({ children: columns.map((c) => textCell(c.role)) })
    ]
  })
}

/** A borderless single-row, two-cell line — left text flush left, right text flush right —
 *  for header details that sit at opposite corners of the page rather than centered (e.g. a
 *  form's "No./Series" control-number block on the left and "(Regional Copy)" designation on
 *  the right). */
export function headerLineSplit(leftText: string, rightText: string): Table {
  const lineCell = (text: string, align: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    new TableCell({
      borders: noBorders,
      children: [new Paragraph({ alignment: align, children: [new TextRun({ text, size: 16 })] })]
    })
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [lineCell(leftText, AlignmentType.LEFT), lineCell(rightText, AlignmentType.RIGHT)]
      })
    ]
  })
}

export function spacer(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 120 } })
}

export async function saveDocx(
  children: (Paragraph | Table)[],
  filename: string,
  landscape = false
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: landscape
          ? { page: { size: { orientation: PageOrientation.LANDSCAPE } } }
          : undefined,
        children
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
