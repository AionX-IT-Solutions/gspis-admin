import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import { useDistrictCommitteeStore } from '../store/districtCommittee.store'
import type { DistrictCommittee } from '../types/districtCommittee.types'

interface DistrictCommitteeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: DistrictCommittee | null
}

const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

function emptyForm() {
  return { name: '', address: '', telNo: '', region: '', council: '', district: '' }
}

export function DistrictCommitteeFormModal({
  open,
  onOpenChange,
  editTarget
}: DistrictCommitteeFormModalProps) {
  const { t } = useTranslation()
  const addCommittee = useDistrictCommitteeStore((s) => s.addCommittee)
  const updateCommittee = useDistrictCommitteeStore((s) => s.updateCommittee)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(
      editTarget
        ? {
            name: editTarget.name,
            address: editTarget.address ?? '',
            telNo: editTarget.telNo ?? '',
            region: editTarget.region ?? '',
            council: editTarget.council ?? '',
            district: editTarget.district ?? ''
          }
        : emptyForm()
    )
  }, [open, editTarget])

  function handleSubmit() {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      telNo: form.telNo.trim() || undefined,
      region: form.region.trim() || undefined,
      council: form.council.trim() || undefined,
      district: form.district || undefined
    }
    if (editTarget) {
      updateCommittee(editTarget.id, payload)
    } else {
      addCommittee({ id: crypto.randomUUID(), ...payload, isActive: true })
    }
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        editTarget ? t('districtCommittee.editModalTitle') : t('districtCommittee.addModalTitle')
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('districtCommittee.form.name')} required>
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </FormField>
        <FormField label={t('districtCommittee.form.address')}>
          <FieldInput
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </FormField>
        <FormField label={t('districtCommittee.form.telNo')}>
          <FieldInput
            value={form.telNo}
            onChange={(e) => setForm((f) => ({ ...f, telNo: e.target.value }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('districtCommittee.form.region')}>
            <FieldInput
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            />
          </FormField>
          <FormField label={t('districtCommittee.form.council')}>
            <FieldInput
              value={form.council}
              onChange={(e) => setForm((f) => ({ ...f, council: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('districtCommittee.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            options={DISTRICT_OPTIONS}
            placeholder={t('districtCommittee.form.districtPlaceholder')}
          />
        </FormField>
      </div>
    </Modal>
  )
}
