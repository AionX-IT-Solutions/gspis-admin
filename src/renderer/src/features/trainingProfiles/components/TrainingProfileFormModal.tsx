import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import {
  COUNCIL_ROLES,
  COMPLETED_TRAININGS,
  AGE_LEVEL_SPECIALIZATIONS,
  COMPLETED_CERTIFICATES,
  type CouncilRole,
  type CompletedTraining,
  type CompletedCertificate,
  type TrainingProfile
} from '../types/trainingProfiles.types'
import {
  useTrainingProfileFormModal,
  type TrainingProfileFormState
} from '../hooks/useTrainingProfileFormModal'

interface TrainingProfileFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: TrainingProfile | null
}

interface CheckboxGroupProps<T extends string> {
  values: readonly T[]
  selected: T[]
  onToggle: (value: T) => void
  labelFor: (value: T) => string
}

function CheckboxGroup<T extends string>({
  values,
  selected,
  onToggle,
  labelFor
}: CheckboxGroupProps<T>) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      {values.map((value) => (
        <label
          key={value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 13,
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          {labelFor(value)}
        </label>
      ))}
    </div>
  )
}

export function TrainingProfileFormModal({
  open,
  onOpenChange,
  editTarget
}: TrainingProfileFormModalProps) {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    canManage,
    toggleRole,
    toggleTraining,
    toggleCertificate,
    totalYearsInScouting,
    handleSubmit
  } = useTrainingProfileFormModal(open, onOpenChange, editTarget)
  const troops = useTroopsStore((s) => s.troops)

  function setField<K extends keyof TrainingProfileFormState>(
    key: K,
    value: TrainingProfileFormState[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const showAgeLevelSpecialization = form.completedTrainings.includes(
    'age_level_specialization_course'
  )
  const showTroopPicker = form.roles.includes('troop_leader')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('trainingProfiles.editTitle') : t('trainingProfiles.newButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editTarget ? t('common.save') : t('trainingProfiles.form.createButton')}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('trainingProfiles.form.name')} required className="col-span-2">
          <FieldInput value={form.name} onChange={(e) => setField('name', e.target.value)} />
        </FormField>
        <FormField label={t('trainingProfiles.form.birthday')} required>
          <FieldInput
            type="date"
            value={form.birthday}
            onChange={(e) => setField('birthday', e.target.value)}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.level')} required>
          <FieldSelect
            value={form.level}
            onChange={(e) => setField('level', e.target.value as TrainingProfileFormState['level'])}
            options={[
              { value: 'elementary', label: t('trainingProfiles.level.elementary') },
              { value: 'high_school', label: t('trainingProfiles.level.highSchool') }
            ]}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.school')} required>
          <FieldInput value={form.school} onChange={(e) => setField('school', e.target.value)} />
        </FormField>
        <FormField label={t('trainingProfiles.form.district')} required>
          <FieldInput
            value={form.district}
            onChange={(e) => setField('district', e.target.value)}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.contactNumber')} required>
          <FieldInput
            value={form.contactNumber}
            onChange={(e) => setField('contactNumber', e.target.value)}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.email')} required>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.homeAddress')} required className="col-span-2">
          <FieldInput
            value={form.homeAddress}
            onChange={(e) => setField('homeAddress', e.target.value)}
          />
        </FormField>

        <FormField label={t('trainingProfiles.form.roles')} required className="col-span-2">
          <CheckboxGroup<CouncilRole>
            values={COUNCIL_ROLES}
            selected={form.roles}
            onToggle={toggleRole}
            labelFor={(role) => t(`trainingProfiles.role.${role}`)}
          />
        </FormField>

        {showTroopPicker && (
          <>
            <FormField label={t('trainingProfiles.form.whichTroop')}>
              <FieldSelect
                value={form.troopId}
                onChange={(e) => setField('troopId', e.target.value)}
                options={troops
                  .filter((tr) => tr.isActive)
                  .map((tr) => ({
                    value: tr.id,
                    label: tr.troopName ? `${tr.troopNumber} — ${tr.troopName}` : tr.troopNumber
                  }))}
                placeholder={t('trainingProfiles.form.whichTroopPlaceholder')}
              />
            </FormField>
            <FormField label={t('trainingProfiles.form.troopRole')}>
              <FieldSelect
                value={form.troopRole}
                onChange={(e) =>
                  setField('troopRole', e.target.value as TrainingProfileFormState['troopRole'])
                }
                options={[
                  { value: 'leader', label: t('trainingProfiles.form.troopRoleLeader') },
                  {
                    value: 'assistant_leader',
                    label: t('trainingProfiles.form.troopRoleAssistant')
                  }
                ]}
              />
            </FormField>
          </>
        )}

        <FormField label={t('trainingProfiles.form.completedTrainings')} className="col-span-2">
          <CheckboxGroup<CompletedTraining>
            values={COMPLETED_TRAININGS}
            selected={form.completedTrainings}
            onToggle={toggleTraining}
            labelFor={(training) => t(`trainingProfiles.training.${training}`)}
          />
        </FormField>

        <FormField label={t('trainingProfiles.form.otherCompletedTraining')} className="col-span-2">
          <FieldInput
            value={form.otherCompletedTraining}
            onChange={(e) => setField('otherCompletedTraining', e.target.value)}
          />
        </FormField>

        {showAgeLevelSpecialization && (
          <FormField
            label={t('trainingProfiles.form.ageLevelSpecialization')}
            className="col-span-2"
          >
            <FieldSelect
              value={form.ageLevelSpecialization}
              onChange={(e) =>
                setField(
                  'ageLevelSpecialization',
                  e.target.value as TrainingProfileFormState['ageLevelSpecialization']
                )
              }
              placeholder={t('trainingProfiles.form.ageLevelSpecializationPlaceholder')}
              options={AGE_LEVEL_SPECIALIZATIONS.map((level) => ({
                value: level,
                label: t(`trainingProfiles.ageLevel.${level}`)
              }))}
            />
          </FormField>
        )}

        <FormField label={t('trainingProfiles.form.completedCertificates')} className="col-span-2">
          <CheckboxGroup<CompletedCertificate>
            values={COMPLETED_CERTIFICATES}
            selected={form.completedCertificates}
            onToggle={toggleCertificate}
            labelFor={(cert) => t(`trainingProfiles.certificate.${cert}`)}
          />
        </FormField>

        <FormField label={t('trainingProfiles.form.firstRegistrationDate')}>
          <FieldInput
            type="date"
            value={form.firstRegistrationDate}
            onChange={(e) => setField('firstRegistrationDate', e.target.value)}
          />
        </FormField>
        <FormField label={t('trainingProfiles.form.totalYearsInScouting')}>
          <FieldInput value={form.firstRegistrationDate ? totalYearsInScouting : ''} readOnly />
        </FormField>
      </div>
    </Modal>
  )
}
