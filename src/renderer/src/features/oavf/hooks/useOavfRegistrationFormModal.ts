import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { todayLocalIso } from '@/shared/lib/utils'
import { useOavfStore } from '../store/oavf.store'
import type { OavfPosition, OavfRegistration } from '../types/oavf.types'

export type OavfRegistrationFormState = ReturnType<typeof emptyForm>

function emptyForm(schoolYear: string) {
  return {
    oavfMemberId: '',
    schoolYear,
    dateApplied: todayLocalIso(),
    wasGirlScout: false,
    gsRegion: '',
    gsCouncil: '',
    dateLastRegistered: '',
    gsPosition: '' as OavfPosition | ''
  }
}

function formFromRegistration(r: OavfRegistration) {
  return {
    oavfMemberId: r.oavfMemberId,
    schoolYear: r.schoolYear,
    dateApplied: r.dateApplied,
    wasGirlScout: r.wasGirlScout,
    gsRegion: r.gsRegion,
    gsCouncil: r.gsCouncil,
    dateLastRegistered: r.dateLastRegistered,
    gsPosition: r.gsPosition
  }
}

/** Filing a new OAVF/Career Woman Registration — same "one filing per applicant per school
 *  year" shape as District/Barangay Committee/Trefoil Guild's own Registration forms, just
 *  without a roster (this module's "roster" is always exactly one applicant, picked here
 *  instead of on a separate picker page). Payment (Fee/AR/Date/Processed By) is intentionally
 *  NOT part of this form — see hooks/useOavfFormModal.ts's identical comment; only "Record
 *  Payment" (RecordOavfPaymentModal) ever writes those fields or posts a voucher. */
export function useOavfRegistrationFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: OavfRegistration | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:oavf')
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const addRegistration = useOavfStore((s) => s.addRegistration)
  const updateRegistration = useOavfStore((s) => s.updateRegistration)
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
    if (!form.oavfMemberId) {
      toast.error(t('oavf.registration.toast.memberRequired'))
      return
    }
    if (!form.schoolYear.trim()) {
      toast.error(t('oavf.registration.toast.schoolYearRequired'))
      return
    }

    const payload: Omit<OavfRegistration, 'id' | 'createdAt' | 'createdBy'> = {
      oavfMemberId: form.oavfMemberId,
      schoolYear: form.schoolYear.trim(),
      dateApplied: form.dateApplied,
      wasGirlScout: form.wasGirlScout,
      gsRegion: form.wasGirlScout ? form.gsRegion.trim() : '',
      gsCouncil: form.wasGirlScout ? form.gsCouncil.trim() : '',
      dateLastRegistered: form.wasGirlScout ? form.dateLastRegistered : '',
      gsPosition: form.wasGirlScout ? form.gsPosition : '',
      membershipFeeTotal: editTarget?.membershipFeeTotal ?? 0,
      membershipFeeCouncilShare: editTarget?.membershipFeeCouncilShare ?? 0,
      arNumber: editTarget?.arNumber ?? '',
      arDate: editTarget?.arDate ?? '',
      processedByName: editTarget?.processedByName ?? '',
      linkedVoucherId: editTarget?.linkedVoucherId
    }

    if (editTarget) {
      updateRegistration(editTarget.id, payload)
      toast.success(t('oavf.registration.toast.updated'))
    } else {
      addRegistration(payload)
      toast.success(t('oavf.registration.toast.created'))
    }

    onOpenChange(false)
  }

  return { form, setForm, canManage, handleSubmit }
}
