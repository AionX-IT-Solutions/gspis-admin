import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderHonoraryMemberSubmission } from '../types/honoraryMemberSubmission.types'

export const useHonoraryMemberSubmissionsStore =
  createSubmissionsStore<LeaderHonoraryMemberSubmission>(
    'honoraryMemberSubmissions',
    'honorary_member_submission_decided',
    'Honorary Member'
  )
