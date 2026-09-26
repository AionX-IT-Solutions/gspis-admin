// Mirrors gspis-app's features/troopLeader/types/leaderHonoraryMemberSubmission.ts — both apps
// read/write the same honoraryMemberSubmissions Firestore collection (see firestore.rules).
// See troopLeaderSubmission.types.ts (Troop) for the original convention this follows — unlike
// Troop, Honorary Member is a single-applicant registration, so there's no members roster here.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderHonoraryMemberSubmission extends LeaderSubmissionBase {
  lastName: string
  firstName: string
  middleInitial?: string
  civilStatus?: string
  sex?: string
  council?: string
  region?: string
  nhq?: string
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
