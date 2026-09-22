import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import { RECEIPT_KIND_LABELS, type ReceiptRecord } from '@/shared/types/receipt.types'
import type { DistrictCommittee, FlatFeePayment } from '../types/districtCommittee.types'
import type { DistrictCommitteeRegistration } from '../types/districtCommitteeRegistration.types'

const DC_GROUP_FEE_ACCOUNT = 'DC Group Fee'

function buildFlatFeeLines(
  committee: DistrictCommittee,
  flatPayments: FlatFeePayment[]
): { accountLines: VoucherAccountLine[]; amount: number } {
  const credits: VoucherAccountLine[] = flatPayments
    .filter((p) => p.amount > 0)
    .map((p) => ({
      account: DC_GROUP_FEE_ACCOUNT,
      description: `D.C. Group Fee — ${committee.name}`,
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
 * Posts ONE receipt (approved Journal Voucher) for an entire Bulk Payment transaction — same
 * "one receipt per transaction" reasoning as features/troops/lib/flatFeeVoucher.ts's
 * postBulkPaymentVoucher. The per-member Membership Fee never posts here (it's a pure
 * pass-through with no council share — see districtCommittee.types.ts) — only the flat D.C.
 * Group Fee does, since that's the one line the Council actually retains.
 *
 * Callers must check `hasPermission('manage:vouchers')` first and just skip this entirely
 * otherwise — Firestore's `vouchers` collection only allows super_admin/admin/accountant/
 * manager to write, not hr, even though hr can record a bulk payment.
 *
 * Returns the created voucher's id (undefined if nothing was posted) so the caller can save it
 * back onto every one of this transaction's FlatFeePayments as `linkedVoucherId`.
 */
export function postBulkPaymentVoucher(
  committee: DistrictCommittee,
  flatPayments: FlatFeePayment[],
  date: string,
  paidByName: string,
  /** The receipt printed for this same transaction, if the "Print a receipt" toggle was used
   *  (see useRecordDCBulkPaymentModal.ts) — stamped onto the voucher so SCRD's Cash Receipts
   *  Journal can show which booklet backs it, same as the physical OR/AR number. */
  receipt?: ReceiptRecord
): string | undefined {
  const { accountLines, amount } = buildFlatFeeLines(committee, flatPayments)
  if (amount <= 0) return undefined

  const { vouchers, addVoucher, decideVoucher } = useVouchersStore.getState()
  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date,
    modeOfPayment: 'cash',
    payee: paidByName || committee.name,
    particulars: `District Committee Payment — ${committee.name}`,
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
 *  partially deletes that transaction. Deletes the voucher outright once no fee lines remain.
 *  Callers must check `hasPermission('manage:vouchers')` first, same as
 *  postBulkPaymentVoucher. */
export function syncBulkPaymentVoucher(
  committee: DistrictCommittee,
  linkedVoucherId: string,
  remainingFlatPayments: FlatFeePayment[],
  date: string,
  paidByName: string
): void {
  const { accountLines, amount } = buildFlatFeeLines(committee, remainingFlatPayments)
  if (amount <= 0) {
    useVouchersStore.getState().deleteVoucher(linkedVoucherId)
    return
  }
  useVouchersStore.getState().updateVoucher(linkedVoucherId, {
    date,
    payee: paidByName || committee.name,
    amount,
    accountLines
  })
}

/** Removes a bulk-payment transaction's shared voucher entirely. Callers must check
 *  `hasPermission('manage:vouchers')` first, same as postBulkPaymentVoucher. */
export function deleteBulkPaymentVoucher(linkedVoucherId: string): void {
  useVouchersStore.getState().deleteVoucher(linkedVoucherId)
}

/**
 * Keeps one approved Journal Voucher in sync with a filed District Committee Registration's
 * actual Council-retained income (the D.C. Group Fee only — NOT the Members fee, which has no
 * council share, and not Program Development Fund/Mutual Assistance Fund, which are recorded
 * on the filing but aren't Council income either) — mirrors
 * features/troopRegistration/lib/remittanceVoucher.ts's syncRemittanceVoucher exactly.
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to write
 * — callers must check `hasPermission('manage:vouchers')` before calling this, and just skip
 * the sync otherwise.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing needed
 * remitting this time).
 */
export function syncRegistrationRemittanceVoucher(
  registration: DistrictCommitteeRegistration,
  committee: DistrictCommittee
): string | undefined {
  const dcGroupFee = registration.dcGroupFee ?? 0
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const particulars = `District Committee Registration Remittance — ${committee.name} (${registration.schoolYear})`

  if (dcGroupFee <= 0) return registration.linkedVoucherId

  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: dcGroupFee, credit: 0 },
    {
      account: DC_GROUP_FEE_ACCOUNT,
      description: `D.C. Group Fee — ${committee.name}`,
      debit: 0,
      credit: dcGroupFee
    }
  ]

  const existing = registration.linkedVoucherId
    ? vouchers.find((v) => v.id === registration.linkedVoucherId)
    : undefined
  if (existing) {
    updateVoucher(existing.id, {
      date: registration.dateApplied,
      particulars,
      amount: dcGroupFee,
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
    payee: committee.name,
    particulars,
    amount: dcGroupFee,
    accountLines
  })
  const created = useVouchersStore
    .getState()
    .vouchers.find((v) => v.voucherNumber === voucherNumber && v.voucherType === 'journal_voucher')
  if (!created) return undefined
  decideVoucher(created.id, 'approved')
  return created.id
}
