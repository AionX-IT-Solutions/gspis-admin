import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import {
  createPdf,
  addHeaderLines,
  addTable,
  addSignatories,
  savePdf,
  type PdfSignatoryColumn
} from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  buildTable,
  signatoryTable,
  spacer,
  saveDocx,
  type DocxSignatoryColumn
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { PERSON_TAG_COLUMNS, type PersonTag } from '../types/membershipDailyCollection.types'

const PERSON_TAGS: PersonTag[] = PERSON_TAG_COLUMNS.map((c) => c.key)

/** One printable line of the Daily Cash Collection Report — an auto/manual
 *  MembershipCollectionRow already merged with its (optional) deposit/remarks override and
 *  formatted for display, see useMembershipDailyCollectionReport.ts's `reportData()`. */
export interface MembershipCollectionExportRow {
  payor: string
  troopNo: string
  district: string
  regFormNo: string
  rorDate: string
  rorNo: string
  amount: number
  counts: Partial<Record<PersonTag, number>>
  totalDeposited: number
  dateDeposited: string
  remarks: string
}

export interface MembershipDailyCollectionData {
  dateLabel: string
  preparedBy: string
  rows: MembershipCollectionExportRow[]
  totalCashCollection: number
  totalDeposited: number
  underOverDeposit: number
  bankBranchCode: string
  remarks: string
}

