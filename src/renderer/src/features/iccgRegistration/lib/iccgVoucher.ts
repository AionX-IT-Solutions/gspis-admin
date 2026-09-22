import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import { RECEIPT_KIND_LABELS, type ReceiptRecord } from '@/shared/types/receipt.types'
import type { Troop } from '@/features/troops/types/troop.types'
import { councilRetainedIccgFeeShare, type IccgRegistration } from '../types/iccgRegistration.types'
import type { MemberPayment } from '../types/iccgMember.types'

const ICCG_FEE_ACCOUNT = 'ICCG Registration Fee'

/**
 * Keeps one approved Journal Voucher in sync with a filed ICCG Registration's actual
 * Council-retained income — the GSP Membership Fee is ₱20/member, of which only ₱5 is Council
 * income (₱15 is forwarded to National HQ as a pure pass-through, same as Troop
 * Registration's own GSP Membership Fee — see councilRetainedIccgFeeShare()), NOT the full
 * Girls + Adults amount collected. Same "one voucher per filing" pattern as
 * features/troopRegistration/lib/remittanceVoucher.ts.
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to
 * write (not hr, even though hr can file a registration) — callers must check
 * `hasPermission('manage:vouchers')` before calling this, and just skip the sync
 * otherwise; a registration filed by someone without that permission simply has no
 * `linkedVoucherId` until an accountant/manager opens and re-saves it.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing
 * needed remitting this time, so a previously-created voucher is never retroactively
 * deleted just because this save's figures dropped to zero).
 */
export function syncIccgRegistrationVoucher(
  registration: IccgRegistration,
  troop: Troop
): string | undefined {
  const councilShare = councilRetainedIccgFeeShare(registration.fee)
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const label = `${registration.school} (Troop ${troop.troopNumber}, ${registration.schoolYear})`
  const particulars = `ICCG Registration Fee (Council share) — ${label}`

  if (councilShare <= 0) return registration.linkedVoucherId

  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: councilShare, credit: 0 },
    {
      account: ICCG_FEE_ACCOUNT,
      description: particulars,
      debit: 0,
      credit: councilShare
    }
  ]

  const existing = registration.linkedVoucherId
    ? vouchers.find((v) => v.id === registration.linkedVoucherId)
    : undefined
  if (existing) {
    updateVoucher(existing.id, {
      date: registration.dateApplied,
      particulars,
      amount: councilShare,
      accountLines
    })
    return existing.id
  }

  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date: registration.dateApplied,
    modeOfPayment: 'cash',
    payee: registration.submittedByName || troop.leaderName,
    particulars,
    amount: councilShare,
    accountLines
  })
  const created = useVouchersStore
    .getState()
    .vouchers.find((v) => v.voucherNumber === voucherNumber && v.voucherType === 'journal_voucher')
  if (!created) return undefined
  decideVoucher(created.id, 'approved')
  return created.id
}

function buildPaymentLines(payments: MemberPayment[]): {
  accountLines: VoucherAccountLine[]
  amount: number
} {
  // Only the council-share portion of each payment posts here — the rest of what was
  // collected (councilShareAmount < amount) is the ₱15/member forwarded to National HQ as a
  // pure pass-through, same split as the registration's own fee (see
  // iccgRegistration.types.ts's councilRetainedIccgFeeShare).
  const amount = payments.reduce((sum, p) => sum + p.councilShareAmount, 0)
  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: amount, credit: 0 },
    { account: ICCG_FEE_ACCOUNT, debit: 0, credit: amount }
  ]
  return { accountLines, amount }
}

/**
 * Posts ONE receipt (approved Journal Voucher) for an entire Payment tab Bulk Payment
 * transaction's Council-retained income — same "one receipt per transaction" reasoning as
 * features/trefoilGuild/lib/tgVoucher.ts's postBulkPaymentVoucher. Only each payment's
 * `councilShareAmount` posts (not the full `amount` collected — see buildPaymentLines above).
 *
 * Callers must check `hasPermission('manage:vouchers')` first and just skip this entirely
 * otherwise — Firestore's `vouchers` collection only allows super_admin/admin/accountant/
 * manager to write, not hr, even though hr can record a bulk payment.
 *
 * Returns the created voucher's id (undefined if nothing was posted) so the caller can save it
 * back onto every one of this transaction's payments as `linkedVoucherId`.
 */
export function postBulkPaymentVoucher(
  payments: MemberPayment[],
  date: string,
  paidByName: string,
  /** The receipt printed for this same transaction — stamped onto the voucher so SCRD's Cash
   *  Receipts Journal can show which booklet backs it, same as the physical OR/AR number. */
  receipt?: ReceiptRecord
): string | undefined {
  const { accountLines, amount } = buildPaymentLines(payments)
  if (amount <= 0) return undefined

  const { vouchers, addVoucher, decideVoucher } = useVouchersStore.getState()
  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date,
    modeOfPayment: 'cash',
    payee: paidByName,
    particulars: 'ICCG Registration Fee (Council share)',
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
 *  partially deletes that transaction. Deletes the voucher outright once no payment lines
 *  remain. Callers must check `hasPermission('manage:vouchers')` first, same as
 *  postBulkPaymentVoucher. */
export function syncBulkPaymentVoucher(
  linkedVoucherId: string,
  remainingPayments: MemberPayment[],
  date: string,
  paidByName: string
): void {
  const { accountLines, amount } = buildPaymentLines(remainingPayments)
  if (amount <= 0) {
    useVouchersStore.getState().deleteVoucher(linkedVoucherId)
    return
  }
  useVouchersStore.getState().updateVoucher(linkedVoucherId, {
    date,
    payee: paidByName,
    amount,
    accountLines
  })
}

/** Removes a bulk-payment transaction's shared voucher entirely. Callers must check
 *  `hasPermission('manage:vouchers')` first, same as postBulkPaymentVoucher. */
export function deleteBulkPaymentVoucher(linkedVoucherId: string): void {
  useVouchersStore.getState().deleteVoucher(linkedVoucherId)
}
