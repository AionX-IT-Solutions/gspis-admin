import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderOavfSubmission } from '../types/oavfSubmission.types'

export const useOavfSubmissionsStore = createSubmissionsStore<LeaderOavfSubmission>(
  'oavfSubmissions',
  'oavf_submission_decided',
  'OAVF'
)
