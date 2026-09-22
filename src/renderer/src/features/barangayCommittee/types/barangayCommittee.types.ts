import type { ReceiptRecord } from '@/shared/types/receipt.types'

// The fixed positions the national GSP "Barangay Committee Registration Form" prints, plus
// "Member" repeated for however many general members a committee has — offered as dropdown
// suggestions on the roster, not enforced as a closed set. Barangay Committee's own roster is
// simpler than District Committee's (no Dist. Commissioner/Troop Organizer/Program Officer/
// DFA rows on this particular paper form).
export const BARANGAY_COMMITTEE_POSITIONS = [
  'Chairman',
  'Vice-Chairman',
  'Secretary',
  'Treasurer',
  'Member'
] as const

export interface BarangayCommittee {
  id: string
  name: string
  address?: string
  telNo?: string
  /** Which District Committee this Barangay Committee reports under — mirrors Troop's own
   *  "District Committee Name/Municipality" field (see troopRegistrationExport.ts), since a
   *  Barangay Committee sits at the same level under a District Committee that a Troop does. */
  districtCommitteeName?: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this committee
   *  belongs to — kept separate from `districtCommitteeName` (the parent committee's own free-
   *  text title) so the Membership Status Report can group this record into the right district
   *  row without fuzzy-matching free text. */
  district?: string
  /** e.g. "Northern Luzon Region" — printed on the paper form's header. */
  region?: string
  /** e.g. "Ilocos Sur Council". */
  council?: string
  isActive: boolean
  /** Flat per-committee fees (B.C. Group Fee) recorded via the Payment tab's bulk payment
   *  flow — see FlatFeePayment below for why these live separately from
   *  BarangayCommitteeMember.payments. */
  flatFeePayments?: FlatFeePayment[]
}

// The B.C. Group Fee is one flat amount per committee, not "amount × member count" — kept on
// the BarangayCommittee itself (mirroring BarangayCommitteeMember.payments' shape) rather than
// forced into MemberPayment, which has no sensible "which member" to attach a committee-wide
// fee to. Mirrors features/districtCommittee/types/districtCommittee.types.ts's FlatFeeCategory
// exactly, one category renamed.
export type FlatFeeCategory = 'bc_group_fee'

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
  /** The approved Journal Voucher this flat fee posted to (see features/barangayCommittee/
   *  lib/bcVoucher.ts) — lets editing/deleting this payment (Payment tab) keep that voucher in
   *  sync instead of leaving an orphaned income record behind. Unset when no one with
   *  voucher-write permission recorded this payment. */
  linkedVoucherId?: string
  /** The receipt printed for this transaction (Record Bulk Payment's mandatory print step) —
   *  stamped identically onto every entry sharing `bulkPaymentId` (one receipt per remittance)
   *  so the Payment tab can reprint it from any of them. */
  receipt?: ReceiptRecord
}

// The Barangay Committee Registration Form's "Members: Re-reg/New" fee is a flat per-member
// amount with no national/council split (same as District Committee's own Members fee) — only
// the B.C. Group Fee is "(To be retained by Council)"; the per-member fee is a pure
// pass-through and never posts to a voucher (see bcVoucher.ts).
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

export interface BarangayCommitteeMember {
  id: string
  barangayCommitteeId: string
  /** One of BARANGAY_COMMITTEE_POSITIONS, or free text for a role worded slightly
   *  differently. */
  position: string
  fullName: string
  birthdate?: string
  /** The paper form's "Group Represented"-equivalent column — which troop/unit this
   *  committee member represents, if any. */
  groupRepresented?: string
  beneficiary?: string
  isActive: boolean
  /** Fees collected for this member over time — recorded via the Payment tab's bulk payment
   *  flow, each tagged with a category. */
  payments?: MemberPayment[]
  /** Reflects this member's status as of the most recently filed Barangay Committee
   *  Registration — same "current state, not full history" pattern as
   *  features/troops ScoutMember.lastRegistrationStatus. */
  lastRegistrationStatus?: 'new' | 're-reg'
}
