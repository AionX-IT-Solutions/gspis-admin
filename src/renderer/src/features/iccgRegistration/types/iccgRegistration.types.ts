// The national GSP "Catholic Guiding Section (CGS) Membership Registration Form" — filed
// once per school/troop per school year, listing that school's CGS-registered girl and adult
// members. Tied to an existing GSP Troop (the form's own "Registered with GSP Troop No."
// field), same as features/troopRegistration, but far simpler: no patrols, no leader T/NT/
// RBO tracking, and a flat Girls/Adults fee split instead of a lettered A–D remittance.
// Frozen at save time so a past filing always reprints exactly as filed, even if the Troop
// changes later.

export interface IccgGirlMember {
  /** Links back to the persistent roster row (features/iccgRegistration/types/
   *  iccgMember.types.ts) this was filled from, if any — a member typed in fresh for this
   *  filing (not yet on the roster) simply has none. */
  memberId?: string
  /** "Last Name, First Name, M.I." per the form's own column heading. */
  fullName: string
  gradeYear?: string
  email?: string
}

export interface IccgAdultMember {
  memberId?: string
  fullName: string
  email?: string
}

export interface IccgFee {
  /** The form's own "No. of Girls: ___  P ___" line — the headcount is never stored here
   *  since it's always derivable from `girls.length` (same reasoning as
   *  features/trefoilGuild's RegistrationMember re-reg/new counts). */
  amountGirls: number
  amountAdults: number
  /** amountGirls + amountAdults — the form's own "Total" box. */
  total: number
  // The GSP Membership Fee is ₱20 per member — most of that (₱15) is forwarded to National
  // HQ, not the Council's own income. These two rates say how much of each peso actually
  // stays with the Council (₱5 of every ₱20) — kept as editable fields rather than a
  // hardcoded ratio since National's split can change. See councilRetainedIccgFeeShare()
  // below for how they're applied; only the resulting share (not the full amount remitted)
  // is what posts to the Council Budget/Cash Receipts — same "council share" pattern as
  // features/troopRegistration's own GSP Membership Fee.
  feePerMemberTotal: number
  feePerMemberCouncilShare: number
  arNo?: string
  dateOfDeposit?: string
  dccrNo?: string
}

export function emptyFee(): IccgFee {
  return {
    amountGirls: 0,
    amountAdults: 0,
    total: 0,
    feePerMemberTotal: 20,
    feePerMemberCouncilShare: 5
  }
}

/** The portion of the total Girls + Adults amount that's actually the Council's own income
 *  (the rest is a pure pass-through forwarded to National HQ) — e.g. total ₱2,000 ×
 *  (₱5 council share / ₱20 per-member total) = ₱500 retained. Zero when the per-member total
 *  rate is unset/zero (avoids a divide-by-zero) rather than throwing. */
export function councilRetainedIccgFeeShare(fee: IccgFee): number {
  if (fee.feePerMemberTotal <= 0) return 0
  return fee.total * (fee.feePerMemberCouncilShare / fee.feePerMemberTotal)
}

export interface IccgRegistration {
  id: string
  troopId: string
  school: string
  ageLevel?: string
  /** e.g. "2026-2027". */
  schoolYear: string
  dateApplied: string
  /** The form's own printed control number, e.g. "03559" (top-right corner). */
  formNo?: string
  seriesYear?: string
  girls: IccgGirlMember[]
  adults: IccgAdultMember[]
  /** CGS Adult Leader. */
  submittedByName: string
  submittedByDate?: string
  /** School Principal. */
  notedByName?: string
  notedByDate?: string
  /** Registration Processor. */
  processedByName?: string
  /** Council Executive. */
  approvedByName?: string
  fee: IccgFee
  /** The approved Journal Voucher auto-created for this filing's CGS Registration Fee — see
   *  useIccgRegistrationForm.ts. Re-saving updates this same voucher instead of creating a
   *  duplicate. Unset when no one with voucher-write permission has saved this filing yet, or
   *  on a filing predating this. */
  linkedVoucherId?: string
  createdAt: string
  updatedAt: string
}
