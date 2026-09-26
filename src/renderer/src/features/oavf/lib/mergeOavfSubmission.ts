import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import type { LeaderOavfSubmission } from '@/features/troopLeaderSubmissions/types/oavfSubmission.types'
import { useOavfMemberStore } from '../store/oavfMember.store'
import { useOavfStore } from '../store/oavf.store'
import type { OavfMember } from '../types/oavfMember.types'
import type { OavfRegistration } from '../types/oavf.types'

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/**
 * See features/troops/lib/mergeTroopSubmission.ts for the full rationale. OAVF has no roster —
 * the "entity" is the one applicant — matched by full name against the persistent OavfMember
 * profile list, reused (a new Registration is filed under the same profile) or created.
 *
 * Unlike Troop/BC/DC/TG, the fee fields are deliberately left at 0 here, exactly matching what
 * the manual "New Registration" form already does (see useOavfRegistrationFormModal.ts) — this
 * module only ever sets membershipFeeTotal/membershipFeeCouncilShare from "Record Payment"
 * (useRecordOavfPaymentModal.ts), which itself already defaults to the standard ₱100/₱25 rate
 * whenever the registration's own figure is unset. So the "auto-computed from standard rate"
 * behavior the client asked for already happens for free the first time staff opens Record
 * Payment on this auto-created registration — nothing to duplicate here.
 */
export function mergeOavfSubmission(submission: LeaderOavfSubmission): void {
  if (!submission.firstName.trim() || !submission.lastName.trim()) {
    throw new Error('Submission has no applicant name — cannot file a registration for it.')
  }

  const { members, addMember, updateMember } = useOavfMemberStore.getState()
  const { addRegistration } = useOavfStore.getState()
  const membershipYear = getMembershipYearLabel(
    useOrgSettingsStore.getState().membershipYearStartMonth
  )
  const today = todayLocalIso()

  const nameKey = `${norm(submission.firstName)} ${norm(submission.lastName)}`
  const existingMember = members.find((m) => `${norm(m.firstName)} ${norm(m.lastName)}` === nameKey)

  let memberId: string
  if (existingMember) {
    memberId = existingMember.id
    updateMember(memberId, {
      middleInitial: submission.middleInitial || existingMember.middleInitial,
      civilStatus: submission.civilStatus || existingMember.civilStatus,
      sex: submission.sex || existingMember.sex,
      birthdate: submission.birthdate || existingMember.birthdate,
      mobileNo: submission.mobileNo || existingMember.mobileNo,
      email: submission.email || existingMember.email,
      homeAddress: submission.homeAddress || existingMember.homeAddress,
      religion: submission.religion || existingMember.religion,
      educationalAttainment:
        submission.educationalAttainment || existingMember.educationalAttainment,
      profession: submission.profession || existingMember.profession,
      occupation: submission.occupation || existingMember.occupation,
      interests: submission.interests || existingMember.interests,
      otherOrgAffiliated: submission.otherOrgAffiliated || existingMember.otherOrgAffiliated,
      beneficiary: submission.beneficiary || existingMember.beneficiary,
      beneficiaryContactNo: submission.beneficiaryContactNo || existingMember.beneficiaryContactNo,
      council: submission.council || existingMember.council,
      region: submission.region || existingMember.region,
      district: submission.district || existingMember.district
    })
  } else {
    const newMember: Omit<OavfMember, 'id'> = {
      firstName: submission.firstName,
      lastName: submission.lastName,
      middleInitial: submission.middleInitial ?? '',
      civilStatus: submission.civilStatus ?? '',
      sex: submission.sex ?? '',
      birthdate: submission.birthdate ?? '',
      mobileNo: submission.mobileNo ?? '',
      email: submission.email ?? '',
      homeAddress: submission.homeAddress ?? '',
      religion: submission.religion ?? '',
      educationalAttainment: submission.educationalAttainment ?? '',
      profession: submission.profession ?? '',
      occupation: submission.occupation ?? '',
      interests: submission.interests ?? '',
      otherOrgAffiliated: submission.otherOrgAffiliated ?? '',
      beneficiary: submission.beneficiary ?? '',
      beneficiaryContactNo: submission.beneficiaryContactNo ?? '',
      council: submission.council ?? '',
      region: submission.region ?? '',
      district: submission.district,
      isActive: true
    }
    memberId = addMember(newMember)
  }

  const registration: Omit<OavfRegistration, 'id' | 'createdAt' | 'createdBy'> = {
    oavfMemberId: memberId,
    schoolYear: submission.schoolYear || membershipYear,
    dateApplied: submission.dateApplied || today,
    wasGirlScout: submission.wasGirlScout,
    gsRegion: submission.wasGirlScout ? (submission.gsRegion ?? '') : '',
    gsCouncil: submission.wasGirlScout ? (submission.gsCouncil ?? '') : '',
    dateLastRegistered: submission.wasGirlScout ? (submission.dateLastRegistered ?? '') : '',
    gsPosition: submission.wasGirlScout ? (submission.gsPosition ?? '') : '',
    membershipFeeTotal: 0,
    membershipFeeCouncilShare: 0,
    arNumber: '',
    arDate: '',
    processedByName: ''
  }
  addRegistration(registration)
}
