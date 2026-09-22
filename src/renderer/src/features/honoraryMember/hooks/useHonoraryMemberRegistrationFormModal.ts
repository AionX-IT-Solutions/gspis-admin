import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { todayLocalIso } from '@/shared/lib/utils'
import { useHonoraryMemberRegistrationStore } from '../store/honoraryMemberRegistration.store'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

export type HonoraryMemberRegistrationFormState = ReturnType<typeof emptyForm>

function emptyForm(schoolYear: string) {
  return {
    honoraryMemberId: '',
    schoolYear,
    dateApplied: todayLocalIso(),
    wasGirlScout: false,
    dateLastRegistered: '',
    position: ''
  }
}

function formFromRegistration(r: HonoraryMemberRegistration) {
  return {
    honoraryMemberId: r.honoraryMemberId,
    schoolYear: r.schoolYear,
    dateApplied: r.dateApplied,
    wasGirlScout: r.wasGirlScout,
    dateLastRegistered: r.dateLastRegistered,
    position: r.position
  }
}

/** Filing a new Honorary Member Registration — mirrors features/oavf/hooks/
 *  useOavfRegistrationFormModal.ts exactly, one honoree instead of one applicant. Payment
 *  (Fee/AR/Date/Processed By) is intentionally NOT part of this form — only "Record Payment"
 *  (RecordHonoraryMemberPaymentModal) ever writes those fields or posts a voucher. */
export function useHonoraryMemberRegistrationFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: HonoraryMemberRegistration | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:honoraryMember')
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const addRegistration = useHonoraryMemberRegistrationStore((s) => s.addRegistration)
  const updateRegistration = useHonoraryMemberRegistrationStore((s) => s.updateRegistration)
  const [form, setForm] = useState(emptyForm(getMembershipYearLabel(startMonth)))

  useEffect(() => {
    if (!open) return
    setForm(
      editTarget ? formFromRegistration(editTarget) : emptyForm(getMembershipYearLabel(startMonth))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget])

  function handleSubmit() {
    if (!canManage) return
    if (!form.honoraryMemberId) {
      toast.error(t('honoraryMember.registration.toast.memberRequired'))
      return
    }
    if (!form.schoolYear.trim()) {
      toast.error(t('honoraryMember.registration.toast.schoolYearRequired'))
      return
    }

    const payload: Omit<HonoraryMemberRegistration, 'id' | 'createdAt' | 'createdBy'> = {
      honoraryMemberId: form.honoraryMemberId,
      schoolYear: form.schoolYear.trim(),
      dateApplied: form.dateApplied,
      wasGirlScout: form.wasGirlScout,
      dateLastRegistered: form.wasGirlScout ? form.dateLastRegistered : '',
      position: form.wasGirlScout ? form.position.trim() : '',
      membershipFeeTotal: editTarget?.membershipFeeTotal ?? 0,
      membershipFeeCouncilShare: editTarget?.membershipFeeCouncilShare ?? 0,
      arNumber: editTarget?.arNumber ?? '',
      arDate: editTarget?.arDate ?? '',
      processedByName: editTarget?.processedByName ?? '',
      linkedVoucherId: editTarget?.linkedVoucherId
    }

    if (editTarget) {
      updateRegistration(editTarget.id, payload)
      toast.success(t('honoraryMember.registration.toast.updated'))
    } else {
      addRegistration(payload)
      toast.success(t('honoraryMember.registration.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
