import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import {
  getExpenseVouchers,
  voucherCategory,
  hasCashAdvance,
  cashAdvanceReimbursement
} from '@/features/vouchers/lib/expenseVouchers'
import { getReceiptRowsFromVouchers } from '@/features/vouchers/lib/receiptVouchers'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useDailyCollectionsStore } from '../store/dailyCollections.store'
import type { MemberPaymentCategory } from '@/features/troops/types/troop.types'
import {
  exportIncomeStatementExcel,
  exportIncomeStatementPdf,
  exportIncomeStatementDocx,
  buildIncomeStatementPdfDoc
} from '../lib/financialReportsExport'

// Mirrors the categorization useScrdComputations.ts already uses for the same underlying
// records, so this report's Income total and SCRD's "Total Receipts" always agree.
const RECEIPT_CATEGORY_BY_MEMBER_PAYMENT: Record<MemberPaymentCategory, string> = {
  membership: 'Troop Fees',
  training: 'Training Fees',
  camping: 'Camping Fees'
}

export function useIncomeStatementTab(periodLabel: string) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const vouchers = useVouchersStore((s) => s.vouchers)
  const expenses = useMemo(() => getExpenseVouchers(vouchers), [vouchers])
  const cashReceipts = useMemo(() => getReceiptRowsFromVouchers(vouchers), [vouchers])
  // A cash-advance liquidation JV that overspent its advance owes the payee the excess back in
  // real cash — the mirror image of an underspent one's leftover refund, which cashReceipts
  // above already counts as "Cash Advance Refund" income. Journal Vouchers are otherwise never
  // expenses (see getExpenseVouchers), so this reimbursement leg needs its own line here, same
  // as SCRD's useScrdComputations.ts already does for its own disbursement totals.
  const cashAdvanceReimbursementRows = useMemo(
    () =>
      vouchers
        .filter(
          (v) => v.voucherType === 'journal_voucher' && v.status === 'approved' && hasCashAdvance(v)
        )
        .map((v) => ({ voucher: v, amount: cashAdvanceReimbursement(v, v.totalAmountSpent ?? 0) }))
        .filter((r) => r.amount > 0),
    [vouchers]
  )
  const sales = usePOSStore((s) => s.sales)
  const bookings = useRentalsStore((s) => s.bookings)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const dailyCollectionReports = useDailyCollectionsStore((s) => s.reports)

  const pnl = useMemo(() => {
    // Every real income source the app records — approved Journal Voucher credit lines (Cash
    // Receipts), POS sales, confirmed/completed rental bookings, and Troop/District Committee
    // roster payments — same sources SCRD's Cash Receipts Journal and Bank Balances already
    // pull from (see receiptVouchers.ts / useScrdComputations.ts / useBankBalances.ts), so this
    // report's income total is never a second, disagreeing figure.
    const incomeByAccount = new Map<string, number>()
    const addIncome = (category: string, amount: number) =>
      incomeByAccount.set(category, (incomeByAccount.get(category) ?? 0) + amount)

    cashReceipts.forEach((r) => addIncome(r.category, r.amount))
    sales.filter((s) => !s.voided).forEach((s) => addIncome('NES Sales', s.totalAmount))
    bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .forEach((b) => addIncome('Rental Income', b.amountPaid ?? b.totalAmount))
    scoutMembers.forEach((m) =>
      (m.payments ?? []).forEach((p) =>
        addIncome(RECEIPT_CATEGORY_BY_MEMBER_PAYMENT[p.category], p.amount)
      )
    )
    // Daily Collections' hand-entered rows — the only categories with no automated source
    // (Badge/Certificate Fee, Council Service Fund, ICCG dues collected in person; see
    // ManualReceiptLine in dailyCollection.types.ts). NES/Mem. Reg./Rentals columns on the
    // same form are deliberately skipped here — those are already counted above from their
    // real POS/troop-payment/rental records, so re-adding them from a manual entry would
    // double-count the same cash.
    dailyCollectionReports.forEach((r) =>
      r.manualReceipts.forEach((line) => {
        addIncome('BC Fee', line.bcFee)
        addIncome('CSF', line.csf)
        addIncome('ICCG', line.iccg)
      })
    )

    const expenseByCategory = new Map<string, number>()
    expenses.forEach((e) => {
      const category = voucherCategory(e)
      expenseByCategory.set(category, (expenseByCategory.get(category) ?? 0) + e.amount)
    })
    cashAdvanceReimbursementRows.forEach(({ amount }) => {
      expenseByCategory.set(
        'Cash Advance Reimbursement',
        (expenseByCategory.get('Cash Advance Reimbursement') ?? 0) + amount
      )
    })

    const totalIncome = [...incomeByAccount.values()].reduce((s, v) => s + v, 0)
    const totalExpense = [...expenseByCategory.values()].reduce((s, v) => s + v, 0)

    return {
      incomeRows: [...incomeByAccount.entries()].sort((a, b) => b[1] - a[1]),
      expenseRows: [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]),
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense
    }
  }, [
    expenses,
    cashReceipts,
    sales,
    bookings,
    scoutMembers,
    dailyCollectionReports,
    cashAdvanceReimbursementRows
  ])

  const trendData = useMemo(() => {
    const monthCount = 6
    const now = new Date()
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-US', { month: 'short' })
      }
    })

    const income = new Map(months.map((m) => [m.key, 0]))
    const expense = new Map(months.map((m) => [m.key, 0]))
    const addIncome = (dateStr: string, amount: number) => {
      const key = `${new Date(dateStr).getFullYear()}-${new Date(dateStr).getMonth()}`
      if (income.has(key)) income.set(key, (income.get(key) ?? 0) + amount)
    }

    expenses.forEach((e) => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (expense.has(key)) expense.set(key, (expense.get(key) ?? 0) + e.amount)
    })
    cashAdvanceReimbursementRows.forEach(({ voucher: v, amount }) => {
      const d = new Date(v.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (expense.has(key)) expense.set(key, (expense.get(key) ?? 0) + amount)
    })
    cashReceipts.forEach((r) => addIncome(r.date, r.amount))
    sales.filter((s) => !s.voided).forEach((s) => addIncome(s.createdAt, s.totalAmount))
    bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .forEach((b) => addIncome(b.bookingDate, b.amountPaid ?? b.totalAmount))
    scoutMembers.forEach((m) => (m.payments ?? []).forEach((p) => addIncome(p.date, p.amount)))
    dailyCollectionReports.forEach((r) =>
      r.manualReceipts.forEach((line) => addIncome(r.date, line.bcFee + line.csf + line.iccg))
    )

    return months.map((m) => ({
      month: m.label,
      income: income.get(m.key) ?? 0,
      expense: expense.get(m.key) ?? 0
    }))
  }, [
    expenses,
    cashReceipts,
    sales,
    bookings,
    scoutMembers,
    dailyCollectionReports,
    cashAdvanceReimbursementRows
  ])

  async function handleView() {
    preview.openPreview(await buildIncomeStatementPdfDoc({ periodLabel, ...pnl }))
  }

  function handleExportExcel() {
    exportIncomeStatementExcel({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.excel'))
  }

  function handleExportPdf() {
    exportIncomeStatementPdf({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.pdf'))
  }

  function handleExportWord() {
    exportIncomeStatementDocx({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.word'))
  }

  return {
    pnl,
    trendData,
    handleView,
    preview,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}
