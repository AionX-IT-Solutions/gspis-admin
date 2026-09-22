import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOavfMemberStore } from '../store/oavfMember.store'
import type { OavfCivilStatus, OavfMember, OavfSex } from '../types/oavfMember.types'

export type OavfMemberFormState = ReturnType<typeof emptyForm>

function emptyForm() {
  return {
    council: '',
    region: '',
    district: '',
    lastName: '',
    firstName: '',
    middleInitial: '',
    civilStatus: '' as OavfCivilStatus | '',
    sex: '' as OavfSex | '',
    birthdate: '',
    mobileNo: '',
    email: '',
    homeAddress: '',
    religion: '',
    educationalAttainment: '',
    profession: '',
    occupation: '',
    interests: '',
    otherOrgAffiliated: '',
    beneficiary: '',
    beneficiaryContactNo: ''
  }
}

function formFromMember(m: OavfMember) {
  return {
    council: m.council,
    region: m.region,
    district: m.district ?? '',
    lastName: m.lastName,
    firstName: m.firstName,
    middleInitial: m.middleInitial,
    civilStatus: m.civilStatus,
    sex: m.sex,
    birthdate: m.birthdate,
    mobileNo: m.mobileNo,
    email: m.email,
    homeAddress: m.homeAddress,
    religion: m.religion,
    educationalAttainment: m.educationalAttainment,
    profession: m.profession,
    occupation: m.occupation,
    interests: m.interests,
    otherOrgAffiliated: m.otherOrgAffiliated,
    beneficiary: m.beneficiary,
    beneficiaryContactNo: m.beneficiaryContactNo
  }
}

export function useOavfMemberFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: OavfMember | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:oavf')
  const addMember = useOavfMemberStore((s) => s.addMember)
  const updateMember = useOavfMemberStore((s) => s.updateMember)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromMember(editTarget) : emptyForm())
  }, [open, editTarget])

  function handleSubmit() {
    if (!canManage) return
    if (!form.lastName.trim() || !form.firstName.trim()) {
      toast.error(t('oavf.toast.missingFields'))
      return
    }

    const payload: Omit<OavfMember, 'id'> = {
      council: form.council.trim(),
      region: form.region.trim(),
      district: form.district || undefined,
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleInitial: form.middleInitial.trim(),
      civilStatus: form.civilStatus,
      sex: form.sex,
      birthdate: form.birthdate,
      mobileNo: form.mobileNo.trim(),
      email: form.email.trim(),
      homeAddress: form.homeAddress.trim(),
      religion: form.religion.trim(),
      educationalAttainment: form.educationalAttainment.trim(),
      profession: form.profession.trim(),
      occupation: form.occupation.trim(),
      interests: form.interests.trim(),
      otherOrgAffiliated: form.otherOrgAffiliated.trim(),
      beneficiary: form.beneficiary.trim(),
      beneficiaryContactNo: form.beneficiaryContactNo.trim(),
      isActive: editTarget?.isActive ?? true
    }

    if (editTarget) {
      updateMember(editTarget.id, payload)
      toast.success(t('oavf.toast.updated'))
    } else {
      addMember(payload)
      toast.success(t('oavf.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
