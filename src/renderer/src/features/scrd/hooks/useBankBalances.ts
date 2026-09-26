import { useEffect, useMemo, useRef } from 'react'
import { useBanksStore, bankDisplayName } from '../store/banks.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import {
  getExpenseVouchers,
  hasCashAdvance,
  cashAdvanceReimbursement
} from '@/features/vouchers/lib/expenseVouchers'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useDailyCollectionsStore } from '@/features/accounting/store/dailyCollections.store'
import { useCashReceiptRows } from './useCashReceiptRows'
import type { BankAccountBalance } from '../lib/scrdExcelExport'

/**
 * The core "how much money does GSPIS actually have" computation — opening
 * balance plus every receipt minus every disbursement, per bank account.
 * Shared between the SCRD Summary tab (which layers session-local manual
 * income adjustments on top for its own richer breakdown — see
 * useScrdComputations) and the Dashboard (which just wants a live total),
 * so neither duplicates this logic and both stay consistent.
 *
 * Also the bridge that keeps banks/{id}.currentBalance fresh in Firestore
 * for gspi-app's mobile dashboard, which has no cashReceipts/vouchers/POS
 * ledger of its own to compute this from — refreshed automatically whenever
 * either page using this hook (Dashboard or SCRD, both commonly visited) is
 * open, rather than depending on one specific page.
 */
/** Guards every raw-record amount against non-numeric/missing data (e.g. a sale
 *  document written by a stale schema, missing `totalAmount`) — without this, `NaN`
 *  propagates through every sum it touches and never recovers (NaN + x is always NaN),
 *  permanently breaking the Dashboard's and SCRD's totals until the bad doc is found. */
