import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import type { TrefoilGuild } from '../types/trefoilGuild.types'

interface TrefoilGuildFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: TrefoilGuild | null
}

const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

function emptyForm() {
  return {
    name: '',
    guildNumber: '',
    address: '',
    telNo: '',
    email: '',
    region: '',
    council: '',
    district: ''
  }
}

export function TrefoilGuildFormModal({
  open,
  onOpenChange,
  editTarget
}: TrefoilGuildFormModalProps) {
  const { t } = useTranslation()
  const addGuild = useTrefoilGuildStore((s) => s.addGuild)
  const updateGuild = useTrefoilGuildStore((s) => s.updateGuild)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(
      editTarget
        ? {
            name: editTarget.name,
            guildNumber: editTarget.guildNumber ?? '',
            address: editTarget.address ?? '',
            telNo: editTarget.telNo ?? '',
            email: editTarget.email ?? '',
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
      guildNumber: form.guildNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      telNo: form.telNo.trim() || undefined,
      email: form.email.trim() || undefined,
      region: form.region.trim() || undefined,
      council: form.council.trim() || undefined,
      district: form.district || undefined
    }
    if (editTarget) {
      updateGuild(editTarget.id, payload)
    } else {
      addGuild({ id: crypto.randomUUID(), ...payload, isActive: true })
    }
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('trefoilGuild.editModalTitle') : t('trefoilGuild.addModalTitle')}
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <FormField label={t('trefoilGuild.form.name')} required>
            <FieldInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trefoilGuild.form.guildNumber')}>
            <FieldInput
              value={form.guildNumber}
              onChange={(e) => setForm((f) => ({ ...f, guildNumber: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('trefoilGuild.form.address')}>
          <FieldInput
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('trefoilGuild.form.telNo')}>
            <FieldInput
              value={form.telNo}
              onChange={(e) => setForm((f) => ({ ...f, telNo: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trefoilGuild.form.email')}>
            <FieldInput
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('trefoilGuild.form.region')}>
            <FieldInput
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trefoilGuild.form.council')}>
            <FieldInput
              value={form.council}
              onChange={(e) => setForm((f) => ({ ...f, council: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('trefoilGuild.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            options={DISTRICT_OPTIONS}
            placeholder={t('trefoilGuild.form.districtPlaceholder')}
          />
        </FormField>
      </div>
    </Modal>
  )
}
