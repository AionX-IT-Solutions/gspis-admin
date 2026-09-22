import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { troopLevelOptions, type ScoutMember } from '../types/troop.types'
import { useScoutMemberFormModal } from '../hooks/useScoutMemberFormModal'

interface ScoutMemberFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  troopId: string
  currentMembershipYear: string
  editTarget: ScoutMember | null
}

export function ScoutMemberFormModal({
  open,
  onOpenChange,
  troopId,
  currentMembershipYear,
  editTarget
}: ScoutMemberFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useScoutMemberFormModal(
    open,
    onOpenChange,
    troopId,
    currentMembershipYear,
    editTarget
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('troops.roster.modal.editTitle') : t('troops.roster.modal.addTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('troops.modal.saveChanges') : t('troops.roster.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('troops.roster.form.fullName')} required className="col-span-2">
          <FieldInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Juana Dela Cruz"
          />
        </FormField>
        <FormField label={t('troops.roster.form.birthdate')} required>
          <FieldInput
            type="date"
            value={form.birthdate}
            onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.roster.form.level')}>
          <FieldSelect
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            options={troopLevelOptions(form.level)}
            placeholder={t('troops.form.levelPlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.roster.form.guardianName')}>
          <FieldInput
            value={form.guardianName}
            onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.roster.form.guardianContact')}>
          <FieldInput
            value={form.guardianContact}
            onChange={(e) => setForm((f) => ({ ...f, guardianContact: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.roster.form.address')} className="col-span-2">
          <FieldInput
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.roster.form.patrol')}>
          <FieldInput
            value={form.patrol}
            onChange={(e) => setForm((f) => ({ ...f, patrol: e.target.value }))}
            placeholder="Patrol 1"
          />
        </FormField>
        <FormField label={t('troops.roster.form.gradeYear')}>
          <FieldInput
            value={form.gradeYear}
            onChange={(e) => setForm((f) => ({ ...f, gradeYear: e.target.value }))}
            placeholder="VI"
          />
        </FormField>
        <FormField label={t('troops.roster.form.beneficiary')} className="col-span-2">
          <FieldInput
            value={form.beneficiary}
            onChange={(e) => setForm((f) => ({ ...f, beneficiary: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}
