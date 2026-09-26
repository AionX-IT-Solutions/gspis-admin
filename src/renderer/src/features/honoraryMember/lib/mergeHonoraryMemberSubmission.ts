import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import type { LeaderHonoraryMemberSubmission } from '@/features/troopLeaderSubmissions/types/honoraryMemberSubmission.types'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import { useHonoraryMemberRegistrationStore } from '../store/honoraryMemberRegistration.store'
import type {
  HonoraryMember,
  HonoraryMemberCivilStatus,
  HonoraryMemberSex
} from '../types/honoraryMember.types'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

// The submission's civilStatus/sex are plain free-text strings (unlike OAVF's, which are
// already typed narrow) — only carry them over when they actually match one of the real
// profile's allowed values, since this is unverified self-submitted data.
const CIVIL_STATUSES: HonoraryMemberCivilStatus[] = ['Single', 'Married', 'Widowed', 'Separated']
const SEXES: HonoraryMemberSex[] = ['Male', 'Female']

function asCivilStatus(value: string | undefined): HonoraryMemberCivilStatus | '' {
  return CIVIL_STATUSES.includes(value as HonoraryMemberCivilStatus)
    ? (value as HonoraryMemberCivilStatus)
    : ''
}
function asSex(value: string | undefined): HonoraryMemberSex | '' {
  return SEXES.includes(value as HonoraryMemberSex) ? (value as HonoraryMemberSex) : ''
}

/**
 * See features/oavf/lib/mergeOavfSubmission.ts for the full rationale — identical pattern for
 * Honorary Member: match-or-create the profile by full name, file a new Registration with fee
 * fields left at 0 (matching useHonoraryMemberRegistrationFormModal.ts's own manual-create
 * default) since Record Payment already supplies the standard ₱150/₱60 rate the first time it's
 * opened on an unpaid registration.
 */
export function mergeHonoraryMemberSubmission(submission: LeaderHonoraryMemberSubmission): void {
  if (!submission.firstName.trim() || !submission.lastName.trim()) {
    throw new Error('Submission has no honoree name — cannot file a registration for it.')
  }

  const { members, addMember, updateMember } = useHonoraryMemberStore.getState()
  const { addRegistration } = useHonoraryMemberRegistrationStore.getState()
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
      nhq: submission.nhq || existingMember.nhq,
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
    const newMember: Omit<HonoraryMember, 'id'> = {
      firstName: submission.firstName,
      lastName: submission.lastName,
      middleInitial: submission.middleInitial ?? '',
      civilStatus: asCivilStatus(submission.civilStatus),
      sex: asSex(submission.sex),
      council: submission.council ?? '',
      region: submission.region ?? '',
      nhq: submission.nhq ?? '',
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

  const registration: Omit<HonoraryMemberRegistration, 'id' | 'createdAt' | 'createdBy'> = {
    honoraryMemberId: memberId,
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
