// Shared shape across every Troops & Membership self-registration category (Troop, Barangay
// Committee, District Committee, Trefoil Guild, OAVF, Honorary Member, Associate Member, ICCG).
// Mirrors gspis-app's features/troopLeader/types/leaderSubmissionBase.ts. Each category's own
// submission type extends this with its content fields — see troopLeaderSubmission.types.ts
// (Troop) for the original, category-specific example this generalizes.

export type LeaderSubmissionStatus = 'pending' | 'approved' | 'rejected'

interface LeaderSubmissionSystemFields {
  id: string
  submittedByUid: string
  submittedByEmail: string
  submittedByName: string
  status: LeaderSubmissionStatus
  reviewedByUid?: string
  reviewedByName?: string
  reviewNotes?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LeaderSubmissionBase extends LeaderSubmissionSystemFields {
  notes?: string
}
