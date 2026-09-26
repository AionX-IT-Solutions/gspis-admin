// Mirrors gspis-app's features/troopLeader/types/leaderTrefoilGuildSubmission.ts — both apps
// read/write the same trefoilGuildSubmissions Firestore collection (see firestore.rules).
// Field list matches the mobile type 1:1.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderTrefoilGuildSubmissionMember {
  position: string
  fullName: string
  birthdate: string
  beneficiary?: string
}

export interface LeaderTrefoilGuildSubmission extends LeaderSubmissionBase {
  name: string
  guildNumber?: string
  address?: string
  telNo?: string
  email?: string
  region?: string
  council?: string
  district?: string
  schoolYear: string
  dateApplied?: string
  members: LeaderTrefoilGuildSubmissionMember[]
}
