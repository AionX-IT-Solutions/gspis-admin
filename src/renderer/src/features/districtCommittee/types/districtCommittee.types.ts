import type { ReceiptRecord } from '@/shared/types/receipt.types'

// The fixed positions the national GSP "District Committee Registration Form" prints, plus
// "Member" repeated for however many general members a committee has — offered as dropdown
// suggestions on the roster, not enforced as a closed set (a district can title a role
// slightly differently).
export const DISTRICT_COMMITTEE_POSITIONS = [
  'Chairman',
  'Vice-Chairman',
  'Secretary',
  'Treasurer',
  'Dist. Commissioner',
  'Troop Organizer',
  'Program Officer',
  'DFA',
  'Member'
] as const

export interface DistrictCommittee {
  id: string
  name: string
  address?: string
  telNo?: string
  /** e.g. "Northern Luzon Region" — printed on the paper form's header. */
  region?: string
  /** e.g. "Ilocos Sur Council". */
  council?: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this committee
   *  belongs to — kept separate from `name` (the committee's own formal title, which doesn't
   *  always read as an exact district name) so the Membership Status Report can group this
   *  record into the right district row without fuzzy-matching free text. */
  district?: string
  isActive: boolean
  /** Flat per-committee fees (D.C. Group Fee) recorded via the Payment tab's bulk payment
   *  flow — see FlatFeePayment below for why these live separately from
   *  DistrictCommitteeMember.payments. */
  flatFeePayments?: FlatFeePayment[]
}

// The D.C. Group Fee is one flat amount per committee, not "amount × member count" — kept on
// the DistrictCommittee itself (mirroring DistrictCommitteeMember.payments' shape) rather than
// forced into MemberPayment, which has no sensible "which member" to attach a committee-wide
// fee to. Unlike Troops (which also has a Thinking Day Fee), there's only this one flat fee
// category here — kept as its own type regardless, so a second one can be added later without
// reshaping every caller.
export type FlatFeeCategory = 'dc_group_fee'

export interface FlatFeePayment {
  id: string
  date: string
  amount: number
  category: FlatFeeCategory
  /** Shares a MemberPayment.bulkPaymentId from the same Payment-tab submission when the
   *  per-member Membership Fee was recorded alongside this one, so the Payment tab groups
   *  them back into the lines of a single remittance event. */
  bulkPaymentId?: string
  paidByName?: string
  /** The approved Journal Voucher this flat fee posted to (see features/districtCommittee/
   *  lib/dcVoucher.ts) — lets editing/deleting this payment (Payment tab) keep that voucher in
   *  sync instead of leaving an orphaned income record behind. Unset when no one with
   *  voucher-write permission recorded this payment. */
  linkedVoucherId?: string
  /** The receipt printed for this transaction (Record Bulk Payment's optional "Print a
   *  receipt" toggle) — stamped identically onto every entry sharing `bulkPaymentId` (one
   *  receipt per remittance) so the Payment tab can reprint it from any of them. Unset when
   *  printing wasn't used for this payment. */
  receipt?: ReceiptRecord
}

// The District Committee Registration Form's "Members: Re-reg/New" fee is a flat ₱50/member
// with NO national/council split (unlike Troops' membership fee) — per the Council's own
// note, only the D.C. Group Fee is "(To be retained by Council)"; the per-member fee is a
// pure pass-through and never posts to a voucher (see dcVoucher.ts). Kept as its own category
// type regardless, matching the Troops pattern, in case a second per-member fee is ever added.
export type MemberPaymentCategory = 'membership'

export interface MemberPayment {
  id: string
  /** ISO date this payment was collected. */
  date: string
  amount: number
  category: MemberPaymentCategory
  /** Groups this payment with others recorded together as one lump-sum remittance — see
   *  Troop.MemberPayment.bulkPaymentId for the full rationale; same pattern here. */
  bulkPaymentId?: string
  paidByName?: string
  /** The receipt printed for this transaction — see FlatFeePayment.receipt above for the
   *  full rationale; same pattern here. */
  receipt?: ReceiptRecord
}

export interface DistrictCommitteeMember {
  id: string
  districtCommitteeId: string
  /** One of DISTRICT_COMMITTEE_POSITIONS, or free text for a role worded slightly
   *  differently. */
  position: string
  fullName: string
  birthdate?: string
  /** The paper form's "Group Represented" column — which troop/unit this committee member
   *  represents. */
  groupRepresented?: string
  beneficiary?: string
  isActive: boolean
  /** Fees collected for this member over time — recorded via the Payment tab's bulk payment
   *  flow, each tagged with a category. */
  payments?: MemberPayment[]
  /** Reflects this member's status as of the most recently filed District Committee
   *  Registration — same "current state, not full history" pattern as
   *  features/troops ScoutMember.lastRegistrationStatus. */
  lastRegistrationStatus?: 'new' | 're-reg'
}
