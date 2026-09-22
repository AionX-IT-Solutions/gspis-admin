import { Paragraph, TextRun } from 'docx'
import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import type { Troop } from '@/features/troops/types/troop.types'
import {
  createPdf,
  addHeaderLines,
  addTable,
  addSignatories,
  type PdfSignatoryColumn,
  savePdf
} from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  buildTable,
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import type { IccgAdultMember, IccgFee, IccgGirlMember } from '../types/iccgRegistration.types'

// Decoupled from the persisted `IccgRegistration` record (troopId only) so the same
// builders work from either a saved record (looked up + joined with its Troop) or the
// in-progress form state (which already holds the full Troop object) — same pattern as
// features/troopRegistration/lib/troopRegistrationExport.ts.
export interface IccgRegistrationExportData {
  troop: Troop
  school: string
  ageLevel?: string
  schoolYear: string
  dateApplied: string
  formNo?: string
  seriesYear?: string
  girls: IccgGirlMember[]
  adults: IccgAdultMember[]
  submittedByName: string
  submittedByDate?: string
  notedByName?: string
  notedByDate?: string
  processedByName?: string
  approvedByName?: string
  fee: IccgFee
}

function peso(n: number | undefined): string {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function signatoryColumns(data: IccgRegistrationExportData): PdfSignatoryColumn[] {
  return [
    { label: 'SUBMITTED BY:', name: data.submittedByName.toUpperCase(), role: 'CGS Adult Leader' },
    { label: 'NOTED BY:', name: (data.notedByName ?? '').toUpperCase(), role: 'School Principal' }
  ]
}

function approvalColumns(data: IccgRegistrationExportData): PdfSignatoryColumn[] {
  return [
    {
      label: 'PROCESSED BY:',
      name: (data.processedByName ?? '').toUpperCase(),
      role: 'Registration Processor'
    },
    {
      label: 'APPROVED BY:',
      name: (data.approvedByName || signatories.councilExecutive).toUpperCase(),
      role: 'Council Executive'
    }
  ]
}

function headerInfoRows(data: IccgRegistrationExportData): [string, string, string, string][] {
  return [
    ['School', data.school, 'Age Level', data.ageLevel ?? ''],
    ['Registered with GSP Troop No.', data.troop.troopNumber, 'Region', orgHeader.region],
    ['Council', orgHeader.council, 'GSP Troop Name', data.troop.troopName ?? ''],
    [
      'School Year',
      data.schoolYear,
      'Date Applied',
      data.dateApplied ? formatDate(data.dateApplied) : ''
    ]
  ]
}

function filenameFor(data: IccgRegistrationExportData): string {
  return `ICCGRegistration_${data.troop.troopNumber}_${data.schoolYear}`.replace(
    /[^0-9a-z_-]/gi,
    '_'
  )
}

// ─── Excel ───

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin' }
const SHEET_SPAN = 5

function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  wb.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}

function setCell(
  sheet: ExcelJS.Worksheet,
  addr: string,
  value: unknown,
  font: Partial<ExcelJS.Font>,
  center = false
) {
  const cell = sheet.getCell(addr)
  cell.value = value as ExcelJS.CellValue
  cell.font = font
  if (center) cell.alignment = { horizontal: 'center' }
}

function applyArialFont(sheet: ExcelJS.Worksheet) {
  sheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { size: 9, ...cell.font, name: 'Arial' }
    })
  })
}

function addRowRule(sheet: ExcelJS.Worksheet, row: number, span: number, side: 'top' | 'bottom') {
  for (let c = 1; c <= span; c++) {
    const cell = sheet.getCell(row, c)
    cell.border = { ...cell.border, [side]: THIN_BORDER }
  }
}

function addOuterBox(sheet: ExcelJS.Worksheet, span: number, lastRow: number) {
  for (let r = 1; r <= lastRow; r++) {
    const left = sheet.getCell(r, 1)
    left.border = { ...left.border, left: THIN_BORDER }
    const right = sheet.getCell(r, span)
    right.border = { ...right.border, right: THIN_BORDER }
  }
  addRowRule(sheet, lastRow, span, 'bottom')
}

const SECTION_FONT = { bold: true, size: 10 }
const SIGNATURE_LABEL_FONT = { bold: true, size: 9 }
const SIGNATURE_NAME_FONT = { bold: true, underline: true, size: 9 }
const SIGNATURE_ROLE_FONT = { size: 9 }

function writeSignaturePair(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  columns: { label: string; name: string; role: string }[]
): number {
  let r = startRow
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  const colStarts = ['A', 'D']
  columns.forEach((c, i) => setCell(sheet, `${colStarts[i]}${r}`, c.label, SIGNATURE_LABEL_FONT))
  r += 3
  columns.forEach((c, i) =>
    setCell(sheet, `${colStarts[i]}${r}`, c.name, SIGNATURE_NAME_FONT, true)
  )
  r++
  columns.forEach((c, i) =>
    setCell(sheet, `${colStarts[i]}${r}`, c.role, SIGNATURE_ROLE_FONT, true)
  )
  return r + 2
}

