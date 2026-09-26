// Honorary Member Registration — a frozen-at-save-time filing record, one per honoree per
// school year (mirrors TrefoilGuildRegistration/BarangayCommitteeRegistration's own "one
// filing per year" pattern). The honoree's own ongoing profile lives on HonoraryMember
// (types/honoraryMember.types.ts); this record only holds what actually changes filing to
// filing — school year, Girl Scout history as re-asked on that year's form, and the
// fee/payment collected for it.

import type { ReceiptRecord } from '@/shared/types/receipt.types'

export interface HonoraryMemberRegistration {
  id: string
  honoraryMemberId: string
  /** e.g. "2026-2027" — same membership-year label used across every other registration
   *  module, letting one honoree have a distinct filing (and payment history) per year. */
  schoolYear: string
  dateApplied: string
  // "Please indicate if you had been a GIRL SCOUT" — Yes/No plus its own Date Last
  // Registered/Position sub-fields, only meaningful when true.
  wasGirlScout: boolean
  dateLastRegistered: string
  position: string
  // The Honorary Member fee is ₱150, of which ₱90 is forwarded to National HQ as a pure
  // pass-through and only the Council's ₱60 share posts to a Journal Voucher — same
  // National/Council split reasoning as features/oavf's own Membership Fee (see
  // councilRetainedMembershipShare-style handling in lib/honoraryMemberVoucher.ts). Only ever
  // set via "Record Payment", not this filing's own save (see
  // hooks/useRecordHonoraryMemberPaymentModal.ts).
  membershipFeeTotal: number
  membershipFeeCouncilShare: number
  arNumber: string
  arDate: string
  processedByName: string
  linkedVoucherId?: string
  /** The receipt printed when "Record Payment" was submitted — kept so the Payment tab can
   *  reprint it later. Unset on a filing that hasn't been paid yet. */
  receipt?: ReceiptRecord
  /** The SECOND, internal receipt documenting the Council's own retained share of this fee (see
   *  PrintCouncilShareReceiptModal), printed on demand from the Payments tab after the
   *  honoree-facing AR/SI above was already issued — only once this exists does
   *  registrationCashReceipts.ts's fromHonoraryMemberRegistrations count this money as Council
   *  income. */
  councilShareReceipt?: ReceiptRecord
  createdAt: string
  createdBy: string
}
