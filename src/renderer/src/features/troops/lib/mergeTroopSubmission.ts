import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import {
  emptyRemittance,
  type RegistrationLeader,
  type RegistrationMember,
  type TroopRegistration
} from '@/features/troopRegistration/types/troopRegistration.types'
import { guessAgeLevel } from '@/features/troopRegistration/hooks/useTroopRegistrationForm'
import type { LeaderTroopSubmission } from '@/features/troopLeaderSubmissions/types/troopLeaderSubmission.types'
import { useTroopsStore } from '../store/troops.store'
import { getMembershipYearLabel } from './membershipYear'
import type { Troop, ScoutMember } from '../types/troop.types'

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/**
 * Turns an approved Troop Leader Submission (mobile self-service, deliberately identity-only —
 * no fee/remittance data, see leaderSubmission.ts) into the real Troop + roster + a filed
 * TroopRegistration for the current membership year, so Record Payment works immediately after
 * approval instead of requiring staff to hand-retype the whole filing first.
 *
 * Matches an existing Troop by troopNumber (case/whitespace-insensitive) so a re-registering
 * troop updates in place rather than creating a duplicate; each roster member is similarly
 * matched by fullName+birthdate within that troop to decide new vs. re-reg (also drives the
 * auto-computed remittance below). Throws with a user-facing message if the submission is
 * missing what a Troop needs — caller (useMembershipSubmissions) is expected to surface it and
 * leave the submission pending.
 */
export function mergeTroopSubmission(submission: LeaderTroopSubmission): void {
  if (!submission.leaderName.trim()) {
    throw new Error('Submission has no Troop Leader name — cannot file a registration for it.')
  }
  if (submission.members.length === 0) {
    throw new Error('Submission has no members — cannot file a registration for it.')
  }

  const { troops, scoutMembers, addTroop, updateTroop, addScoutMember, updateScoutMember } =
    useTroopsStore.getState()
  const { addRegistration } = useTroopRegistrationStore.getState()
  const membershipYear = getMembershipYearLabel(
    useOrgSettingsStore.getState().membershipYearStartMonth
  )
  const today = todayLocalIso()
  const now = new Date().toISOString()

  const troopNumberKey = norm(submission.troopNumber)
  const existingTroop = troopNumberKey
    ? troops.find((t) => norm(t.troopNumber) === troopNumberKey)
    : undefined

  let troop: Troop
  if (existingTroop) {
    troop = {
      ...existingTroop,
      leaderName: submission.leaderName || existingTroop.leaderName,
      assistantLeaderName: submission.assistantLeaderName || existingTroop.assistantLeaderName,
      level: submission.level || existingTroop.level,
      school: submission.school || existingTroop.school,
      barangay: submission.barangay || existingTroop.barangay,
      meetingPlace: submission.meetingPlace || existingTroop.meetingPlace,
      troopAddress: submission.troopAddress || existingTroop.troopAddress,
      troopTelNo: submission.troopTelNo || existingTroop.troopTelNo,
      district: submission.district || existingTroop.district,
      sponsoringGroup: submission.sponsoringGroup || existingTroop.sponsoringGroup
    }
    updateTroop(troop.id, troop)
  } else {
    troop = {
      id: crypto.randomUUID(),
      troopNumber: submission.troopNumber?.trim() || `PENDING-${Date.now()}`,
      troopName: submission.troopName,
      level: submission.level,
      leaderName: submission.leaderName,
      assistantLeaderName: submission.assistantLeaderName,
      school: submission.school,
      barangay: submission.barangay,
      meetingPlace: submission.meetingPlace,
      isActive: true,
      troopAddress: submission.troopAddress,
      troopTelNo: submission.troopTelNo,
      district: submission.district,
      sponsoringGroup: submission.sponsoringGroup
    }
    addTroop(troop)
  }

  const existingRoster = scoutMembers.filter((m) => m.troopId === troop.id)
  const registrationMembers: RegistrationMember[] = []
  let newCount = 0
  let reRegCount = 0

  for (const sm of submission.members) {
    const match = existingRoster.find(
      (m) => norm(m.fullName) === norm(sm.fullName) && m.birthdate === sm.birthdate
    )
    if (match) {
      reRegCount++
      updateScoutMember(match.id, {
        level: sm.level || match.level,
        guardianName: sm.guardianName || match.guardianName,
        guardianContact: sm.guardianContact || match.guardianContact,
        address: sm.address || match.address,
        lastRegistrationStatus: 're-reg',
        membershipYear,
        renewedAt: today,
        isActive: true
      })
      registrationMembers.push({
        scoutMemberId: match.id,
        patrol: match.patrol ?? '',
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        gradeYear: match.gradeYear,
        regStatus: 're-reg',
        beneficiary: match.beneficiary
      })
    } else {
      newCount++
      const newMemberId = crypto.randomUUID()
      const newMember: ScoutMember = {
        id: newMemberId,
        troopId: troop.id,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        level: sm.level,
        guardianName: sm.guardianName,
        guardianContact: sm.guardianContact,
        address: sm.address,
        membershipYear,
        renewedAt: today,
        payments: [],
        isActive: true,
        lastRegistrationStatus: 'new'
      }
      addScoutMember(newMember)
      registrationMembers.push({
        scoutMemberId: newMemberId,
        patrol: '',
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        regStatus: 'new'
      })
    }
  }

  const leaders: RegistrationLeader[] = [
    { position: 'Troop Leader', name: submission.leaderName, trained: false, rboStatus: 'new' },
    ...(submission.assistantLeaderName?.trim()
      ? [
          {
            position: 'Co-Leader',
            name: submission.assistantLeaderName,
            trained: false,
            rboStatus: 'new' as const
          }
        ]
      : [])
  ]

  const rate = emptyRemittance()
  const remittance = {
    ...rate,
    membershipFeeGirlsNew: newCount * rate.membershipFeePerMemberTotal,
    membershipFeeGirlsReReg: reRegCount * rate.membershipFeePerMemberTotal
  }
  remittance.totalRemittance =
    remittance.membershipFeeGirlsReReg +
    remittance.membershipFeeGirlsNew +
    remittance.membershipFeeLeaderReReg +
    remittance.membershipFeeLeaderNew +
    remittance.membershipFeeCoLeaderReReg +
    remittance.membershipFeeCoLeaderNew +
    remittance.programDevelopmentFund +
    remittance.mutualAssistanceFundContribution +
    remittance.magazineSubscriptionFee

  const registration: TroopRegistration = {
    id: crypto.randomUUID(),
    troopId: troop.id,
    schoolYear: membershipYear,
    dateApplied: today,
    troopStatus: existingTroop ? 're-registered' : 'new',
    ageLevel: guessAgeLevel(submission.level || troop.level),
    leaders,
    members: registrationMembers,
    submittedByName: submission.leaderName,
    remittance,
    cardsIssued: {},
    // No standard rate exists for this one (see useTroopRegistrationForm.ts's troopFee
    // field, which also starts blank on a brand-new filing) — left for staff to fill in.
    createdAt: now,
    updatedAt: now
  }
  addRegistration(registration)
}
