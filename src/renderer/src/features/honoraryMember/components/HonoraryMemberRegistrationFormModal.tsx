import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'
import { useHonoraryMemberRegistrationFormModal } from '../hooks/useHonoraryMemberRegistrationFormModal'

interface HonoraryMemberRegistrationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: HonoraryMemberRegistration | null
  /** Pre-selects the honoree when filing a fresh registration straight from the Members tab —
   *  ignored while editing. */
  presetMemberId?: string | null
}

export function HonoraryMemberRegistrationFormModal({
  open,
  onOpenChange,
  editTarget,
  presetMemberId
}: HonoraryMemberRegistrationFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, canManage, handleSubmit } = useHonoraryMemberRegistrationFormModal(
    open,
    onOpenChange,
    editTarget
  )
  const members = useHonoraryMemberStore((s) => s.members)
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setMemberSearch('')
    if (!editTarget && presetMemberId) {
      setForm((f) => ({ ...f, honoraryMemberId: presetMemberId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget, presetMemberId])

  const selectedMember = members.find((m) => m.id === form.honoraryMemberId) ?? null
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    if (!q) return []
    return members.filter((m) => `${m.lastName} ${m.firstName}`.toLowerCase().includes(q))
  }, [members, memberSearch])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        editTarget
          ? t('honoraryMember.registration.editModalTitle')
          : t('honoraryMember.registration.addModalTitle')
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {t('honoraryMember.registration.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('honoraryMember.registration.form.honoree')} required>
          {editTarget ? (
            <div style={{ fontSize: 13, fontWeight: 600, padding: '10px 12px' }}>
              {selectedMember ? `${selectedMember.lastName}, ${selectedMember.firstName}` : '—'}
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {selectedMember ? (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--accent-primary-subtle)',
                    border: '1px solid var(--accent-primary)',
                    fontSize: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 40
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {selectedMember.lastName}, {selectedMember.firstName}
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, honoraryMemberId: '' }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: 16,
                      padding: 4
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <FieldInput
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder={t('honoraryMember.registration.form.honoreePlaceholder')}
                    autoComplete="off"
                  />
                  {filteredMembers.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        border: '1px solid var(--border-default)',
                        borderRadius: 8,
                        maxHeight: 240,
                        overflowY: 'auto',
                        backgroundColor: '#ffffff',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {filteredMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setForm((f) => ({ ...f, honoraryMemberId: m.id }))
                            setMemberSearch('')
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-subtle)',
                            fontSize: 13,
                            backgroundColor: '#ffffff'
                          }}
                        >
                          {m.lastName}, {m.firstName}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('honoraryMember.registration.form.schoolYear')} required>
            <FieldInput
              value={form.schoolYear}
              onChange={(e) => setForm((f) => ({ ...f, schoolYear: e.target.value }))}
            />
          </FormField>
          <FormField label={t('honoraryMember.registration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={form.dateApplied}
              onChange={(e) => setForm((f) => ({ ...f, dateApplied: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label={t('honoraryMember.form.wasGirlScout')}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.wasGirlScout}
              onChange={(e) => setForm((f) => ({ ...f, wasGirlScout: e.target.checked }))}
            />
            {t('honoraryMember.form.wasGirlScoutLabel')}
          </label>
        </FormField>

        {form.wasGirlScout && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <FormField label={t('honoraryMember.form.dateLastRegistered')}>
              <FieldInput
                type="date"
                value={form.dateLastRegistered}
                onChange={(e) => setForm((f) => ({ ...f, dateLastRegistered: e.target.value }))}
              />
            </FormField>
            <FormField label={t('honoraryMember.form.position')}>
              <FieldInput
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              />
            </FormField>
          </div>
        )}
      </div>
    </Modal>
  )
}
