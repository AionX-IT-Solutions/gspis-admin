import { create } from 'zustand'
import { persistDoc, hydrateCollection, reportHydrateFailure } from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

export interface MembershipGoals {
  membershipPotential: number
  barangayCommittee: number
  districtCommittee: number
  associateMember: number
  honoraryMember: number
  trefoilGuild: number
  careerWoman: number
  iccg: number
}

// The Council's own Membership Status Report shows these exact figures as its Goal column —
// kept only as the starting default for a membership year that has no goals doc yet (not
// hardcoded forever); every value stays editable per school year from the report page.
export const DEFAULT_MEMBERSHIP_GOALS: MembershipGoals = {
  membershipPotential: 17352,
  barangayCommittee: 192,
  districtCommittee: 5,
  associateMember: 100,
  honoraryMember: 10,
  trefoilGuild: 2,
  careerWoman: 10,
  iccg: 5
}

interface MembershipGoalsDoc extends MembershipGoals {
  id: string
}

interface MembershipGoalsState {
  // Keyed by membership year label (e.g. "2026-2027") — the Council resets/adjusts targets
  // each cycle, so goals are per-year rather than one global set.
  goalsByYear: Record<string, MembershipGoals>
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  getGoals: (schoolYear: string) => MembershipGoals
  setGoals: (schoolYear: string, goals: MembershipGoals) => void
}

export const useMembershipGoalsStore = create<MembershipGoalsState>()((set, get) => ({
  goalsByYear: {},
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const docs = await hydrateCollection<MembershipGoalsDoc>('membershipGoals')
      const goalsByYear: Record<string, MembershipGoals> = {}
      for (const doc of docs) {
        const { id: _id, ...goals } = doc
        goalsByYear[doc.id] = goals
      }
      set({ goalsByYear, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[membershipGoals.store] Failed to hydrate', err)
    }
  },

  getGoals: (schoolYear) => get().goalsByYear[schoolYear] ?? DEFAULT_MEMBERSHIP_GOALS,

  setGoals: (schoolYear, goals) => {
    set((s) => ({ goalsByYear: { ...s.goalsByYear, [schoolYear]: goals } }))
    persistDoc('membershipGoals', schoolYear, { id: schoolYear, ...goals })
    appendAuditLog({
      action: 'membership_goals_updated',
      actorName: actorName(),
      entityType: 'membership_goals',
      summary: `Membership Status Report goals for ${schoolYear} updated.`
    })
  }
}))
