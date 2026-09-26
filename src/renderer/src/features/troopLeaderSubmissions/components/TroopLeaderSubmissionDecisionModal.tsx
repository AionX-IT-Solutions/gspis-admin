import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldTextArea } from '@/shared/components/ui/FormField'
import type { LeaderSubmissionStatus } from '../types/leaderSubmissionBase.types'
import { useTroopLeaderSubmissionDecisionModal } from '../hooks/useTroopLeaderSubmissionDecisionModal'

export interface TroopLeaderSubmissionDecisionTarget {
  id: string
  primaryLabel: string
  submittedByName: string
  status: LeaderSubmissionStatus
  /** Only set for categories with `requiresTroopPick` (ICCG) — the troop id picked via
   *  TroopPickerModal before this decision target was created, forwarded into merge(). */
  extra?: unknown
}

interface TroopLeaderSubmissionDecisionModalProps {
  decision: TroopLeaderSubmissionDecisionTarget | null
  decideSubmission: (
    id: string,
    status: LeaderSubmissionStatus,
    notes?: string,
    extra?: unknown
  ) => boolean
  onClose: () => void
}

export function TroopLeaderSubmissionDecisionModal({
  decision,
  decideSubmission,
  onClose
}: TroopLeaderSubmissionDecisionModalProps) {
  const { t } = useTranslation()
  const { decisionNotes, setDecisionNotes, handleDecide } = useTroopLeaderSubmissionDecisionModal(
    decision,
    decideSubmission,
    onClose
  )

  return (
    <Modal
      open={!!decision}
      onOpenChange={(open) => !open && onClose()}
      title={
        decision?.status === 'approved'
          ? t('troopLeaderSubmissions.modal.approveTitle')
          : t('troopLeaderSubmissions.modal.rejectTitle')
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={decision?.status === 'approved' ? 'primary' : 'danger'}
            size="sm"
            onClick={handleDecide}
          >
            {decision?.status === 'approved'
              ? t('troopLeaderSubmissions.modal.confirmApproval')
              : t('troopLeaderSubmissions.modal.confirmRejection')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 13, marginBottom: 12 }}>
        {decision &&
          t('troopLeaderSubmissions.modal.summary', {
            primary: decision.primaryLabel,
            submitter: decision.submittedByName
          })}
      </p>
      {decision?.status === 'approved' && (
        <p style={{ fontSize: 12, color: 'var(--c-text-3)', marginBottom: 12 }}>
          {t('troopLeaderSubmissions.modal.approveHint')}
        </p>
      )}
      <FormField label={t('troopLeaderSubmissions.form.notesOptional')}>
        <FieldTextArea
          value={decisionNotes}
          onChange={(e) => setDecisionNotes(e.target.value)}
          placeholder={t('troopLeaderSubmissions.form.notesPlaceholder')}
        />
      </FormField>
    </Modal>
  )
}
