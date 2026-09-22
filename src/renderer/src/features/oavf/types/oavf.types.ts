// OAVF (Other Adult Volunteer)/Career Woman Member Registration — a frozen-at-save-time filing
// record, one per applicant per school year (mirrors TrefoilGuildRegistration/
// BarangayCommitteeRegistration's own "one filing per year" pattern). The applicant's own
// ongoing profile lives on OavfMember (types/oavfMember.types.ts); this record only holds what
// actually changes filing to filing — school year, Girl Scout history as re-asked on that
// year's form, and the fee/payment collected for it.

import type { ReceiptRecord } from '@/shared/types/receipt.types'

// The paper form's "Have you been a Girl Scout?" section checks off which age-level/role the
// applicant last held, not a re-registration status — same fixed checklist wording as the
// Girl Scout program's own age levels/adult roles.
export const OAVF_POSITIONS = [
  'Twinkler',
  'Star',
  'Junior',
  'Senior',
  'Cadet',
  'T.Leader',
  'Volunteer'
] as const
export type OavfPosition = (typeof OAVF_POSITIONS)[number]

export interface OavfRegistration {
  id: string
  oavfMemberId: string
  /** e.g. "2026-2027" — same membership-year label used across every other registration
   *  module, letting one applicant have a distinct filing (and payment history) per year. */
  schoolYear: string
  dateApplied: string
  // "Have you been a Girl Scout?" — Yes/No plus its own Region/Council/Date Last
  // Registered/Position sub-fields, only meaningful when true.
  wasGirlScout: boolean
  gsRegion: string
  gsCouncil: string
  dateLastRegistered: string
  gsPosition: OavfPosition | ''
  // The form's footer note ("must be submitted with the Php100.00 membership registration
  // fee") plus a handwritten 75/25 split — 75 goes to National (pass-through, never booked)
  // and only the Council's 25 share posts to a Journal Voucher, same reasoning as Troop
  // Registration's councilRetainedMembershipShare(). Only ever set via "Record Payment", not
  // this filing's own save (see hooks/useRecordOavfPaymentModal.ts).
  membershipFeeTotal: number
  membershipFeeCouncilShare: number
  arNumber: string
  arDate: string
  processedByName: string
  linkedVoucherId?: string
  /** The receipt printed when "Record Payment" was submitted — kept so the Payment tab can
   *  reprint it later, same as the committee-style modules' FlatFeePayment.receipt. Unset on a
   *  filing that hasn't been paid yet. */
  receipt?: ReceiptRecord
  createdAt: string
  createdBy: string
}
