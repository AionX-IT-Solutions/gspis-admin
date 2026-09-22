import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import {
  createPdf,
  addHeaderLines,
  addTable,
  addSignatories,
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

export interface IncomeStatementData {
  periodLabel: string
  incomeRows: [string, number][]
  expenseRows: [string, number][]
  totalIncome: number
  totalExpense: number
  netIncome: number
}

const headerLines = (title: string, periodLabel: string) => [
  { text: orgHeader.orgName, bold: true },
  { text: orgHeader.council },
  { text: title, bold: true, size: 12 },
  { text: periodLabel }
]

export async function exportIncomeStatementExcel(data: IncomeStatementData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Income Statement')
  sheet.columns = [{ width: 4 }, { width: 34 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 3 })

  const lines = [orgHeader.orgName, orgHeader.council, 'Income Statement', data.periodLabel]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 3)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 7
  sheet.getCell(r, 2).value = 'Income'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const [account, amount] of data.incomeRows) {
    sheet.getCell(r, 2).value = `   ${account}`
    sheet.getCell(r, 3).value = amount
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Income'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalIncome
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Expenses'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const [category, amount] of data.expenseRows) {
    sheet.getCell(r, 2).value = `   ${category}`
    sheet.getCell(r, 3).value = amount
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Expenses'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalExpense
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Net Income'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.netIncome
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 4

  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 3).value = 'Certified Correct:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 3).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 3).value = 'Council Executive'

  downloadWorkbook(wb, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function incomeStatementRows(data: IncomeStatementData): (string | number)[][] {
  return [
    ['Income', ''],
    ...data.incomeRows.map(([account, amount]) => [`   ${account}`, amount.toFixed(2)]),
    ['Total Income', data.totalIncome.toFixed(2)],
    ['Expenses', ''],
    ...data.expenseRows.map(([category, amount]) => [`   ${category}`, amount.toFixed(2)]),
    ['Total Expenses', data.totalExpense.toFixed(2)]
  ]
}

export async function buildIncomeStatementPdfDoc(data: IncomeStatementData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, headerLines('Income Statement', data.periodLabel))
  y = addTable(doc, {
    startY: y,
    head: [],
    body: incomeStatementRows(data),
    foot: [['Net Income', data.netIncome.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: 'Certified Correct:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    }
  ])
  return doc
}

export async function exportIncomeStatementPdf(data: IncomeStatementData) {
  const doc = await buildIncomeStatementPdfDoc(data)
  savePdf(doc, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportIncomeStatementDocx(data: IncomeStatementData) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Income Statement', bold: true, size: 24 },
      { text: data.periodLabel }
    ])),
    spacer(),
    buildTable([], incomeStatementRows(data), ['Net Income', data.netIncome.toFixed(2)]),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      {
        label: 'Certified Correct:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      }
    ])
  ]
  await saveDocx(children, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

export interface DailyCollectionReceiptRow {
  siNo: string
  receivedFrom: string
  nes: number
  bcFee: number
  csf: number
  iccg: number
  memReg: number
  rentals: number
  refundOfCa: number
  others: number
  amount: number
}

export interface DailyCollectionDepositRow {
  bankName: string
  saNo: string
  purpose: string
  amount: number
}

/** Mirrors the Council's real "Daily Cash Collection Report" paper form exactly —
 *  beginning balance, itemized receipts (auto-populated from POS/Rentals/Troops plus
 *  any hand-entered lines), then cash deposited to the bank, reconciled down to an
 *  undeposited balance. */
export interface DailyCollectionsData {
  dateLabel: string
  preparedBy: string
  beginningBalance: number
  receiptRows: DailyCollectionReceiptRow[]
  receiptTotals: Omit<DailyCollectionReceiptRow, 'siNo' | 'receivedFrom'>
  totalCashCollection: number
  totalCashOnHand: number
  depositRows: DailyCollectionDepositRow[]
  totalDeposited: number
  balanceUndeposited: number
}

const RECEIPT_HEAD = [
  'SI No.',
  'Received From',
  'NES',
  'BC Fee',
  'CSF',
  'ICCG',
  'Mem. Reg.',
  'Rentals',
  'Refund of CA',
  'Others',
  'Amount'
]

function receiptRowCells(r: DailyCollectionReceiptRow): (string | number)[] {
  return [
    r.siNo,
    r.receivedFrom,
    r.nes.toFixed(2),
    r.bcFee.toFixed(2),
    r.csf.toFixed(2),
    r.iccg.toFixed(2),
    r.memReg.toFixed(2),
    r.rentals.toFixed(2),
    r.refundOfCa.toFixed(2),
    r.others.toFixed(2),
    r.amount.toFixed(2)
  ]
}

function receiptFootCells(t: DailyCollectionsData['receiptTotals']): (string | number)[] {
  return [
    '',
    'TOTAL',
    t.nes.toFixed(2),
    t.bcFee.toFixed(2),
    t.csf.toFixed(2),
    t.iccg.toFixed(2),
    t.memReg.toFixed(2),
    t.rentals.toFixed(2),
    t.refundOfCa.toFixed(2),
    t.others.toFixed(2),
    t.amount.toFixed(2)
  ]
}

const DEPOSIT_HEAD = ['Bank', 'S/A No.', 'Purpose', 'Amount']

function depositRowCells(r: DailyCollectionDepositRow): (string | number)[] {
  return [r.bankName, r.saNo, r.purpose, r.amount.toFixed(2)]
}

/** The paper's two-tier signature block: Prepared by (Cashier) / Certified by (Council
 *  Executive) on one row, then a separate "Verified Correct:" row of four — Bookkeeper,
 *  Council Auditor, Council Treasurer, Council President. */
function dailyCollectionSignatories(preparedBy: string) {
  return {
    primary: [
      { label: 'Prepared by:', name: preparedBy.toUpperCase(), role: 'Cashier' },
      {
        label: 'Certified by:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      }
    ],
    verified: [
      {
        label: 'Verified Correct:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Bookkeeper'
      },
      { label: '', name: signatories.councilAuditor.toUpperCase(), role: 'Council Auditor' },
      { label: '', name: signatories.councilTreasurer.toUpperCase(), role: 'Council Treasurer' },
      { label: '', name: signatories.councilPresident.toUpperCase(), role: 'Council President' }
    ]
  }
}

export async function exportDailyCollectionsExcel(data: DailyCollectionsData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Daily Collections')
  sheet.columns = [
    { width: 4 },
    { width: 12 },
    { width: 20 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 11 },
    { width: 11 },
    { width: 11 },
    { width: 11 },
    { width: 14 }
  ]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 12 })

  const lines = [
    orgHeader.orgName,
    orgHeader.council,
    'Daily Cash Collection Report',
    data.dateLabel
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 12)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 6
  sheet.getCell(r, 2).value = 'Beginning Balance'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 12).value = data.beginningBalance
  sheet.getCell(r, 12).numFmt = '#,##0.00'
  sheet.getCell(r, 12).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'ADD: CASH RECEIPTS'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  RECEIPT_HEAD.forEach((label, i) => {
    const cell = sheet.getCell(r, i + 2)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: i >= 2 ? 'right' : 'left' }
  })
  r++
  for (const row of data.receiptRows) {
    const cells = receiptRowCells(row)
    cells.forEach((v, i) => {
      const cell = sheet.getCell(r, i + 2)
      cell.value = v
      if (i >= 2) cell.numFmt = '#,##0.00'
    })
    r++
  }
  const footCells = receiptFootCells(data.receiptTotals)
  footCells.forEach((v, i) => {
    const cell = sheet.getCell(r, i + 2)
    cell.value = v
    cell.font = { bold: true }
    if (i >= 2) cell.numFmt = '#,##0.00'
  })
  r += 2

  sheet.getCell(r, 2).value = 'TOTAL CASH COLLECTION DURING THE DAY'
  sheet.getCell(r, 12).value = data.totalCashCollection
  sheet.getCell(r, 12).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 2).value = 'TOTAL CASH ON HAND'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 12).value = data.totalCashOnHand
  sheet.getCell(r, 12).numFmt = '#,##0.00'
  sheet.getCell(r, 12).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'LESS: CASH DEPOSIT'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  DEPOSIT_HEAD.forEach((label, i) => {
    const cell = sheet.getCell(r, i + 2)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: i === 3 ? 'right' : 'left' }
  })
  r++
  for (const row of data.depositRows) {
    const cells = depositRowCells(row)
    cells.forEach((v, i) => {
      const cell = sheet.getCell(r, i + 2)
      cell.value = v
      if (i === 3) cell.numFmt = '#,##0.00'
    })
    r++
  }
  sheet.getCell(r, 4).value = 'TOTAL'
  sheet.getCell(r, 4).font = { bold: true }
  sheet.getCell(r, 5).value = data.totalDeposited
  sheet.getCell(r, 5).numFmt = '#,##0.00'
  sheet.getCell(r, 5).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'TOTAL CASH COLLECTION DEPOSIT IN BANK'
  sheet.getCell(r, 12).value = data.totalDeposited
  sheet.getCell(r, 12).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 2).value = 'BALANCE/UNDEPOSITED CASH COLLECTION'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 12).value = data.balanceUndeposited
  sheet.getCell(r, 12).numFmt = '#,##0.00'
  sheet.getCell(r, 12).font = { bold: true }
  r += 4

  const sig = dailyCollectionSignatories(data.preparedBy)
  sheet.getCell(r, 2).value = sig.primary[0].label
  sheet.getCell(r, 6).value = sig.primary[1].label
  r += 3
  sheet.getCell(r, 2).value = sig.primary[0].name
  sheet.getCell(r, 6).value = sig.primary[1].name
  r++
  sheet.getCell(r, 2).value = sig.primary[0].role
  sheet.getCell(r, 6).value = sig.primary[1].role
  r += 3

  sheet.getCell(r, 2).value = 'Verified Correct:'
  sheet.getCell(r, 2).font = { bold: true }
  r += 2
  sig.verified.forEach((s, i) => {
    sheet.getCell(r, 2 + i * 2).value = s.name
  })
  r++
  sig.verified.forEach((s, i) => {
    sheet.getCell(r, 2 + i * 2).value = s.role
  })

  downloadWorkbook(wb, `Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildDailyCollectionsPdfDoc(data: DailyCollectionsData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, headerLines('Daily Cash Collection Report', data.dateLabel))

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Beginning Balance', 30, y)
  doc.text(data.beginningBalance.toFixed(2), 480, y, { align: 'right' })
  y += 16

  doc.setFontSize(9)
  doc.text('ADD: Cash Receipts', 30, y)
  y += 6

  y = addTable(doc, {
    startY: y,
    head: [RECEIPT_HEAD],
    body: data.receiptRows.map(receiptRowCells),
    foot: [receiptFootCells(data.receiptTotals)],
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
      9: { halign: 'right' },
      10: { halign: 'right' }
    }
  })
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.text('Total Cash Collection During the Day', 30, y)
  doc.text(data.totalCashCollection.toFixed(2), 480, y, { align: 'right' })
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.text('Total Cash on Hand', 30, y)
  doc.text(data.totalCashOnHand.toFixed(2), 480, y, { align: 'right' })
  y += 22

  doc.text('LESS: Cash Deposit', 30, y)
  y += 6
  y = addTable(doc, {
    startY: y,
    head: [DEPOSIT_HEAD],
    body: data.depositRows.map(depositRowCells),
    foot: [['', '', 'TOTAL', data.totalDeposited.toFixed(2)]],
    columnStyles: { 3: { halign: 'right' } }
  })
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.text('Total Cash Collection Deposit in Bank', 30, y)
  doc.text(data.totalDeposited.toFixed(2), 480, y, { align: 'right' })
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.text('Balance/Undeposited Cash Collection', 30, y)
  doc.text(data.balanceUndeposited.toFixed(2), 480, y, { align: 'right' })
  y += 10

  const sig = dailyCollectionSignatories(data.preparedBy)
  y = addSignatories(doc, y, sig.primary)
  y += 20
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Verified Correct:', 30, y)
  addSignatories(doc, y, sig.verified)

  return doc
}

export async function exportDailyCollectionsPdf(data: DailyCollectionsData) {
  const doc = await buildDailyCollectionsPdfDoc(data)
  savePdf(doc, `Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportDailyCollectionsDocx(data: DailyCollectionsData) {
  const sig = dailyCollectionSignatories(data.preparedBy)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Daily Cash Collection Report', bold: true, size: 24 },
      { text: data.dateLabel }
    ])),
    spacer(),
    buildTable([], [['Beginning Balance', data.beginningBalance.toFixed(2)]]),
    spacer(),
    buildTable(
      RECEIPT_HEAD,
      data.receiptRows.map(receiptRowCells),
      receiptFootCells(data.receiptTotals)
    ),
    spacer(),
    buildTable(
      [],
      [
        ['Total Cash Collection During the Day', data.totalCashCollection.toFixed(2)],
        ['Total Cash on Hand', data.totalCashOnHand.toFixed(2)]
      ]
    ),
    spacer(),
    buildTable(DEPOSIT_HEAD, data.depositRows.map(depositRowCells), [
      '',
      '',
      'TOTAL',
      data.totalDeposited.toFixed(2)
    ]),
    spacer(),
    buildTable(
      [],
      [
        ['Total Cash Collection Deposit in Bank', data.totalDeposited.toFixed(2)],
        ['Balance/Undeposited Cash Collection', data.balanceUndeposited.toFixed(2)]
      ]
    ),
    spacer(),
    spacer(),
    signatoryTable(sig.primary),
    spacer(),
    signatoryTable(sig.verified)
  ]
  await saveDocx(
    children,
    `Daily_Cash_Collection_${data.dateLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}
