import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import type { DistrictRow, GoalRow } from '../hooks/useMembershipStatusReport'

// Matches the Council's own printed column order exactly — see useMembershipStatusReport.ts's
// own header comment for what each block/column means.
const UNIT_COLUMNS: (keyof DistrictRow['units'])[] = [
  'tw',
  'st',
  'jr',
  'sr',
  'cdt',
  'bc',
  'dc',
  'am',
  'hm',
  'tg',
  'cw',
  'iccg'
]
const PEOPLE_COLUMNS: (keyof DistrictRow['people'])[] = [
  'tw',
  'st',
  'jr',
  'sr',
  'cdt',
  'tg',
  'iccg',
  'bc',
  'tl',
  'dc',
  'am',
  'hm',
  'cw'
]
const SUB_HEADERS_UNITS = [
  'TW',
  'ST',
  'JR',
  'SR',
  'CDT',
  'BC',
  'DC',
  'AM',
  'HM',
  'TG',
  'CW',
  'ICCG'
]
const SUB_HEADERS_PEOPLE = [
  'TW',
  'ST',
  'JR',
  'SR',
  'CDT',
  'TG',
  'ICCG',
  'BC',
  'TL',
  'DC',
  'AM',
  'HM',
  'CW'
]

function dash(n: number): string {
  return n === 0 ? '' : String(n)
}

function fileBase(schoolYear: string): string {
  return `Membership_Status_Report_${schoolYear}`.replace(/[^0-9a-zA-Z_-]/g, '_')
}

function rowToCells(row: DistrictRow): (string | number)[] {
  return [
    row.district,
    ...UNIT_COLUMNS.map((c) => dash(row.units[c])),
    ...PEOPLE_COLUMNS.map((c) => dash(row.people[c])),
    dash(row.totalGirls),
    dash(row.totalAdults)
  ]
}

function goalCells(g: GoalRow): (string | number)[] {
  const balance = g.goal - g.achieved
  return [g.label, g.goal, g.achieved, balance >= 0 ? balance : `Goal met +${-balance}`]
}

// ─── PDF ───

export async function buildMembershipStatusReportPdfDoc(
  districtRows: DistrictRow[],
  schoolYear: string,
  goalRows: GoalRow[],
  asOfLabel: string
) {
  const doc = createPdf('landscape')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: `MEMBERSHIP STATUS REPORT AS OF ${asOfLabel}`, bold: true, size: 12 },
    { text: `Membership Year ${schoolYear}` }
  ])

  y = addTable(doc, {
    startY: y,
    head: [
      [
        { content: 'DISTRICT', rowSpan: 2 },
        { content: 'NO. OF TROOPS & UNITS', colSpan: 12 },
        { content: 'NO. OF GIRLS & ADULTS', colSpan: 13 },
        { content: 'TOTAL NO.', colSpan: 2 }
      ],
      [...SUB_HEADERS_UNITS, ...SUB_HEADERS_PEOPLE, 'GIRLS', 'ADULTS']
    ],
    body: districtRows.slice(0, -1).map(rowToCells),
    foot: [rowToCells(districtRows[districtRows.length - 1])]
  })

  addTable(doc, {
    startY: y + 14,
    head: [['', 'GOAL', 'ACHIEVED', 'BALANCE']],
    body: goalRows.map(goalCells)
  })

  return doc
}

export async function exportMembershipStatusReportPdf(
  districtRows: DistrictRow[],
  schoolYear: string,
  goalRows: GoalRow[],
  asOfLabel: string
) {
  const doc = await buildMembershipStatusReportPdfDoc(districtRows, schoolYear, goalRows, asOfLabel)
  savePdf(doc, `${fileBase(schoolYear)}.pdf`)
}

// ─── Excel ───

