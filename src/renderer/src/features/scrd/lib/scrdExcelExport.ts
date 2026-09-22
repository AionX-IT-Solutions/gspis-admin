import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
import { formatDate, formatAmount } from '@/shared/lib/utils'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import { addWorksheetLogo, applyDoubleRule } from '@/shared/lib/excelReport'

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

function addHeader(sheet: ExcelJS.Worksheet, lines: string[], totalCols: number) {
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, totalCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= lines.length - 2, size: i === lines.length - 2 ? 13 : 11 }
  })
}

export interface JournalRow {
  date: string
  name: string
  particulars: string
  reference?: string
  category: string
  bankAccount: string
  amount: number
  /** Which receipt booklet was used for this entry (Service Invoice, Acknowledgment Receipt,
   *  Sales Invoice) — see CashReceipt.receiptType. Unset for disbursements and any receipt
   *  with no associated booklet (rentals, cash-advance reimbursements). */
  receiptType?: string
}

// Pivots a flat list of journal entries into the Council's real wide-ledger
// layout: one column per distinct category actually present in the data, plus
// one column per bank account — each row places its amount under the matching
// category column AND the matching bank column (columns grow/shrink with the
// data instead of a fixed ~20/40-column template that would mostly sit empty).
// `bankFirst` puts the bank columns ahead of the category columns — the Cash
// Disbursement report reads "which bank, then which expense", the opposite of
// Cash Receipts' "which income category, then which bank" — and amounts stay
// real `number`s (not pre-formatted strings) so Excel's own numFmt/PDF-DOCX's
// comma-grouped display can each format the same underlying value correctly.
function journalPivotData(
  rows: JournalRow[],
  fixedCols: string[],
  bankAccountNames: string[],
  bankFirst = false
) {
  const categories = Array.from(new Set(rows.map((r) => r.category))).sort()
  const categoryTotals = new Array(categories.length).fill(0)
  const bankTotals = new Array(bankAccountNames.length).fill(0)

  const body: (string | number)[][] = rows.map((row) => {
    const catIdx = categories.indexOf(row.category)
    const bankIdx = bankAccountNames.indexOf(row.bankAccount)
    const catCells: (string | number)[] = categories.map((_, i) => {
      if (i !== catIdx) return ''
      categoryTotals[i] += row.amount
      return row.amount
    })
    const bankCells: (string | number)[] = bankAccountNames.map((_, i) => {
      if (i !== bankIdx) return ''
      bankTotals[i] += row.amount
      return row.amount
    })
    const valueCells = bankFirst ? [...bankCells, ...catCells] : [...catCells, ...bankCells]
    return [formatDate(row.date), row.name, row.particulars, row.reference ?? '', ...valueCells]
  })

  const allCols = bankFirst
    ? [...fixedCols, ...bankAccountNames, ...categories]
    : [...fixedCols, ...categories, ...bankAccountNames]
  const totalsOrdered = bankFirst
    ? [...bankTotals, ...categoryTotals]
    : [...categoryTotals, ...bankTotals]

  const foot = [
    ...fixedCols.map((_, i) => (i === fixedCols.length - 1 ? 'TOTAL' : '')),
    ...totalsOrdered
  ]

  return { allCols, categories, body, foot }
}

/** Renders the pivot's numeric cells (everything past `fixedCols`) as comma-grouped
 *  display text — for PDF/DOCX, which print plain strings rather than a spreadsheet's
 *  numFmt-aware numeric cell. */
function formatPivotRow(row: (string | number)[], fixedColsLen: number): (string | number)[] {
  return row.map((v, i) => (i >= fixedColsLen && v !== '' ? formatAmount(v as number) : v))
}

