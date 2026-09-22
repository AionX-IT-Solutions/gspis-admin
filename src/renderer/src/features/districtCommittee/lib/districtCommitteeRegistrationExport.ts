import { Paragraph, TextRun } from 'docx'
import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import type { DistrictCommittee } from '../types/districtCommittee.types'
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
  headerLineSplit,
  buildTable,
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import type {
  CardsIssued,
  RegistrationMember,
  RegistrationRemittance
} from '../types/districtCommitteeRegistration.types'

// Decoupled from the persisted `DistrictCommitteeRegistration` record (districtCommitteeId
// only) so the same builders work from either a saved record (looked up + joined with its
// DistrictCommittee) or the in-progress form state (which already holds the full committee
// object) — same pattern as features/troopRegistration/lib/troopRegistrationExport.ts.
export interface DistrictCommitteeRegistrationExportData {
  committee: DistrictCommittee
  schoolYear: string
  dateApplied: string
  registrationStatus: 'new' | 're-registered'
  members: RegistrationMember[]
  submittedByName: string
  submittedByDate?: string
  notedByName?: string
  notedByDate?: string
  remittance: RegistrationRemittance
  dcGroupFee?: number
  rorNo?: string
  rorDate?: string
  dccrNo?: string
  dateOfDeposit?: string
  dccrSumNo?: string
  branchCode?: string
  cardsIssued: CardsIssued
  processedByName?: string
  approvedByName?: string
}

