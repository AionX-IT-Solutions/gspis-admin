// Mirrors gspis-app's features/troopLeader/types/leaderAssociateMemberSubmission.ts — both
// apps read/write the same associateMemberSubmissions Firestore collection (see
// firestore.rules). Field list matches the mobile type 1:1.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderAssociateMemberSubmission extends LeaderSubmissionBase {
  lastName: string
  firstName: string
  middleInitial?: string
  civilStatus?: string
  sex?: string
  council?: string
  region?: string
  district?: string
  homeAddress?: string
  phone?: string
  email?: string
  businessAddress?: string
  businessPhone?: string
  profession?: string
  occupation?: string
  beneficiary?: string
  schoolYear: string
  dateApplied?: string
  wasGirlScout: boolean
  dateLastRegistered?: string
  position?: string
}
