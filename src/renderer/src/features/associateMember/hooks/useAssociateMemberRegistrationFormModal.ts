import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { todayLocalIso } from '@/shared/lib/utils'
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

export type AssociateMemberRegistrationFormState = ReturnType<typeof emptyForm>

function emptyForm(schoolYear: string) {
  return {
    associateMemberId: '',
    amfNumber: '',
    series: '',
    schoolYear,
    dateApplied: todayLocalIso(),
    wasGirlScout: false,
    dateLastRegistered: '',
    position: ''
  }
}

function formFromRegistration(r: AssociateMemberRegistration) {
  return {
    associateMemberId: r.associateMemberId,
    amfNumber: r.amfNumber,
    series: r.series,
    schoolYear: r.schoolYear,
    dateApplied: r.dateApplied,
    wasGirlScout: r.wasGirlScout,
    dateLastRegistered: r.dateLastRegistered,
    position: r.position
  }
}

/** Filing a new Associate Member Registration — mirrors features/oavf/hooks/
 *  useOavfRegistrationFormModal.ts exactly, one applicant instead of one applicant (same
 *  shape), plus this module's own AMF No./Series booklet control number. Payment (Fee/AR/Date/
 *  Processed By) is intentionally NOT part of this form — only "Record Payment"
 *  (RecordAssociateMemberPaymentModal) ever writes those fields or posts a voucher. */
export function useAssociateMemberRegistrationFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: AssociateMemberRegistration | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:associateMember')
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const addRegistration = useAssociateMemberRegistrationStore((s) => s.addRegistration)
  const updateRegistration = useAssociateMemberRegistrationStore((s) => s.updateRegistration)
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
    if (!form.associateMemberId) {
      toast.error(t('associateMember.registration.toast.memberRequired'))
      return
    }
    if (!form.schoolYear.trim()) {
      toast.error(t('associateMember.registration.toast.schoolYearRequired'))
      return
    }

    const payload: Omit<AssociateMemberRegistration, 'id' | 'createdAt' | 'createdBy'> = {
      associateMemberId: form.associateMemberId,
      amfNumber: form.amfNumber.trim(),
      series: form.series.trim(),
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
      toast.success(t('associateMember.registration.toast.updated'))
    } else {
      addRegistration(payload)
      toast.success(t('associateMember.registration.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
