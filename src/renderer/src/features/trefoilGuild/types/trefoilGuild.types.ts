import type { ReceiptRecord } from '@/shared/types/receipt.types'

// The fixed positions the national GSP "Trefoil Guild Registration Form" prints, plus
// "Member" repeated for however many general members a guild has — offered as dropdown
// suggestions on the roster, not enforced as a closed set. Trefoil Guild's own roster has no
// Vice-Chairman row, unlike Barangay/District Committee's.
export const TREFOIL_GUILD_POSITIONS = ['Chairman', 'Secretary', 'Treasurer', 'Member'] as const

export interface TrefoilGuild {
  id: string
  name: string
  /** The paper form's own "Trefoil Guild Number" field — a Council-assigned guild number,
   *  distinct from this record's internal `id`. */
  guildNumber?: string
  address?: string
  telNo?: string
  email?: string
  /** e.g. "Northern Luzon Region" — printed on the paper form's header. */
  region?: string
  /** e.g. "Ilocos Sur Council". */
  council?: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this guild belongs to
   *  — lets the Membership Status Report group this record into the right district row. */
  district?: string
  isActive: boolean
  /** Flat per-guild fees (T.G. Group Fee) recorded via the Payment tab's bulk payment flow —
   *  see FlatFeePayment below for why these live separately from TrefoilGuildMember.payments. */
  flatFeePayments?: FlatFeePayment[]
}

// The T.G. Group Fee is one flat amount per guild, not "amount × member count" — kept on the
// TrefoilGuild itself (mirroring TrefoilGuildMember.payments' shape) rather than forced into
// MemberPayment, which has no sensible "which member" to attach a guild-wide fee to. Mirrors
// features/barangayCommittee/types/barangayCommittee.types.ts's FlatFeeCategory exactly, one
// category renamed.
export type FlatFeeCategory = 'tg_group_fee'

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
  /** The approved Journal Voucher this flat fee posted to (see features/trefoilGuild/lib/
   *  tgVoucher.ts) — lets editing/deleting this payment (Payment tab) keep that voucher in
   *  sync instead of leaving an orphaned income record behind. Unset when no one with
   *  voucher-write permission recorded this payment. */
  linkedVoucherId?: string
  /** The receipt printed for this transaction (Record Bulk Payment's mandatory print step) —
   *  stamped identically onto every entry sharing `bulkPaymentId` (one receipt per remittance)
   *  so the Payment tab can reprint it from any of them. */
  receipt?: ReceiptRecord
}

// The Trefoil Guild Registration Form's "Members: Re-reg/New" fee is a flat per-member amount
// with no national/council split — only the T.G. Group Fee is "(To be retained by Council)";
// the per-member fee is a pure pass-through and never posts to a voucher (see tgVoucher.ts).
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

export interface TrefoilGuildMember {
  id: string
  trefoilGuildId: string
  /** One of TREFOIL_GUILD_POSITIONS, or free text for a role worded slightly differently. */
  position: string
  fullName: string
  birthdate?: string
  beneficiary?: string
  isActive: boolean
  /** Fees collected for this member over time — recorded via the Payment tab's bulk payment
   *  flow, each tagged with a category. */
  payments?: MemberPayment[]
  /** Reflects this member's status as of the most recently filed Trefoil Guild Registration —
   *  same "current state, not full history" pattern as
   *  features/troops ScoutMember.lastRegistrationStatus. */
  lastRegistrationStatus?: 'new' | 're-reg'
}