function peso(n: number | undefined): string {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function registrationStatusLine(status: 'new' | 're-registered'): string {
  return `[${status === 're-registered' ? 'X' : ' '}] Re-registered    [${status === 'new' ? 'X' : ' '}] New`
}

// The printed form's "Members" remittance line reads "Members : Re-reg____ New_____   P____"
// — Re-reg/New there are headcounts (for hand-tallying off the roster above), not two
// separate peso amounts, and only ONE peso field follows. Derived live from `members[]`
// rather than stored, so it can never drift from who's actually on the filing.
function memberCounts(members: RegistrationMember[]): { reReg: number; new: number } {
  let reReg = 0
  let newCount = 0
  for (const m of members) {
    if (m.regStatus === 're-reg') reReg++
    else newCount++
  }
  return { reReg, new: newCount }
}

function membersLineLabel(members: RegistrationMember[]): string {
  const counts = memberCounts(members)
  return `Members — Re-Reg ${counts.reReg}, New ${counts.new}`
}

// The real paper form pre-prints these exact position rows (Chairman through DFA) before its
// blank "Member" rows — mirrors the Acknowledgment Receipt's fixedRows pattern (see
// shared/lib/receiptCategories.ts) for the same reason: the booklet's row labels are fixed by
// the form itself, not derived from whatever was typed in. A filing with nobody in a given
// position still shows that row, blank, matching the unfilled booklet.
const FIXED_DC_POSITIONS = [
  'Chairman',
  'Vice-Chairman',
  'Secretary',
  'Treasurer',
  'Dist. Commissioner',
  'Troop Organizer',
  'Program Officer',
  'DFA'
] as const

// Matches each fixed position back to its member (case-insensitively, first match only), then
// appends everyone else as "Member" rows — same two-part shape as the paper form's fixed
// leadership rows followed by open "Member" rows.
function orderedMemberRows(members: RegistrationMember[]): RegistrationMember[] {
  const used = new Set<number>()
  const fixedRows: RegistrationMember[] = FIXED_DC_POSITIONS.map((position) => {
    const idx = members.findIndex(
      (m, i) => !used.has(i) && m.position.trim().toLowerCase() === position.toLowerCase()
    )
    if (idx === -1) return { position, fullName: '', regStatus: 'new' as const }
    used.add(idx)
    return members[idx]
  })
  const memberRows = members
    .filter((_, i) => !used.has(i))
    .map((m) => ({ ...m, position: m.position.trim() || 'Member' }))
  return [...fixedRows, ...memberRows]
}

/** The paper form's Birthdate column is itself split into MM/DD/YY sub-columns rather than
 *  one free-text date — same split for every export format. */
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

function signatoryColumns(data: DistrictCommitteeRegistrationExportData): PdfSignatoryColumn[] {
  return [
    {
      label: 'SUBMITTED BY:',
      name: data.submittedByName.toUpperCase(),
      role: 'District Field Adviser'
    },
    {
      label: 'NOTED BY:',
      name: (data.notedByName ?? '').toUpperCase(),
      role: 'Dist. Com. Chairman/Dist. Commissioner'
    }
  ]
}

function approvalColumns(data: DistrictCommitteeRegistrationExportData): PdfSignatoryColumn[] {
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

function filenameFor(data: DistrictCommitteeRegistrationExportData): string {
  return `DistrictCommitteeRegistration_${data.committee.name}_${data.schoolYear}`.replace(
    /[^0-9a-z_-]/gi,
    '_'
  )
}

// Shared committee-header field pairs — row order/pairing follows the reference paper form
// exactly (District Committee Name/Address on one line, District Committee Tel. No. alone on
// its own, Registration Status checkboxes alone on its own — the form has nothing paired
// alongside either of the last two). Region/Council are already printed once, centered, right
// under the form title (see addCenteredHeader below) — not repeated here. Date Applied/School
// Year have no slot on the paper form itself but are real data this app needs, so they're
// tucked into the otherwise-empty right side of the Tel. No./Registration Status rows rather
// than being dropped.
function committeeInfoRows(
  data: DistrictCommitteeRegistrationExportData
): [string, string, string, string][] {
  return [
    ['District Committee Name', data.committee.name, 'Address', data.committee.address ?? ''],
    [
      'District Committee Tel. No.',
      data.committee.telNo ?? '',
      'Date Applied',
      data.dateApplied ? formatDate(data.dateApplied) : ''
    ],
    [
      'Registration Status',
      registrationStatusLine(data.registrationStatus),
      'School Year',
      data.schoolYear
    ]
  ]
}

// ─── Excel — mirrors the boxed-form pattern features/troopRegistration/lib/
// troopRegistrationExport.ts established (itself mirroring voucherExcelExport.ts): raw cell
// addressing + ruled sub-boxes, not a generic tabular report. ───

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin' }
// A, B-C (Name), D-F (Birthdate MM/DD/YY), G (Group Represented), H (Beneficiary).
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

const SECTION_FONT = { bold: true, size: 10 }
const SIGNATURE_LABEL_FONT = { bold: true, size: 9 }
const SIGNATURE_NAME_FONT = { bold: true, underline: true, size: 9 }
const SIGNATURE_ROLE_FONT = { size: 9 }

function addCenteredHeader(sheet: ExcelJS.Worksheet) {
  // Row 1 stays outside the centered-title merge below (which starts at row 2) so the
  // paper form's own top-left "No. / Series ____" control-number block and top-right
  // "Regional Copy" label both have somewhere to sit without overlapping the title.
  setCell(sheet, 'A1', 'No.', { bold: true, size: 9 })
  setCell(sheet, 'B1', 'Series', { bold: true, size: 9 })
  setCell(
    sheet,
    `${String.fromCharCode(64 + SHEET_SPAN)}1`,
    'Regional Copy',
    { italic: true, size: 9 },
    true
  )
  const lines: { text: string; bold?: boolean; size?: number }[] = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: 'National Headquarters', size: 10 },
    { text: '901 Padre Faura St., Ermita, 1000 Manila', size: 9 },
    { text: 'DISTRICT COMMITTEE REGISTRATION FORM', bold: true, size: 14 },
    { text: orgHeader.region, size: 10 },
    { text: orgHeader.council, size: 10 }
  ]
  lines.forEach((line, i) => {
    const row = i + 2
    sheet.mergeCells(row, 1, row, SHEET_SPAN)
    setCell(sheet, `A${row}`, line.text, { bold: !!line.bold, size: line.size ?? 10 }, true)
  })
  sheet.getRow(5).height = 22
  addRowRule(sheet, 7, SHEET_SPAN, 'bottom')
}

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

