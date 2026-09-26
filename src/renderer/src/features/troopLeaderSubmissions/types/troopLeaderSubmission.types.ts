// Mirrors gspis-app's features/troopLeader/types/leaderSubmission.ts — both apps read/write
// the same troopLeaderSubmissions Firestore collection (see firestore.rules). The sibling
// submission types for the other 7 categories (barangayCommitteeSubmission.types.ts etc.)
// follow this exact same convention against their own admin entity.

import type { LeaderSubmissionBase } from './leaderSubmissionBase.types'

export type { LeaderSubmissionStatus } from './leaderSubmissionBase.types'

export interface LeaderSubmissionMember {
  fullName: string
  birthdate: string
  level?: string
  guardianName?: string
  guardianContact?: string
  address?: string
}

export interface LeaderTroopSubmission extends LeaderSubmissionBase {
  troopNumber?: string
  troopName?: string
  level: string
  school?: string
  barangay?: string
  meetingPlace?: string
  leaderName: string
  assistantLeaderName?: string
  troopAddress?: string
  troopTelNo?: string
  district?: string
  sponsoringGroup?: string
  members: LeaderSubmissionMember[]
}