async function writeJournalSheet(
  wb: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  headerLines: string[],
  fixedCols: string[],
  rows: JournalRow[],
  bankAccountNames: string[],
  bankFirst = false
) {
  const { allCols, categories, body, foot } = journalPivotData(
    rows,
    fixedCols,
    bankAccountNames,
    bankFirst
  )
  sheet.columns = allCols.map((_, i) => ({ width: i < fixedCols.length ? 20 : 15 }))
  await addWorksheetLogo(wb, sheet)
  addHeader(sheet, headerLines, allCols.length)

  const headerRow = 7
  allCols.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', wrapText: true }
  })

  let r = headerRow + 1
  for (const cells of body) {
    cells.forEach((value, i) => {
      const cell = sheet.getCell(r, i + 1)
      if (i >= fixedCols.length && value !== '') {
        cell.value = value as number
        cell.numFmt = '#,##0.00'
      } else {
        cell.value = value
      }
    })
    r++
  }

  r++
  const totalRow = r
  foot.forEach((value, i) => {
    const cell = sheet.getCell(r, i + 1)
    if (i >= fixedCols.length && value !== '') {
      cell.value = value as number
      cell.numFmt = '#,##0.00'
    } else {
      cell.value = value
    }
    cell.font = { bold: true }
  })
  applyDoubleRule(sheet, totalRow, 1, allCols.length)

  return { allCols, categories }
}

// ─── Cash Receipts Journal — categorized + multi-bank-account column layout ─
export async function exportCashReceiptsJournal(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Cash Receipts')
  await writeJournalSheet(
    wb,
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'CASH RECEIPTS',
      `For the Month of ${monthLabel}`
    ],
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    rows,
    bankAccountNames
  )
  downloadWorkbook(wb, `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildCashReceiptsJournalPdfDoc(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    bankAccountNames
  )
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'CASH RECEIPTS', bold: true, size: 12 },
    { text: `For the Month of ${monthLabel}` }
  ])
  addTable(doc, {
    startY: y,
    head: [allCols],
    body: body.map((row) => formatPivotRow(row, 4)),
    foot: [formatPivotRow(foot, 4)],
    columnStyles: Object.fromEntries(
      Array.from({ length: allCols.length - 4 }, (_, i) => [4 + i, { halign: 'right' as const }])
    )
  })
  return doc
}

export async function exportCashReceiptsJournalPdf(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const doc = await buildCashReceiptsJournalPdfDoc(rows, monthLabel, bankAccountNames)
  savePdf(doc, `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportCashReceiptsJournalDocx(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    bankAccountNames
  )
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'CASH RECEIPTS', bold: true, size: 24 },
      { text: `For the Month of ${monthLabel}` }
    ])),
    spacer(),
    buildTable(
      allCols,
      body.map((row) => formatPivotRow(row, 4)),
      formatPivotRow(foot, 4)
    )
  ]
  await saveDocx(
    children,
    `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

// ─── Cash Disbursement Journal — bank-first + expense-category layout ──────
// A voucher's Mode of Payment can be "Cash" as well as "Check" (see
// vouchers.types.ts), and either kind can leave with no specific bank chosen
// (falls back to "Cash on Hand" — same as Cash Receipts' undeposited-sales
// column), so this needs a Cash on Hand column too or those disbursements'
// amounts would land in no bank column at all. Reads "which bank, then which
// expense category" — the reverse column order from Cash Receipts.
function disbursementBankNames(bankAccountNames: string[]): string[] {
  return bankAccountNames
}

export async function exportCashDisbursementJournal(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Cash Disbursements')
  await writeJournalSheet(
    wb,
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'CASH DISBURSEMENT',
      `FOR THE MONTH OF ${monthLabel.toUpperCase()}`
    ],
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    rows,
    disbursementBankNames(bankAccountNames),
    true
  )
  downloadWorkbook(wb, `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildCashDisbursementJournalPdfDoc(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    disbursementBankNames(bankAccountNames),
    true
  )
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'CASH DISBURSEMENT', bold: true, size: 12 },
    { text: `FOR THE MONTH OF ${monthLabel.toUpperCase()}` }
  ])
  addTable(doc, {
    startY: y,
    head: [allCols],
    body: body.map((row) => formatPivotRow(row, 4)),
    foot: [formatPivotRow(foot, 4)],
    columnStyles: Object.fromEntries(
      Array.from({ length: allCols.length - 4 }, (_, i) => [4 + i, { halign: 'right' as const }])
    )
  })
  return doc
}

