import { createSubmissionsStore } from './createSubmissionsStore'
import type { LeaderDistrictCommitteeSubmission } from '../types/districtCommitteeSubmission.types'

export const useDistrictCommitteeSubmissionsStore =
  createSubmissionsStore<LeaderDistrictCommitteeSubmission>(
    'districtCommitteeSubmissions',
    'district_committee_submission_decided',
    'District Committee'
  )
