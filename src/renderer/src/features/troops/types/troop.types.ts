import type { ReceiptRecord } from '@/shared/types/receipt.types'

// GSP's age-based program levels, offered as a dropdown on the Troop and roster forms.
// Kept as plain strings (not a union type) so a pre-existing troop/member whose `level`
// was typed in before this became a dropdown still displays and saves correctly.
export const TROOP_LEVELS = [
  'Star Scout',
  'Junior Scout',
  'Cadet Scout',
  'Senior Scout',
  'Ambassador Scout'
] as const

/** Dropdown options for a level field — includes `currentValue` as its own option when it's
 *  set but isn't one of TROOP_LEVELS, so a legacy/custom value never gets silently dropped. */
export function troopLevelOptions(currentValue?: string): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = TROOP_LEVELS.map((level) => ({
    value: level,
    label: level
  }))
  if (currentValue && !(TROOP_LEVELS as readonly string[]).includes(currentValue)) {
    options.push({ value: currentValue, label: currentValue })
  }
  return options
}

export interface Troop {
  id: string
  troopNumber: string
  troopName?: string
  /** Age-based program level — one of TROOP_LEVELS, picked from a dropdown. */
  level: string
  // Plain display names — independent free text, not a link. A Training Profile
  // (features/trainingProfiles) that declares itself this troop's leader (via its own
  // `troopId`/`troopRole`) writes its name in here; Training Profile is the registry of
  // people, so it's the side that looks up/picks a Troop, not the other way around. See
  // TroopProfile.tsx / useTroopRegistrationForm.ts for the reverse lookup (by troopId)
  // used to show/pull that profile's own details (trainings completed, birthday, etc).
  leaderName: string
  assistantLeaderName?: string
  school?: string
  barangay?: string
  meetingPlace?: string
  isActive: boolean
  // Troop-header fields the national GSP Troop Registration Form asks for, beyond what
  // day-to-day roster management needs — kept on the Troop record itself (editable from
  // this same form) rather than only inside a filed registration, so they stay current
  // outside of registration season too. All optional so an existing troop keeps working
  // unchanged until someone fills them in.
  troopAddress?: string
  troopTelNo?: string
  /** "District Committee Name/ Municipality" on the paper form. */
  districtCommitteeName?: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this troop belongs to
   *  — kept separate from `districtCommitteeName` (free text) so the Membership Status Report
   *  can group this record into the right district row without fuzzy-matching free text. */
  district?: string
  barangayCommitteeName?: string
  sponsoringGroup?: string
  completeMailingAddress?: string
  /** ISO date the troop was originally founded/chartered. */
  troopBirthday?: string
  troopType?: 'school' | 'community'
  // Per-leader detail the paper form's Leaders table asks for, beyond the plain display
  // name above — "RBO Status" (Old/New) and Beneficiary. Mirrored for the Co-Leader row
  // via the assistantLeader* fields below. Birthdate and "T/NT" (trained/not trained) are
  // deliberately NOT duplicated here — when a Training Profile (features/trainingProfiles)
  // claims this troop as `troopId`/`troopRole`, that registry is the source of truth for
  // both (birthday, completedTrainings) and the Registration form pulls from it directly
  // (reverse lookup by troopId — see useTroopRegistrationForm.ts); a leader with no
  // matching profile just gets those two fields typed in on the registration itself.
  leaderBeneficiary?: string
  leaderRboStatus?: 'old' | 'new'
  assistantLeaderBeneficiary?: string
  assistantLeaderRboStatus?: 'old' | 'new'
  /** Flat per-troop fees (Troop Fee, Thinking Day Fee) recorded via the Payment tab's bulk
   *  payment flow — see FlatFeePayment below for why these live separately from
   *  ScoutMember.payments. */
  flatFeePayments?: FlatFeePayment[]
}

// Troop-level fees that don't divide across members the way GSP Membership/Training/
// Camping Fees do — the paper Troop Registration Form's Troop Fee and Thinking Day Fee are
// each one flat amount per troop, not "amount × member count". Kept on the Troop itself
// (mirroring ScoutMember.payments' shape) rather than forced into MemberPayment, which has
// no sensible "which member" to attach a troop-wide fee to.
export type FlatFeeCategory = 'troop_fee' | 'thinking_day'