export async function exportCashDisbursementJournalPdf(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const doc = await buildCashDisbursementJournalPdfDoc(rows, monthLabel, bankAccountNames)
  savePdf(doc, `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportCashDisbursementJournalDocx(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    disbursementBankNames(bankAccountNames),
    true
  )
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'CASH DISBURSEMENT', bold: true, size: 24 },
      { text: `FOR THE MONTH OF ${monthLabel.toUpperCase()}` }
    ])),
    spacer(),
    buildTable(
      allCols,
      body.map((row) => formatPivotRow(row, 4)),
      formatPivotRow(foot, 4)
    )
  ]
  await saveDocx(
    children,
    `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

// ─── Statement of Cash Receipts & Disbursements (SCRD) — summary ────────────
// Matches the Council's real SCRD format: receipts grouped into I. Operations
// (A. General Operations, B. National Equipment Service), II. Rental Income,
// III. Interest Income, IV. Other Income; disbursements grouped into
// I. Operations (A. Operating Expenses, B. National Equipment Services),
// II. Capital Outlay, III. Other Expenses; plus the "ACCOUNTED FOR AS FOLLOWS"
// cash-by-bank-account reconciliation (General Operations / Retirement Fund /
// Capital Outlay-Building-NES-Transitory Fees, per the real account groupings).
export interface SCRDCategoryTotal {
  category: string
  amount: number
}

export type BankAccountBucket = 'general' | 'retirement' | 'capital'

export const BANK_ACCOUNT_BUCKET: Record<string, BankAccountBucket> = {
  'Cash on Hand': 'general',
  'DBP #00-500128590-5': 'general',
  'Cordillera Bank #8104': 'retirement',
  'Maybank #01-017-00-0197-9': 'capital',
  'DBP #0-50141-590-7': 'capital',
  'PNB #223510036978': 'capital'
}

export interface BankAccountBalance {
  id: string
  account: string
  opening: number
  receipts: number
  disbursements: number
  closing: number
}

export interface SCRDSummaryParams {
  monthLabel: string
  beginningBalance: number
  generalReceiptCategories: SCRDCategoryTotal[]
  nesSalesTotal: number
  rentalIncomeTotal: number
  interestIncome: number
  otherIncomeCategories: SCRDCategoryTotal[]
  generalDisbursementCategories: SCRDCategoryTotal[]
  nesPurchasesTotal: number
  capitalOutlayCategories: SCRDCategoryTotal[]
  otherExpenseCategories: SCRDCategoryTotal[]
  bankAccountBalances: BankAccountBalance[]
}

function sumCategories(categories: SCRDCategoryTotal[]) {
  return categories.reduce((s, c) => s + c.amount, 0)
}

function scrdFigures(params: SCRDSummaryParams) {
  const generalReceipts = sumCategories(params.generalReceiptCategories)
  const operationsReceipts = generalReceipts + params.nesSalesTotal
  const otherIncomeTotal = sumCategories(params.otherIncomeCategories)
  const totalReceipts =
    operationsReceipts + params.rentalIncomeTotal + params.interestIncome + otherIncomeTotal
  const generalDisbursements = sumCategories(params.generalDisbursementCategories)
  const operationsDisbursements = generalDisbursements + params.nesPurchasesTotal
  const capitalOutlayTotal = sumCategories(params.capitalOutlayCategories)
  const otherExpensesTotal = sumCategories(params.otherExpenseCategories)
  const totalDisbursements = operationsDisbursements + capitalOutlayTotal + otherExpensesTotal
  const totalCashAvailable = params.beginningBalance + totalReceipts
  const endingBalance = totalCashAvailable - totalDisbursements
  const bucketTotal = (bucket: BankAccountBucket) =>
    params.bankAccountBalances
      .filter((b) => BANK_ACCOUNT_BUCKET[b.account] === bucket)
      .reduce((s, b) => s + b.closing, 0)
  return {
    generalReceipts,
    operationsReceipts,
    otherIncomeTotal,
    totalReceipts,
    generalDisbursements,
    operationsDisbursements,
    capitalOutlayTotal,
    otherExpensesTotal,
    totalDisbursements,
    totalCashAvailable,
    endingBalance,
    generalBucketTotal: bucketTotal('general'),
    retirementBucketTotal: bucketTotal('retirement'),
    capitalBucketTotal: bucketTotal('capital')
  }
}

function scrdSummaryRows(params: SCRDSummaryParams) {
  const f = scrdFigures(params)
  const generalBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'general'
  )
  const retirementBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'retirement'
  )
  const capitalBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'capital'
  )

  // Amounts stay real `number`s (not pre-formatted strings) so Excel's numFmt and
  // PDF/DOCX's comma-grouped display can each format the same value correctly.
  const rows: (string | number)[][] = [
    ['CASH BALANCE AVAILABLE AT THE BEGINNING', params.beginningBalance],
    ['ADD: CASH RECEIPTS', ''],
    ['I. Operations', ''],
    ['   A. General Operations', ''],
    ...params.generalReceiptCategories.map((c) => [`      ${c.category}`, c.amount]),
    ['      Sub-total', f.generalReceipts],
    ['   B. National Equipment Service (NES)', ''],
    ['      Sales: NES Items', params.nesSalesTotal],
    ['II. Rental Income', params.rentalIncomeTotal],
    ['III. Interest Income', params.interestIncome],
    ['IV. Other Income', ''],
    ...params.otherIncomeCategories.map((c) => [`      ${c.category}`, c.amount]),
    ['      Sub-total', f.otherIncomeTotal],
    ['TOTAL CASH RECEIPTS', f.totalReceipts],
    ['TOTAL CASH AVAILABLE', f.totalCashAvailable],
    ['LESS: CASH DISBURSEMENTS', ''],
    ['I. Operations', ''],
    ['   A. Operating Expenses', ''],
    ...params.generalDisbursementCategories.map((c) => [`      ${c.category}`, c.amount]),
    ['      Sub-total', f.generalDisbursements],
    ['   B. National Equipment Services', ''],
    ['      Purchases', params.nesPurchasesTotal],
    ['II. Capital Outlay', ''],
    ...params.capitalOutlayCategories.map((c) => [`      ${c.category}`, c.amount]),
    ['      Sub-total', f.capitalOutlayTotal],
    ['III. Other Expenses', ''],
    ...params.otherExpenseCategories.map((c) => [`      ${c.category}`, c.amount]),
    ['      Sub-total', f.otherExpensesTotal],
    ['TOTAL CASH DISBURSEMENTS', f.totalDisbursements],
    ['TOTAL CASH BALANCE', f.endingBalance],
    ['', ''],
    ['ACCOUNTED FOR AS FOLLOWS:', ''],
    ['I. Operations', ''],
    ['   A. General Operations', ''],
    ...generalBanks.map((b) => [`      ${b.account}`, b.closing]),
    ['      Sub-total', f.generalBucketTotal],
    ['   B. Retirement Fund', ''],
    ...retirementBanks.map((b) => [`      ${b.account}`, b.closing]),
    ['      Sub-total', f.retirementBucketTotal],
    ['II. Capital Outlay', ''],
    ['   A. Building/NES/Transitory Fees', ''],
    ...capitalBanks.map((b) => [`      ${b.account}`, b.closing]),
    ['      Sub-total', f.capitalBucketTotal],
    ['TOTAL CASH BALANCE (ACCOUNTED FOR)', f.endingBalance]
  ]
  return { rows, ending: f.endingBalance }
}