export async function exportDistrictCommitteeRegistrationExcel(
  data: DistrictCommitteeRegistrationExportData
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('District Committee Registration')
  sheet.columns = Array.from({ length: SHEET_SPAN }, () => ({ width: 17 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet)

  let r = 8
  for (const [labelA, valueA, labelB, valueB] of committeeInfoRows(data)) {
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

  setCell(sheet, `A${r}`, 'REGISTRATION OF COMMITTEE MEMBERS', SECTION_FONT)
  r++
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  setCell(sheet, `A${r}`, 'Position', SECTION_FONT)
  sheet.mergeCells(r, 2, r, 3)
  setCell(sheet, `B${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
  sheet.mergeCells(r, 4, r, 6)
  setCell(sheet, `D${r}`, 'Birthdate', SECTION_FONT, true)
  setCell(sheet, `G${r}`, 'Group Represented', SECTION_FONT)
  setCell(sheet, `H${r}`, 'Beneficiary', SECTION_FONT)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  setCell(sheet, `D${r}`, 'MM', SECTION_FONT, true)
  setCell(sheet, `E${r}`, 'DD', SECTION_FONT, true)
  setCell(sheet, `F${r}`, 'YY', SECTION_FONT, true)
  addRowRule(sheet, r, SHEET_SPAN, 'bottom')
  r++
  for (const member of orderedMemberRows(data.members)) {
    const [mm, dd, yy] = splitBirthdate(member.birthdate)
    setCell(sheet, `A${r}`, member.position, { size: 9 })
    sheet.mergeCells(r, 2, r, 3)
    setCell(sheet, `B${r}`, member.fullName, { size: 9 })
    setCell(sheet, `D${r}`, mm, { size: 9 }, true)
    setCell(sheet, `E${r}`, dd, { size: 9 }, true)
    setCell(sheet, `F${r}`, yy, { size: 9 }, true)
    setCell(sheet, `G${r}`, member.groupRepresented ?? '', { size: 9 })
    setCell(sheet, `H${r}`, member.beneficiary ?? '', { size: 9 })
    r++
  }
  addRowRule(sheet, r - 1, SHEET_SPAN, 'bottom')
  r += 1

  r = writeSignaturePair(sheet, r, signatoryColumns(data))
  r += 1

  setCell(sheet, `A${r}`, 'COUNCIL ACTION REMITTANCE', SECTION_FONT)
  r++
  const remittanceRows: [string, number][] = [
    [membersLineLabel(data.members), data.remittance.memberFeeTotal],
    ['Program Development Fund', data.remittance.programDevelopmentFund],
    ['Contribution to the Mutual Assistance Fund', data.remittance.mutualAssistanceFundContribution]
  ]
  for (const [label, amount] of remittanceRows) {
    setCell(sheet, `A${r}`, label, { size: 9 })
    setCell(sheet, `C${r}`, amount, { size: 9 }, true)
    sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
    r++
  }
  setCell(sheet, `A${r}`, 'Total Remittance', { bold: true, size: 10 })
  setCell(sheet, `C${r}`, data.remittance.totalRemittance, { bold: true, size: 10 }, true)
  sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
  addRowRule(sheet, r, 3, 'top')
  r++

  // The D.C. Group Fee is the one figure the Council fully retains (see totalRemittance's
  // doc comment) — its own row right below Total Remittance, matching the paper form, rather
  // than folded into that total or set off in a separate side box.
  setCell(sheet, `A${r}`, 'D.C. Group Fee (To be retained by Council)', { bold: true, size: 9 })
  setCell(sheet, `C${r}`, data.dcGroupFee ?? '', { size: 9 }, true)
  if (data.dcGroupFee != null) sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
  r++

  setCell(sheet, `A${r}`, 'Paid under R.O.R. No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.rorNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.rorDate ? formatDate(data.rorDate) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'DCCR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.dccrNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date of Deposit', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.dateOfDeposit ? formatDate(data.dateOfDeposit) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'DCCR Sum No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.dccrSumNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Branch Code', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.branchCode ?? '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'Adult Cards Issued', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.cardsIssued.adultsFrom ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'To', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.cardsIssued.adultsTo ?? '', { size: 9 })
  r += 2

  r = writeSignaturePair(sheet, r, approvalColumns(data))

  applyArialFont(sheet)
  addOuterBox(sheet, SHEET_SPAN, r - 1)

  downloadWorkbook(wb, `${filenameFor(data)}.xlsx`)
}

// ─── PDF ───

export async function buildDistrictCommitteeRegistrationPdfDoc(
  data: DistrictCommitteeRegistrationExportData
) {
  const doc = createPdf('portrait')
  // Left/right corner line — the control-number block belongs at the left margin and
  // "(Regional Copy)" at the right, matching the paper form, not centered together as one
  // string.
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('No.: __________   Series: __________', margin, 20)
  doc.text('(Regional Copy)', pageWidth - margin, 20, { align: 'right' })

  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: 'National Headquarters' },
    { text: '901 Padre Faura St., Ermita, 1000 Manila' },
    { text: 'DISTRICT COMMITTEE REGISTRATION FORM', bold: true, size: 13 },
    { text: orgHeader.region },
    { text: orgHeader.council }
  ])

  y = addTable(doc, {
    startY: y,
    head: [],
    body: committeeInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
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
      ['Position', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Group Represented', 'Beneficiary']
    ],
    body: orderedMemberRows(data.members).map((m) => {
      const [mm, dd, yy] = splitBirthdate(m.birthdate)
      return [m.position, m.fullName, mm, dd, yy, m.groupRepresented ?? '', m.beneficiary ?? '']
    }),
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } }
  })

  y = addSignatories(doc, y, signatoryColumns(data))

  y += 20
  y = addTable(doc, {
    startY: y,
    head: [['Council Action Remittance', '']],
    body: [
      [membersLineLabel(data.members), peso(data.remittance.memberFeeTotal)],
      ['Program Development Fund', peso(data.remittance.programDevelopmentFund)],
      [
        'Contribution to the Mutual Assistance Fund',
        peso(data.remittance.mutualAssistanceFundContribution)
      ]
    ],
    foot: [['Total Remittance', peso(data.remittance.totalRemittance)]],
    columnStyles: { 1: { halign: 'right' } }
  })

  // The D.C. Group Fee is the one figure the Council fully retains — its own row right below
  // Total Remittance, matching the paper form, rather than paired with Adult Cards Issued.
  y = addTable(doc, {
    startY: y + 8,
    head: [],
    body: [
      [
        'D.C. Group Fee (To be retained by Council)',
        data.dcGroupFee != null ? peso(data.dcGroupFee) : ''
      ]
    ],
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
  })

  y = addTable(doc, {
    startY: y + 4,
    head: [],
    body: [
      [
        'Paid under R.O.R. No.',
        data.rorNo ?? '',
        'Date',
        data.rorDate ? formatDate(data.rorDate) : ''
      ],
      [
        'DCCR No.',
        data.dccrNo ?? '',
        'Date of Deposit',
        data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
      ],
      ['DCCR Sum No.', data.dccrSumNo ?? '', 'Branch Code', data.branchCode ?? ''],
      [
        'Adult Cards Issued',
        data.cardsIssued.adultsFrom ?? '',
        'To',
        data.cardsIssued.adultsTo ?? ''
      ]
    ],
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  addSignatories(doc, y, approvalColumns(data))
  return doc
}

export async function exportDistrictCommitteeRegistrationPdf(
  data: DistrictCommitteeRegistrationExportData
) {
  const doc = await buildDistrictCommitteeRegistrationPdfDoc(data)
  savePdf(doc, `${filenameFor(data)}.pdf`)
}

// ─── Word ───

export async function exportDistrictCommitteeRegistrationDocx(
  data: DistrictCommitteeRegistrationExportData
) {
  const children = [
    // Left/right corner line — the control-number block belongs at the left margin and
    // "(Regional Copy)" at the right, matching the paper form, not centered together.
    headerLineSplit('No.: __________   Series: __________', '(Regional Copy)'),
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: 'National Headquarters' },
      { text: '901 Padre Faura St., Ermita, 1000 Manila' },
      { text: 'DISTRICT COMMITTEE REGISTRATION FORM', bold: true, size: 26 },
      { text: orgHeader.region },
      { text: orgHeader.council }
    ])),
    spacer(),
    buildTable(
      [],
      committeeInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
        labelA,
        valueA,
        labelB,
        valueB
      ])
    ),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'Registration of Committee Members', bold: true })]
    }),
    buildTable(
      [
        'Position',
        'Name (Last, First, M.I.)',
        'MM',
        'DD',
        'YY',
        'Group Represented',
        'Beneficiary'
      ],
      orderedMemberRows(data.members).map((m) => {
        const [mm, dd, yy] = splitBirthdate(m.birthdate)
        return [m.position, m.fullName, mm, dd, yy, m.groupRepresented ?? '', m.beneficiary ?? '']
      })
    ),
    spacer(),
    signatoryTable(signatoryColumns(data)),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'Council Action Remittance', bold: true })] }),
    buildTable(
      [],
      [
        [membersLineLabel(data.members), peso(data.remittance.memberFeeTotal)],
        ['Program Development Fund', peso(data.remittance.programDevelopmentFund)],
        [
          'Contribution to the Mutual Assistance Fund',
          peso(data.remittance.mutualAssistanceFundContribution)
        ]
      ],
      ['Total Remittance', peso(data.remittance.totalRemittance)]
    ),
    spacer(),
    buildTable(
      [],
      [
        [
          'D.C. Group Fee (To be retained by Council)',
          data.dcGroupFee != null ? peso(data.dcGroupFee) : ''
        ]
      ]
    ),
    spacer(),
    buildTable(
      [],
      [
        [
          'Paid under R.O.R. No.',
          data.rorNo ?? '',
          'Date',
          data.rorDate ? formatDate(data.rorDate) : ''
        ],
        [
          'DCCR No.',
          data.dccrNo ?? '',
          'Date of Deposit',
          data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
        ],
        ['DCCR Sum No.', data.dccrSumNo ?? '', 'Branch Code', data.branchCode ?? ''],
        [
          'Adult Cards Issued',
          data.cardsIssued.adultsFrom ?? '',
          'To',
          data.cardsIssued.adultsTo ?? ''
        ]
      ]
    ),
    spacer(),
    signatoryTable(approvalColumns(data))
  ]

  await saveDocx(children, `${filenameFor(data)}.docx`)
}