export interface FlatFeePayment {
  id: string
  date: string
  amount: number
  category: FlatFeeCategory
  /** Shares a MemberPayment.bulkPaymentId from the same Payment-tab submission when
   *  per-member lines were recorded alongside this one, so the Payment tab groups them
   *  back into the lines of a single remittance event. */
  bulkPaymentId?: string
  paidByName?: string
  /** The approved Journal Voucher this flat fee posted to (see
   *  features/troops/lib/flatFeeVoucher.ts) — lets editing/deleting this payment (Payment
   *  tab) keep that voucher's date in sync or remove it too, instead of leaving an orphaned
   *  income record behind. Unset when no one with voucher-write permission recorded this
   *  payment (hr can record a bulk payment but can't write vouchers). */
  linkedVoucherId?: string
  /** The receipt printed for this transaction (Record Bulk Payment's optional "Print a
   *  receipt" toggle) — stamped identically onto every entry sharing `bulkPaymentId` (one
   *  receipt per remittance) so the Payment tab can reprint it from any of them. Unset when
   *  printing wasn't used for this payment. */
  receipt?: ReceiptRecord
}

// Matches the Council Budget's own income-line breakdown (see budgetAutoActuals.ts's
// MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE) so a recorded payment posts to the right line —
// 'membership' -> "Troop, BC/DC Fees", 'training' -> "Training Fees", 'camping' -> "Camping Fees".
export type MemberPaymentCategory = 'membership' | 'training' | 'camping'

export interface MemberPayment {
  id: string
  /** ISO date this payment was collected — feeds the Reports > Daily Collections tab. */
  date: string
  amount: number
  category: MemberPaymentCategory
  /** Groups this payment with others recorded together as one lump-sum remittance — in
   *  practice the Troop Leader pays once for the whole troop (or however many members are
   *  covered) even though the fee is computed per member, so the app's actual recording
   *  flow is a single bulk action (see addBulkPayment in troops.store.ts) that fans out
   *  into one MemberPayment per covered member, all sharing this id. The Payment tab
   *  (features/troops/pages/Troops.tsx) groups by it to show one row per remittance
   *  instead of one per member. Unset on a payment recorded the older one-at-a-time way
   *  (features/troops/hooks/useRecordMemberPaymentModal.ts) — it just shows as its own
   *  single-member group there. */
  bulkPaymentId?: string
  /** Who actually handed over the money — defaults to the Troop Leader's name at the time
   *  of recording (bulk payments), editable. Unset on older individually-recorded payments. */
  paidByName?: string
  /** The receipt printed for this transaction — see FlatFeePayment.receipt above for the
   *  full rationale; same pattern here. */
  receipt?: ReceiptRecord
}

export interface ScoutMember {
  id: string
  troopId: string
  fullName: string
  birthdate: string
  /** Age-based program level — one of TROOP_LEVELS, same dropdown as Troop.level. */
  level?: string
  guardianName?: string
  guardianContact?: string
  address?: string
  /** The membership year cycle this member is currently registered for, e.g. "2026-2027". */
  membershipYear: string
  /** ISO date of the last registration/renewal. */
  renewedAt: string
  /** Fees collected for this member over time (membership dues, training fees, etc.) —
   *  recorded one at a time via the roster's "Record Payment" action, each tagged with
   *  a category. Feeds the Reports > Daily Collections tab. Unset on members synced
   *  before this field existed — read as `payments ?? []`. */
  payments?: MemberPayment[]
  isActive: boolean
  /** Patrol/Cluster name (e.g. "Patrol 1") — how the Troop Registration Form's Members
   *  table groups the roster. Editable from the roster itself, not just registration
   *  season, since patrols get reshuffled independently of any one filing. */
  patrol?: string
  /** School grade/year level (the form's "Gr/Yr" column, e.g. "VI") — distinct from
   *  `level`, which is the troop-wide GSP program level, not an individual's school grade. */
  gradeYear?: string
  beneficiary?: string
  /** Reflects this member's status as of the most recently filed Troop Registration
   *  (features/troopRegistration) — same "current state, not full history" pattern as
   *  `membershipYear`/`renewedAt` above. The actual historical record of what was
   *  submitted on a given date lives on the frozen TroopRegistration itself. */
  lastRegistrationStatus?: 'new' | 're-reg'
}
