import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import type { OavfMember } from '../types/oavfMember.types'
import type { OavfRegistration } from '../types/oavf.types'

const OAVF_FEE_ACCOUNT = 'OAVF/Career Woman Membership Fee'

/**
 * Keeps one approved Journal Voucher in sync with an OAVF/Career Woman Registration's actual
 * Council-retained income — only `membershipFeeCouncilShare` posts (the ₱75 National share of
 * the ₱100 fee is a pure pass-through, never booked), mirroring
 * features/trefoilGuild/lib/tgVoucher.ts's syncRegistrationRemittanceVoucher.
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to write —
 * callers must check `hasPermission('manage:vouchers')` before calling this, and just skip the
 * sync otherwise.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing needed
 * remitting this time).
 */
export function syncOavfRegistrationVoucher(
  member: OavfMember,
  registration: OavfRegistration
): string | undefined {
  const councilShare = registration.membershipFeeCouncilShare ?? 0
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const applicantName = `${member.firstName} ${member.lastName}`.trim()
  const particulars = `OAVF/Career Woman Registration — ${applicantName} (${registration.schoolYear})`

  if (councilShare <= 0) return registration.linkedVoucherId

  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: councilShare, credit: 0 },
    {
      account: OAVF_FEE_ACCOUNT,
      description: `OAVF/Career Woman Membership Fee — ${applicantName}`,
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
    payee: applicantName,
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
