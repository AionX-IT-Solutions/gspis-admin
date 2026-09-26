import { useEffect, useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useUsersStore, type StaffUser } from '@/features/users/store/users.store'
import { setStaffUserActive } from '@/features/users/lib/staffUserFunctions'
import { MEMBERSHIP_CATEGORIES } from '../config/membershipCategories'
import type { TroopLeaderSubmissionDecisionTarget } from '../components/TroopLeaderSubmissionDecisionModal'
import type {
  LeaderSubmissionBase,
  LeaderSubmissionStatus
} from '../types/leaderSubmissionBase.types'

export interface SubmissionRow {
  id: string
  primaryLabel: string
  submittedByName: string
  memberCount?: number
  status: LeaderSubmissionStatus
  createdAt: string
}

// Generalizes the original, Troop-only useTroopLeaderSubmissions.ts across all 8 Troops &
// Membership categories, driven by MEMBERSHIP_CATEGORIES instead of one hardcoded store.
export function useMembershipSubmissions() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const loading = useSkeletonLoading()

  const users = useUsersStore((s) => s.users)
  const subscribeUsers = useUsersStore((s) => s.subscribe)

  // Rules of Hooks are safe here — MEMBERSHIP_CATEGORIES is a fixed-length module constant, so
  // every render calls the same 8 store hooks, in the same order, every time.
  const categoryStates = MEMBERSHIP_CATEGORIES.map((category) => ({
    category,
    ...category.useStore()
  }))

  useEffect(() => {
    categoryStates.forEach(({ hydrate }) => hydrate())
    // Each category's hydrate is stable (module-level store action) — only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const unsubscribe = subscribeUsers()
    return () => unsubscribe()
  }, [subscribeUsers])

  const canManage = hasPermission('manage:troopLeaderSubmissions')

  const [activeTab, setActiveTabRaw] = useState(MEMBERSHIP_CATEGORIES[0].key)
  const [search, setSearch] = useState('')
  const [decision, setDecision] = useState<TroopLeaderSubmissionDecisionTarget | null>(null)
  const [detailTarget, setDetailTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubmissionRow | null>(null)
  const [toggleTarget, setToggleTarget] = useState<StaffUser | null>(null)
  const [toggling, setToggling] = useState(false)

  function setActiveTab(key: string) {
    setActiveTabRaw(key)
    setSearch('')
    setDetailTarget(null)
    setDecision(null)
    setDeleteTarget(null)
  }

  const activeState =
    categoryStates.find((cs) => cs.category.key === activeTab) ?? categoryStates[0]

  const rows: SubmissionRow[] = useMemo(
    () =>
      activeState.submissions
        .map((s: LeaderSubmissionBase) => ({
          id: s.id,
          primaryLabel: activeState.category.getPrimaryLabel(s),
          submittedByName: s.submittedByName,
          memberCount: activeState.category.getCount(s),
          status: s.status,
          createdAt: s.createdAt
        }))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [activeState]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.primaryLabel.toLowerCase().includes(q) || r.submittedByName.toLowerCase().includes(q)
    )
  }, [rows, search])

  // Category-agnostic — every self-registration category shares the same account tier
  // (see firestore.rules: role() == 'troop_leader'), so this list isn't scoped per tab.
  const leaderAccounts = useMemo(() => users.filter((u) => u.role === 'troop_leader'), [users])

  const detailSubmission = useMemo(
    () => activeState.submissions.find((s) => s.id === detailTarget) ?? null,
    [activeState, detailTarget]
  )

  // Approving now actually files the real record (see membershipCategories.ts's `merge`) before
  // flipping status — a submission missing something merge() needs (e.g. ICCG's picked troop)
  // throws, so this surfaces that as a toast and leaves the submission pending instead of
  // silently marking it "approved" with nothing real behind it. Returns whether the decision
  // actually went through, so the confirm modal knows whether it's safe to close.
  function decideSubmission(
    id: string,
    status: LeaderSubmissionStatus,
    notes?: string,
    extra?: unknown
  ): boolean {
    if (status === 'approved') {
      const submission = activeState.submissions.find((s) => s.id === id)
      if (!submission) return false
      try {
        activeState.category.merge(submission, extra)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t('troopLeaderSubmissions.toast.mergeFailed')
        )
        return false
      }
    }
    activeState.decideSubmission(id, status, notes)
    return true
  }

  function handleConfirmDeleteSubmission() {
    if (!deleteTarget) return
    activeState.deleteSubmission(deleteTarget.id)
    toast.success(t('troopLeaderSubmissions.toast.deleted'))
    setDeleteTarget(null)
  }

  async function handleConfirmToggleActive() {
    if (!toggleTarget) return
    setToggling(true)
    try {
      await setStaffUserActive(toggleTarget.uid, !toggleTarget.isActive)
      appendAuditLog({
        action: 'user_updated',
        actorName: useAppStore.getState().currentUser?.fullName ?? 'System',
        entityType: 'user',
        summary: `Member account "${toggleTarget.fullName}" ${toggleTarget.isActive ? 'disabled' : 'reactivated'}.`
      })
      toast.success(
        toggleTarget.isActive
          ? t('users.toast.userDisabled', { fullName: toggleTarget.fullName })
          : t('users.toast.userEnabled', { fullName: toggleTarget.fullName })
      )
    } catch {
      toast.error(t('users.toast.toggleActiveFailed'))
    } finally {
      setToggling(false)
      setToggleTarget(null)
    }
  }

  return {
    loading,
    categories: MEMBERSHIP_CATEGORIES,
    activeTab,
    setActiveTab,
    activeCategory: activeState.category,
    decideSubmission,
    hydrateActive: activeState.hydrate,
    rows: filteredRows,
    search,
    setSearch,
    canManage,
    decision,
    setDecision,
    detailSubmission,
    setDetailTarget,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteSubmission,
    leaderAccounts,
    toggleTarget,
    setToggleTarget,
    toggling,
    handleConfirmToggleActive
  }
}
