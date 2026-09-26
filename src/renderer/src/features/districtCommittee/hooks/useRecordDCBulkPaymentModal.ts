import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useDistrictCommitteeStore } from '../store/districtCommittee.store'
import { useDistrictCommitteeRegistrationStore } from '../store/districtCommitteeRegistration.store'
import type { DistrictCommitteeRegistration } from '../types/districtCommitteeRegistration.types'

function emptyForm() {
  return {
    districtCommitteeId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    dcGroupFeeAmount: 0
  }
}

// The rates a committee actually owes are whatever its most recently filed District Committee
// Registration recorded (RegistrationRemittance.memberFeePerMember / dcGroupFee) — not a
// hardcoded app-wide default. "Most recent" mirrors the "current state" pattern used
// elsewhere (see features/troops's identical findLatestRegistration).
function findLatestRegistration(
  registrations: DistrictCommitteeRegistration[],
  districtCommitteeId: string
): DistrictCommitteeRegistration | undefined {
  return [...registrations]
    .filter((r) => r.districtCommitteeId === districtCommitteeId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

export function useRecordDCBulkPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:districtCommittee')
  const committees = useDistrictCommitteeStore((s) => s.committees)
  const members = useDistrictCommitteeStore((s) => s.members)
  const addBulkPayment = useDistrictCommitteeStore((s) => s.addBulkPayment)
  const registrations = useDistrictCommitteeRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const committeeRegistration = useMemo(
    () => findLatestRegistration(registrations, form.districtCommitteeId),
    [registrations, form.districtCommitteeId]
  )

  // Picking a committee defaults to covering its whole active roster — stays freely editable
  // since a real remittance sometimes covers fewer members. The fee amounts are pulled
  // straight from that committee's latest filed registration and are NOT editable here (see
  // the fields' `readOnly` in RecordDCBulkPaymentModal.tsx) — this modal only ever collects
  // what was already recorded on file.
  function selectCommittee(districtCommitteeId: string) {
    const committeeMembersList = members.filter(
      (m) => m.districtCommitteeId === districtCommitteeId && m.isActive
    )
    const registration = findLatestRegistration(registrations, districtCommitteeId)
    setForm((f) => ({
      ...f,
      districtCommitteeId,
      memberIds: committeeMembersList.map((m) => m.id),
      membershipAmountPerMember: registration?.remittance.memberFeePerMember ?? 0,
      dcGroupFeeAmount: registration?.dcGroupFee ?? 0
    }))
  }

  // Which fee is part of THIS collection is no longer a manual per-line toggle — it's
  // determined entirely by the receipt type already picked (see ReceiptTypePickerModal), and
  // the two are mutually exclusive: the Acknowledgment Receipt booklet only has a fixed
  // "District Committee Members" REGISTRATION fee row, so an AR-based collection is Membership
  // Fee only. The D.C. Group Fee isn't a registration fee at all — it's collected on a Service
  // Invoice instead, which is D.C. Group Fee only (never Membership Fee, which always goes
  // through an AR). A single remittance covering both would need two separate Record Bulk
  // Payment transactions, one per receipt type.
  const isServiceInvoice = receiptFields.receiptType === 'service_invoice'
  const membershipTotal = isServiceInvoice
    ? 0
    : form.membershipAmountPerMember * form.memberIds.length
  const dcGroupFeeCollected = isServiceInvoice ? form.dcGroupFeeAmount : 0
  const grandTotal = membershipTotal + dcGroupFeeCollected

  // Service Invoice tab's itemized preview — one line per fee actually being collected in
  // this remittance, same labels shown on the form above.
  const officialReceiptLines: ReceiptBreakdownLine[] = [
    ...(membershipTotal > 0
      ? [{ label: t('districtCommittee.payment.categoryMembership'), amount: membershipTotal }]
      : []),
    ...(dcGroupFeeCollected > 0
      ? [{ label: t('districtCommittee.payment.dcGroupFeeLabel'), amount: dcGroupFeeCollected }]
      : [])
  ]

  // Keeps the Acknowledgment Receipt tab's "District Committee Members" row pre-filled with
  // the Membership Fee total. The D.C. Group Fee is deliberately NOT folded into its "Others"
  // row: it's not a registration fee at all, so a transaction that includes it needs the
  // Service Invoice tab instead (or a separate Record Bulk Payment covering just the
  // Membership Fee). No-ops once the cashier has actually edited the breakdown.
  useEffect(() => {
    receiptFields.autoFillBreakdown(
      { 'District Committee Members': membershipTotal },
      { label: '', amount: 0 }
    )
    // `open` is deliberately included even though it's not read in the body — the row otherwise
    // never re-fills after the fields reset on open, whenever a new bulk payment happens to
    // total the exact same amount as the previous one (so this effect wouldn't otherwise
    // re-run).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal, open])

  function handleSubmit() {
    if (!canManage) return
    if (!form.districtCommitteeId) {
      toast.error(t('districtCommittee.payment.toast.committeeRequired'))
      return
    }
    if (!committeeRegistration) {
      toast.error(t('districtCommittee.payment.toast.noRegistration'))
      return
    }
    const memberLines = [
      {
        category: 'membership' as const,
        amountPerMember: isServiceInvoice ? 0 : form.membershipAmountPerMember
      }
    ].filter((l) => l.amountPerMember > 0)
    const flatLines = [{ category: 'dc_group_fee' as const, amount: dcGroupFeeCollected }].filter(
      (l) => l.amount > 0
    )

    if (memberLines.length > 0 && form.memberIds.length === 0) {
      toast.error(t('districtCommittee.payment.toast.membersRequired'))
      return
    }
    if (memberLines.length === 0 && flatLines.length === 0) {
      toast.error(t('districtCommittee.payment.toast.amountRequired'))
      return
    }
    if (!form.paidByName.trim()) {
      toast.error(t('districtCommittee.payment.toast.paidByRequired'))
      return
    }

    // Validate and build the receipt BEFORE recording anything — a payment is never recorded
    // without a receipt to show for it (the Council's real process always issues one). Stored
    // on the payment record as-is so the Payment tab's own Print action can print/reprint it
    // later — recording no longer prints automatically (see that tab's Actions column).
    const committee = committees.find((c) => c.id === form.districtCommitteeId)
    if (!receiptFields.receiptNumber.trim()) {
      toast.error(t('receipts.toast.receiptNumberRequired'))
      return
    }
    const receiptLines =
      receiptFields.receiptType === 'acknowledgment_receipt'
        ? receiptFields.buildAcknowledgmentLines()
        : officialReceiptLines
    if (receiptLines.length === 0) {
      toast.error(t('receipts.toast.breakdownRequired'))
      return
    }
    const collected = receiptLines.reduce((s, l) => s + l.amount, 0)
    if (Math.abs(collected - grandTotal) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }
    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(form.date).toISOString(),
      referenceNote: committee ? `District Committee ${committee.name}` : undefined,
      payorName: form.paidByName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    addBulkPayment({
      districtCommitteeId: form.districtCommitteeId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    toast.success(t('districtCommittee.payment.toast.recorded'))

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    committeeRegistration,
    selectCommittee,
    isServiceInvoice,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
