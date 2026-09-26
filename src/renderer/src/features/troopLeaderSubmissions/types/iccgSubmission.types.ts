// Mirrors gspis-app's features/troopLeader/types/leaderIccgSubmission.ts — both apps read/write
// the same iccgSubmissions Firestore collection (see firestore.rules). Field list matches the
// mobile type 1:1. Unlike every other category here, ICCG carries TWO independent rosters
// (girls and adults) rather than one.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderIccgGirlMember {
  fullName: string
  gradeYear?: string
  email?: string
}

export interface LeaderIccgAdultMember {
  fullName: string
  email?: string
}

export interface LeaderIccgSubmission extends LeaderSubmissionBase {
  school: string
  ageLevel?: string
  schoolYear: string
  dateApplied?: string
  girls: LeaderIccgGirlMember[]
  adults: LeaderIccgAdultMember[]
}
