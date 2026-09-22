import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import type { OavfMember } from '../types/oavfMember.types'
import { useOavfMemberFormModal, type OavfMemberFormState } from '../hooks/useOavfMemberFormModal'

interface OavfMemberFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: OavfMember | null
}

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated'].map((v) => ({
  value: v,
  label: v
}))
const SEX_OPTIONS = ['Male', 'Female'].map((v) => ({ value: v, label: v }))
const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

export function OavfMemberFormModal({ open, onOpenChange, editTarget }: OavfMemberFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, canManage, handleSubmit } = useOavfMemberFormModal(
    open,
    onOpenChange,
    editTarget
  )

  function setField<K extends keyof OavfMemberFormState>(key: K, value: OavfMemberFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('oavf.editModalTitle') : t('oavf.addModalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editTarget ? t('common.save') : t('oavf.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('oavf.form.council')}>
          <FieldInput value={form.council} onChange={(e) => setField('council', e.target.value)} />
        </FormField>
        <FormField label={t('oavf.form.region')}>
          <FieldInput value={form.region} onChange={(e) => setField('region', e.target.value)} />
        </FormField>
        <FormField label={t('oavf.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setField('district', e.target.value)}
            options={DISTRICT_OPTIONS}
            placeholder={t('oavf.form.selectPlaceholder')}
          />
        </FormField>
        <div />

        <FormField label={t('oavf.form.lastName')} required>
          <FieldInput
            value={form.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.firstName')} required>
          <FieldInput
            value={form.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.middleInitial')}>
          <FieldInput
            value={form.middleInitial}
            onChange={(e) => setField('middleInitial', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.civilStatus')}>
          <FieldSelect
            value={form.civilStatus}
            onChange={(e) =>
              setField('civilStatus', e.target.value as OavfMemberFormState['civilStatus'])
            }
            options={CIVIL_STATUS_OPTIONS}
            placeholder={t('oavf.form.selectPlaceholder')}
          />
        </FormField>
        <FormField label={t('oavf.form.sex')}>
          <FieldSelect
            value={form.sex}
            onChange={(e) => setField('sex', e.target.value as OavfMemberFormState['sex'])}
            options={SEX_OPTIONS}
            placeholder={t('oavf.form.selectPlaceholder')}
          />
        </FormField>
        <FormField label={t('oavf.form.birthdate')}>
          <FieldInput
            type="date"
            value={form.birthdate}
            onChange={(e) => setField('birthdate', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.mobileNo')}>
          <FieldInput
            value={form.mobileNo}
            onChange={(e) => setField('mobileNo', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.email')}>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.homeAddress')} className="col-span-2">
          <FieldInput
            value={form.homeAddress}
            onChange={(e) => setField('homeAddress', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.religion')}>
          <FieldInput
            value={form.religion}
            onChange={(e) => setField('religion', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.educationalAttainment')}>
          <FieldInput
            value={form.educationalAttainment}
            onChange={(e) => setField('educationalAttainment', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.profession')}>
          <FieldInput
            value={form.profession}
            onChange={(e) => setField('profession', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.occupation')}>
          <FieldInput
            value={form.occupation}
            onChange={(e) => setField('occupation', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.interests')} className="col-span-2">
          <FieldInput
            value={form.interests}
            onChange={(e) => setField('interests', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.otherOrgAffiliated')} className="col-span-2">
          <FieldInput
            value={form.otherOrgAffiliated}
            onChange={(e) => setField('otherOrgAffiliated', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.beneficiary')}>
          <FieldInput
            value={form.beneficiary}
            onChange={(e) => setField('beneficiary', e.target.value)}
          />
        </FormField>
        <FormField label={t('oavf.form.beneficiaryContactNo')}>
          <FieldInput
            value={form.beneficiaryContactNo}
            onChange={(e) => setField('beneficiaryContactNo', e.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  )
}
