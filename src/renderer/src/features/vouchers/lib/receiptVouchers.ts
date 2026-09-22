import type { CashReceipt } from '@/features/scrd/types/cashReceipts.types'
import type { Voucher } from '../types/vouchers.types'

/**
 * GSPI records incoming cash the same way it records outgoing cash: a Journal Voucher, credit
 * side. This is the credit-side counterpart of expenseVouchers.ts's getExpenseVouchers/
 * voucherCategory — approved Journal Vouchers only (pending/cancelled ones haven't actually
 * come in yet, and a Check Voucher is only ever a disbursement, never a receipt), flattened
 * one row per credit line so a voucher that (rarely) records more than one income category
 * still contributes each to its own line.
 *
 * A cash-advance liquidation JV (cashAdvanceAmount set) is the one exception: its credit
 * line just clears the internal "Cash Advance" receivable back to zero — it isn't new money
 * coming in, since that cash already left the bank when the advance itself was disbursed
 * (a separate, earlier Check Voucher). Counting that clearing line here as a receipt would
 * cancel out the real expense (totalAmountSpent) it was meant to record — the advance would
 * net to zero regardless of how much was actually spent. The only genuine new cash movement
 * at liquidation time is whatever was physically handed back (amountRefunded), so that's the
 * only figure counted as a receipt for this kind of JV.
 */
export function getReceiptRowsFromVouchers(vouchers: Voucher[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const voucher of vouchers) {
    if (voucher.voucherType !== 'journal_voucher' || voucher.status !== 'approved') continue

    if (voucher.cashAdvanceAmount !== undefined) {
      if (voucher.amountRefunded) {
        rows.push({
          id: `${voucher.id}-refund`,
          date: voucher.refundDate || voucher.date,
          payor: voucher.payee,
          particulars: `${voucher.particulars} (cash advance refund)`,
          referenceNumber: voucher.refundOrNumber || voucher.voucherNumber,
          category: 'Cash Advance Refund',
          bankAccount: voucher.bankAccountRef ?? 'Cash on Hand',
          amount: voucher.amountRefunded,
          receiptType: voucher.receiptType
        })
      }
      continue
    }

    voucher.accountLines.forEach((line, index) => {
      if (!line.credit) return
      rows.push({
        id: `${voucher.id}-${index}`,
        date: voucher.date,
        payor: voucher.payee,
        particulars: voucher.particulars,
        referenceNumber: voucher.orNumber || voucher.voucherNumber,
        category: line.account.trim() || 'Other Operations',
        bankAccount: voucher.bankAccountRef ?? 'Cash on Hand',
        amount: line.credit,
        receiptType: voucher.receiptType
      })
    })
  }
  return rows
}
