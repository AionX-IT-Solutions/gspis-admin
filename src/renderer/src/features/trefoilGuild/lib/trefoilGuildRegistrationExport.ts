import { Paragraph, TextRun } from 'docx'
import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import type { TrefoilGuild } from '../types/trefoilGuild.types'
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
} from '../types/trefoilGuildRegistration.types'

// Decoupled from the persisted `TrefoilGuildRegistration` record (trefoilGuildId only) so the
// same builders work from either a saved record (looked up + joined with its TrefoilGuild) or
// the in-progress form state (which already holds the full guild object) — same pattern as
// features/barangayCommittee/lib/barangayCommitteeRegistrationExport.ts.
export interface TrefoilGuildRegistrationExportData {
  guild: TrefoilGuild
  schoolYear: string
  dateApplied: string
  registrationStatus: 'new' | 're-registered'
  members: RegistrationMember[]
  submittedByName: string
  submittedByDate?: string
  remittance: RegistrationRemittance
  tgGroupFee?: number
  orNo?: string
  orDate?: string
  dccrNo?: string
  dateOfDeposit?: string
  branchCode?: string
  cardsIssued: CardsIssued
  processedByName?: string
  approvedByName?: string
}

function peso(n: number | undefined): string {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function registrationStatusLine(status: 'new' | 're-registered'): string {
  return `[${status === 're-registered' ? 'X' : ' '}] Re-reg    [${status === 'new' ? 'X' : ' '}] New`
}

// The printed form's "Members" remittance line reads "Members: Re-reg____ New_____   P____"
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

// The real paper form pre-prints these exact position rows (Chairman/Secretary/Treasurer)
// before its blank "Member" rows — mirrors District/Barangay Committee's own FIXED_*_POSITIONS
// for the same reason: the booklet's row labels are fixed by the form itself, not derived
// from whatever was typed in. A filing with nobody in a given position still shows that row,
// blank, matching the unfilled booklet. Trefoil Guild's own form has no Vice-Chairman row,
// unlike Barangay/District Committee's.
const FIXED_TG_POSITIONS = ['Chairman', 'Secretary', 'Treasurer'] as const

// Matches each fixed position back to its member (case-insensitively, first match only), then
// appends everyone else as "Member" rows.
function orderedMemberRows(members: RegistrationMember[]): RegistrationMember[] {
  const used = new Set<number>()
  const fixedRows: RegistrationMember[] = FIXED_TG_POSITIONS.map((position) => {
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

// The paper form's own top signature row pairs "Submitted By" (TG Chairman) with
// "Processed by" (Registration Processor) side by side — no separate "Noted by" step.
function signatoryColumns(data: TrefoilGuildRegistrationExportData): PdfSignatoryColumn[] {
  return [
    { label: 'SUBMITTED BY:', name: data.submittedByName.toUpperCase(), role: 'TG Chairman' },
    {
      label: 'PROCESSED BY:',
      name: (data.processedByName ?? '').toUpperCase(),
      role: 'Registration Processor'
    }
  ]
}

// "Approved by" stands alone at the bottom of the form (its left side is the Council Action
// Remittance list, not a paired signatory) — a single-column signature block.
function approvalColumns(data: TrefoilGuildRegistrationExportData): PdfSignatoryColumn[] {
  return [
    {
      label: 'APPROVED BY:',
      name: (data.approvedByName || signatories.councilExecutive).toUpperCase(),
      role: 'Council Executive'
    }
  ]
}

function filenameFor(data: TrefoilGuildRegistrationExportData): string {
  return `TrefoilGuildRegistration_${data.guild.name}_${data.schoolYear}`.replace(
    /[^0-9a-z_-]/gi,
    '_'
  )
}

// Shared guild-header field pairs — row order/pairing follows the reference paper form
// exactly (Trefoil Guild Name/Number, Trefoil Guild Address alone, Tel. No./Email Address).
// Registration Status/Date Applied/School Year follow, same trailing shape as District/
// Barangay Committee's own committeeInfoRows.
function guildInfoRows(
  data: TrefoilGuildRegistrationExportData
): [string, string, string, string][] {
  return [
    ['Trefoil Guild Name', data.guild.name, 'Trefoil Guild Number', data.guild.guildNumber ?? ''],
    ['Trefoil Guild Address', data.guild.address ?? '', '', ''],
    ['Tel. No.', data.guild.telNo ?? '', 'Email Address', data.guild.email ?? ''],
    [
      'Registration Status',
      registrationStatusLine(data.registrationStatus),
      'Date Applied',
      data.dateApplied ? formatDate(data.dateApplied) : ''
    ],
    ['School Year', data.schoolYear, '', '']
  ]
}

// ─── Excel — mirrors the boxed-form pattern features/barangayCommittee/lib/
// barangayCommitteeRegistrationExport.ts established (itself mirroring voucherExcelExport.ts):
// raw cell addressing + ruled sub-boxes, not a generic tabular report. ───

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin' }
// A, B-C (Name), D-F (Birthdate MM/DD/YY), G (Reg. Status), H (Beneficiary).
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
  // "National Copy" label both have somewhere to sit without overlapping the title.
  setCell(sheet, 'A1', 'No.', { bold: true, size: 9 })
  setCell(sheet, 'B1', 'Series', { bold: true, size: 9 })
  setCell(
    sheet,
    `${String.fromCharCode(64 + SHEET_SPAN)}1`,
    'National Copy',
    { italic: true, size: 9 },
    true
  )
  const lines: { text: string; bold?: boolean; size?: number }[] = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: 'National Headquarters', size: 10 },
    { text: '901 Padre Faura St., Ermita, Manila', size: 9 },
    { text: 'TREFOIL GUILD REGISTRATION FORM', bold: true, size: 14 },
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

export async function exportTrefoilGuildRegistrationExcel(
  data: TrefoilGuildRegistrationExportData
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Trefoil Guild Registration')
  sheet.columns = Array.from({ length: SHEET_SPAN }, () => ({ width: 17 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet)

  let r = 8
  for (const [labelA, valueA, labelB, valueB] of guildInfoRows(data)) {
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

  setCell(sheet, `A${r}`, 'REGISTRATION OF GUILD MEMBERS', SECTION_FONT)
  r++
  addRowRule(sheet, r, SHEET_SPAN, 'top')
  setCell(sheet, `A${r}`, 'Position', SECTION_FONT)
  sheet.mergeCells(r, 2, r, 3)
  setCell(sheet, `B${r}`, 'Name (Last, First, M.I.)', SECTION_FONT)
  sheet.mergeCells(r, 4, r, 6)
  setCell(sheet, `D${r}`, 'Birthdate', SECTION_FONT, true)
  setCell(sheet, `G${r}`, 'Reg. Status', SECTION_FONT, true)
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
    setCell(sheet, `G${r}`, member.regStatus === 'new' ? 'New' : 'Re-Reg', { size: 9 }, true)
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

  // The T.G. Group Fee is the one figure the Council fully retains — its own row right below
  // Total Remittance, matching the paper form.
  setCell(sheet, `A${r}`, 'T.G. Group Fee (To be retained by Council)', { bold: true, size: 9 })
  setCell(sheet, `C${r}`, data.tgGroupFee ?? '', { size: 9 }, true)
  if (data.tgGroupFee != null) sheet.getCell(`C${r}`).numFmt = '"₱"#,##0.00'
  r++

  setCell(sheet, `A${r}`, 'Paid under O.R. No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.orNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.orDate ? formatDate(data.orDate) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'DCCR No.', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.dccrNo ?? '', { size: 9 })
  setCell(sheet, `D${r}`, 'Date of Deposit', { bold: true, size: 9 })
  setCell(sheet, `E${r}`, data.dateOfDeposit ? formatDate(data.dateOfDeposit) : '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'Branch Code', { bold: true, size: 9 })
  setCell(sheet, `B${r}`, data.branchCode ?? '', { size: 9 })
  r++
  setCell(sheet, `A${r}`, 'No. of Cards Issued', { bold: true, size: 9 })
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

export async function buildTrefoilGuildRegistrationPdfDoc(
  data: TrefoilGuildRegistrationExportData
) {
  const doc = createPdf('portrait')
  // Left/right corner line — the control-number block belongs at the left margin and
  // "(National Copy)" at the right, matching the paper form, not centered together.
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('No.: __________   Series: __________', margin, 20)
  doc.text('(National Copy)', pageWidth - margin, 20, { align: 'right' })

  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: 'National Headquarters' },
    { text: '901 Padre Faura St., Ermita, Manila' },
    { text: 'TREFOIL GUILD REGISTRATION FORM', bold: true, size: 13 },
    { text: orgHeader.region },
    { text: orgHeader.council }
  ])

  y = addTable(doc, {
    startY: y,
    head: [],
    body: guildInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
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
      ['Position', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Reg. Status', 'Beneficiary']
    ],
    body: orderedMemberRows(data.members).map((m) => {
      const [mm, dd, yy] = splitBirthdate(m.birthdate)
      return [
        m.position,
        m.fullName,
        mm,
        dd,
        yy,
        m.regStatus === 'new' ? 'New' : 'Re-Reg',
        m.beneficiary ?? ''
      ]
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

  // The T.G. Group Fee is the one figure the Council fully retains — its own row right below
  // Total Remittance, matching the paper form.
  y = addTable(doc, {
    startY: y + 8,
    head: [],
    body: [
      [
        'T.G. Group Fee (To be retained by Council)',
        data.tgGroupFee != null ? peso(data.tgGroupFee) : ''
      ]
    ],
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
  })

  y = addTable(doc, {
    startY: y + 4,
    head: [],
    body: [
      ['Paid under O.R. No.', data.orNo ?? '', 'Date', data.orDate ? formatDate(data.orDate) : ''],
      [
        'DCCR No.',
        data.dccrNo ?? '',
        'Date of Deposit',
        data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
      ],
      ['Branch Code', data.branchCode ?? '', '', ''],
      [
        'No. of Cards Issued',
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

export async function exportTrefoilGuildRegistrationPdf(data: TrefoilGuildRegistrationExportData) {
  const doc = await buildTrefoilGuildRegistrationPdfDoc(data)
  savePdf(doc, `${filenameFor(data)}.pdf`)
}

// ─── Word ───

export async function exportTrefoilGuildRegistrationDocx(data: TrefoilGuildRegistrationExportData) {
  const children = [
    // Left/right corner line — the control-number block belongs at the left margin and
    // "(National Copy)" at the right, matching the paper form, not centered together.
    headerLineSplit('No.: __________   Series: __________', '(National Copy)'),
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: 'National Headquarters' },
      { text: '901 Padre Faura St., Ermita, Manila' },
      { text: 'TREFOIL GUILD REGISTRATION FORM', bold: true, size: 26 },
      { text: orgHeader.region },
      { text: orgHeader.council }
    ])),
    spacer(),
    buildTable(
      [],
      guildInfoRows(data).map(([labelA, valueA, labelB, valueB]) => [
        labelA,
        valueA,
        labelB,
        valueB
      ])
    ),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'Registration of Guild Members', bold: true })]
    }),
    buildTable(
      ['Position', 'Name (Last, First, M.I.)', 'MM', 'DD', 'YY', 'Reg. Status', 'Beneficiary'],
      orderedMemberRows(data.members).map((m) => {
        const [mm, dd, yy] = splitBirthdate(m.birthdate)
        return [
          m.position,
          m.fullName,
          mm,
          dd,
          yy,
          m.regStatus === 'new' ? 'New' : 'Re-Reg',
          m.beneficiary ?? ''
        ]
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
          'T.G. Group Fee (To be retained by Council)',
          data.tgGroupFee != null ? peso(data.tgGroupFee) : ''
        ]
      ]
    ),
    spacer(),
    buildTable(
      [],
      [
        [
          'Paid under O.R. No.',
          data.orNo ?? '',
          'Date',
          data.orDate ? formatDate(data.orDate) : ''
        ],
        [
          'DCCR No.',
          data.dccrNo ?? '',
          'Date of Deposit',
          data.dateOfDeposit ? formatDate(data.dateOfDeposit) : ''
        ],
        ['Branch Code', data.branchCode ?? '', '', ''],
        [
          'No. of Cards Issued',
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
