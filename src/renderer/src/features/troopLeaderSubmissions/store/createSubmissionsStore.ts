import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type {
  LeaderSubmissionBase,
  LeaderSubmissionStatus
} from '../types/leaderSubmissionBase.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

export interface SubmissionsState<T extends LeaderSubmissionBase> {
  submissions: T[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>
  // Approve/reject only flip status + review fields — deliberately never write to the real
  // records (troops/scoutMembers-style collections): unverified leader-submitted data gets
  // manually re-keyed into the real records by staff, not auto-merged.
  decideSubmission: (id: string, status: LeaderSubmissionStatus, notes?: string) => void
  // Staff-only cleanup (any status — see firestore.rules) for test/junk/duplicate submissions.
  // Safe even on an already-approved one: approving already copied its data into the real
  // records (see membershipCategories.ts's `merge`), so deleting the submission record
  // afterward never loses anything.
  deleteSubmission: (id: string) => void
}

/** Builds the identical submissions-review store every Troops & Membership category needs,
 * scoped to one Firestore collection. See troopLeaderSubmissions.store.ts for the original,
 * single-category version this generalizes — `decideSubmission` is 100% category-blind, only
 * the collection name and the audit-log wording differ per category. */
export function createSubmissionsStore<T extends LeaderSubmissionBase>(
  collectionName: string,
  auditAction: string,
  entityLabel: string
) {
  return create<SubmissionsState<T>>()((set, get) => ({
    submissions: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const submissions = await hydrateCollection<T>(collectionName)
        set({ submissions, hydrated: true })
      } catch (err) {
        reportHydrateFailure(`[${collectionName}.store] Failed to hydrate`, err)
      }
    },

    decideSubmission: (id, status, notes) => {
      const target = get().submissions.find((s) => s.id === id)
      if (!target || target.status !== 'pending') return

      const updated = {
        ...target,
        status,
        reviewNotes: notes,
        reviewedByUid: useAppStore.getState().currentUser?.id,
        reviewedByName: actorName(),
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as T
      set((s) => ({
        submissions: s.submissions.map((sub) => (sub.id === id ? updated : sub))
      }))
      persist(collectionName, id, updated)
      appendAuditLog({
        action: auditAction,
        actorName: actorName(),
        entityType: entityLabel,
        summary: `${entityLabel} submission from ${target.submittedByName} marked as ${status}.`
      })
    },

    deleteSubmission: (id) => {
      const target = get().submissions.find((s) => s.id === id)
      if (!target) return
      set((s) => ({ submissions: s.submissions.filter((sub) => sub.id !== id) }))
      deleteDocById(collectionName, id)
      appendAuditLog({
        action: auditAction,
        actorName: actorName(),
        entityType: entityLabel,
        summary: `${entityLabel} submission from ${target.submittedByName} deleted.`
      })
    }
  }))
}
