import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import { RECEIPT_KIND_LABELS, type ReceiptRecord } from '@/shared/types/receipt.types'
import type { FlatFeePayment, Troop } from '../types/troop.types'

const ACCOUNT_BY_CATEGORY: Record<FlatFeePayment['category'], string> = {
  troop_fee: 'Troop Fees',
  thinking_day: 'Thinking Day Fund'
}

const LABEL_BY_CATEGORY: Record<FlatFeePayment['category'], string> = {
  troop_fee: 'Troop Fee',
  thinking_day: 'Thinking Day Fee'
}

function buildAccountLines(
  troop: Troop,
  flatPayments: FlatFeePayment[]
): { accountLines: VoucherAccountLine[]; amount: number } {
  const credits: VoucherAccountLine[] = flatPayments
    .filter((p) => p.amount > 0)
    .map((p) => ({
      account: ACCOUNT_BY_CATEGORY[p.category],
      description: `${LABEL_BY_CATEGORY[p.category]} — ${troop.troopNumber}`,
      debit: 0,
      credit: p.amount
    }))
  const amount = credits.reduce((sum, l) => sum + l.credit, 0)
  return {
    accountLines: [{ account: 'Cash on Hand', debit: amount, credit: 0 }, ...credits],
    amount
  }
}

/**
 * Posts ONE receipt (approved Journal Voucher) for an entire Bulk Payment transaction — every
 * flat per-troop fee recorded together in the same remittance (Troop Fee, Thinking Day Fee)
 * shares a single voucher with one credit line per category, rather than a separate voucher
 * per fee type. A Troop Leader remitting Troop Fee + Thinking Day Fee at once physically hands
 * over one payment and gets one receipt — this mirrors that, and is what makes the receipt
 * countable ("isang resibo every transaction") the same way SCRD's Cash Receipts journal and
 * the Council Budget's income auto-actuals expect (both derive from approved voucher credit
 * lines — see budgetAutoActuals.ts's computeBudgetAutoActuals and
 * features/troopRegistration/lib/remittanceVoucher.ts, which does the same one-voucher/
 * several-credit-lines thing for a filed registration's own remittance).
 *
 * Callers must check `hasPermission('manage:vouchers')` first and just skip this entirely
 * otherwise — Firestore's `vouchers` collection only allows super_admin/admin/accountant/
 * manager to write, not hr, even though hr can record a bulk payment.
 *
 * Returns the created voucher's id (undefined if nothing was posted) so the caller can save it
 * back onto every one of this transaction's FlatFeePayments as `linkedVoucherId` — that's what
 * lets a later edit/delete of this same transaction (Payment tab) keep the voucher in sync
 * instead of leaving an orphaned income record behind (see syncBulkPaymentVoucher /
 * deleteBulkPaymentVoucher below).
 */
export function postBulkPaymentVoucher(
  troop: Troop,
  flatPayments: FlatFeePayment[],
  date: string,
  paidByName: string,
  /** The receipt printed for this same transaction, if the "Print a receipt" toggle was used
   *  (see useRecordBulkPaymentModal.ts) — stamped onto the voucher so SCRD's Cash Receipts
   *  Journal can show which booklet backs it, same as the physical OR/AR number. */
  receipt?: ReceiptRecord
): string | undefined {
  const { accountLines, amount } = buildAccountLines(troop, flatPayments)
  if (amount <= 0) return undefined

  const { vouchers, addVoucher, decideVoucher } = useVouchersStore.getState()
  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date,
    modeOfPayment: 'cash',
    payee: paidByName || troop.leaderName,
    particulars: `Troop Payment — ${troop.troopNumber}`,
    amount,
    accountLines,
    orNumber: receipt?.receiptNumber,
    receiptType: receipt ? RECEIPT_KIND_LABELS[receipt.receiptType] : undefined
  })

  const created = useVouchersStore
    .getState()
    .vouchers.find((v) => v.voucherNumber === voucherNumber && v.voucherType === 'journal_voucher')
  if (!created) return undefined
  decideVoucher(created.id, 'approved')
  return created.id
}

/** Rebuilds a shared bulk-payment voucher's account lines after the Payment tab edits or
 *  partially deletes that transaction — e.g. editing the date/payer re-stamps the same
 *  receipt rather than leaving it out of sync, and deleting just one fee line (keeping
 *  another) drops that one credit line instead of the whole receipt. Deletes the voucher
 *  outright once no fee lines remain. Callers must check `hasPermission('manage:vouchers')`
 *  first, same as postBulkPaymentVoucher. */
export function syncBulkPaymentVoucher(
  troop: Troop,
  linkedVoucherId: string,
  remainingFlatPayments: FlatFeePayment[],
  date: string,
  paidByName: string
): void {
  const { accountLines, amount } = buildAccountLines(troop, remainingFlatPayments)
  if (amount <= 0) {
    useVouchersStore.getState().deleteVoucher(linkedVoucherId)
    return
  }
  useVouchersStore.getState().updateVoucher(linkedVoucherId, {
    date,
    payee: paidByName || troop.leaderName,
    amount,
    accountLines
  })
}

/** Removes a bulk-payment transaction's shared voucher entirely (every fee line in it was
 *  deleted) — otherwise the voucher would keep recording income for a transaction that no
 *  longer exists. Callers must check `hasPermission('manage:vouchers')` first, same as
 *  postBulkPaymentVoucher. */
export function deleteBulkPaymentVoucher(linkedVoucherId: string): void {
  useVouchersStore.getState().deleteVoucher(linkedVoucherId)
}