export function safeAmount(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function useBankBalances() {
  const allBanks = useBanksStore((s) => s.banks)
  const setCurrentBalance = useBanksStore((s) => s.setCurrentBalance)
  // Filtering here rather than in the selector: an inline `.filter()` inside
  // a zustand selector returns a new array every render, which makes
  // useSyncExternalStore think the store changed on every render and can
  // spiral into "Maximum update depth exceeded".
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])
  const vouchers = useVouchersStore((s) => s.vouchers)
  // Every real income source the app records — approved Journal Voucher credit lines plus all
  // 9 registration modules' fee/payment records read directly instead of through a voucher
  // (BC/DC/TG/OAVF/ICCG/Honorary/Associate/Troop council shares) — see
  // registrationCashReceipts.ts. Without this, e.g. a Troop's Membership Fee council share
  // never counted toward any bank's balance here at all.
  const cashReceipts = useCashReceiptRows()
  const sales = usePOSStore((s) => s.sales)
  const purchases = usePOSStore((s) => s.purchases)
  const bookings = useRentalsStore((s) => s.bookings)
  const dailyCollectionReports = useDailyCollectionsStore((s) => s.reports)
  // Every deposit logged under Reports > Daily Collections > Cash Deposits — a *transfer*,
  // not new money (the cash was already counted once, as "Cash on Hand", when the underlying
  // sale/booking/payment/receipt happened). So it's subtracted from Cash on Hand and added to
  // the named bank below, rather than being its own separate receipt.
  const deposits = useMemo(
    () => dailyCollectionReports.flatMap((r) => r.deposits),
    [dailyCollectionReports]
  )
  // Daily Collections' hand-entered rows — only BC Fee/CSF/ICCG, the categories with no
  // automated source of their own; the NES/Mem. Reg./Rentals columns on the same form are
  // real cash too, but already counted below from their actual sale/booking/payment records.
  const manualReceiptsTotal = useMemo(
    () =>
      dailyCollectionReports.reduce(
        (sum, r) =>
          sum + r.manualReceipts.reduce((s, line) => s + line.bcFee + line.csf + line.iccg, 0),
        0
      ),
    [dailyCollectionReports]
  )

  const receiptsByAccount = useMemo(() => {
    const map = new Map<string, number>()
    const add = (account: string, amount: number) =>
      map.set(account, (map.get(account) ?? 0) + safeAmount(amount))
    cashReceipts.forEach((r) => add(r.bankAccount, r.amount))
    sales.filter((s) => !s.voided).forEach((s) => add('Cash on Hand', s.totalAmount))
    bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      // amountPaid (down payment or full settlement) is what actually came in as
      // cash — totalAmount is just the contract price. Bookings predating the
      // down-payment feature have no amountPaid recorded, so fall back to
      // totalAmount there (matches the old assume-paid-in-full behavior).
      .forEach((b) => add('Cash on Hand', b.amountPaid ?? b.totalAmount))
    deposits.forEach((d) => add(d.bankName, d.amount))
    add('Cash on Hand', manualReceiptsTotal)
    return map
  }, [cashReceipts, sales, bookings, deposits, manualReceiptsTotal])

  const disbursementsByAccount = useMemo(() => {
    const map = new Map<string, number>()
    const add = (account: string, amount: number) =>
      map.set(account, (map.get(account) ?? 0) + safeAmount(amount))
    getExpenseVouchers(vouchers).forEach((v) => add(v.bankAccountRef ?? 'Cash on Hand', v.amount))
    purchases.forEach((p) => add('Cash on Hand', p.amount))
    deposits.forEach((d) => add('Cash on Hand', d.amount))
    // A cash-advance liquidation JV that overspent its advance owes the payee the excess
    // back in real cash — the mirror image of an underspent one's leftover refund, which
    // getReceiptRowsFromVouchers already counts as a "Cash Advance Refund" receipt above.
    // Journal Vouchers are otherwise never disbursements (see getExpenseVouchers), so this
    // reimbursement leg is the one JV amount that has to be added here explicitly.
    vouchers
      .filter(
        (v) => v.voucherType === 'journal_voucher' && v.status === 'approved' && hasCashAdvance(v)
      )
      .forEach((v) => {
        const reimbursement = cashAdvanceReimbursement(v, v.totalAmountSpent ?? 0)
        if (reimbursement > 0) add(v.bankAccountRef ?? 'Cash on Hand', reimbursement)
      })
    return map
  }, [vouchers, purchases, deposits])

  // Every real registered bank — "Cash on Hand" is one of these too (see banks.store.ts's
  // hydrate, which backfills it for any install that predates it being added to SEED_BANKS),
  // so the fallback bucket every receipt/disbursement lands in when no bank was chosen (the
  // `?? 'Cash on Hand'` / literal 'Cash on Hand' calls feeding receiptsByAccount and
  // disbursementsByAccount above) always has a real doc here to read its opening balance from
  // and persist a closing one back to, same as any other account.
  const bankAccountBalances: BankAccountBalance[] = useMemo(
    () =>
      banks.map((bank) => {
        const displayName = bankDisplayName(bank)
        const opening = safeAmount(bank.openingBalance)
        const receipts = receiptsByAccount.get(displayName) ?? 0
        const disbursements = disbursementsByAccount.get(displayName) ?? 0
        return {
          id: bank.id,
          account: displayName,
          opening,
          receipts,
          disbursements,
          closing: opening + receipts - disbursements
        }
      }),
    [banks, receiptsByAccount, disbursementsByAccount]
  )

  const totalBalance = useMemo(
    () => bankAccountBalances.reduce((sum, b) => sum + b.closing, 0),
    [bankAccountBalances]
  )

  // Guarded by a content fingerprint, not just the effect's dependency
  // array: persisting can trigger this collection's own hydrate/refresh
  // path, which hands back a freshly-built `banks` array — a new reference
  // even when nothing actually changed. Keying off `bankAccountBalances`
  // directly risks re-running this effect on every one of those echoes,
  // which would re-trigger the write, which re-triggers the refresh — an
  // infinite loop. Comparing serialized id:closing pairs means the effect
  // only actually writes when a value has truly changed.
  const balancesFingerprint = bankAccountBalances.map((b) => `${b.id}:${b.closing}`).join('|')
  const lastFingerprintRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastFingerprintRef.current === balancesFingerprint) return
    lastFingerprintRef.current = balancesFingerprint
    bankAccountBalances.forEach((b) => setCurrentBalance(b.id, b.closing))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed off the fingerprint, not the array reference (see comment above)
  }, [balancesFingerprint, setCurrentBalance])

  return { banks, bankAccountBalances, totalBalance }
}
