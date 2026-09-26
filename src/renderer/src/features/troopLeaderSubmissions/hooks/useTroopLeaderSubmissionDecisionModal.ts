import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { LeaderSubmissionStatus } from '../types/leaderSubmissionBase.types'
import type { TroopLeaderSubmissionDecisionTarget } from '../components/TroopLeaderSubmissionDecisionModal'

// decideSubmission is generic across every category's store (see createSubmissionsStore.ts) —
// this hook takes the active tab's store's decideSubmission directly instead of importing one
// hardcoded store, so the same modal works for whichever category is currently selected.
export function useTroopLeaderSubmissionDecisionModal(
  decision: TroopLeaderSubmissionDecisionTarget | null,
  decideSubmission: (
    id: string,
    status: LeaderSubmissionStatus,
    notes?: string,
    extra?: unknown
  ) => boolean,
  onClose: () => void
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const [decisionNotes, setDecisionNotes] = useState('')

  function handleDecide() {
    if (!decision || !hasPermission('manage:troopLeaderSubmissions')) return
    // Approving can fail (merge() throws — see useMembershipSubmissions.ts), which already
    // surfaced its own error toast; leave the modal open with the notes intact so staff can
    // fix the underlying data and retry instead of losing what they typed.
    const ok = decideSubmission(
      decision.id,
      decision.status,
      decisionNotes || undefined,
      decision.extra
    )
    if (!ok) return
    toast.success(
      t('troopLeaderSubmissions.toast.decided', { status: t(`common.${decision.status}`) })
    )
    setDecisionNotes('')
    onClose()
  }

  return { decisionNotes, setDecisionNotes, handleDecide }
}
