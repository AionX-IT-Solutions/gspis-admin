import { useMemo } from 'react'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getReceiptRowsFromVouchers } from '@/features/vouchers/lib/receiptVouchers'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useBarangayCommitteeStore } from '@/features/barangayCommittee/store/barangayCommittee.store'
import { useDistrictCommitteeStore } from '@/features/districtCommittee/store/districtCommittee.store'
import { useTrefoilGuildStore } from '@/features/trefoilGuild/store/trefoilGuild.store'
import { useOavfStore } from '@/features/oavf/store/oavf.store'
import { useOavfMemberStore } from '@/features/oavf/store/oavfMember.store'
import { useIccgMemberStore } from '@/features/iccgRegistration/store/iccgMember.store'
import { useHonoraryMemberRegistrationStore } from '@/features/honoraryMember/store/honoraryMemberRegistration.store'
import { useHonoraryMemberStore } from '@/features/honoraryMember/store/honoraryMember.store'
import { useAssociateMemberRegistrationStore } from '@/features/associateMember/store/associateMemberRegistration.store'
import { useAssociateMemberStore } from '@/features/associateMember/store/associateMember.store'
import {
  buildRegistrationCashReceipts,
  RESERVED_AUTO_CATEGORIES
} from '../lib/registrationCashReceipts'
import type { CashReceipt } from '../types/cashReceipts.types'

/**
 * The single source of truth for every Cash Receipt row that isn't POS/Rentals/Troop membership
 * payments/Daily Collections — combines genuinely manual approved Journal Vouchers (cash-advance
 * refunds, any ad-hoc income an accountant records by hand via "+ New Voucher") with the 9
 * registration modules' fee/payment records read directly instead of through a voucher (see
 * registrationCashReceipts.ts for why those categories no longer ever post to one). Shared by
 * SCRD's Cash Receipts Journal (useScrdComputations.ts) and Council Budget's income auto-actuals
 * (useBudget.ts) so both always agree on the same figures.
 */
export function useCashReceiptRows(): CashReceipt[] {
  const vouchers = useVouchersStore((s) => s.vouchers)
  const troopRegistrations = useTroopRegistrationStore((s) => s.registrations)
  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const barangayCommittees = useBarangayCommitteeStore((s) => s.committees)
  const districtCommittees = useDistrictCommitteeStore((s) => s.committees)
  const trefoilGuilds = useTrefoilGuildStore((s) => s.guilds)
  const oavfRegistrations = useOavfStore((s) => s.registrations)
  const oavfMembers = useOavfMemberStore((s) => s.members)
  const iccgMembers = useIccgMemberStore((s) => s.members)
  const honoraryMemberRegistrations = useHonoraryMemberRegistrationStore((s) => s.registrations)
  const honoraryMembers = useHonoraryMemberStore((s) => s.members)
  const associateMemberRegistrations = useAssociateMemberRegistrationStore((s) => s.registrations)
  const associateMembers = useAssociateMemberStore((s) => s.members)

  return useMemo(() => {
    const fromVouchers = getReceiptRowsFromVouchers(vouchers).filter(
      (r) => !RESERVED_AUTO_CATEGORIES.includes(r.category)
    )
    const fromRegistrations = buildRegistrationCashReceipts({
      troopRegistrations,
      troops,
      scoutMembers,
      barangayCommittees,
      districtCommittees,
      trefoilGuilds,
      oavfRegistrations,
      oavfMembers,
      iccgMembers,
      honoraryMemberRegistrations,
      honoraryMembers,
      associateMemberRegistrations,
      associateMembers
    })
    return [...fromVouchers, ...fromRegistrations]
  }, [
    vouchers,
    troopRegistrations,
    troops,
    scoutMembers,
    barangayCommittees,
    districtCommittees,
    trefoilGuilds,
    oavfRegistrations,
    oavfMembers,
    iccgMembers,
    honoraryMemberRegistrations,
    honoraryMembers,
    associateMemberRegistrations,
    associateMembers
  ])
}
