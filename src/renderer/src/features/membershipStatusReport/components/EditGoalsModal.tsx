import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { DEFAULT_MEMBERSHIP_GOALS, type MembershipGoals } from '../store/membershipGoals.store'

interface EditGoalsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYear: string
  currentGoals: MembershipGoals | undefined
  onSave: (goals: MembershipGoals) => void
}

type FormState = Record<keyof MembershipGoals, string>

function toFormState(goals: MembershipGoals): FormState {
  return Object.fromEntries(Object.entries(goals).map(([k, v]) => [k, String(v)])) as FormState
}

const FIELDS: { key: keyof MembershipGoals; labelKey: string }[] = [
  { key: 'membershipPotential', labelKey: 'membershipStatusReport.goals.membershipPotential' },
  { key: 'barangayCommittee', labelKey: 'membershipStatusReport.goals.barangayCommittee' },
  { key: 'districtCommittee', labelKey: 'membershipStatusReport.goals.districtCommittee' },
  { key: 'associateMember', labelKey: 'membershipStatusReport.goals.associateMember' },
  { key: 'honoraryMember', labelKey: 'membershipStatusReport.goals.honoraryMember' },
  { key: 'trefoilGuild', labelKey: 'membershipStatusReport.goals.trefoilGuild' },
  { key: 'careerWoman', labelKey: 'membershipStatusReport.goals.careerWoman' },
  { key: 'iccg', labelKey: 'membershipStatusReport.goals.iccg' }
]

export function EditGoalsModal({
  open,
  onOpenChange,
  schoolYear,
  currentGoals,
  onSave
}: EditGoalsModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>(toFormState(DEFAULT_MEMBERSHIP_GOALS))

  useEffect(() => {
    if (!open) return
    setForm(toFormState(currentGoals ?? DEFAULT_MEMBERSHIP_GOALS))
  }, [open, currentGoals])

  function handleSubmit() {
    const goals = Object.fromEntries(
      FIELDS.map(({ key }) => [key, parseFloat(form[key]) || 0])
    ) as unknown as MembershipGoals
    onSave(goals)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('membershipStatusReport.goals.editTitle', { schoolYear })}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {FIELDS.map(({ key, labelKey }) => (
          <FormField key={key} label={t(labelKey)}>
            <FieldInput
              type="number"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </FormField>
        ))}
      </div>
    </Modal>
  )
}
