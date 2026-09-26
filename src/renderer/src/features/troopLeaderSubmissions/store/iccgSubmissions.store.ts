import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderIccgSubmission } from '../types/iccgSubmission.types'

export const useIccgSubmissionsStore = createSubmissionsStore<LeaderIccgSubmission>(
  'iccgSubmissions',
  'iccg_submission_decided',
  'ICCG'
)
