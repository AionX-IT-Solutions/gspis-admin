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
import {
  REGISTRATION_AGE_LEVELS,
  type CardsIssued,
  type RegistrationAgeLevel,
  type RegistrationLeader,
  type RegistrationMember,
  type RegistrationRemittance
} from '../types/troopRegistration.types'

// Decoupled from the persisted `TroopRegistration` record (troopId only) so the same
// builders work from either a saved record (looked up + joined with its Troop) or the
// in-progress form state (which already holds the full Troop object).
export interface TroopRegistrationExportData {
  troop: Troop
  schoolYear: string
  dateApplied: string
  troopStatus: 'new' | 're-registered'
  ageLevel: RegistrationAgeLevel
  leaders: RegistrationLeader[]
  members: RegistrationMember[]
  submittedByName: string
  submittedByDate?: string
  notedByName?: string
  notedByDate?: string
  remittance: RegistrationRemittance
  troopNo?: string
  cardsIssued: CardsIssued
  girlsIdCardSeriesYear?: string
  adultsIdCardSeriesYear?: string
  troopFee?: number
  rorNo?: string
  rorDate?: string
  dccrNo?: string
  dateOfDeposit?: string
  branchCode?: string
  processedByName?: string
  approvedByName?: string
}

function peso(n: number | undefined): string {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** The paper form's Birthdate column is itself split into MM/DD/YY sub-columns rather than
 *  one free-text date — used for both the Leaders and Troop Members tables, every export
 *  format. */
function splitBirthdate(birthdate?: string): [string, string, string] {
  if (!birthdate) return ['', '', '']
  const d = new Date(birthdate)
  if (Number.isNaN(d.getTime())) return ['', '', '']
  return [
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    String(d.getFullYear()).slice(-2)
  ]
}

function groupByPatrol(members: RegistrationMember[]): [string, RegistrationMember[]][] {
  const groups = new Map<string, RegistrationMember[]>()
  for (const m of members) {
    const list = groups.get(m.patrol) ?? []
    list.push(m)
    groups.set(m.patrol, list)
  }
  return [...groups.entries()]
}

// The printed form's "Total Remittance" is A+B+C+D only — the Thinking Day Fee is not one
// of its lettered lines (it's a flat per-troop fee like Troop Fee, printed in the Council's
// own retained-fees box instead — see the handwritten margin notes on the reference form).
// Computed here rather than trusting `remittance.totalRemittance` so a record saved before
// this distinction existed still exports the correct figure.
function computeTotalRemittance(r: RegistrationRemittance): number {
  return (
    r.membershipFeeGirlsReReg +
    r.membershipFeeGirlsNew +
    r.membershipFeeLeaderReReg +
    r.membershipFeeLeaderNew +
    r.membershipFeeCoLeaderReReg +
    r.membershipFeeCoLeaderNew +
    r.programDevelopmentFund +
    r.mutualAssistanceFundContribution +
    r.magazineSubscriptionFee
  )
}

// Exact wording from the reference paper form's top-right age-level checkboxes.
const AGE_LEVEL_DESCRIPTIONS: Record<RegistrationAgeLevel, string> = {
  Twinkler: 'Twinkler - 4-6 years old/Pre-school',
  Star: 'Star - 6-9 years old/Grades I-V',
  Junior: 'Junior - 9-12 years old/Grades IV-V',
  Senior: 'Senior - 12-16 years old/High School',
  Cadet: 'Cadet -16-21 years old/College'
}

function rboStatusLine(rboStatus: 'old' | 'new'): string {
  return `[${rboStatus === 'old' ? 'X' : ' '}] Old   [${rboStatus === 'new' ? 'X' : ' '}] New`
}

function regStatusLine(regStatus: 'new' | 're-reg'): string {
  return `[${regStatus === 're-reg' ? 'X' : ' '}] Re-Reg   [${regStatus === 'new' ? 'X' : ' '}] New`
}

function ageLevelChecklistLines(ageLevel: RegistrationAgeLevel): string[] {
  return REGISTRATION_AGE_LEVELS.map(
    (level) => `[${level === ageLevel ? 'X' : ' '}] ${AGE_LEVEL_DESCRIPTIONS[level]}`
  )
}

function ageLevelChecklistInline(ageLevel: RegistrationAgeLevel): string {
  return REGISTRATION_AGE_LEVELS.map(
    (level) => `[${level === ageLevel ? 'X' : ' '}] ${level}`
  ).join('   ')
}

function troopTypeLine(troop: Troop): string {
  const isCommunity = troop.troopType === 'community'
  return `[${isCommunity ? ' ' : 'X'}] School Based    [${isCommunity ? 'X' : ' '}] Community Based`
}

function troopStatusLine(status: 'new' | 're-registered'): string {
  return `[${status === 're-registered' ? 'X' : ' '}] Re-registered    [${status === 'new' ? 'X' : ' '}] New`
}

function signatoryColumns(data: TroopRegistrationExportData): PdfSignatoryColumn[] {
  return [
    { label: 'SUBMITTED BY:', name: data.submittedByName.toUpperCase(), role: 'Troop Leader' },
    {
      label: 'NOTED BY:',
      name: (data.notedByName ?? '').toUpperCase(),
      role: 'Principal / School Head / BC Chairman'
    }
  ]
}

function approvalColumns(data: TroopRegistrationExportData): PdfSignatoryColumn[] {
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

function filenameFor(data: TroopRegistrationExportData): string {
  return `TroopRegistration_${data.troop.troopNumber}_${data.schoolYear}`.replace(
    /[^0-9a-z_-]/gi,
    '_'
  )
}

// Shared left/right troop-header field pairs — row order and pairing follows the reference
// paper form exactly (Troop Name/Age Level, Troop Address/Sponsoring Group, Troop Tel.
// No./Complete Mailing Address, District Committee, Barangay Committee, Troop Type/Troop
// Birthday, Troop Status/Date Applied). School Year has no slot on the paper form itself
// (it's implied by Date Applied) but is real data this app needs, so it gets its own
// trailing row rather than being dropped.
function troopInfoRows(data: TroopRegistrationExportData): [string, string, string, string][] {
  return [
    ['Troop Name', data.troop.troopName ?? '', 'Age Level', data.ageLevel],
    [
      'Troop Address',
      data.troop.troopAddress ?? '',
      'Sponsoring Group',
      data.troop.sponsoringGroup ?? ''
    ],
    [
      'Troop Tel. No.',
      data.troop.troopTelNo ?? '',
      'Complete Mailing Address',
      data.troop.completeMailingAddress ?? ''
    ],
    ['District Committee Name/Municipality', data.troop.districtCommitteeName ?? '', '', ''],
    ['Barangay Committee Name', data.troop.barangayCommitteeName ?? '', '', ''],
    [
      'Troop Type',
      troopTypeLine(data.troop),
      'Troop Birthday',
      data.troop.troopBirthday ? formatDate(data.troop.troopBirthday) : ''
    ],
    [
      'Troop Status',
      troopStatusLine(data.troopStatus),
      'Date Applied',
      data.dateApplied ? formatDate(data.dateApplied) : ''
    ],
    ['School Year', data.schoolYear, '', '']
  ]
}

// ─── Excel — mirrors the boxed-form pattern voucherExcelExport.ts established for the
// Council's real DV/JV templates: raw cell addressing + ruled sub-boxes, not a generic
// tabular report. ───

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin' }
// One extra column vs. before to fit the Birthdate MM/DD/YY split as three columns instead
// of one (see splitBirthdate) — the age-level checklist and Beneficiary column both shift
// out to the new last column (H) accordingly.
const SHEET_SPAN = 8

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

// Row 1's left cell holds "NO." — the Council's own blank control-number field on the
// physical form (we hold no data for it); the same five rows carry the age-level checklist
// in the sheet's rightmost column, matching the paper form's top-right corner box.
function addCenteredHeader(sheet: ExcelJS.Worksheet, ageLevel: RegistrationAgeLevel) {
  setCell(sheet, 'A1', 'NO.', { bold: true, size: 9 })
  const checklist = ageLevelChecklistLines(ageLevel)
  const checklistCol = String.fromCharCode(64 + SHEET_SPAN)
  checklist.forEach((line, i) => {
    setCell(sheet, `${checklistCol}${i + 1}`, line, { size: 6.5 })
  })

  const lines: { text: string; bold?: boolean; size?: number }[] = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: 'National Headquarters', size: 10 },
    { text: '901 Padre Faura St., Ermita, Manila', size: 9 },
    { text: 'TROOP REGISTRATION FORM', bold: true, size: 14 },
    { text: orgHeader.region, size: 10 },
    { text: orgHeader.council, size: 10 }
  ]
  lines.forEach((line, i) => {
    const row = i + 2
    sheet.mergeCells(row, 1, row, SHEET_SPAN - 1)
    setCell(sheet, `A${row}`, line.text, { bold: !!line.bold, size: line.size ?? 10 }, true)
  })
  sheet.getRow(5).height = 22
  addRowRule(sheet, 7, SHEET_SPAN, 'bottom')
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

export async function exportTroopRegistrationExcel(data: TroopRegistrationExportData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Troop Registration')
  sheet.columns = [16, 16, 16, 16, 16, 16, 16, 34].map((width) => ({ width }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, data.ageLevel)

  let r = 8
  for (const [labelA, valueA, labelB, valueB] of troopInfoRows(data)) {
    setCell(sheet, `A${r}`, labelA, { size: 9, bold: true })
    setCell(sheet, `B${r}`, valueA, { size: 9 })
    if (labelB) {
      setCell(sheet, `D${r}`, labelB, { size: 9, bold: true })
      setCell(sheet, `E${r}`, valueB, { size: 9 })
    }
    r++
  }
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  r += 1

  setCell(sheet, `A${r}`, 'REGISTRATION OF LEADERS', SECTION_FONT)
  r++
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  setCell(sheet, `A${r}`, 'Position', SECTION_FONT)
  setCell(sheet, `B${r}`, 'T/NT', SECTION_FONT, true)
  setCell(sheet, `C${r}`, 'RBO Status', SECTION_FONT, true)
  setCell(sheet, `D${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
  sheet.mergeCells(r, 5, r, 7)
  setCell(sheet, `E${r}`, 'Birthdate', SECTION_FONT, true)
  setCell(sheet, `H${r}`, 'Beneficiary', SECTION_FONT)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  setCell(sheet, `E${r}`, 'MM', SECTION_FONT, true)
  setCell(sheet, `F${r}`, 'DD', SECTION_FONT, true)
  setCell(sheet, `G${r}`, 'YY', SECTION_FONT, true)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  for (const leader of data.leaders) {
    const [mm, dd, yy] = splitBirthdate(leader.birthdate)
    setCell(sheet, `A${r}`, leader.position, { size: 9 })
    setCell(sheet, `B${r}`, leader.trained ? 'T' : 'NT', { size: 9 }, true)
    setCell(sheet, `C${r}`, rboStatusLine(leader.rboStatus), { size: 8 })
    setCell(sheet, `D${r}`, leader.name, { size: 9 })
    setCell(sheet, `E${r}`, mm, { size: 9 }, true)
    setCell(sheet, `F${r}`, dd, { size: 9 }, true)
    setCell(sheet, `G${r}`, yy, { size: 9 }, true)
    setCell(sheet, `H${r}`, leader.beneficiary ?? '', { size: 9 })
    r++
  }
  addRowRule(sheet, r - 1, SHEET_SPAN, 'bottom')
  r += 1

  setCell(sheet, `A${r}`, 'REGISTRATION OF TROOP MEMBERS', SECTION_FONT)
  r++
  for (const [, members] of groupByPatrol(data.members)) {
    setCell(sheet, `A${r}`, 'Name of Patrol/Cluster:', {
      bold: true,
      size: 9,
      italic: true
    })
    r++
    addRowRule(sheet, r, SHEET_SPAN, 'top')
    setCell(sheet, `A${r}`, '#', SECTION_FONT, true)
    setCell(sheet, `B${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
    sheet.mergeCells(r, 3, r, 5)
    setCell(sheet, `C${r}`, 'Birthdate', SECTION_FONT, true)
    setCell(sheet, `F${r}`, 'Gr/Yr', SECTION_FONT, true)
    setCell(sheet, `G${r}`, 'Reg. Status', SECTION_FONT, true)
    setCell(sheet, `H${r}`, 'Beneficiary', SECTION_FONT)
    addRowRule(sheet, r, SHEET_SPAN, 'bottom')
    r++
    setCell(sheet, `C${r}`, 'MM', SECTION_FONT, true)
    setCell(sheet, `D${r}`, 'DD', SECTION_FONT, true)
    setCell(sheet, `E${r}`, 'YY', SECTION_FONT, true)
    addRowRule(sheet, r, SHEET_SPAN, 'bottom')
    r++
    members.forEach((member, i) => {
      const [mm, dd, yy] = splitBirthdate(member.birthdate)
      setCell(sheet, `A${r}`, i + 1, { size: 9 }, true)
      setCell(sheet, `B${r}`, member.fullName, { size: 9 })
      setCell(sheet, `C${r}`, mm, { size: 9 }, true)
      setCell(sheet, `D${r}`, dd, { size: 9 }, true)
      setCell(sheet, `E${r}`, yy, { size: 9 }, true)
      setCell(sheet, `F${r}`, member.gradeYear ?? '', { size: 9 }, true)
      setCell(sheet, `G${r}`, regStatusLine(member.regStatus), { size: 8 })
      setCell(sheet, `H${r}`, member.beneficiary ?? '', { size: 9 })
      r++
    })
  }
  addRowRule(sheet, r - 1, SHEET_SPAN, 'bottom')
  r += 1

  r = writeSignaturePair(sheet, r, signatoryColumns(data))
  r += 1

  setCell(sheet, `A${r}`, 'COUNCIL ACTION REMITTANCE', SECTION_FONT)
  r++
  const remittanceRows: [string, number][] = [
    ['A. GSP Membership Fee — Girls (Re-Reg)', data.remittance.membershipFeeGirlsReReg],
    ['    Girls (New)', data.remittance.membershipFeeGirlsNew],
    ['    Leader (Re-Reg)', data.remittance.membershipFeeLeaderReReg],
    ['    Leader (New)', data.remittance.membershipFeeLeaderNew],
    ['    Co-Leader (Re-Reg)', data.remittance.membershipFeeCoLeaderReReg],
    ['    Co-Leader (New)', data.remittance.membershipFeeCoLeaderNew],
    ['B. Program Development Fund', data.remittance.programDevelopmentFund],
    [
      'C. Contribution to the Mutual Assistance Fund',
      data.remittance.mutualAssistanceFundContribution
    ],
    ['D. GS Magazine Troop Subscription Fee', data.remittance.magazineSubscriptionFee]
  ]
  const remittanceStartRow = r
  for (const [label, amount] of remittanceRows) {
    setCell(sheet, `A${r}`, label, { size: 9 })
    setCell(sheet, `C${r}`, amount, { size: 9 }, true)
    sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
    r++
  }
  setCell(sheet, `A${r}`, 'Total Remittance', { bold: true, size: 10 })
  setCell(sheet, `C${r}`, computeTotalRemittance(data.remittance), { bold: true, size: 10 }, true)
  sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
  addRowRule(sheet, r, 3, 'top')
  r++

  // Right-hand box — Troop No., cards issued, ID card series, and the two flat fees fully
  // retained by the Council (Troop Fee, Thinking Day Fee) — matches the paper form's own
  // right-side "Council Action" fields, printed alongside the A–D remittance list on the
  // left rather than folded into its total.
  let rr = remittanceStartRow
  const rightBlock: [string, string][] = [
    ['Troop No.', data.troopNo ?? ''],
    [
      'No. of Cards Issued — Girls',
      `From ${data.cardsIssued.girlsFrom ?? ''} to ${data.cardsIssued.girlsTo ?? ''}`
    ],
    ['Girls ID Card Series Year', data.girlsIdCardSeriesYear ?? ''],
    [
      'No. of Cards Issued — Adults',
      `From ${data.cardsIssued.adultsFrom ?? ''} to ${data.cardsIssued.adultsTo ?? ''}`
    ],
    ['Adults ID Card Series Year', data.adultsIdCardSeriesYear ?? ''],
    [
      'Troop Fee (To be Retained by Council)',
      data.troopFee != null ? `₱${peso(data.troopFee)}` : ''
    ],
    ['Thinking Day Fee (Retained by Council)', `₱${peso(data.remittance.thinkingDayFee)}`]
  ]
  for (const [label, value] of rightBlock) {
    setCell(sheet, `D${rr}`, label, { bold: true, size: 9 })
    setCell(sheet, `F${rr}`, value, { size: 9 })
    rr++
  }
  r = Math.max(r, rr) + 1

  setCell(sheet, `A${r}`, 'ROR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.rorNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.rorDate ? formatDate(data.rorDate) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'DCCR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.dccrNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date of Deposit', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.dateOfDeposit ? formatDate(data.dateOfDeposit) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'Branch Code', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.branchCode ?? '', { size: 9 })
  r += 2

  r = writeSignaturePair(sheet, r, approvalColumns(data))

  applyArialFont(sheet)
  addOuterBox(sheet, SHEET_SPAN, r - 1)

  downloadWorkbook(wb, `${filenameFor(data)}.xlsx`)
}

// ─── PDF ───

export async function buildTroopRegistrationPdfDoc(data: TroopRegistrationExportData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: 'National Headquarters' },
    { text: '901 Padre Faura St., Ermita, Manila' },
    { text: 'TROOP REGISTRATION FORM', bold: true, size: 13 },
    { text: orgHeader.region },
    { text: orgHeader.council }
  ])

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`AGE LEVEL:   ${ageLevelChecklistInline(data.ageLevel)}`, 30, y)
  y += 14

  y = addTable(doc, {
    startY: y,
    head: [],
    body: troopInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
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
      ['Position', 'T/NT', 'RBO', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Beneficiary']
    ],
    body: data.leaders.map((l) => {
      const [mm, dd, yy] = splitBirthdate(l.birthdate)
      return [
        l.position,
        l.trained ? 'T' : 'NT',
        rboStatusLine(l.rboStatus),
        l.name,
        mm,
        dd,
        yy,
        l.beneficiary ?? ''
      ]
    }),
    columnStyles: { 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' } }
  })

  for (const [, members] of groupByPatrol(data.members)) {
    y = addTable(doc, {
      startY: y + 8,
      head: [
        ['Name of Patrol/Cluster:', 'Name', 'MM', 'DD', 'YY', 'Gr/Yr', 'Reg. Status', 'Beneficiary']
      ],
      body: members.map((m, i) => {
        const [mm, dd, yy] = splitBirthdate(m.birthdate)
        return [
          String(i + 1),
          m.fullName,
          mm,
          dd,
          yy,
          m.gradeYear ?? '',
          regStatusLine(m.regStatus),
          m.beneficiary ?? ''
        ]
      }),
      columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } }
    })
  }

  y = addSignatories(doc, y, signatoryColumns(data))

  y += 20
  y = addTable(doc, {
    startY: y,
    head: [['Council Action Remittance', '']],
    body: [
      ['A. GSP Membership Fee — Girls (Re-Reg)', peso(data.remittance.membershipFeeGirlsReReg)],
      ['    Girls (New)', peso(data.remittance.membershipFeeGirlsNew)],
      ['    Leader (Re-Reg)', peso(data.remittance.membershipFeeLeaderReReg)],
      ['    Leader (New)', peso(data.remittance.membershipFeeLeaderNew)],
      ['    Co-Leader (Re-Reg)', peso(data.remittance.membershipFeeCoLeaderReReg)],
      ['    Co-Leader (New)', peso(data.remittance.membershipFeeCoLeaderNew)],
      ['B. Program Development Fund', peso(data.remittance.programDevelopmentFund)],
      [
        'C. Contribution to the Mutual Assistance Fund',
        peso(data.remittance.mutualAssistanceFundContribution)
      ],
      ['D. GS Magazine Troop Subscription Fee', peso(data.remittance.magazineSubscriptionFee)]
    ],
    foot: [['Total Remittance', peso(computeTotalRemittance(data.remittance))]],
    columnStyles: { 1: { halign: 'right' } }
  })

  y = addTable(doc, {
    startY: y + 8,
    head: [],
    body: [
      [
        'Troop No.',
        data.troopNo ?? '',
        'Troop Fee (Council)',
        data.troopFee != null ? peso(data.troopFee) : ''
      ],
      [
        'Cards Issued — Girls',
        `${data.cardsIssued.girlsFrom ?? ''} - ${data.cardsIssued.girlsTo ?? ''}`,
        'Girls ID Series Year',
        data.girlsIdCardSeriesYear ?? ''
      ],
      [
        'Cards Issued — Adults',
        `${data.cardsIssued.adultsFrom ?? ''} - ${data.cardsIssued.adultsTo ?? ''}`,
        'Adults ID Series Year',
        data.adultsIdCardSeriesYear ?? ''
      ],
      ['Thinking Day Fee (Council)', peso(data.remittance.thinkingDayFee), '', ''],
      ['ROR No.', data.rorNo ?? '', 'ROR Date', data.rorDate ? formatDate(data.rorDate) : ''],
      [
        'DCCR No.',
        data.dccrNo ?? '',
        'Date of Deposit',
        data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
      ],
      ['Branch Code', data.branchCode ?? '', '', '']
    ],
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  addSignatories(doc, y, approvalColumns(data))
  return doc
}

export async function exportTroopRegistrationPdf(data: TroopRegistrationExportData) {
  const doc = await buildTroopRegistrationPdfDoc(data)
  savePdf(doc, `${filenameFor(data)}.pdf`)
}

// ─── Word ───

export async function exportTroopRegistrationDocx(data: TroopRegistrationExportData) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: 'National Headquarters' },
      { text: '901 Padre Faura St., Ermita, Manila' },
      { text: 'TROOP REGISTRATION FORM', bold: true, size: 26 },
      { text: orgHeader.region },
      { text: orgHeader.council }
    ])),
    new Paragraph({
      alignment: 'center',
      children: [
        new TextRun({ text: `AGE LEVEL:   ${ageLevelChecklistInline(data.ageLevel)}`, size: 16 })
      ]
    }),
    spacer(),
    buildTable(
      [],
      troopInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
        labelA,
        valueA,
        labelB,
        valueB
      ])
    ),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'Registration of Leaders', bold: true })] }),
    buildTable(
      ['Position', 'T/NT', 'RBO', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Beneficiary'],
      data.leaders.map((l) => {
        const [mm, dd, yy] = splitBirthdate(l.birthdate)
        return [
          l.position,
          l.trained ? 'T' : 'NT',
          rboStatusLine(l.rboStatus),
          l.name,
          mm,
          dd,
          yy,
          l.beneficiary ?? ''
        ]
      })
    ),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'Registration of Troop Members', bold: true })]
    }),
    ...groupByPatrol(data.members).flatMap(([, members]) => [
      new Paragraph({
        spacing: { before: 120 },
        children: [new TextRun({ text: 'Name of Patrol/Cluster:', bold: true, italics: true })]
      }),
      buildTable(
        ['#', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Gr/Yr', 'Reg. Status', 'Beneficiary'],
        members.map((m, i) => {
          const [mm, dd, yy] = splitBirthdate(m.birthdate)
          return [
            String(i + 1),
            m.fullName,
            mm,
            dd,
            yy,
            m.gradeYear ?? '',
            regStatusLine(m.regStatus),
            m.beneficiary ?? ''
          ]
        })
      )
    ]),
    spacer(),
    signatoryTable(signatoryColumns(data)),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'Council Action Remittance', bold: true })] }),
    buildTable(
      [],
      [
        ['A. GSP Membership Fee — Girls (Re-Reg)', peso(data.remittance.membershipFeeGirlsReReg)],
        ['    Girls (New)', peso(data.remittance.membershipFeeGirlsNew)],
        ['    Leader (Re-Reg)', peso(data.remittance.membershipFeeLeaderReReg)],
        ['    Leader (New)', peso(data.remittance.membershipFeeLeaderNew)],
        ['    Co-Leader (Re-Reg)', peso(data.remittance.membershipFeeCoLeaderReReg)],
        ['    Co-Leader (New)', peso(data.remittance.membershipFeeCoLeaderNew)],
        ['B. Program Development Fund', peso(data.remittance.programDevelopmentFund)],
        [
          'C. Contribution to the Mutual Assistance Fund',
          peso(data.remittance.mutualAssistanceFundContribution)
        ],
        ['D. GS Magazine Troop Subscription Fee', peso(data.remittance.magazineSubscriptionFee)]
      ],
      ['Total Remittance', peso(computeTotalRemittance(data.remittance))]
    ),
    spacer(),
    buildTable(
      [],
      [
        [
          'Troop No.',
          data.troopNo ?? '',
          'Troop Fee (Council)',
          data.troopFee != null ? peso(data.troopFee) : ''
        ],
        [
          'Cards Issued — Girls',
          `${data.cardsIssued.girlsFrom ?? ''} - ${data.cardsIssued.girlsTo ?? ''}`,
          'Girls ID Series Year',
          data.girlsIdCardSeriesYear ?? ''
        ],
        [
          'Cards Issued — Adults',
          `${data.cardsIssued.adultsFrom ?? ''} - ${data.cardsIssued.adultsTo ?? ''}`,
          'Adults ID Series Year',
          data.adultsIdCardSeriesYear ?? ''
        ],
        ['Thinking Day Fee (Council)', peso(data.remittance.thinkingDayFee), '', ''],
        ['ROR No.', data.rorNo ?? '', 'ROR Date', data.rorDate ? formatDate(data.rorDate) : ''],
        [
          'DCCR No.',
          data.dccrNo ?? '',
          'Date of Deposit',
          data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
        ],
        ['Branch Code', data.branchCode ?? '', '', '']
      ]
    ),
    spacer(),
    signatoryTable(approvalColumns(data))
  ]

  await saveDocx(children, `${filenameFor(data)}.docx`)
}
