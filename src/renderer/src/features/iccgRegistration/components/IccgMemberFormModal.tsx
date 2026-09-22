import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { SearchablePicker } from '@/shared/components/ui/SearchablePicker'
import { useToast } from '@/app/hooks/useToast'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useIccgMemberStore } from '../store/iccgMember.store'
import type { IccgMember, IccgMemberRole } from '../types/iccgMember.types'

interface IccgMemberFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: IccgMember | null
}

export function IccgMemberFormModal({ open, onOpenChange, editTarget }: IccgMemberFormModalProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const troops = useTroopsStore((s) => s.troops)
  const addMember = useIccgMemberStore((s) => s.addMember)
  const updateMember = useIccgMemberStore((s) => s.updateMember)

  const [troopId, setTroopId] = useState('')
  const [role, setRole] = useState<IccgMemberRole>('girl')
  const [fullName, setFullName] = useState('')
  const [gradeYear, setGradeYear] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!open) return
    if (editTarget) {
      setTroopId(editTarget.troopId)
      setRole(editTarget.role)
      setFullName(editTarget.fullName)
      setGradeYear(editTarget.gradeYear ?? '')
      setEmail(editTarget.email ?? '')
    } else {
      setTroopId('')
      setRole('girl')
      setFullName('')
      setGradeYear('')
      setEmail('')
    }
  }, [open, editTarget])

  const roleOptions = [
    { value: 'girl', label: t('iccgRegistration.members.roleGirl') },
    { value: 'adult', label: t('iccgRegistration.members.roleAdult') }
  ]

  function handleSubmit() {
    if (!troopId) {
      toast.error(t('iccgRegistration.members.toast.troopRequired'))
      return
    }
    if (!fullName.trim()) {
      toast.error(t('iccgRegistration.members.toast.nameRequired'))
      return
    }
    if (editTarget) {
      updateMember(editTarget.id, {
        troopId,
        role,
        fullName: fullName.trim(),
        gradeYear: role === 'girl' ? gradeYear.trim() || undefined : undefined,
        email: email.trim() || undefined
      })
      toast.success(t('iccgRegistration.members.toast.updated'))
    } else {
      addMember({
        id: crypto.randomUUID(),
        troopId,
        role,
        fullName: fullName.trim(),
        gradeYear: role === 'girl' ? gradeYear.trim() || undefined : undefined,
        email: email.trim() || undefined,
        isActive: true
      })
      toast.success(t('iccgRegistration.members.toast.created'))
    }
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        editTarget
          ? t('iccgRegistration.members.editModalTitle')
          : t('iccgRegistration.members.addModalTitle')
      }
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
        <FormField label={t('iccgRegistration.members.form.troop')} required>
          <SearchablePicker
            items={troops.filter((tr) => tr.isActive)}
            value={troopId}
            onChange={setTroopId}
            getId={(tr) => tr.id}
            getLabel={(tr) => tr.troopNumber}
            getSubLabel={(tr) => tr.troopName || undefined}
            searchPlaceholder={t('iccgRegistration.members.form.troopPlaceholder')}
          />
        </FormField>
        <FormField label={t('iccgRegistration.members.form.role')} required>
          <FieldSelect
            value={role}
            onChange={(e) => setRole(e.target.value as IccgMemberRole)}
            options={roleOptions}
          />
        </FormField>
        <FormField label={t('iccgRegistration.members.form.fullName')} required>
          <FieldInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormField>
        {role === 'girl' && (
          <FormField label={t('iccgRegistration.members.form.gradeYear')}>
            <FieldInput value={gradeYear} onChange={(e) => setGradeYear(e.target.value)} />
          </FormField>
        )}
        <FormField label={t('iccgRegistration.members.form.email')}>
          <FieldInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
      </div>
    </Modal>
  )
}
