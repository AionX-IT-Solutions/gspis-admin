import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderBarangayCommitteeSubmission } from '../types/barangayCommitteeSubmission.types'

export const useBarangayCommitteeSubmissionsStore =
  createSubmissionsStore<LeaderBarangayCommitteeSubmission>(
    'barangayCommitteeSubmissions',
    'barangay_committee_submission_decided',
    'Barangay Committee'
  )
