// Mirrors gspis-app's features/troopLeader/types/leaderBarangayCommitteeSubmission.ts — both
// apps read/write the same barangayCommitteeSubmissions Firestore collection (see
// firestore.rules). Field list matches the mobile type 1:1.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderBarangayCommitteeSubmissionMember {
  position: string
  fullName: string
  birthdate: string
  groupRepresented?: string
}

export interface LeaderBarangayCommitteeSubmission extends LeaderSubmissionBase {
  name: string
  address?: string
  telNo?: string
  district?: string
  region?: string
  council?: string
  districtCommitteeName?: string
  schoolYear: string
  dateApplied?: string
  members: LeaderBarangayCommitteeSubmissionMember[]
}
