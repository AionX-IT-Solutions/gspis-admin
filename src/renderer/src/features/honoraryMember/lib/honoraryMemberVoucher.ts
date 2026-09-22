import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import type { HonoraryMember } from '../types/honoraryMember.types'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

const HONORARY_MEMBER_FEE_ACCOUNT = 'Honorary Member Fee'

/**
 * Keeps one approved Journal Voucher in sync with an Honorary Member Registration's actual
 * Council-retained income — only `membershipFeeCouncilShare` posts (the ₱90 National share of
 * the ₱150 fee is a pure pass-through, never booked), mirroring features/oavf/lib/
 * oavfVoucher.ts's syncOavfRegistrationVoucher.
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to write —
 * callers must check `hasPermission('manage:vouchers')` before calling this, and just skip the
 * sync otherwise.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing needed
 * remitting this time).
 */
export function syncHonoraryMemberRegistrationVoucher(
  member: HonoraryMember,
  registration: HonoraryMemberRegistration
): string | undefined {
  const councilShare = registration.membershipFeeCouncilShare ?? 0
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const memberName = `${member.firstName} ${member.lastName}`.trim()
  const particulars = `Honorary Member Registration — ${memberName} (${registration.schoolYear})`

  if (councilShare <= 0) return registration.linkedVoucherId

  const accountLines: VoucherAccountLine[] = [
    { account: 'Cash on Hand', debit: councilShare, credit: 0 },
    {
      account: HONORARY_MEMBER_FEE_ACCOUNT,
      description: `Honorary Member Fee — ${memberName}`,
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
    payee: memberName,
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
