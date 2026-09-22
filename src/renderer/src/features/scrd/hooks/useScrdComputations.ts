import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBanksStore } from '../store/banks.store'
import { safeAmount, useBankBalances } from './useBankBalances'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import {
  getExpenseVouchers,
  hasCashAdvance,
  cashAdvanceReimbursement
} from '@/features/vouchers/lib/expenseVouchers'
import { getReceiptRowsFromVouchers } from '@/features/vouchers/lib/receiptVouchers'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useDailyCollectionsStore } from '@/features/accounting/store/dailyCollections.store'
import { RECEIPT_KIND_LABELS } from '@/shared/types/receipt.types'
import type { MemberPaymentCategory } from '@/features/troops/types/troop.types'
import type { JournalRow, BankAccountBalance } from '../lib/scrdExcelExport'

// Mirrors MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE (budgetAutoActuals.ts) so a Troop payment's
// category label here always names the same Council Budget line its amount actually posts to.
const RECEIPT_CATEGORY_BY_MEMBER_PAYMENT: Record<MemberPaymentCategory, string> = {
  membership: 'Troop Fees',
  training: 'Training Fees',
  camping: 'Camping Fees'
}

export interface JournalDisplayRow extends JournalRow {
  id: string
}

// Categories excluded from "A. General Operations" because they're broken out
// into their own SCRD sections (matching the Council's real SUMMARY sheet).
const RECEIPT_SECTION_CATEGORIES = [
  'NES Sales',
  'Rental Income',
  'Interest Income',
  'Other Operations'
]

// Real account names (per the Council's April 2026 Cash Disbursement ledger)
// that belong under "II. Capital Outlay" / "III. Other Expenses" instead of
// the catch-all "A. Operating Expenses".
const CAPITAL_OUTLAY_NAMES = ['repair and maintenance - campsite', 'building improvement']
const OTHER_EXPENSE_NAMES = ['souvenir book expense', 'souvenir book expenses']

function bucketDisbursementCategory(category: string): 'capital' | 'other' | 'general' {
  const normalized = category.trim().toLowerCase()
  if (CAPITAL_OUTLAY_NAMES.includes(normalized)) return 'capital'
  if (OTHER_EXPENSE_NAMES.includes(normalized)) return 'other'
  return 'general'
}

