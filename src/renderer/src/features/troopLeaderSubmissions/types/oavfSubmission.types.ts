// Mirrors gspis-app's features/troopLeader/types/leaderOavfSubmission.ts — both apps read/write
// the same oavfSubmissions Firestore collection (see firestore.rules). Field list matches the
// mobile type 1:1.

import type { OavfPosition } from '@/features/oavf/types/oavf.types'
import type { OavfCivilStatus, OavfSex } from '@/features/oavf/types/oavfMember.types'
import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderOavfSubmission extends LeaderSubmissionBase {
  lastName: string
  firstName: string
  middleInitial?: string
  civilStatus?: OavfCivilStatus
  sex?: OavfSex
  birthdate?: string
  mobileNo?: string
  email?: string
  homeAddress?: string
  religion?: string
  educationalAttainment?: string
  profession?: string
  occupation?: string
  interests?: string
  otherOrgAffiliated?: string
  beneficiary?: string
  beneficiaryContactNo?: string
  council?: string
  region?: string
  district?: string
  schoolYear: string
  dateApplied?: string
  wasGirlScout: boolean
  gsRegion?: string
  gsCouncil?: string
  dateLastRegistered?: string
  gsPosition?: OavfPosition
}
