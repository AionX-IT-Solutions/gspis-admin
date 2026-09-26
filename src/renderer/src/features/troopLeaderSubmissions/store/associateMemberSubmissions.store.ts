import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderAssociateMemberSubmission } from '../types/associateMemberSubmission.types'

export const useAssociateMemberSubmissionsStore =
  createSubmissionsStore<LeaderAssociateMemberSubmission>(
    'associateMemberSubmissions',
    'associate_member_submission_decided',
    'Associate Member'
  )