export function useScrdComputations() {
  const { t } = useTranslation()
  const { banks, bankAccountBalances: baseBankAccountBalances } = useBankBalances()
  const addBank = useBanksStore((s) => s.addBank)
  const updateBank = useBanksStore((s) => s.updateBank)
  const deleteBank = useBanksStore((s) => s.deleteBank)
  const restoreBank = useBanksStore((s) => s.restoreBank)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const cashReceipts = useMemo(() => getReceiptRowsFromVouchers(vouchers), [vouchers])
  // A cash-advance liquidation JV that overspent its advance owes the payee the excess back
  // in real cash — the mirror image of an underspent one's leftover refund, which
  // getReceiptRowsFromVouchers already turns into a "Cash Advance Refund" receipt row above.
  // Journal Vouchers are otherwise never disbursements (see getExpenseVouchers), so this
  // reimbursement leg needs its own row here to actually leave the bank balance.
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
  const spaces = useRentalsStore((s) => s.spaces)
  const purchases = usePOSStore((s) => s.purchases)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const dailyCollectionReports = useDailyCollectionsStore((s) => s.reports)

  const [manualInterestIncome, setManualInterestIncome] = useState(0)
  const [manualOtherIncome, setManualOtherIncome] = useState(0)
  const monthLabel = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  function setOpeningBalance(bankId: string, openingBalance: number) {
    updateBank(bankId, { openingBalance })
  }

  const beginningBalance = useMemo(
    () => banks.reduce((sum, b) => sum + safeAmount(b.openingBalance), 0),
    [banks]
  )

  const receiptRows: JournalDisplayRow[] = useMemo(() => {
    const fromManual: JournalDisplayRow[] = cashReceipts.map((r) => ({
      id: r.id,
      date: r.date,
      name: r.payor,
      particulars: r.particulars,
      reference: r.referenceNumber,
      category: r.category,
      bankAccount: r.bankAccount,
      amount: safeAmount(r.amount),
      receiptType: r.receiptType
    }))
    const fromSales: JournalDisplayRow[] = sales
      .filter((s) => !s.voided)
      .map((s) => ({
        id: s.id,
        date: s.createdAt,
        name: s.cashierName,
        particulars: `NES Sales (${s.saleNumber})`,
        reference: s.saleNumber,
        category: 'NES Sales',
        bankAccount: 'Cash on Hand',
        amount: safeAmount(s.totalAmount),
        receiptType: 'Sales Invoice'
      }))
    const fromRentals: JournalDisplayRow[] = bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .map((b) => ({
        id: b.id,
        date: b.bookingDate,
        name: b.renterName,
        particulars: `${spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? 'Space'} Rental`,
        category: 'Rental Income',
        bankAccount: 'Cash on Hand',
        // What was actually collected (down payment or full settlement), not
        // the contract price — see useBankBalances for the same fallback.
        amount: safeAmount(b.amountPaid ?? b.totalAmount)
      }))
    const fromTroopPayments: JournalDisplayRow[] = scoutMembers.flatMap((m) =>
      (m.payments ?? []).map((payment) => ({
        id: payment.id,
        date: payment.date,
        name: m.fullName,
        particulars: `${RECEIPT_CATEGORY_BY_MEMBER_PAYMENT[payment.category]} (${m.fullName})`,
        category: RECEIPT_CATEGORY_BY_MEMBER_PAYMENT[payment.category],
        bankAccount: 'Cash on Hand',
        amount: safeAmount(payment.amount),
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      }))
    )
    // Daily Collections' hand-entered rows — only the categories with no automated source of
    // their own (BC Fee/CSF/ICCG). The NES/Mem. Reg./Rentals columns on that same form are
    // skipped here since fromSales/fromTroopPayments/fromRentals above already count those
    // amounts from their real records — re-adding them from a manual entry would double-count.
    const fromDailyCollections: JournalDisplayRow[] = dailyCollectionReports.flatMap((r) =>
      r.manualReceipts.flatMap((line) => {
        const rows: JournalDisplayRow[] = []
        const push = (category: string, amount: number) => {
          if (amount > 0) {
            rows.push({
              id: `${line.id}-${category}`,
              date: r.date,
              name: line.receivedFrom,
              particulars: `${category} (${line.siNo})`,
              reference: line.siNo,
              category,
              bankAccount: 'Cash on Hand',
              amount: safeAmount(amount)
            })
          }
        }
        push('BC Fee', line.bcFee)
        push('CSF', line.csf)
        push('ICCG', line.iccg)
        return rows
      })
    )
    return [
      ...fromManual,
      ...fromSales,
      ...fromRentals,
      ...fromTroopPayments,
      ...fromDailyCollections
    ].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [cashReceipts, sales, bookings, spaces, scoutMembers, dailyCollectionReports])

  const disbursementRows: JournalDisplayRow[] = useMemo(
    () =>
      [
        ...getExpenseVouchers(vouchers).map((v) => ({
          id: v.id,
          date: v.date,
          name: v.payee,
          particulars: v.particulars,
          reference: v.checkNumber ? `Check ${v.checkNumber}` : v.voucherNumber,
          category: v.accountLines[0]?.account ?? 'General',
          bankAccount: v.bankAccountRef ?? 'Cash on Hand',
          amount: safeAmount(v.amount)
        })),
        ...cashAdvanceReimbursementRows.map(({ voucher: v, amount }) => ({
          id: `${v.id}-reimbursement`,
          date: v.date,
          name: v.payee,
          particulars: v.particulars,
          reference: v.voucherNumber,
          category: 'Cash Advance Reimbursement',
          bankAccount: v.bankAccountRef ?? 'Cash on Hand',
          amount: safeAmount(amount)
        }))
      ].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [vouchers, cashAdvanceReimbursementRows]
  )

  // Matches the Council's real SCRD format: NES Sales, Rental Income, Interest
  // Income and Other Income are their own sections; everything else manually
  // recorded falls under "A. General Operations".
  const nesSalesTotal = useMemo(
    () =>
      receiptRows.filter((r) => r.category === 'NES Sales').reduce((sum, r) => sum + r.amount, 0),
    [receiptRows]
  )
  const rentalIncomeTotal = useMemo(
    () =>
      receiptRows
        .filter((r) => r.category === 'Rental Income')
        .reduce((sum, r) => sum + r.amount, 0),
    [receiptRows]
  )
  const interestIncomeFromReceipts = useMemo(
    () =>
      receiptRows
        .filter((r) => r.category === 'Interest Income')
        .reduce((sum, r) => sum + r.amount, 0),
    [receiptRows]
  )
  const interestIncome = interestIncomeFromReceipts + manualInterestIncome

  const otherIncomeCategories = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of receiptRows) {
      if (r.category !== 'Other Operations') continue
      map.set(r.particulars, (map.get(r.particulars) ?? 0) + r.amount)
    }
    const rows = Array.from(map.entries()).map(([category, amount]) => ({ category, amount }))
    if (manualOtherIncome)
      rows.push({ category: t('scrd.summary.otherIncomeManualEntry'), amount: manualOtherIncome })
    return rows
  }, [receiptRows, manualOtherIncome, t])

  const generalReceiptCategories = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of receiptRows) {
      if (RECEIPT_SECTION_CATEGORIES.includes(r.category)) continue
      map.set(r.category, (map.get(r.category) ?? 0) + r.amount)
    }
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }))
  }, [receiptRows])

  const nesPurchasesTotal = useMemo(
    () => purchases.reduce((sum, p) => sum + safeAmount(p.amount), 0),
    [purchases]
  )

  const disbursementCategoryTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of getExpenseVouchers(vouchers)) {
      for (const line of v.accountLines) {
        if (line.debit) map.set(line.account, (map.get(line.account) ?? 0) + safeAmount(line.debit))
      }
    }
    for (const { amount } of cashAdvanceReimbursementRows) {
      map.set(
        'Cash Advance Reimbursement',
        (map.get('Cash Advance Reimbursement') ?? 0) + safeAmount(amount)
      )
    }
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }))
  }, [vouchers, cashAdvanceReimbursementRows])

  const generalDisbursementCategories = useMemo(
    () =>
      disbursementCategoryTotals.filter(
        (c) => bucketDisbursementCategory(c.category) === 'general'
      ),
    [disbursementCategoryTotals]
  )
  const capitalOutlayCategories = useMemo(
    () =>
      disbursementCategoryTotals.filter(
        (c) => bucketDisbursementCategory(c.category) === 'capital'
      ),
    [disbursementCategoryTotals]
  )
  const otherExpenseCategories = useMemo(
    () =>
      disbursementCategoryTotals.filter((c) => bucketDisbursementCategory(c.category) === 'other'),
    [disbursementCategoryTotals]
  )

  const receiptTotal =
    receiptRows.reduce((sum, r) => sum + r.amount, 0) + manualInterestIncome + manualOtherIncome
  const disbursementTotal =
    disbursementRows.reduce((sum, r) => sum + r.amount, 0) + nesPurchasesTotal
  const endingBalance = beginningBalance + receiptTotal - disbursementTotal

  // Layers the session-local manual income entries on top of the shared,
  // persisted per-bank balances — "Cash on Hand" and the Cordillera Bank
  // account (the interest-bearing one on the real ledger) absorb them, same
  // special-casing the hardcoded version of this had. NES purchases are
  // already folded into baseBankAccountBalances (see useBankBalances) since
  // they're real persisted data, not a manual entry — only the manual
  // income adjustments are layered here. Deliberately NOT fed back into
  // banks/{id}.currentBalance (that persist happens once, on the clean base
  // balances, inside useBankBalances) so an unsaved manual entry here can't
  // make the persisted total flicker for other viewers/mobile.
  const bankAccountBalances: BankAccountBalance[] = useMemo(
    () =>
      baseBankAccountBalances.map((b) => {
        const extraReceipts =
          (b.account === 'Cordillera Bank #8104' ? manualInterestIncome : 0) +
          (b.account === 'Cash on Hand' ? manualOtherIncome : 0)
        if (!extraReceipts) return b
        const receipts = b.receipts + extraReceipts
        return { ...b, receipts, closing: b.opening + receipts - b.disbursements }
      }),
    [baseBankAccountBalances, manualInterestIncome, manualOtherIncome]
  )

  return {
    monthLabel,
    banks,
    addBank,
    deleteBank,
    restoreBank,
    setOpeningBalance,
    manualInterestIncome,
    setManualInterestIncome,
    manualOtherIncome,
    setManualOtherIncome,
    beginningBalance,
    receiptRows,
    disbursementRows,
    nesSalesTotal,
    rentalIncomeTotal,
    interestIncome,
    otherIncomeCategories,
    generalReceiptCategories,
    nesPurchasesTotal,
    generalDisbursementCategories,
    capitalOutlayCategories,
    otherExpenseCategories,
    receiptTotal,
    disbursementTotal,
    endingBalance,
    bankAccountBalances
  }
}
