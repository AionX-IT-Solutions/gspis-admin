import { todayLocalIso } from '@/shared/lib/utils'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import type { LeaderIccgSubmission } from '@/features/troopLeaderSubmissions/types/iccgSubmission.types'
import { useIccgMemberStore } from '../store/iccgMember.store'
import { useIccgRegistrationStore } from '../store/iccgRegistration.store'
import {
  emptyFee,
  type IccgAdultMember,
  type IccgGirlMember,
  type IccgRegistration
} from '../types/iccgRegistration.types'
import type { IccgMember } from '../types/iccgMember.types'

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/**
 * See features/troops/lib/mergeTroopSubmission.ts for the full merge rationale. ICCG's mobile
 * submission never captures a troop link (`school` is free text, not a foreign key — the
 * account isn't bound to one troop either, see functions/troopLeaderRegistration.ts), so unlike
 * every other category this one can't auto-match a troop — the caller (the Approve flow's ICCG
 * tab) must resolve `troopId` first via TroopPickerModal and pass it in here.
 *
 * Girls/adults are matched against that troop's existing ICCG roster by fullName + role (no
 * birthdate on this roster to match against) — matched → reused id; unmatched → new roster
 * entry. Fee totals are auto-computed from the standard ₱20/₱5 per-member rate
 * (emptyFee()) × headcount, same as Troop/BC/DC/TG.
 */
export function mergeIccgSubmission(submission: LeaderIccgSubmission, troopId: string): void {
  const troop = useTroopsStore.getState().troops.find((t) => t.id === troopId)
  if (!troop) {
    throw new Error('No troop was selected — cannot file an ICCG registration without one.')
  }
  if (!submission.school.trim()) {
    throw new Error('Submission has no School name — cannot file a registration for it.')
  }
  if (submission.girls.length === 0 && submission.adults.length === 0) {
    throw new Error('Submission has no girls or adults — cannot file a registration for it.')
  }

  const { members, addMember } = useIccgMemberStore.getState()
  const { addRegistration } = useIccgRegistrationStore.getState()
  const today = todayLocalIso()
  const now = new Date().toISOString()

  const existingRoster = members.filter((m) => m.troopId === troopId)

  function resolveMember(fullName: string, role: 'girl' | 'adult'): string {
    const match = existingRoster.find((m) => m.role === role && norm(m.fullName) === norm(fullName))
    if (match) return match.id
    const newMemberId = crypto.randomUUID()
    const newMember: IccgMember = {
      id: newMemberId,
      troopId,
      role,
      fullName,
      isActive: true
    }
    addMember(newMember)
    existingRoster.push(newMember)
    return newMemberId
  }

  const girls: IccgGirlMember[] = submission.girls.map((g) => ({
    memberId: resolveMember(g.fullName, 'girl'),
    fullName: g.fullName,
    gradeYear: g.gradeYear,
    email: g.email
  }))
  const adults: IccgAdultMember[] = submission.adults.map((a) => ({
    memberId: resolveMember(a.fullName, 'adult'),
    fullName: a.fullName,
    email: a.email
  }))

  const rate = emptyFee()
  const amountGirls = girls.length * rate.feePerMemberTotal
  const amountAdults = adults.length * rate.feePerMemberTotal
  const fee = {
    ...rate,
    amountGirls,
    amountAdults,
    total: amountGirls + amountAdults
  }

  const registration: IccgRegistration = {
    id: crypto.randomUUID(),
    troopId,
    school: submission.school,
    ageLevel: submission.ageLevel,
    schoolYear: submission.schoolYear || today.slice(0, 4),
    dateApplied: submission.dateApplied || today,
    girls,
    adults,
    submittedByName: submission.submittedByName || troop.leaderName,
    fee,
    createdAt: now,
    updatedAt: now
  }
  addRegistration(registration)
}
