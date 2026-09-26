import type { ReceiptRecord } from '@/shared/types/receipt.types'

// ICCG's persistent per-troop roster — one record per girl or adult ever filed on an ICCG
// Registration for that troop, kept around (mirroring features/trefoilGuild's
// TrefoilGuildMember) so fee collection can be tracked as an ongoing ledger via the Payment
// tab, independent of any one year's filed Registration snapshot.

export type IccgMemberRole = 'girl' | 'adult'

// The GSP Membership Fee is ₱20/member, of which only ₱5 is Council income — the other ₱15
// is forwarded to National HQ as a pure pass-through (same split as the registration's own
// fee box — see features/iccgRegistration/types/iccgRegistration.types.ts's
// councilRetainedIccgFeeShare). Split by role (rather than one flat 'membership' category)
// since the paper form's own fee box prices Girls and Adults separately ("No. of Girls:
// P___", "No. of Adult: P___").
export type MemberPaymentCategory = 'girls_fee' | 'adults_fee'

export interface MemberPayment {
  id: string
  /** ISO date this payment was collected. */
  date: string
  /** The FULL amount collected from this person (e.g. ₱20) — what the printed receipt shows. */
  amount: number
  /** The portion of `amount` that's actually Council income (e.g. ₱5 of the ₱20) — the rest
   *  is forwarded to National HQ and never posts to a voucher. See iccgVoucher.ts. */
  councilShareAmount: number
  category: MemberPaymentCategory
  /** Groups this payment with others recorded together as one lump-sum remittance — same
   *  bulkPaymentId pattern as every other Troops & Membership Payment tab. */
  bulkPaymentId?: string
  paidByName?: string
  /** The approved Journal Voucher this payment (and every other payment sharing its
   *  bulkPaymentId) posted to — see iccgVoucher.ts's postBulkPaymentVoucher. Lets
   *  editing/deleting this payment (Payment tab) keep that voucher in sync instead of
   *  leaving an orphaned income record behind. */
  linkedVoucherId?: string
  /** The receipt printed for this transaction (Record Bulk Payment's mandatory print step) —
   *  stamped identically onto every entry sharing `bulkPaymentId` so the Payment tab can
   *  reprint it from any of them. */
  receipt?: ReceiptRecord
  /** The SECOND, internal receipt documenting the Council's own retained share of this payment
   *  (see PrintCouncilShareReceiptModal), printed on demand from the Payments tab after the
   *  member-facing AR/SI above was already issued — only once this exists does
   *  registrationCashReceipts.ts's fromIccgMemberPayments count this money as Council income. */
  councilShareReceipt?: ReceiptRecord
}

export interface IccgMember {
  id: string
  troopId: string
  role: IccgMemberRole
  fullName: string
  /** Girls only — the form's "Grade/Year" column. */
  gradeYear?: string
  email?: string
  isActive: boolean
  /** Fees collected for this person over time — recorded via the Payment tab's bulk payment
   *  flow, each tagged with a category. */
  payments?: MemberPayment[]
}
