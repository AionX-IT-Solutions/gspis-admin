// Mirrors gspis-app's features/troopLeader/types/leaderDistrictCommitteeSubmission.ts — both
// apps read/write the same districtCommitteeSubmissions Firestore collection (see
// firestore.rules). Sibling of troopLeaderSubmission.types.ts (Troop) for the District
// Committee category.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export interface LeaderDistrictCommitteeSubmissionMember {
  position: string
  fullName: string
  birthdate: string
  groupRepresented?: string
}

export interface LeaderDistrictCommitteeSubmission extends LeaderSubmissionBase {
  name: string
  address?: string
  telNo?: string
  region?: string
  council?: string
  district?: string
  schoolYear: string
  dateApplied?: string
  members: LeaderDistrictCommitteeSubmissionMember[]
}
