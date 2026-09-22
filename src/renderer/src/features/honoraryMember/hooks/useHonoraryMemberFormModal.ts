import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import type {
  HonoraryMember,
  HonoraryMemberCivilStatus,
  HonoraryMemberSex
} from '../types/honoraryMember.types'

export type HonoraryMemberFormState = ReturnType<typeof emptyForm>

function emptyForm() {
  return {
    lastName: '',
    firstName: '',
    middleInitial: '',
    civilStatus: '' as HonoraryMemberCivilStatus | '',
    sex: '' as HonoraryMemberSex | '',
    council: '',
    region: '',
    nhq: '',
    district: '',
    homeAddress: '',
    phone: '',
    email: '',
    businessAddress: '',
    businessPhone: '',
    profession: '',
    occupation: '',
    beneficiary: ''
  }
}

function formFromMember(m: HonoraryMember) {
  return {
    lastName: m.lastName,
    firstName: m.firstName,
    middleInitial: m.middleInitial,
    civilStatus: m.civilStatus,
    sex: m.sex,
    council: m.council,
    region: m.region,
    nhq: m.nhq,
    district: m.district ?? '',
    homeAddress: m.homeAddress,
    phone: m.phone,
    email: m.email,
    businessAddress: m.businessAddress,
    businessPhone: m.businessPhone,
    profession: m.profession,
    occupation: m.occupation,
    beneficiary: m.beneficiary
  }
}

export function useHonoraryMemberFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: HonoraryMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:honoraryMember')
  const addMember = useHonoraryMemberStore((s) => s.addMember)
  const updateMember = useHonoraryMemberStore((s) => s.updateMember)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromMember(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!canManage) return
    if (!form.lastName.trim() || !form.firstName.trim()) {
      toast.error(t('honoraryMember.toast.missingFields'))
      return
    }

    const payload: Omit<HonoraryMember, 'id'> = {
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleInitial: form.middleInitial.trim(),
      civilStatus: form.civilStatus,
      sex: form.sex,
      council: form.council.trim(),
      region: form.region.trim(),
      nhq: form.nhq.trim(),
      district: form.district || undefined,
      homeAddress: form.homeAddress.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      businessAddress: form.businessAddress.trim(),
      businessPhone: form.businessPhone.trim(),
      profession: form.profession.trim(),
      occupation: form.occupation.trim(),
      beneficiary: form.beneficiary.trim(),
      isActive: editTarget?.isActive ?? true
    }

    if (editTarget) {
      updateMember(editTarget.id, payload)
      toast.success(t('honoraryMember.toast.updated'))
    } else {
      addMember(payload)
      toast.success(t('honoraryMember.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
