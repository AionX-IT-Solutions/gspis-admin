import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/lib/utils'
import type { MembershipCategoryConfig } from '../config/membershipCategories'
import type {
  LeaderSubmissionBase,
  LeaderSubmissionStatus
} from '../types/leaderSubmissionBase.types'

interface TroopLeaderSubmissionDetailModalProps {
  submission: LeaderSubmissionBase | null
  category: MembershipCategoryConfig
  onClose: () => void
}

const STATUS_VARIANT: Record<LeaderSubmissionStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: 'var(--c-text-3)', minWidth: 140 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

// Config-driven across all 8 Troops & Membership categories (see config/membershipCategories.ts)
// — header fields and the roster block (age-level+guardian, position+group, girls+adults, or no
// roster at all) come entirely from the active category's config instead of being hardcoded per
// field, the way the original Troop-only version of this modal was.
export function TroopLeaderSubmissionDetailModal({
  submission,
  category,
  onClose
}: TroopLeaderSubmissionDetailModalProps) {
  const { t } = useTranslation()
  const rosterCards = submission ? category.getRosterCards(submission) : []

  return (
    <Modal
      open={!!submission}
      onOpenChange={(open) => !open && onClose()}
      title={t('troopLeaderSubmissions.detail.title')}
      size="md"
    >
      {submission && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Badge variant={STATUS_VARIANT[submission.status]}>
              {t(`common.${submission.status}`)}
            </Badge>
            <span style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
              {t('troopLeaderSubmissions.detail.submittedOn', {
                date: formatDate(submission.createdAt)
              })}
            </span>
          </div>

          {category.detailFields.map((field) => (
            <Row key={field.label} label={field.label} value={field.get(submission)} />
          ))}

          <div style={{ marginTop: 8, marginBottom: 4, fontSize: 12, color: 'var(--c-text-3)' }}>
            {t('troopLeaderSubmissions.detail.submittedBy')}
          </div>
          <Row label={t('users.table.fullName')} value={submission.submittedByName} />
          <Row label={t('users.table.email')} value={submission.submittedByEmail} />

          {rosterCards.length > 0 && (
            <>
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {t('troopLeaderSubmissions.detail.members', { count: rosterCards.length })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rosterCards.map((card, i) => (
                  <div
                    key={`${card.title}-${i}`}
                    style={{
                      border: '1px solid var(--c-border)',
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 12
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{card.title}</div>
                    <div style={{ color: 'var(--c-text-3)' }}>{card.subtitle}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {submission.notes && (
            <>
              <div
                style={{ marginTop: 16, marginBottom: 4, fontSize: 12, color: 'var(--c-text-3)' }}
              >
                {t('troopLeaderSubmissions.form.notesOptional')}
              </div>
              <p style={{ fontSize: 13 }}>{submission.notes}</p>
            </>
          )}

          {submission.reviewNotes && (
            <>
              <div
                style={{ marginTop: 16, marginBottom: 4, fontSize: 12, color: 'var(--c-text-3)' }}
              >
                {t('troopLeaderSubmissions.detail.reviewNotes')}
              </div>
              <p style={{ fontSize: 13 }}>{submission.reviewNotes}</p>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
