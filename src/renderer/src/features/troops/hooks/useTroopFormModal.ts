import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '../store/troops.store'
import type { Troop } from '../types/troop.types'

function emptyForm() {
  return {
    troopNumber: '',
    troopName: '',
    level: '',
    leaderName: '',
    assistantLeaderName: '',
    school: '',
    barangay: '',
    meetingPlace: '',
    troopAddress: '',
    troopTelNo: '',
    districtCommitteeName: '',
    district: '',
    barangayCommitteeName: '',
    sponsoringGroup: '',
    completeMailingAddress: '',
    troopBirthday: '',
    troopType: '' as '' | 'school' | 'community',
    leaderBeneficiary: '',
    leaderRboStatus: '' as '' | 'old' | 'new',
    assistantLeaderBeneficiary: '',
    assistantLeaderRboStatus: '' as '' | 'old' | 'new'
  }
}

function formFromTroop(troop: Troop) {
  return {
    troopNumber: troop.troopNumber,
    troopName: troop.troopName ?? '',
    level: troop.level,
    leaderName: troop.leaderName,
    assistantLeaderName: troop.assistantLeaderName ?? '',
    school: troop.school ?? '',
    barangay: troop.barangay ?? '',
    meetingPlace: troop.meetingPlace ?? '',
    troopAddress: troop.troopAddress ?? '',
    troopTelNo: troop.troopTelNo ?? '',
    districtCommitteeName: troop.districtCommitteeName ?? '',
    district: troop.district ?? '',
    barangayCommitteeName: troop.barangayCommitteeName ?? '',
    sponsoringGroup: troop.sponsoringGroup ?? '',
    completeMailingAddress: troop.completeMailingAddress ?? '',
    troopBirthday: troop.troopBirthday ?? '',
    troopType: (troop.troopType ?? '') as '' | 'school' | 'community',
    leaderBeneficiary: troop.leaderBeneficiary ?? '',
    leaderRboStatus: (troop.leaderRboStatus ?? '') as '' | 'old' | 'new',
    assistantLeaderBeneficiary: troop.assistantLeaderBeneficiary ?? '',
    assistantLeaderRboStatus: (troop.assistantLeaderRboStatus ?? '') as '' | 'old' | 'new'
  }
}

export function useTroopFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget: Troop | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const addTroop = useTroopsStore((s) => s.addTroop)
  const updateTroop = useTroopsStore((s) => s.updateTroop)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (open) setForm(editTarget ? formFromTroop(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!hasPermission('manage:troops')) return
    if (!form.troopNumber.trim() || !form.leaderName.trim() || !form.level.trim()) {
      toast.error(t('troops.toast.validationRequired'))
      return
    }
    const payload = {
      troopNumber: form.troopNumber.trim(),
      troopName: form.troopName.trim() || undefined,
      level: form.level.trim(),
      leaderName: form.leaderName.trim(),
      assistantLeaderName: form.assistantLeaderName.trim() || undefined,
      school: form.school.trim() || undefined,
      barangay: form.barangay.trim() || undefined,
      meetingPlace: form.meetingPlace.trim() || undefined,
      troopAddress: form.troopAddress.trim() || undefined,
      troopTelNo: form.troopTelNo.trim() || undefined,
      districtCommitteeName: form.districtCommitteeName.trim() || undefined,
      district: form.district || undefined,
      barangayCommitteeName: form.barangayCommitteeName.trim() || undefined,
      sponsoringGroup: form.sponsoringGroup.trim() || undefined,
      completeMailingAddress: form.completeMailingAddress.trim() || undefined,
      troopBirthday: form.troopBirthday || undefined,
      troopType: form.troopType || undefined,
      leaderBeneficiary: form.leaderBeneficiary.trim() || undefined,
      leaderRboStatus: form.leaderRboStatus || undefined,
      assistantLeaderBeneficiary: form.assistantLeaderBeneficiary.trim() || undefined,
      assistantLeaderRboStatus: form.assistantLeaderRboStatus || undefined
    }
    if (editTarget) {
      updateTroop(editTarget.id, payload)
      toast.success(t('troops.toast.updated'))
    } else {
      addTroop({ id: crypto.randomUUID(), ...payload, isActive: true })
      toast.success(t('troops.toast.created', { troopNumber: payload.troopNumber }))
    }
    onOpenChange(false)
  }

  return {
    form,
    setForm,
    handleSubmit
  }
}
