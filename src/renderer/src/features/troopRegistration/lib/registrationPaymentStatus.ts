import {
  membershipFeeCouncilShareRatio,
  type TroopRegistration
} from '../types/troopRegistration.types'
import type { MemberPayment, ScoutMember } from '@/features/troops/types/troop.types'
import type { ReceiptRecord } from '@/shared/types/receipt.types'

// The rates a troop owes are whatever its most recently filed Troop Registration recorded —
// same "current state" pattern the Payment tab itself uses to look up what a troop owes (see
// troops/hooks/useRecordBulkPaymentModal.ts's own findLatestRegistration).
function findLatestRegistration(
  registrations: TroopRegistration[],
  troopId: string
): TroopRegistration | undefined {
  return [...registrations]
    .filter((r) => r.troopId === troopId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

/** The Council-retained share of one individual 'membership' MemberPayment — its gross amount
 *  × the troop's latest filed registration's own council-share ratio. Used wherever a
 *  per-payment (not per-registration aggregate) figure is needed, e.g. Daily Collections'
 *  MEM. REG column and running-balance total (useDailyCollectionsTab.ts) — those show one row
 *  per payment, not one per registration, so they can't reuse findRecordedMembershipPayment's
 *  aggregate. Zero when the troop has no filed registration to pull a rate from. */
export function membershipPaymentCouncilShare(
  payment: MemberPayment,
  troopId: string,
  registrations: TroopRegistration[]
): number {
  const registration = findLatestRegistration(registrations, troopId)
  if (!registration) return 0
  return payment.amount * membershipFeeCouncilShareRatio(registration.remittance)
}

export interface RecordedMembershipPayment {
  /** The Council-retained share of what's actually been collected so far toward this
   *  registration — every qualifying 'membership' payment's amount, summed, × this
   *  registration's own council-share ratio. Deliberately NOT the filing's full typed total
   *  (councilRetainedMembershipShare(reg.remittance)) — a partial collection (e.g. only 1 of
   *  10 filed members paid so far) should only credit the Council for what was actually
   *  handed over, the same "derive from what the Payment tab actually recorded" principle
   *  that decides whether this counts as paid at all. */
  amount: number
  /** The most recent qualifying payment's date/receipt — what a Cash Receipts row shows. */
  date: string
  receipt?: ReceiptRecord
}

/** Whether — and how much of — this registration's council-retained share of the GSP
 *  Membership Fee has actually been collected, derived entirely from the Payment tab's own
 *  bulk-payment ledger (ScoutMember.payments, written by addBulkPayment in troops.store.ts)
 *  instead of a separate recorded-payment flag, so there's only ever one place ("Record Bulk
 *  Payment" on the Payment tab) that marks a Membership Fee as paid. Only ever set for a
 *  troop's most recently filed registration — the Payment tab always pays toward that one (see
 *  findLatestRegistration above), so an older, superseded filing has no reliable way to be
 *  distinguished from the current one by payment date alone and is simply never shown as paid. */
export function findRecordedMembershipPayment(
  registration: TroopRegistration,
  registrations: TroopRegistration[],
  scoutMembers: ScoutMember[]
): RecordedMembershipPayment | undefined {
  const latest = findLatestRegistration(registrations, registration.troopId)
  if (latest?.id !== registration.id) return undefined
  const payments = scoutMembers
    .filter((m) => m.troopId === registration.troopId)
    .flatMap((m) => m.payments ?? [])
    .filter((p) => p.category === 'membership' && p.date >= registration.dateApplied)
  if (payments.length === 0) return undefined
  const ratio = membershipFeeCouncilShareRatio(registration.remittance)
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const latestPayment = [...payments].sort((a, b) => b.date.localeCompare(a.date))[0]
  return {
    amount: totalCollected * ratio,
    date: latestPayment.date,
    receipt: latestPayment.receipt
  }
}

export interface ReceiptedCouncilShare {
  /** The Council-retained share of every qualifying payment that has ALREADY had its
   *  council-share receipt printed — never a partial/pending amount still waiting on that
   *  second receipt. */
  amount: number
  /** The most recent qualifying council-share receipt's own date — when Council recognized
   *  this income, not when the Troop-level payment was originally collected. */
  date: string
  receipt?: ReceiptRecord
}

/** Whether — and how much of — this registration's council-retained share of the GSP
 *  Membership Fee has been receipted a SECOND time via "Print Council Share Receipt" (Payments
 *  tab, see PrintCouncilShareReceiptModal/setMembershipCouncilShareReceipt) — the actual trigger
 *  for recognizing this money as Council income in Cash Receipts/SCRD/Budget/Daily Collections
 *  (see registrationCashReceipts.ts's fromTroopRegistrations and useDailyCollectionsTab.ts).
 *  Deliberately a SEPARATE function from findRecordedMembershipPayment above, which reflects
 *  only whether the Troop Leader has paid (drives the Registrations tab's Paid/Unpaid badge) —
 *  a payment can sit "Paid" for a while with this staying undefined the whole time, until staff
 *  actually prints the Council's own receipt for its cut. Only ever counts payments that
 *  qualify for findRecordedMembershipPayment in the first place (same troop/latest-registration/
 *  date-filed rules), further narrowed to the ones whose councilShareReceipt has been stamped. */
export function findReceiptedCouncilShare(
  registration: TroopRegistration,
  registrations: TroopRegistration[],
  scoutMembers: ScoutMember[]
): ReceiptedCouncilShare | undefined {
  const latest = findLatestRegistration(registrations, registration.troopId)
  if (latest?.id !== registration.id) return undefined
  const receiptedPayments = scoutMembers
    .filter((m) => m.troopId === registration.troopId)
    .flatMap((m) => m.payments ?? [])
    .filter((p) => p.category === 'membership' && p.date >= registration.dateApplied)
    .flatMap((p) =>
      p.councilShareReceipt ? [{ amount: p.amount, receipt: p.councilShareReceipt }] : []
    )
  if (receiptedPayments.length === 0) return undefined
  const ratio = membershipFeeCouncilShareRatio(registration.remittance)
  const totalCollected = receiptedPayments.reduce((sum, p) => sum + p.amount, 0)
  const latestReceipt = [...receiptedPayments].sort((a, b) =>
    a.receipt.date.localeCompare(b.receipt.date)
  )[receiptedPayments.length - 1].receipt
  return {
    amount: totalCollected * ratio,
    date: latestReceipt.date,
    receipt: latestReceipt
  }
}
