import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import type { BarangayCommittee } from '../types/barangayCommittee.types'

interface BarangayCommitteeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: BarangayCommittee | null
}

const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

function emptyForm() {
  return {
    name: '',
    address: '',
    telNo: '',
    districtCommitteeName: '',
    district: '',
    region: '',
    council: ''
  }
}

export function BarangayCommitteeFormModal({
  open,
  onOpenChange,
  editTarget
}: BarangayCommitteeFormModalProps) {
  const { t } = useTranslation()
  const addCommittee = useBarangayCommitteeStore((s) => s.addCommittee)
  const updateCommittee = useBarangayCommitteeStore((s) => s.updateCommittee)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(
      editTarget
        ? {
            name: editTarget.name,
            address: editTarget.address ?? '',
            telNo: editTarget.telNo ?? '',
            districtCommitteeName: editTarget.districtCommitteeName ?? '',
            district: editTarget.district ?? '',
            region: editTarget.region ?? '',
            council: editTarget.council ?? ''
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
      districtCommitteeName: form.districtCommitteeName.trim() || undefined,
      district: form.district || undefined,
      region: form.region.trim() || undefined,
      council: form.council.trim() || undefined
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
        editTarget ? t('barangayCommittee.editModalTitle') : t('barangayCommittee.addModalTitle')
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
        <FormField label={t('barangayCommittee.form.name')} required>
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </FormField>
        <FormField label={t('barangayCommittee.form.address')}>
          <FieldInput
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </FormField>
        <FormField label={t('barangayCommittee.form.telNo')}>
          <FieldInput
            value={form.telNo}
            onChange={(e) => setForm((f) => ({ ...f, telNo: e.target.value }))}
          />
        </FormField>
        <FormField label={t('barangayCommittee.form.districtCommitteeName')}>
          <FieldInput
            value={form.districtCommitteeName}
            onChange={(e) => setForm((f) => ({ ...f, districtCommitteeName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('barangayCommittee.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            options={DISTRICT_OPTIONS}
            placeholder={t('barangayCommittee.form.districtPlaceholder')}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('barangayCommittee.form.region')}>
            <FieldInput
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            />
          </FormField>
          <FormField label={t('barangayCommittee.form.council')}>
            <FieldInput
              value={form.council}
              onChange={(e) => setForm((f) => ({ ...f, council: e.target.value }))}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}