export async function exportIccgRegistrationExcel(data: IccgRegistrationExportData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('ICCG Registration')
  sheet.columns = [6, 32, 18, 14, 28].map((width) => ({ width }))
  await addWorksheetLogo(wb, sheet)

  setCell(sheet, 'A1', data.formNo ?? '', { size: 8 })
  const lines: { text: string; bold?: boolean; size?: number }[] = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: 'National Headquarters', size: 10 },
    { text: '901 Padre Faura St., Ermita, Manila', size: 9 },
    { text: 'CATHOLIC GUIDING SECTION MEMBERSHIP REGISTRATION FORM', bold: true, size: 12 },
    { text: orgHeader.region, size: 10 },
    { text: orgHeader.council, size: 10 }
  ]
  lines.forEach((line, i) => {
    const row = i + 1
    sheet.mergeCells(row, 2, row, SHEET_SPAN)
    setCell(sheet, `B${row}`, line.text, { bold: !!line.bold, size: line.size ?? 10 }, true)
  })
  sheet.getRow(4).height = 20
  addRowRule(sheet, 7, SHEET_SPAN, 'bottom')

  let r = 8
  for (const [labelA, valueA, labelB, valueB] of headerInfoRows(data)) {
    setCell(sheet, `A${r}`, labelA, { size: 9, bold: true })
    sheet.mergeCells(r, 1, r, 2)
    setCell(sheet, `C${r}`, valueA, { size: 9 })
    setCell(sheet, `D${r}`, labelB, { size: 9, bold: true })
    setCell(sheet, `E${r}`, valueB, { size: 9 })
    r++
  }
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  r += 1

  setCell(sheet, `A${r}`, 'CGS REGISTERED GIRL MEMBERS', SECTION_FONT)
  r++
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  setCell(sheet, `A${r}`, '#', SECTION_FONT, true)
  setCell(sheet, `B${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
  setCell(sheet, `C${r}`, 'Grade/Year', SECTION_FONT, true)
  sheet.mergeCells(r, 4, r, 5)
  setCell(sheet, `D${r}`, 'e-mail address', SECTION_FONT)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  data.girls.forEach((girl, i) => {
    setCell(sheet, `A${r}`, i + 1, { size: 9 }, true)
    setCell(sheet, `B${r}`, girl.fullName, { size: 9 })
    setCell(sheet, `C${r}`, girl.gradeYear ?? '', { size: 9 }, true)
    sheet.mergeCells(r, 4, r, 5)
    setCell(sheet, `D${r}`, girl.email ?? '', { size: 9 })
    r++
  })
  addRowRule(sheet, r - 1, SHEET_SPAN, 'bottom')
  r += 1

  setCell(sheet, `A${r}`, 'CGS REGISTERED ADULT MEMBERS (at least 2)', SECTION_FONT)
  r++
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  setCell(sheet, `A${r}`, '#', SECTION_FONT, true)
  sheet.mergeCells(r, 2, r, 3)
  setCell(sheet, `B${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
  sheet.mergeCells(r, 4, r, 5)
  setCell(sheet, `D${r}`, 'e-mail address', SECTION_FONT)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  data.adults.forEach((adult, i) => {
    setCell(sheet, `A${r}`, i + 1, { size: 9 }, true)
    sheet.mergeCells(r, 2, r, 3)
    setCell(sheet, `B${r}`, adult.fullName, { size: 9 })
    sheet.mergeCells(r, 4, r, 5)
    setCell(sheet, `D${r}`, adult.email ?? '', { size: 9 })
    r++
  })
  addRowRule(sheet, r - 1, SHEET_SPAN, 'bottom')
  r += 1

  r = writeSignaturePair(sheet, r, signatoryColumns(data))
  r += 1

  setCell(sheet, `A${r}`, 'CGS REGISTRATION FEE', SECTION_FONT)
  r++
  const feeRows: [string, string, string][] = [
    ['No. of Girls', String(data.girls.length), peso(data.fee.amountGirls)],
    ['No. of Adult', String(data.adults.length), peso(data.fee.amountAdults)]
  ]
  for (const [label, count, amount] of feeRows) {
    setCell(sheet, `A${r}`, label, { size: 9 })
    setCell(sheet, `C${r}`, count, { size: 9 }, true)
    setCell(sheet, `D${r}`, amount, { size: 9 }, true)
    sheet.getCell(`D${r}`).numFmt = '"₱"#,##0.00'
    r++
  }
  setCell(sheet, `A${r}`, 'Total', { bold: true, size: 10 })
  setCell(sheet, `D${r}`, peso(data.fee.total), { bold: true, size: 10 }, true)
  sheet.getCell(`D${r}`).numFmt = '"₱"#,##0.00'
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  r += 2

  setCell(sheet, `A${r}`, 'AR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.fee.arNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date Deposited', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.fee.dateOfDeposit ? formatDate(data.fee.dateOfDeposit) : '', {
    size: 9
  })
  r++
  setCell(sheet, `A${r}`, 'DCCR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.fee.dccrNo ?? '', { size: 9 })
  r += 2

  r = writeSignaturePair(sheet, r, approvalColumns(data))

  applyArialFont(sheet)
  addOuterBox(sheet, SHEET_SPAN, r - 1)

  downloadWorkbook(wb, `${filenameFor(data)}.xlsx`)
}

// ─── PDF ───

export async function buildIccgRegistrationPdfDoc(data: IccgRegistrationExportData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: 'National Headquarters' },
    { text: '901 Padre Faura St., Ermita, Manila' },
    { text: 'CATHOLIC GUIDING SECTION MEMBERSHIP REGISTRATION FORM', bold: true, size: 12 },
    { text: orgHeader.region },
    { text: orgHeader.council }
  ])

  y = addTable(doc, {
    startY: y,
    head: [],
    body: headerInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
      labelA,
      valueA,
      labelB,
      valueB
    ]),
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  y = addTable(doc, {
    startY: y + 8,
    head: [
      ['#', 'CGS Registered Girl Members (Last, First, M.I.)', 'Grade/Year', 'e-mail address']
    ],
    body: data.girls.map((g, i) => [String(i + 1), g.fullName, g.gradeYear ?? '', g.email ?? '']),
    columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' } }
  })

  y = addTable(doc, {
    startY: y + 8,
    head: [['#', 'CGS Registered Adult Members (at least 2)', 'e-mail address']],
    body: data.adults.map((a, i) => [String(i + 1), a.fullName, a.email ?? '']),
    columnStyles: { 0: { halign: 'center' } }
  })

  y = addSignatories(doc, y, signatoryColumns(data))

  y += 20
  y = addTable(doc, {
    startY: y,
    head: [['CGS Registration Fee', 'No.', 'Amount']],
    body: [
      ['No. of Girls', String(data.girls.length), peso(data.fee.amountGirls)],
      ['No. of Adult', String(data.adults.length), peso(data.fee.amountAdults)]
    ],
    foot: [['Total', '', peso(data.fee.total)]],
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } }
  })

  y = addTable(doc, {
    startY: y + 8,
    head: [],
    body: [
      [
        'AR No.',
        data.fee.arNo ?? '',
        'Date Deposited',
        data.fee.dateOfDeposit ? formatDate(data.fee.dateOfDeposit) : ''
      ],
      ['DCCR No.', data.fee.dccrNo ?? '', '', '']
    ],
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  addSignatories(doc, y, approvalColumns(data))
  return doc
}

export async function exportIccgRegistrationPdf(data: IccgRegistrationExportData) {
  const doc = await buildIccgRegistrationPdfDoc(data)
  savePdf(doc, `${filenameFor(data)}.pdf`)
}

// ─── Word ───

export async function exportIccgRegistrationDocx(data: IccgRegistrationExportData) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: 'National Headquarters' },
      { text: '901 Padre Faura St., Ermita, Manila' },
      { text: 'CATHOLIC GUIDING SECTION MEMBERSHIP REGISTRATION FORM', bold: true, size: 24 },
      { text: orgHeader.region },
      { text: orgHeader.council }
    ])),
    spacer(),
    buildTable(
      [],
      headerInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
        labelA,
        valueA,
        labelB,
        valueB
      ])
    ),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'CGS Registered Girl Members', bold: true })]
    }),
    buildTable(
      ['#', 'Name (Last, First, M.I.)', 'Grade/Year', 'e-mail address'],
      data.girls.map((g, i) => [String(i + 1), g.fullName, g.gradeYear ?? '', g.email ?? ''])
    ),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'CGS Registered Adult Members (at least 2)', bold: true })]
    }),
    buildTable(
      ['#', 'Name (Last, First, M.I.)', 'e-mail address'],
      data.adults.map((a, i) => [String(i + 1), a.fullName, a.email ?? ''])
    ),
    spacer(),
    signatoryTable(signatoryColumns(data)),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'CGS Registration Fee', bold: true })] }),
    buildTable(
      [],
      [
        ['No. of Girls', String(data.girls.length), peso(data.fee.amountGirls)],
        ['No. of Adult', String(data.adults.length), peso(data.fee.amountAdults)]
      ],
      ['Total', '', peso(data.fee.total)]
    ),
    spacer(),
    buildTable(
      [],
      [
        [
          'AR No.',
          data.fee.arNo ?? '',
          'Date Deposited',
          data.fee.dateOfDeposit ? formatDate(data.fee.dateOfDeposit) : ''
        ],
        ['DCCR No.', data.fee.dccrNo ?? '', '', '']
      ]
    ),
    spacer(),
    signatoryTable(approvalColumns(data))
  ]

  await saveDocx(children, `${filenameFor(data)}.docx`)
}
