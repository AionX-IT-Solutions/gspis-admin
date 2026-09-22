// Associate Member Registration — a frozen-at-save-time filing record, one per applicant per
// school year, each corresponding to its own AMF booklet page (mirrors TrefoilGuildRegistration/
// BarangayCommitteeRegistration's own "one filing per year" pattern). The applicant's own
// ongoing profile lives on AssociateMember (types/associateMember.types.ts); this record only
// holds what actually changes filing to filing — the booklet's own control number, school
// year, Girl Scout history as re-asked on that year's form, and the fee/payment collected.

import type { ReceiptRecord } from '@/shared/types/receipt.types'

export interface AssociateMemberRegistration {
  id: string
  associateMemberId: string
  // The physical AMF booklet's own pre-printed control number ("AMF Nº ____ Series ____") —
  // real per-filing data since each year's registration uses a new booklet page, unlike
  // District/Barangay Committee/Trefoil Guild's own "No./Series" block (left blank on export
  // for hand-filling) — see the type's own historical comment in the old flat shape.
  amfNumber: string
  series: string
  /** e.g. "2026-2027" — same membership-year label used across every other registration
   *  module, letting one applicant have a distinct filing (and payment history) per year. */
  schoolYear: string
  dateApplied: string
  // "Please indicate if you had been a GIRL SCOUT" — Yes/No plus its own Date Last
  // Registered/Position sub-fields, only meaningful when true.
  wasGirlScout: boolean
  dateLastRegistered: string
  position: string
  // The Associate Member fee is ₱50, of which ₱30 is forwarded to National HQ as a pure
  // pass-through and only the Council's ₱20 share posts to a Journal Voucher — same
  // National/Council split reasoning as features/oavf's own Membership Fee (see
  // lib/associateMemberVoucher.ts). Only ever set via "Record Payment", not this filing's own
  // save (see hooks/useRecordAssociateMemberPaymentModal.ts).
  membershipFeeTotal: number
  membershipFeeCouncilShare: number
  arNumber: string
  arDate: string
  processedByName: string
  linkedVoucherId?: string
  /** The receipt printed when "Record Payment" was submitted — kept so the Payment tab can
   *  reprint it later. Unset on a filing that hasn't been paid yet. */
  receipt?: ReceiptRecord
  createdAt: string
  createdBy: string
}
