import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import type { LeaderAssociateMemberSubmission } from '@/features/troopLeaderSubmissions/types/associateMemberSubmission.types'
import { useAssociateMemberStore } from '../store/associateMember.store'
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'
import type {
  AssociateMember,
  AssociateMemberCivilStatus,
  AssociateMemberSex
} from '../types/associateMember.types'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

// The submission's civilStatus/sex are plain free-text strings (unlike OAVF's, which are
// already typed narrow) — only carry them over when they actually match one of the real
// profile's allowed values, since this is unverified self-submitted data.
const CIVIL_STATUSES: AssociateMemberCivilStatus[] = ['Single', 'Married', 'Widowed', 'Separated']
const SEXES: AssociateMemberSex[] = ['Male', 'Female']

function asCivilStatus(value: string | undefined): AssociateMemberCivilStatus | '' {
  return CIVIL_STATUSES.includes(value as AssociateMemberCivilStatus)
    ? (value as AssociateMemberCivilStatus)
    : ''
}
function asSex(value: string | undefined): AssociateMemberSex | '' {
  return SEXES.includes(value as AssociateMemberSex) ? (value as AssociateMemberSex) : ''
}

/**
 * See features/oavf/lib/mergeOavfSubmission.ts for the full rationale — identical pattern for
 * Associate Member: match-or-create the profile by full name, file a new Registration with fee
 * fields left at 0 (Record Payment already supplies the standard ₱50/₱20 rate). `amfNumber`/
 * `series` (the physical AMF booklet's own control number) is never in the submission — it's
 * staff-assigned on paper, so it's left blank here for staff to fill in once, same as the
 * manual "New Registration" form already starts blank (useAssociateMemberRegistrationFormModal.ts).
 */
export function mergeAssociateMemberSubmission(submission: LeaderAssociateMemberSubmission): void {
  if (!submission.firstName.trim() || !submission.lastName.trim()) {
    throw new Error('Submission has no applicant name — cannot file a registration for it.')
  }

  const { members, addMember, updateMember } = useAssociateMemberStore.getState()
  const { addRegistration } = useAssociateMemberRegistrationStore.getState()
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
      civilStatus: asCivilStatus(submission.civilStatus) || existingMember.civilStatus,
      sex: asSex(submission.sex) || existingMember.sex,
      council: submission.council || existingMember.council,
      region: submission.region || existingMember.region,
      district: submission.district || existingMember.district,
      homeAddress: submission.homeAddress || existingMember.homeAddress,
      phone: submission.phone || existingMember.phone,
      email: submission.email || existingMember.email,
      businessAddress: submission.businessAddress || existingMember.businessAddress,
      businessPhone: submission.businessPhone || existingMember.businessPhone,
      profession: submission.profession || existingMember.profession,
      occupation: submission.occupation || existingMember.occupation,
      beneficiary: submission.beneficiary || existingMember.beneficiary
    })
  } else {
    const newMember: Omit<AssociateMember, 'id'> = {
      firstName: submission.firstName,
      lastName: submission.lastName,
      middleInitial: submission.middleInitial ?? '',
      civilStatus: asCivilStatus(submission.civilStatus),
      sex: asSex(submission.sex),
      council: submission.council ?? '',
      region: submission.region ?? '',
      district: submission.district,
      homeAddress: submission.homeAddress ?? '',
      phone: submission.phone ?? '',
      email: submission.email ?? '',
      businessAddress: submission.businessAddress ?? '',
      businessPhone: submission.businessPhone ?? '',
      profession: submission.profession ?? '',
      occupation: submission.occupation ?? '',
      beneficiary: submission.beneficiary ?? '',
      isActive: true
    }
    memberId = addMember(newMember)
  }

  const registration: Omit<AssociateMemberRegistration, 'id' | 'createdAt' | 'createdBy'> = {
    associateMemberId: memberId,
    amfNumber: '',
    series: '',
    schoolYear: submission.schoolYear || membershipYear,
    dateApplied: submission.dateApplied || today,
    wasGirlScout: submission.wasGirlScout,
    dateLastRegistered: submission.wasGirlScout ? (submission.dateLastRegistered ?? '') : '',
    position: submission.wasGirlScout ? (submission.position ?? '') : '',
    membershipFeeTotal: 0,
    membershipFeeCouncilShare: 0,
    arNumber: '',
    arDate: '',
    processedByName: ''
  }
  addRegistration(registration)
}