function downloadWorkbook(wb: ExcelJS.Workbook, filename: string): void {
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

const LEADING_HEAD = [
  'Payor',
  'Troop No.',
  'District',
  'Reg. Form No.',
  'R.O.R. Date',
  'R.O.R. No.',
  'Amount'
]
const TRAILING_HEAD = [
  'Total Amount Collected',
  'Total Amount Deposited',
  'Date Deposited',
  'Remarks'
]
const FLAT_HEAD = [...LEADING_HEAD, ...PERSON_TAGS, ...TRAILING_HEAD]

function rowCells(r: MembershipCollectionExportRow): (string | number)[] {
  return [
    r.payor,
    r.troopNo,
    r.district,
    r.regFormNo,
    r.rorDate,
    r.rorNo,
    r.amount.toFixed(2),
    ...PERSON_TAGS.map((tag) => (r.counts[tag] ? String(r.counts[tag]) : '')),
    r.amount.toFixed(2),
    r.totalDeposited ? r.totalDeposited.toFixed(2) : '',
    r.dateDeposited || '',
    r.remarks || ''
  ]
}

function totalsOf(rows: MembershipCollectionExportRow[]) {
  const counts: Partial<Record<PersonTag, number>> = {}
  let amount = 0
  let deposited = 0
  for (const r of rows) {
    amount += r.amount
    deposited += r.totalDeposited
    for (const tag of PERSON_TAGS) {
      if (r.counts[tag]) counts[tag] = (counts[tag] ?? 0) + (r.counts[tag] ?? 0)
    }
  }
  return { counts, amount, deposited }
}

function footCells(data: MembershipDailyCollectionData): (string | number)[] {
  const t = totalsOf(data.rows)
  return [
    '',
    'TOTALS',
    '',
    '',
    '',
    '',
    t.amount.toFixed(2),
    ...PERSON_TAGS.map((tag) => (t.counts[tag] ? String(t.counts[tag]) : '')),
    t.amount.toFixed(2),
    t.deposited.toFixed(2),
    '',
    ''
  ]
}

const headerLines = (dateLabel: string) => [
  { text: orgHeader.orgName, bold: true },
  { text: orgHeader.council },
  { text: 'Daily Cash Collection Report', bold: true, size: 12 },
  { text: dateLabel }
]

/** Prepared By (Registration Processor/Cashier) / Approved By (Council Executive) / Noted By
 *  (Membership-Finance Division) — matches the paper form's own three-signature footer,
 *  distinct from Accounting's own two-tier Prepared/Certified + Verified Correct block. Noted
 *  By has no name on file (unlike the Council Executive) so it's left blank for the signer to
 *  fill in by hand, same as the paper form itself. */
function reportSignatories(preparedBy: string) {
  return [
    {
      label: 'Prepared By:',
      name: preparedBy.toUpperCase(),
      role: 'Registration Processor / Cashier'
    },
    {
      label: 'Approved By:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    },
    { label: 'Noted By:', name: '', role: 'Membership / Finance Division' }
  ]
}

function summaryLines(data: MembershipDailyCollectionData): [string, string][] {
  return [
    ['Total Cash Collection for the Day', data.totalCashCollection.toFixed(2)],
    ['Less Total Deposit for the Day', data.totalDeposited.toFixed(2)],
    ['(Under) Over Deposit', data.underOverDeposit.toFixed(2)],
    ['Bank Branch Code', data.bankBranchCode || '—'],
    ['Remarks', data.remarks || '—']
  ]
}

export async function exportMembershipDailyCollectionExcel(
  data: MembershipDailyCollectionData
): Promise<void> {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Daily Cash Collection')
  const colCount = FLAT_HEAD.length
  sheet.columns = Array.from({ length: colCount + 1 }, (_, i) =>
    i === 0 ? { width: 4 } : { width: 12 }
  )
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: colCount + 1 })

  const titleLines = [
    orgHeader.orgName,
    orgHeader.council,
    'Daily Cash Collection Report',
    data.dateLabel
  ]
  titleLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, colCount + 1)
    const c = sheet.getCell(i + 1, 2)
    c.value = line
    c.alignment = { horizontal: 'center' }
    c.font = { bold: i >= 2 }
  })

  // Two-row header: a grouped "Number of Persons Registering" banner over the 11 count
  // columns (split Adult Members / Young Girl Scouts), single columns row-spanned across both
  // header rows either side of it.
  const groupRow = 6
  const labelRow = 7
  const leadingStart = 2
  const personStart = leadingStart + LEADING_HEAD.length
  const trailingStart = personStart + PERSON_TAGS.length
  LEADING_HEAD.forEach((label, i) => {
    sheet.mergeCells(groupRow, leadingStart + i, labelRow, leadingStart + i)
    const c = sheet.getCell(groupRow, leadingStart + i)
    c.value = label
    c.font = { bold: true, size: 10 }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  sheet.mergeCells(groupRow, personStart, groupRow, personStart + 5)
  sheet.getCell(groupRow, personStart).value = 'Number of Persons Registering — Adult Members'
  sheet.mergeCells(groupRow, personStart + 6, groupRow, personStart + 10)
  sheet.getCell(groupRow, personStart + 6).value =
    'Number of Persons Registering — Young Girl Scouts'
  ;[personStart, personStart + 6].forEach((c) => {
    const cell = sheet.getCell(groupRow, c)
    cell.font = { bold: true, size: 9 }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  PERSON_TAGS.forEach((tag, i) => {
    const c = sheet.getCell(labelRow, personStart + i)
    c.value = tag
    c.font = { bold: true, size: 10 }
    c.alignment = { horizontal: 'center' }
  })
  TRAILING_HEAD.forEach((label, i) => {
    sheet.mergeCells(groupRow, trailingStart + i, labelRow, trailingStart + i)
    const c = sheet.getCell(groupRow, trailingStart + i)
    c.value = label
    c.font = { bold: true, size: 10 }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })

  let r = labelRow + 1
  for (const row of data.rows) {
    const cells = rowCells(row)
    cells.forEach((v, i) => {
      const c = sheet.getCell(r, leadingStart + i)
      c.value = v
      if (i === 6 || i === FLAT_HEAD.length - 4 || i === FLAT_HEAD.length - 3) c.numFmt = '#,##0.00'
    })
    r++
  }
  const foot = footCells(data)
  foot.forEach((v, i) => {
    const c = sheet.getCell(r, leadingStart + i)
    c.value = v
    c.font = { bold: true }
    if (i === 6 || i === FLAT_HEAD.length - 4 || i === FLAT_HEAD.length - 3) c.numFmt = '#,##0.00'
  })
  r += 2

  summaryLines(data).forEach(([label, value]) => {
    sheet.getCell(r, 2).value = label
    sheet.getCell(r, 2).font = { bold: true }
    sheet.getCell(r, personStart).value = value
    r++
  })
  r += 2

  const sig = reportSignatories(data.preparedBy)
  sig.forEach((s, i) => {
    sheet.getCell(r, 2 + i * 6).value = s.label
  })
  r += 3
  sig.forEach((s, i) => {
    sheet.getCell(r, 2 + i * 6).value = s.name
    sheet.getCell(r, 2 + i * 6).font = { bold: true }
  })
  r++
  sig.forEach((s, i) => {
    sheet.getCell(r, 2 + i * 6).value = s.role
  })

  downloadWorkbook(
    wb,
    `Membership_Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`
  )
}

export async function buildMembershipDailyCollectionPdfDoc(data: MembershipDailyCollectionData) {
  const doc = createPdf('landscape')
  let y = await addHeaderLines(doc, headerLines(data.dateLabel))

  const columnStyles: Record<number, { halign: 'right' | 'center' }> = { 6: { halign: 'right' } }
  for (let i = 0; i < PERSON_TAGS.length; i++) columnStyles[7 + i] = { halign: 'center' }
  columnStyles[7 + PERSON_TAGS.length] = { halign: 'right' }
  columnStyles[8 + PERSON_TAGS.length] = { halign: 'right' }

  y = addTable(doc, {
    startY: y,
    head: [
      [
        ...LEADING_HEAD.map(() => ({ content: '', colSpan: 1 })),
        {
          content: 'Number of Persons Registering',
          colSpan: PERSON_TAGS.length,
          styles: { halign: 'center' as const }
        },
        ...TRAILING_HEAD.map(() => ({ content: '', colSpan: 1 }))
      ],
      FLAT_HEAD
    ],
    body: data.rows.map(rowCells),
    foot: [footCells(data)],
    columnStyles
  })
  y += 20

  summaryLines(data).forEach(([label, value]) => {
    doc.setFont('helvetica', label.startsWith('(Under)') ? 'bold' : 'normal')
    doc.text(label, 30, y)
    doc.text(value, 480, y, { align: 'right' })
    y += 14
  })
  y += 10

  addSignatories(doc, y, reportSignatories(data.preparedBy) as PdfSignatoryColumn[])

  return doc
}

export async function exportMembershipDailyCollectionPdf(
  data: MembershipDailyCollectionData
): Promise<void> {
  const doc = await buildMembershipDailyCollectionPdfDoc(data)
  savePdf(doc, `Membership_Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportMembershipDailyCollectionDocx(
  data: MembershipDailyCollectionData
): Promise<void> {
  const sig = reportSignatories(data.preparedBy)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Daily Cash Collection Report', bold: true, size: 24 },
      { text: data.dateLabel }
    ])),
    spacer(),
    buildTable(FLAT_HEAD, data.rows.map(rowCells), footCells(data), [
      ...LEADING_HEAD.map(() => ({ label: '', span: 1 })),
      { label: 'Number of Persons Registering', span: PERSON_TAGS.length },
      ...TRAILING_HEAD.map(() => ({ label: '', span: 1 }))
    ]),
    spacer(),
    buildTable([], summaryLines(data)),
    spacer(),
    signatoryTable(sig as DocxSignatoryColumn[])
  ]

  await saveDocx(
    children,
    `Membership_Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}