/** Every "total"/section-heading line in the statement gets bold — matching the
 *  Council's real ledger convention where roman-numeral headings, sub-totals, and
 *  running totals all stand out, not just the one grand-final figure at the bottom
 *  (which additionally gets the double rule — see the last row's `foot` treatment
 *  in the PDF/DOCX builders below). */
function isScrdHeadingLabel(label: string | number): boolean {
  const trimmed = typeof label === 'string' ? label.trim() : ''
  return (
    /^(I{1,3}\.|IV\.)/.test(trimmed) ||
    trimmed.startsWith('TOTAL') ||
    trimmed.startsWith('CASH BALANCE') ||
    trimmed.startsWith('ADD:') ||
    trimmed.startsWith('LESS:') ||
    trimmed.startsWith('ACCOUNTED') ||
    trimmed.includes('Sub-total')
  )
}

/** Renders an SCRD row's amount (column 1) as comma-grouped display text — for
 *  PDF/DOCX, which print plain strings rather than a numFmt-aware numeric cell. */
function formatScrdRow(row: (string | number)[]): (string | number)[] {
  return row.map((v, i) => (i === 1 && v !== '' ? formatAmount(v as number) : v))
}

export async function exportSCRDSummary(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('SCRD')
  sheet.columns = [{ width: 4 }, { width: 4 }, { width: 40 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet)

  addHeader(
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS',
      `For the Month Ended, ${params.monthLabel}`
    ],
    4
  )

  let r = 7
  rows.forEach(([label, amount], idx) => {
    const isHeading = isScrdHeadingLabel(label)
    const col = typeof label === 'string' && label.startsWith('      ') ? 3 : 1
    sheet.getCell(r, col).value = label
    if (isHeading) sheet.getCell(r, col).font = { bold: true }
    if (amount !== '') {
      sheet.getCell(r, 4).value = amount as number
      sheet.getCell(r, 4).numFmt = '#,##0.00'
      if (isHeading) sheet.getCell(r, 4).font = { bold: true }
    }
    if (idx === rows.length - 1) applyDoubleRule(sheet, r, 1, 4)
    r++
  })

  downloadWorkbook(wb, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildSCRDSummaryPdfDoc(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  // The statement's one true grand-final total is its last row ("TOTAL CASH BALANCE
  // (ACCOUNTED FOR)") — split it into `foot` so it gets the shared bold+double-rule
  // treatment; every other heading/sub-total line is still bold via boldBodyRowIndexes.
  const bodyRows = rows.slice(0, -1)
  const finalRow = rows[rows.length - 1]
  const boldBodyRowIndexes = bodyRows
    .map((row, i) => (isScrdHeadingLabel(row[0]) ? i : -1))
    .filter((i) => i !== -1)
  const doc = createPdf('portrait')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS', bold: true, size: 12 },
    { text: `For the Month Ended, ${params.monthLabel}` }
  ])
  addTable(doc, {
    startY: y,
    head: [],
    body: bodyRows.map(formatScrdRow),
    foot: [formatScrdRow(finalRow)],
    columnStyles: { 1: { halign: 'right' } },
    boldBodyRowIndexes
  })
  return doc
}

export async function exportSCRDSummaryPdf(params: SCRDSummaryParams) {
  const doc = await buildSCRDSummaryPdfDoc(params)
  savePdf(doc, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportSCRDSummaryDocx(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  const bodyRows = rows.slice(0, -1)
  const finalRow = rows[rows.length - 1]
  const boldBodyRowIndexes = bodyRows
    .map((row, i) => (isScrdHeadingLabel(row[0]) ? i : -1))
    .filter((i) => i !== -1)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS', bold: true, size: 24 },
      { text: `For the Month Ended, ${params.monthLabel}` }
    ])),
    spacer(),
    buildTable(
      [],
      bodyRows.map(formatScrdRow),
      formatScrdRow(finalRow),
      undefined,
      boldBodyRowIndexes
    )
  ]
  await saveDocx(children, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`)
}
