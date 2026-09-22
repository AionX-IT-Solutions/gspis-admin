import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { OAVF_POSITIONS, type OavfRegistration } from '../types/oavf.types'
import { useOavfMemberStore } from '../store/oavfMember.store'
import {
  useOavfRegistrationFormModal,
  type OavfRegistrationFormState
} from '../hooks/useOavfRegistrationFormModal'

interface OavfRegistrationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: OavfRegistration | null
  /** Pre-selects the applicant when filing a fresh registration straight from the Members tab
   *  (e.g. "New Registration" on a specific member's row) — ignored while editing. */
  presetMemberId?: string | null
}

const POSITION_OPTIONS = OAVF_POSITIONS.map((p) => ({ value: p, label: p }))

export function OavfRegistrationFormModal({
  open,
  onOpenChange,
  editTarget,
  presetMemberId
}: OavfRegistrationFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, canManage, handleSubmit } = useOavfRegistrationFormModal(
    open,
    onOpenChange,
    editTarget
  )
  const members = useOavfMemberStore((s) => s.members)
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setMemberSearch('')
    if (!editTarget && presetMemberId) {
      setForm((f) => ({ ...f, oavfMemberId: presetMemberId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget, presetMemberId])

  const selectedMember = members.find((m) => m.id === form.oavfMemberId) ?? null
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    if (!q) return []
    return members.filter((m) => `${m.lastName} ${m.firstName}`.toLowerCase().includes(q))
  }, [members, memberSearch])

  function setField<K extends keyof OavfRegistrationFormState>(
    key: K,
    value: OavfRegistrationFormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        editTarget ? t('oavf.registration.editModalTitle') : t('oavf.registration.addModalTitle')
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {t('oavf.registration.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('oavf.registration.form.applicant')} required>
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
                    onClick={() => setField('oavfMemberId', '')}
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
                    placeholder={t('oavf.registration.form.applicantPlaceholder')}
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
                            setField('oavfMemberId', m.id)
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
          <FormField label={t('oavf.registration.form.schoolYear')} required>
            <FieldInput
              value={form.schoolYear}
              onChange={(e) => setField('schoolYear', e.target.value)}
            />
          </FormField>
          <FormField label={t('oavf.registration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={form.dateApplied}
              onChange={(e) => setField('dateApplied', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label={t('oavf.form.wasGirlScout')}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.wasGirlScout}
              onChange={(e) => setField('wasGirlScout', e.target.checked)}
            />
            {t('oavf.form.wasGirlScoutLabel')}
          </label>
        </FormField>

        {form.wasGirlScout && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <FormField label={t('oavf.form.gsRegion')}>
              <FieldInput
                value={form.gsRegion}
                onChange={(e) => setField('gsRegion', e.target.value)}
              />
            </FormField>
            <FormField label={t('oavf.form.gsCouncil')}>
              <FieldInput
                value={form.gsCouncil}
                onChange={(e) => setField('gsCouncil', e.target.value)}
              />
            </FormField>
            <FormField label={t('oavf.form.dateLastRegistered')}>
              <FieldInput
                type="date"
                value={form.dateLastRegistered}
                onChange={(e) => setField('dateLastRegistered', e.target.value)}
              />
            </FormField>
            <FormField label={t('oavf.form.gsPosition')}>
              <FieldSelect
                value={form.gsPosition}
                onChange={(e) =>
                  setField('gsPosition', e.target.value as OavfRegistrationFormState['gsPosition'])
                }
                options={POSITION_OPTIONS}
                placeholder={t('oavf.form.selectPlaceholder')}
              />
            </FormField>
          </div>
        )}
      </div>
    </Modal>
  )
}
