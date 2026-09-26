import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderTrefoilGuildSubmission } from '../types/trefoilGuildSubmission.types'

export const useTrefoilGuildSubmissionsStore = createSubmissionsStore<LeaderTrefoilGuildSubmission>(
  'trefoilGuildSubmissions',
  'trefoil_guild_submission_decided',
  'Trefoil Guild'
)
