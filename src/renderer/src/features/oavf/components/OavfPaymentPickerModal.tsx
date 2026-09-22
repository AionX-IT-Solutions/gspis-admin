import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { FieldInput } from '@/shared/components/ui/FormField'
import { useOavfStore } from '../store/oavf.store'
import { useOavfMemberStore } from '../store/oavfMember.store'
import type { OavfRegistration } from '../types/oavf.types'

interface OavfPaymentPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (registration: OavfRegistration) => void
}

/** Picks which unpaid Registration to record a payment against, opened from the Payment tab's
 *  "Record Payment" button — mirrors the applicant search already built into
 *  OavfRegistrationFormModal.tsx, scoped to registrations that don't have an AR No. yet
 *  (already-paid ones are corrected via the Payment tab's row action instead). */
export function OavfPaymentPickerModal({
  open,
  onOpenChange,
  onPick
}: OavfPaymentPickerModalProps) {
  const { t } = useTranslation()
  const registrations = useOavfStore((s) => s.registrations)
  const members = useOavfMemberStore((s) => s.members)
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const [search, setSearch] = useState('')

  const unpaidRegistrations = useMemo(
    () => registrations.filter((r) => !r.arNumber),
    [registrations]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return unpaidRegistrations
    return unpaidRegistrations.filter((r) => {
      const member = memberById.get(r.oavfMemberId)
      return (
        (member ? `${member.lastName} ${member.firstName}` : '').toLowerCase().includes(q) ||
        r.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [unpaidRegistrations, search, memberById])

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('oavf.payment.pickerTitle')} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FieldInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('oavf.payment.pickerPlaceholder')}
          autoComplete="off"
        />
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 4px' }}>
              {t('oavf.payment.pickerEmpty')}
            </p>
          )}
          {filtered.map((r) => {
            const member = memberById.get(r.oavfMemberId)
            return (
              <div
                key={r.id}
                onClick={() => onPick(r)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 13,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {member ? `${member.lastName}, ${member.firstName}` : '—'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{r.schoolYear}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
