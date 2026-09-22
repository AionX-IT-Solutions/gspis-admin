import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAssociateMemberStore } from '../store/associateMember.store'
import type {
  AssociateMember,
  AssociateMemberCivilStatus,
  AssociateMemberSex
} from '../types/associateMember.types'

export type AssociateMemberFormState = ReturnType<typeof emptyForm>

function emptyForm() {
  return {
    lastName: '',
    firstName: '',
    middleInitial: '',
    civilStatus: '' as AssociateMemberCivilStatus | '',
    sex: '' as AssociateMemberSex | '',
    council: '',
    region: '',
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

function formFromMember(m: AssociateMember) {
  return {
    lastName: m.lastName,
    firstName: m.firstName,
    middleInitial: m.middleInitial,
    civilStatus: m.civilStatus,
    sex: m.sex,
    council: m.council,
    region: m.region,
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

export function useAssociateMemberFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: AssociateMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:associateMember')
  const addMember = useAssociateMemberStore((s) => s.addMember)
  const updateMember = useAssociateMemberStore((s) => s.updateMember)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromMember(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!canManage) return
    if (!form.lastName.trim() || !form.firstName.trim()) {
      toast.error(t('associateMember.toast.missingFields'))
      return
    }

    const payload: Omit<AssociateMember, 'id'> = {
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleInitial: form.middleInitial.trim(),
      civilStatus: form.civilStatus,
      sex: form.sex,
      council: form.council.trim(),
      region: form.region.trim(),
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
      toast.success(t('associateMember.toast.updated'))
    } else {
      addMember(payload)
      toast.success(t('associateMember.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
