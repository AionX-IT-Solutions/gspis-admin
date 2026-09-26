import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import type { LeaderBarangayCommitteeSubmission } from '@/features/troopLeaderSubmissions/types/barangayCommitteeSubmission.types'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import {
  emptyRemittance,
  type RegistrationMember,
  type BarangayCommitteeRegistration
} from '../types/barangayCommitteeRegistration.types'
import type { BarangayCommittee, BarangayCommitteeMember } from '../types/barangayCommittee.types'

// Matches the Registration form's own default (useBarangayCommitteeRegistrationForm.ts's
// `useState('15.00')`) — the same starting figure staff would see filing this by hand.
const BC_GROUP_FEE_DEFAULT = 15

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/** See features/troops/lib/mergeTroopSubmission.ts for the full rationale — this is the
 *  identical pattern for Barangay Committee: match-or-create the committee by name, match-or-
 *  create each roster member by fullName+birthdate, then file a Registration with an
 *  auto-computed Members fee (count × the form's own default per-member rate) and the standard
 *  B.C. Group Fee default. */
export function mergeBarangayCommitteeSubmission(
  submission: LeaderBarangayCommitteeSubmission
): void {
  if (!submission.name.trim()) {
    throw new Error('Submission has no Committee Name — cannot file a registration for it.')
  }
  if (submission.members.length === 0) {
    throw new Error('Submission has no members — cannot file a registration for it.')
  }

  const { committees, members, addCommittee, updateCommittee, addMember, updateMember } =
    useBarangayCommitteeStore.getState()
  const { addRegistration } = useBarangayCommitteeRegistrationStore.getState()
  const membershipYear = getMembershipYearLabel(
    useOrgSettingsStore.getState().membershipYearStartMonth
  )
  const today = todayLocalIso()
  const now = new Date().toISOString()

  const nameKey = norm(submission.name)
  const existingCommittee = committees.find((c) => norm(c.name) === nameKey)

  let committee: BarangayCommittee
  if (existingCommittee) {
    committee = {
      ...existingCommittee,
      address: submission.address || existingCommittee.address,
      telNo: submission.telNo || existingCommittee.telNo,
      district: submission.district || existingCommittee.district,
      region: submission.region || existingCommittee.region,
      council: submission.council || existingCommittee.council,
      districtCommitteeName:
        submission.districtCommitteeName || existingCommittee.districtCommitteeName
    }
    updateCommittee(committee.id, committee)
  } else {
    committee = {
      id: crypto.randomUUID(),
      name: submission.name,
      address: submission.address,
      telNo: submission.telNo,
      districtCommitteeName: submission.districtCommitteeName,
      district: submission.district,
      region: submission.region,
      council: submission.council,
      isActive: true
    }
    addCommittee(committee)
  }

  const existingRoster = members.filter((m) => m.barangayCommitteeId === committee.id)
  const registrationMembers: RegistrationMember[] = []
  let newCount = 0
  let reRegCount = 0

  for (const sm of submission.members) {
    const match = existingRoster.find(
      (m) => norm(m.fullName) === norm(sm.fullName) && m.birthdate === sm.birthdate
    )
    if (match) {
      reRegCount++
      updateMember(match.id, {
        position: sm.position || match.position,
        groupRepresented: sm.groupRepresented || match.groupRepresented,
        lastRegistrationStatus: 're-reg',
        isActive: true
      })
      registrationMembers.push({
        memberId: match.id,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        groupRepresented: sm.groupRepresented,
        regStatus: 're-reg',
        beneficiary: match.beneficiary
      })
    } else {
      newCount++
      const newMemberId = crypto.randomUUID()
      const newMember: BarangayCommitteeMember = {
        id: newMemberId,
        barangayCommitteeId: committee.id,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        groupRepresented: sm.groupRepresented,
        isActive: true,
        payments: [],
        lastRegistrationStatus: 'new'
      }
      addMember(newMember)
      registrationMembers.push({
        memberId: newMemberId,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        groupRepresented: sm.groupRepresented,
        regStatus: 'new'
      })
    }
  }

  // The paper form has no separate "Submitted By" name field on the mobile submission — the
  // roster's own Chairman row is who actually signs that line; fall back to whoever's account
  // submitted this if no Chairman row was included.
  const chairman = submission.members.find((m) => /chair/i.test(m.position))

  const rate = emptyRemittance()
  const memberFeeTotal = (newCount + reRegCount) * rate.memberFeePerMember
  const remittance = {
    ...rate,
    memberFeeTotal,
    totalRemittance:
      memberFeeTotal + rate.programDevelopmentFund + rate.mutualAssistanceFundContribution
  }

  const registration: BarangayCommitteeRegistration = {
    id: crypto.randomUUID(),
    barangayCommitteeId: committee.id,
    schoolYear: membershipYear,
    dateApplied: today,
    registrationStatus: existingCommittee ? 're-registered' : 'new',
    members: registrationMembers,
    submittedByName: chairman?.fullName || submission.submittedByName,
    remittance,
    bcGroupFee: BC_GROUP_FEE_DEFAULT,
    cardsIssued: {},
    createdAt: now,
    updatedAt: now
  }
  addRegistration(registration)
}
