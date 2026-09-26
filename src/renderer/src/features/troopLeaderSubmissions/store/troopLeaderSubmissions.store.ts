import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderTroopSubmission } from '../types/troopLeaderSubmission.types'

export const useTroopLeaderSubmissionsStore = createSubmissionsStore<LeaderTroopSubmission>(
  'troopLeaderSubmissions',
  'troop_leader_submission_decided',
  'Troop Leader'
)
