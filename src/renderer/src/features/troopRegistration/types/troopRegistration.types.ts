// The national GSP "Troop Registration Form" the Council files with National HQ once per
// troop per school year. Frozen at save time (see troopRegistration.store.ts) so a past
// year's export always reprints exactly as filed, even if the Troop/ScoutMember roster
// changes later.

export interface RegistrationLeader {
  /** "Troop Leader", "Co-Leader", ... — repeatable, defaults to those two rows. */
  position: string
  name: string
  /** The form's "T/NT" column. */
  trained: boolean
  rboStatus: 'old' | 'new'
  birthdate?: string
  beneficiary?: string
}

export interface RegistrationMember {
  /** Links back to the roster row this was filled from, if any — a member typed in fresh
   *  for this filing (not yet on the roster) simply has none. */
  scoutMemberId?: string
  patrol: string
  fullName: string
  birthdate: string
  gradeYear?: string
  regStatus: 'new' | 're-reg'
  beneficiary?: string
}

// The form's own top-right age-level checkboxes — a different, older taxonomy than the
// app's TROOP_LEVELS (features/troops/types/troop.types.ts), which does not map 1:1 onto
// this one. Kept as its own field rather than reusing TROOP_LEVELS for that reason.
export const REGISTRATION_AGE_LEVELS = ['Twinkler', 'Star', 'Junior', 'Senior', 'Cadet'] as const
export type RegistrationAgeLevel = (typeof REGISTRATION_AGE_LEVELS)[number]

export interface RegistrationRemittance {
  membershipFeeGirlsReReg: number
  membershipFeeGirlsNew: number
  membershipFeeLeaderReReg: number
  membershipFeeLeaderNew: number
  membershipFeeCoLeaderReReg: number
  membershipFeeCoLeaderNew: number
  // The GSP Membership Fee lines above are the FULL amount remitted per member (e.g. ₱50)
  // — most of that is forwarded on to National HQ, not the Council's own income. These two
  // rates say how much of each peso actually stays with the Council (e.g. ₱10 of every
  // ₱50) — kept as editable fields rather than a hardcoded ratio since National's split can
  // change. See councilRetainedMembershipShare() below for how they're applied; only the
  // resulting share (not the full remitted total) is what posts to the Council Budget/Cash
  // Receipts (see useTroopRegistrationForm.ts's remittance-voucher sync).
  membershipFeePerMemberTotal: number
  membershipFeePerMemberCouncilShare: number
  programDevelopmentFund: number
  mutualAssistanceFundContribution: number
  magazineSubscriptionFee: number
  /** Flat per-troop fee, e.g. ₱10 — fully retained by the Council (paper form has no
   *  national/council split for this one, unlike the membership fee above). */
  thinkingDayFee: number
  totalRemittance: number
}

export function emptyRemittance(): RegistrationRemittance {
  return {
    membershipFeeGirlsReReg: 0,
    membershipFeeGirlsNew: 0,
    membershipFeeLeaderReReg: 0,
    membershipFeeLeaderNew: 0,
    membershipFeeCoLeaderReReg: 0,
    membershipFeeCoLeaderNew: 0,
    membershipFeePerMemberTotal: 50,
    membershipFeePerMemberCouncilShare: 10,
    programDevelopmentFund: 0,
    mutualAssistanceFundContribution: 0,
    magazineSubscriptionFee: 0,
    thinkingDayFee: 10,
    totalRemittance: 0
  }
}

/** The portion of the GSP Membership Fee lines that's actually the Council's own income
 *  (the rest is a pass-through forwarded to National HQ) — e.g. total remitted ₱2,000 ×
 *  (₱10 council share / ₱50 per-member total) = ₱400 retained. Zero when the per-member
 *  total rate is unset/zero (avoids a divide-by-zero) rather than throwing. */
export function councilRetainedMembershipShare(remittance: RegistrationRemittance): number {
  if (remittance.membershipFeePerMemberTotal <= 0) return 0
  const totalRemitted =
    remittance.membershipFeeGirlsReReg +
    remittance.membershipFeeGirlsNew +
    remittance.membershipFeeLeaderReReg +
    remittance.membershipFeeLeaderNew +
    remittance.membershipFeeCoLeaderReReg +
    remittance.membershipFeeCoLeaderNew
  const ratio =
    remittance.membershipFeePerMemberCouncilShare / remittance.membershipFeePerMemberTotal
  return totalRemitted * ratio
}

export interface CardsIssued {
  girlsFrom?: string
  girlsTo?: string
  adultsFrom?: string
  adultsTo?: string
}

export interface TroopRegistration {
  id: string
  troopId: string
  /** e.g. "2026-2027". */
  schoolYear: string
  dateApplied: string
  troopStatus: 'new' | 're-registered'
  ageLevel: RegistrationAgeLevel
  leaders: RegistrationLeader[]
  members: RegistrationMember[]
  submittedByName: string
  submittedByDate?: string
  notedByName?: string
  notedByDate?: string
  remittance: RegistrationRemittance
  troopNo?: string
  cardsIssued: CardsIssued
  girlsIdCardSeriesYear?: string
  adultsIdCardSeriesYear?: string
  troopFee?: number
  rorNo?: string
  rorDate?: string
  dccrNo?: string
  dateOfDeposit?: string
  branchCode?: string
  processedByName?: string
  /** Council Executive. */
  approvedByName?: string
  /** The approved Journal Voucher auto-created for this filing's Council-retained income
   *  (council share of the membership fee + Troop Fee + Thinking Day Fee) — see
   *  useTroopRegistrationForm.ts. Re-saving updates this same voucher instead of creating
   *  a duplicate. Unset when no one with voucher-write permission has saved this filing
   *  yet (see the permission-gated best-effort sync), or on a filing predating this. */
  linkedVoucherId?: string
  createdAt: string
  updatedAt: string
}