export async function exportMembershipStatusReportExcel(
  districtRows: DistrictRow[],
  schoolYear: string,
  goalRows: GoalRow[],
  asOfLabel: string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Membership Status Report')
  const span = 1 + UNIT_COLUMNS.length + PEOPLE_COLUMNS.length + 2
  sheet.columns = Array.from({ length: span }, (_, i) => ({ width: i === 0 ? 22 : 7 }))
  await addWorksheetLogo(wb, sheet)

  const headLines = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: orgHeader.council, size: 10 },
    { text: orgHeader.city, size: 10 },
    { text: `MEMBERSHIP STATUS REPORT AS OF ${asOfLabel}`, bold: true, size: 13 },
    { text: `Membership Year ${schoolYear}`, size: 9 }
  ]
  headLines.forEach((line, i) => {
    const row = i + 1
    sheet.mergeCells(row, 1, row, span)
    const cell = sheet.getCell(`A${row}`)
    cell.value = line.text
    cell.font = { bold: !!line.bold, size: line.size ?? 10 }
    cell.alignment = { horizontal: 'center' }
  })

  let r = 7
  sheet.mergeCells(r, 1, r + 1, 1)
  sheet.getCell(r, 1).value = 'DISTRICT'
  sheet.getCell(r, 1).font = { bold: true, size: 8 }
  sheet.mergeCells(r, 2, r, 1 + UNIT_COLUMNS.length)
  sheet.getCell(r, 2).value = 'NO. OF TROOPS & UNITS'
  sheet.getCell(r, 2).font = { bold: true, size: 8 }
  sheet.mergeCells(r, 2 + UNIT_COLUMNS.length, r, 1 + UNIT_COLUMNS.length + PEOPLE_COLUMNS.length)
  sheet.getCell(r, 2 + UNIT_COLUMNS.length).value = 'NO. OF GIRLS & ADULTS'
  sheet.getCell(r, 2 + UNIT_COLUMNS.length).font = { bold: true, size: 8 }
  sheet.mergeCells(r, span - 1, r, span)
  sheet.getCell(r, span - 1).value = 'TOTAL NO.'
  sheet.getCell(r, span - 1).font = { bold: true, size: 8 }
  r++
  const subHeaders = [...SUB_HEADERS_UNITS, ...SUB_HEADERS_PEOPLE, 'GIRLS', 'ADULTS']
  subHeaders.forEach((h, i) => {
    const cell = sheet.getCell(r, i + 2)
    cell.value = h
    cell.font = { bold: true, size: 8 }
    cell.alignment = { horizontal: 'center' }
  })
  r++

  const lastRowIdx = districtRows.length - 1
  districtRows.forEach((row, i) => {
    const cells = rowToCells(row)
    cells.forEach((v, colIdx) => {
      const cell = sheet.getCell(r, colIdx + 1)
      cell.value = v
      cell.font = { bold: i === lastRowIdx, size: 8 }
      if (colIdx > 0) cell.alignment = { horizontal: 'center' }
    })
    r++
  })

  r += 2
  sheet.getCell(r, 1).value = 'Goal / Achieved / Balance'
  sheet.getCell(r, 1).font = { bold: true, size: 10 }
  r++
  ;['', 'GOAL', 'ACHIEVED', 'BALANCE'].forEach((h, i) => {
    const cell = sheet.getCell(r, i + 1)
    cell.value = h
    cell.font = { bold: true, size: 9 }
  })
  r++
  for (const g of goalRows) {
    const cells = goalCells(g)
    cells.forEach((v, i) => {
      sheet.getCell(r, i + 1).value = v
      sheet.getCell(r, i + 1).font = { size: 9 }
    })
    r++
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBase(schoolYear)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Word ───

export async function exportMembershipStatusReportDocx(
  districtRows: DistrictRow[],
  schoolYear: string,
  goalRows: GoalRow[],
  asOfLabel: string
) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: `MEMBERSHIP STATUS REPORT AS OF ${asOfLabel}`, bold: true, size: 26 },
      { text: `Membership Year ${schoolYear}` }
    ])),
    spacer(),
    buildTable(
      ['District', ...SUB_HEADERS_UNITS, ...SUB_HEADERS_PEOPLE, 'GIRLS', 'ADULTS'],
      districtRows.map(rowToCells),
      undefined,
      [
        { label: 'District', span: 1 },
        { label: 'No. of Troops & Units', span: UNIT_COLUMNS.length },
        { label: 'No. of Girls & Adults', span: PEOPLE_COLUMNS.length },
        { label: 'Total No.', span: 2 }
      ],
      [districtRows.length - 1]
    ),
    spacer(),
    buildTable(['', 'Goal', 'Achieved', 'Balance'], goalRows.map(goalCells))
  ]

  await saveDocx(children, `${fileBase(schoolYear)}.docx`, true)
}
