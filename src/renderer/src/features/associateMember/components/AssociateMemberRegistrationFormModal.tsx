import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useAssociateMemberStore } from '../store/associateMember.store'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'
import { useAssociateMemberRegistrationFormModal } from '../hooks/useAssociateMemberRegistrationFormModal'

interface AssociateMemberRegistrationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: AssociateMemberRegistration | null
  /** Pre-selects the applicant when filing a fresh registration straight from the Members
   *  tab — ignored while editing. */
  presetMemberId?: string | null
}

export function AssociateMemberRegistrationFormModal({
  open,
  onOpenChange,
  editTarget,
  presetMemberId
}: AssociateMemberRegistrationFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, canManage, handleSubmit } = useAssociateMemberRegistrationFormModal(
    open,
    onOpenChange,
    editTarget
  )
  const members = useAssociateMemberStore((s) => s.members)
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setMemberSearch('')
    if (!editTarget && presetMemberId) {
      setForm((f) => ({ ...f, associateMemberId: presetMemberId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget, presetMemberId])

  const selectedMember = members.find((m) => m.id === form.associateMemberId) ?? null
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
          ? t('associateMember.registration.editModalTitle')
          : t('associateMember.registration.addModalTitle')
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {t('associateMember.registration.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('associateMember.registration.form.applicant')} required>
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
                    onClick={() => setForm((f) => ({ ...f, associateMemberId: '' }))}
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
                    placeholder={t('associateMember.registration.form.applicantPlaceholder')}
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
                            setForm((f) => ({ ...f, associateMemberId: m.id }))
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
          <FormField label={t('associateMember.form.amfNumber')}>
            <FieldInput
              value={form.amfNumber}
              onChange={(e) => setForm((f) => ({ ...f, amfNumber: e.target.value }))}
            />
          </FormField>
          <FormField label={t('associateMember.form.series')}>
            <FieldInput
              value={form.series}
              onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('associateMember.registration.form.schoolYear')} required>
            <FieldInput
              value={form.schoolYear}
              onChange={(e) => setForm((f) => ({ ...f, schoolYear: e.target.value }))}
            />
          </FormField>
          <FormField label={t('associateMember.registration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={form.dateApplied}
              onChange={(e) => setForm((f) => ({ ...f, dateApplied: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label={t('associateMember.form.wasGirlScout')}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.wasGirlScout}
              onChange={(e) => setForm((f) => ({ ...f, wasGirlScout: e.target.checked }))}
            />
            {t('associateMember.form.wasGirlScoutLabel')}
          </label>
        </FormField>

        {form.wasGirlScout && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <FormField label={t('associateMember.form.dateLastRegistered')}>
              <FieldInput
                type="date"
                value={form.dateLastRegistered}
                onChange={(e) => setForm((f) => ({ ...f, dateLastRegistered: e.target.value }))}
              />
            </FormField>
            <FormField label={t('associateMember.form.position')}>
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
