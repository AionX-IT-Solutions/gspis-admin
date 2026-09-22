import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import type { AssociateMember } from '../types/associateMember.types'
import {
  useAssociateMemberFormModal,
  type AssociateMemberFormState
} from '../hooks/useAssociateMemberFormModal'

interface AssociateMemberFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: AssociateMember | null
}

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated'].map((v) => ({
  value: v,
  label: v
}))
const SEX_OPTIONS = ['Male', 'Female'].map((v) => ({ value: v, label: v }))
const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

export function AssociateMemberFormModal({
  open,
  onOpenChange,
  editTarget
}: AssociateMemberFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, canManage, handleSubmit } = useAssociateMemberFormModal(
    open,
    onOpenChange,
    editTarget
  )

  function setField<K extends keyof AssociateMemberFormState>(
    key: K,
    value: AssociateMemberFormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('associateMember.editModalTitle') : t('associateMember.addModalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editTarget ? t('common.save') : t('associateMember.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('associateMember.form.council')}>
          <FieldInput value={form.council} onChange={(e) => setField('council', e.target.value)} />
        </FormField>
        <FormField label={t('associateMember.form.region')}>
          <FieldInput value={form.region} onChange={(e) => setField('region', e.target.value)} />
        </FormField>
        <FormField label={t('associateMember.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setField('district', e.target.value)}
            options={DISTRICT_OPTIONS}
            placeholder={t('associateMember.form.selectPlaceholder')}
          />
        </FormField>
        <div />

        <FormField label={t('associateMember.form.lastName')} required>
          <FieldInput
            value={form.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.firstName')} required>
          <FieldInput
            value={form.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.middleInitial')}>
          <FieldInput
            value={form.middleInitial}
            onChange={(e) => setField('middleInitial', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.civilStatus')}>
          <FieldSelect
            value={form.civilStatus}
            onChange={(e) =>
              setField('civilStatus', e.target.value as AssociateMemberFormState['civilStatus'])
            }
            options={CIVIL_STATUS_OPTIONS}
            placeholder={t('associateMember.form.selectPlaceholder')}
          />
        </FormField>
        <FormField label={t('associateMember.form.sex')}>
          <FieldSelect
            value={form.sex}
            onChange={(e) => setField('sex', e.target.value as AssociateMemberFormState['sex'])}
            options={SEX_OPTIONS}
            placeholder={t('associateMember.form.selectPlaceholder')}
          />
        </FormField>
        <div />

        <FormField label={t('associateMember.form.homeAddress')} className="col-span-2">
          <FieldInput
            value={form.homeAddress}
            onChange={(e) => setField('homeAddress', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.phone')}>
          <FieldInput value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
        </FormField>
        <FormField label={t('associateMember.form.email')}>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.businessAddress')} className="col-span-2">
          <FieldInput
            value={form.businessAddress}
            onChange={(e) => setField('businessAddress', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.businessPhone')}>
          <FieldInput
            value={form.businessPhone}
            onChange={(e) => setField('businessPhone', e.target.value)}
          />
        </FormField>
        <div />
        <FormField label={t('associateMember.form.profession')}>
          <FieldInput
            value={form.profession}
            onChange={(e) => setField('profession', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.occupation')}>
          <FieldInput
            value={form.occupation}
            onChange={(e) => setField('occupation', e.target.value)}
          />
        </FormField>
        <FormField label={t('associateMember.form.beneficiary')} className="col-span-2">
          <FieldInput
            value={form.beneficiary}
            onChange={(e) => setField('beneficiary', e.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
