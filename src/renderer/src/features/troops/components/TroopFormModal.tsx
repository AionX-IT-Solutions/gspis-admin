import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import { troopLevelOptions, type Troop } from '../types/troop.types'
import { useTroopFormModal } from '../hooks/useTroopFormModal'

interface TroopFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Troop | null
}

const DISTRICT_OPTIONS = ILOCOS_SUR_DISTRICTS.map((d) => ({ value: d, label: d }))

// Section label between field groups in the (now fairly long) Troop form — matches the
// weight/size used elsewhere for small uppercase section headings in this app's forms.
function SectionHeading({ children }: { children: string }) {
  return (
    <div
      className="col-span-2"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginTop: 6,
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 14
      }}
    >
      {children}
    </div>
  )
}

const TROOP_TYPE_OPTIONS = [
  { value: 'school', label: 'School Based' },
  { value: 'community', label: 'Community Based' }
]
const RBO_STATUS_OPTIONS = [
  { value: 'old', label: 'Old' },
  { value: 'new', label: 'New' }
]

export function TroopFormModal({ open, onOpenChange, editTarget }: TroopFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useTroopFormModal(open, onOpenChange, editTarget)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={editTarget ? t('troops.modal.editTitle') : t('troops.modal.addTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('troops.modal.saveChanges') : t('troops.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('troops.form.troopNumber')} required>
          <FieldInput
            value={form.troopNumber}
            onChange={(e) => setForm((f) => ({ ...f, troopNumber: e.target.value }))}
            placeholder="TROOP-014"
          />
        </FormField>
        <FormField label={t('troops.form.level')} required>
          <FieldSelect
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            options={troopLevelOptions(form.level)}
            placeholder={t('troops.form.levelPlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.troopName')} className="col-span-2">
          <FieldInput
            value={form.troopName}
            onChange={(e) => setForm((f) => ({ ...f, troopName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.leaderName')} required>
          <FieldInput
            value={form.leaderName}
            onChange={(e) => setForm((f) => ({ ...f, leaderName: e.target.value }))}
            placeholder={t('troops.form.leaderNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.assistantLeaderName')}>
          <FieldInput
            value={form.assistantLeaderName}
            onChange={(e) => setForm((f) => ({ ...f, assistantLeaderName: e.target.value }))}
            placeholder={t('troops.form.leaderNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.school')}>
          <FieldInput
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.barangay')}>
          <FieldInput
            value={form.barangay}
            onChange={(e) => setForm((f) => ({ ...f, barangay: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.meetingPlace')} className="col-span-2">
          <FieldInput
            value={form.meetingPlace}
            onChange={(e) => setForm((f) => ({ ...f, meetingPlace: e.target.value }))}
          />
        </FormField>

        <SectionHeading>{t('troops.form.registrationDetailsHeading')}</SectionHeading>
        <FormField label={t('troops.form.troopAddress')} className="col-span-2">
          <FieldInput
            value={form.troopAddress}
            onChange={(e) => setForm((f) => ({ ...f, troopAddress: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.troopTelNo')}>
          <FieldInput
            value={form.troopTelNo}
            onChange={(e) => setForm((f) => ({ ...f, troopTelNo: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.troopType')}>
          <FieldSelect
            value={form.troopType}
            onChange={(e) =>
              setForm((f) => ({ ...f, troopType: e.target.value as typeof f.troopType }))
            }
            options={TROOP_TYPE_OPTIONS}
            placeholder={t('troops.form.troopTypePlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.districtCommitteeName')}>
          <FieldInput
            value={form.districtCommitteeName}
            onChange={(e) => setForm((f) => ({ ...f, districtCommitteeName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.district')}>
          <FieldSelect
            value={form.district}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            options={DISTRICT_OPTIONS}
            placeholder={t('troops.form.districtPlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.barangayCommitteeName')}>
          <FieldInput
            value={form.barangayCommitteeName}
            onChange={(e) => setForm((f) => ({ ...f, barangayCommitteeName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.sponsoringGroup')}>
          <FieldInput
            value={form.sponsoringGroup}
            onChange={(e) => setForm((f) => ({ ...f, sponsoringGroup: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.troopBirthday')}>
          <FieldInput
            type="date"
            value={form.troopBirthday}
            onChange={(e) => setForm((f) => ({ ...f, troopBirthday: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.completeMailingAddress')} className="col-span-2">
          <FieldInput
            value={form.completeMailingAddress}
            onChange={(e) => setForm((f) => ({ ...f, completeMailingAddress: e.target.value }))}
          />
        </FormField>

        <SectionHeading>{t('troops.form.leaderDetailsHeading')}</SectionHeading>
        <p
          className="col-span-2"
          style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}
        >
          {t('troops.form.leaderDetailsHint')}
        </p>
        <FormField label={t('troops.form.leaderBeneficiary')}>
          <FieldInput
            value={form.leaderBeneficiary}
            onChange={(e) => setForm((f) => ({ ...f, leaderBeneficiary: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.leaderRboStatus')}>
          <FieldSelect
            value={form.leaderRboStatus}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                leaderRboStatus: e.target.value as typeof f.leaderRboStatus
              }))
            }
            options={RBO_STATUS_OPTIONS}
            placeholder={t('troops.form.rboStatusPlaceholder')}
          />
        </FormField>

        <SectionHeading>{t('troops.form.assistantLeaderDetailsHeading')}</SectionHeading>
        <FormField label={t('troops.form.leaderBeneficiary')}>
          <FieldInput
            value={form.assistantLeaderBeneficiary}
            onChange={(e) => setForm((f) => ({ ...f, assistantLeaderBeneficiary: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.leaderRboStatus')}>
          <FieldSelect
            value={form.assistantLeaderRboStatus}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                assistantLeaderRboStatus: e.target.value as typeof f.assistantLeaderRboStatus
              }))
            }
            options={RBO_STATUS_OPTIONS}
            placeholder={t('troops.form.rboStatusPlaceholder')}
          />
        </FormField>
      </div>
    </Modal>
  )
}
