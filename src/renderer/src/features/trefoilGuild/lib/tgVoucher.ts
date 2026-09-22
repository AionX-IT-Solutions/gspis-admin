import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import { RECEIPT_KIND_LABELS, type ReceiptRecord } from '@/shared/types/receipt.types'
import type { TrefoilGuild, FlatFeePayment } from '../types/trefoilGuild.types'
import type { TrefoilGuildRegistration } from '../types/trefoilGuildRegistration.types'

const TG_GROUP_FEE_ACCOUNT = 'TG Group Fee'

function buildFlatFeeLines(
  guild: TrefoilGuild,
  flatPayments: FlatFeePayment[]
): { accountLines: VoucherAccountLine[]; amount: number } {
  const credits: VoucherAccountLine[] = flatPayments
    .filter((p) => p.amount > 0)
    .map((p) => ({
      account: TG_GROUP_FEE_ACCOUNT,
      description: `T.G. Group Fee — ${guild.name}`,
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
 * "one receipt per transaction" reasoning as features/barangayCommittee/lib/bcVoucher.ts's
 * postBulkPaymentVoucher. The per-member Membership Fee never posts here (it's a pure
 * pass-through with no council share — see trefoilGuild.types.ts) — only the flat T.G. Group
 * Fee does, since that's the one line the Council actually retains.
 *
 * Callers must check `hasPermission('manage:vouchers')` first and just skip this entirely
 * otherwise — Firestore's `vouchers` collection only allows super_admin/admin/accountant/
 * manager to write, not hr, even though hr can record a bulk payment.
 *
 * Returns the created voucher's id (undefined if nothing was posted) so the caller can save it
 * back onto every one of this transaction's FlatFeePayments as `linkedVoucherId`.
 */
export function postBulkPaymentVoucher(
  guild: TrefoilGuild,
  flatPayments: FlatFeePayment[],
  date: string,
  paidByName: string,
  /** The receipt printed for this same transaction — stamped onto the voucher so SCRD's Cash
   *  Receipts Journal can show which booklet backs it, same as the physical OR/AR number. */
  receipt?: ReceiptRecord
): string | undefined {
  const { accountLines, amount } = buildFlatFeeLines(guild, flatPayments)
  if (amount <= 0) return undefined

  const { vouchers, addVoucher, decideVoucher } = useVouchersStore.getState()
  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date,
    modeOfPayment: 'cash',
    payee: paidByName || guild.name,
    particulars: `Trefoil Guild Payment — ${guild.name}`,
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
  guild: TrefoilGuild,
  linkedVoucherId: string,
  remainingFlatPayments: FlatFeePayment[],
  date: string,
  paidByName: string
): void {
  const { accountLines, amount } = buildFlatFeeLines(guild, remainingFlatPayments)
  if (amount <= 0) {
    useVouchersStore.getState().deleteVoucher(linkedVoucherId)
    return
  }
  useVouchersStore.getState().updateVoucher(linkedVoucherId, {
    date,
    payee: paidByName || guild.name,
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
 * Keeps one approved Journal Voucher in sync with a filed Trefoil Guild Registration's actual
 * Council-retained income (the T.G. Group Fee only — NOT the Members fee, which has no
 * council share, and not Program Development Fund/Mutual Assistance Fund, which are recorded
 * on the filing but aren't Council income either) — mirrors
 * features/barangayCommittee/lib/bcVoucher.ts's syncRegistrationRemittanceVoucher exactly.
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to write
 * — callers must check `hasPermission('manage:vouchers')` before calling this, and just skip
 * the sync otherwise.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing needed
 * remitting this time).
 */
export function syncRegistrationRemittanceVoucher(
  registration: TrefoilGuildRegistration,
  guild: TrefoilGuild
): string | undefined {
  const tgGroupFee = registration.tgGroupFee ?? 0
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const particulars = `Trefoil Guild Registration Remittance — ${guild.name} (${registration.schoolYear})`

  if (tgGroupFee <= 0) return registration.linkedVoucherId

  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: tgGroupFee, credit: 0 },
    {
      account: TG_GROUP_FEE_ACCOUNT,
      description: `T.G. Group Fee — ${guild.name}`,
      debit: 0,
      credit: tgGroupFee
    }
  ]

  const existing = registration.linkedVoucherId
    ? vouchers.find((v) => v.id === registration.linkedVoucherId)
    : undefined
  if (existing) {
    updateVoucher(existing.id, {
      date: registration.dateApplied,
      particulars,
      amount: tgGroupFee,
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
    payee: guild.name,
    particulars,
    amount: tgGroupFee,
    accountLines
  })
  const created = useVouchersStore
    .getState()
    .vouchers.find((v) => v.voucherNumber === voucherNumber && v.voucherType === 'journal_voucher')
  if (!created) return undefined
  decideVoucher(created.id, 'approved')
  return created.id
}
