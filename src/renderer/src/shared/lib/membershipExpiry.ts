// Shared validity-period check for the single-person "Member + yearly Registration" modules
// (OAVF/Career Woman, Honorary Member, Associate Member) — each one's membership is valid for
// a fixed number of years from their most recently filed Registration's date, after which
// they show as expired in that module's Members table until they file (and pay) another one.

/** True once `validityYears` have passed since `dateApplied`. */
export function isMembershipExpired(dateApplied: string, validityYears: number): boolean {
  if (!dateApplied) return false
  const expiry = new Date(dateApplied)
  if (Number.isNaN(expiry.getTime())) return false
  expiry.setFullYear(expiry.getFullYear() + validityYears)
  return Date.now() > expiry.getTime()
}

/** The most recently filed record for one member, by `dateApplied` — same "current state"
 *  lookup every registration-picking flow in these modules already does (e.g.
 *  features/oavf/hooks/useRecordOavfPaymentModal.ts's own latest-registration logic). */
export function latestByDateApplied<T extends { dateApplied: string }>(
  records: T[]
): T | undefined {
  return [...records].sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}
