// The national GSP "Barangay Committee Registration Form" the Council files with National HQ
// — mirrors features/districtCommittee's DistrictCommitteeRegistration, minus the fields the
// real Barangay Committee form doesn't print: no "Noted by" signatory (only Submitted By,
// Processed by, and Approved by) and no "DCCR Sum No." line. Frozen at save time (see
// barangayCommitteeRegistration.store.ts) so a past filing always reprints exactly as filed,
// even if the committee's roster changes later.

export interface RegistrationMember {
  /** Links back to the roster row this was filled from, if any — a member typed in fresh for
   *  this filing (not yet on the roster) simply has none. */
  memberId?: string
  position: string
  fullName: string
  birthdate?: string
  groupRepresented?: string
  regStatus: 'new' | 're-reg'
  beneficiary?: string
}

export interface RegistrationRemittance {
  /** The printed form's own "Members" line is just ONE peso field ("Members: Re-reg___
   *  New___    P___") — Re-reg/New there are headcounts, not two separate amounts, and are
   *  never stored here since they're always derivable from `members[].regStatus` (see
   *  barangayCommitteeRegistrationExport.ts) — storing a second copy would just be a second
   *  place for them to drift out of sync with the roster. */
  memberFeeTotal: number
  /** The flat per-member rate `memberFeeTotal` is expected to roughly track (default ₱50) —
   *  kept as its own editable field since the rate could change. No council-share field here
   *  — this fee is a pure pass-through and never posts to a voucher (see bcVoucher.ts). */
  memberFeePerMember: number
  programDevelopmentFund: number
  mutualAssistanceFundContribution: number
  /** A+B+C only, matching the printed form's own "Total Remittance" line — the B.C. Group Fee
   *  is a separate, council-retained figure printed in its own box (see bcGroupFee below), not
   *  folded into this total. */
  totalRemittance: number
}

export function emptyRemittance(): RegistrationRemittance {
  return {
    memberFeeTotal: 0,
    memberFeePerMember: 50,
    programDevelopmentFund: 0,
    mutualAssistanceFundContribution: 0,
    totalRemittance: 0
  }
}

export interface CardsIssued {
  adultsFrom?: string
  adultsTo?: string
}

export interface BarangayCommitteeRegistration {
  id: string
  barangayCommitteeId: string
  /** e.g. "2026-2027". */
  schoolYear: string
  dateApplied: string
  registrationStatus: 'new' | 're-registered'
  members: RegistrationMember[]
  /** BC Chairman. */
  submittedByName: string
  submittedByDate?: string
  remittance: RegistrationRemittance
  /** Flat fee, e.g. ₱15.00 — fully retained by the Council (the only remittance figure that
   *  is; see RegistrationRemittance's totalRemittance comment). Default matches the Council's
   *  own handwritten note on the reference form. */
  bcGroupFee?: number
  rorNo?: string
  rorDate?: string
  dccrNo?: string
  dateOfDeposit?: string
  branchCode?: string
  cardsIssued: CardsIssued
  /** Registration Processor. */
  processedByName?: string
  /** Council Executive. */
  approvedByName?: string
  /** The approved Journal Voucher auto-created for this filing's Council-retained income
   *  (the B.C. Group Fee only) — see useBarangayCommitteeRegistrationForm.ts. Re-saving
   *  updates this same voucher instead of creating a duplicate. Unset when no one with
   *  voucher-write permission has saved this filing yet, or on a filing predating this. */
  linkedVoucherId?: string
  createdAt: string
  updatedAt: string
}
