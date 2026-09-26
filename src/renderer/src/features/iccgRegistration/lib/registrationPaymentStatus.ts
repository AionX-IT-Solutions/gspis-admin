import type { IccgRegistration } from '../types/iccgRegistration.types'
import type { IccgMember, MemberPayment } from '../types/iccgMember.types'

// Mirrors troopRegistration/lib/registrationPaymentStatus.ts's findLatestRegistration — same
// "current state" pattern useRecordIccgBulkPaymentModal.ts already uses to look up what a
// troop owes.
function findLatestRegistration(
  registrations: IccgRegistration[],
  troopId: string
): IccgRegistration | undefined {
  return [...registrations]
    .filter((r) => r.troopId === troopId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

/** Whether this registration's GSP Membership Fee has actually been collected — derived from
 *  the Payment tab's own per-member roster ledger (IccgMember.payments, written by
 *  addBulkPayment in iccgMember.store.ts), the same ledger registrationCashReceipts.ts's
 *  fromIccgMemberPayments already reads for Cash Receipts. Only ever true for a troop's most
 *  recently filed registration — see the Troop Registration equivalent of this function for
 *  why. Returns the matching payment (not just a boolean) so callers can also show its date. */
export function findRecordedIccgPayment(
  registration: IccgRegistration,
  registrations: IccgRegistration[],
  members: IccgMember[]
): MemberPayment | undefined {
  const latest = findLatestRegistration(registrations, registration.troopId)
  if (latest?.id !== registration.id) return undefined
  return members
    .filter((m) => m.troopId === registration.troopId)
    .flatMap((m) => m.payments ?? [])
    .filter((p) => p.councilShareAmount > 0 && p.date >= registration.dateApplied)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}
