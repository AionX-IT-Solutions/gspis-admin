import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '../store/troops.store'
import { todayLocalIso } from '@/shared/lib/utils'
import type { ScoutMember } from '../types/troop.types'

function emptyForm() {
  return {
    fullName: '',
    birthdate: '',
    level: '',
    guardianName: '',
    guardianContact: '',
    address: '',
    patrol: '',
    gradeYear: '',
    beneficiary: ''
  }
}

function formFromMember(member: ScoutMember) {
  return {
    fullName: member.fullName,
    birthdate: member.birthdate,
    level: member.level ?? '',
    guardianName: member.guardianName ?? '',
    guardianContact: member.guardianContact ?? '',
    address: member.address ?? '',
    patrol: member.patrol ?? '',
    gradeYear: member.gradeYear ?? '',
    beneficiary: member.beneficiary ?? ''
  }
}

export function useScoutMemberFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  troopId: string,
  currentMembershipYear: string,
  editTarget: ScoutMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const addScoutMember = useTroopsStore((s) => s.addScoutMember)
  const updateScoutMember = useTroopsStore((s) => s.updateScoutMember)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(editTarget ? formFromMember(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!hasPermission('manage:troops')) return
    if (!form.fullName.trim() || !form.birthdate.trim()) {
      toast.error(t('troops.roster.toast.validationRequired'))
      return
    }
    const payload = {
      fullName: form.fullName.trim(),
      birthdate: form.birthdate,
      level: form.level.trim() || undefined,
      guardianName: form.guardianName.trim() || undefined,
      guardianContact: form.guardianContact.trim() || undefined,
      address: form.address.trim() || undefined,
      patrol: form.patrol.trim() || undefined,
      gradeYear: form.gradeYear.trim() || undefined,
      beneficiary: form.beneficiary.trim() || undefined
    }
    if (editTarget) {
      updateScoutMember(editTarget.id, payload)
      toast.success(t('troops.roster.toast.updated'))
    } else {
      addScoutMember({
        id: crypto.randomUUID(),
        troopId,
        ...payload,
        membershipYear: currentMembershipYear,
        renewedAt: todayLocalIso(),
        payments: [],
        isActive: true
      })
      toast.success(t('troops.roster.toast.created', { name: payload.fullName }))
    }
    onOpenChange(false)
  }

  return { form, setForm, handleSubmit }
}
