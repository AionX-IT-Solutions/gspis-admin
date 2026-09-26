import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import type { BarangayCommitteeRegistration } from '../types/barangayCommitteeRegistration.types'

function emptyForm() {
  return {
    barangayCommitteeId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    bcGroupFeeAmount: 0
  }
}

// The rates a committee actually owes are whatever its most recently filed Barangay Committee
// Registration recorded (RegistrationRemittance.memberFeePerMember / bcGroupFee) — not a
// hardcoded app-wide default. "Most recent" mirrors the "current state" pattern used
// elsewhere (see features/troops's identical findLatestRegistration).
function findLatestRegistration(
  registrations: BarangayCommitteeRegistration[],
  barangayCommitteeId: string
): BarangayCommitteeRegistration | undefined {
  return [...registrations]
    .filter((r) => r.barangayCommitteeId === barangayCommitteeId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

export function useRecordBCBulkPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:barangayCommittee')
  const committees = useBarangayCommitteeStore((s) => s.committees)
  const members = useBarangayCommitteeStore((s) => s.members)
  const addBulkPayment = useBarangayCommitteeStore((s) => s.addBulkPayment)
  const registrations = useBarangayCommitteeRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const committeeRegistration = useMemo(
    () => findLatestRegistration(registrations, form.barangayCommitteeId),
    [registrations, form.barangayCommitteeId]
  )

  // Picking a committee defaults to covering its whole active roster — stays freely editable
  // since a real remittance sometimes covers fewer members. The fee amounts are pulled
  // straight from that committee's latest filed registration and are NOT editable here (see
  // the fields' `readOnly` in RecordBCBulkPaymentModal.tsx) — this modal only ever collects
  // what was already recorded on file.
  function selectCommittee(barangayCommitteeId: string) {
    const committeeMembersList = members.filter(
      (m) => m.barangayCommitteeId === barangayCommitteeId && m.isActive
    )
    const registration = findLatestRegistration(registrations, barangayCommitteeId)
    setForm((f) => ({
      ...f,
      barangayCommitteeId,
      memberIds: committeeMembersList.map((m) => m.id),
      membershipAmountPerMember: registration?.remittance.memberFeePerMember ?? 0,
      bcGroupFeeAmount: registration?.bcGroupFee ?? 0
    }))
  }

  // Which fee is part of THIS collection is no longer a manual per-line toggle — it's
  // determined entirely by the receipt type already picked (see ReceiptTypePickerModal), and
  // the two are mutually exclusive: the Acknowledgment Receipt booklet only has a fixed
  // "Barangay Committee Members" REGISTRATION fee row, so an AR-based collection is Membership
  // Fee only. The B.C. Group Fee isn't a registration fee at all — it's collected on a Service
  // Invoice instead, which is B.C. Group Fee only (never Membership Fee, which always goes
  // through an AR). A single remittance covering both would need two separate Record Bulk
  // Payment transactions, one per receipt type.
  const isServiceInvoice = receiptFields.receiptType === 'service_invoice'
  const membershipTotal = isServiceInvoice
    ? 0
    : form.membershipAmountPerMember * form.memberIds.length
  const bcGroupFeeCollected = isServiceInvoice ? form.bcGroupFeeAmount : 0
  const grandTotal = membershipTotal + bcGroupFeeCollected

  // Service Invoice tab's itemized preview — one line per fee actually being collected in
  // this remittance, same labels shown on the form above.
  const officialReceiptLines: ReceiptBreakdownLine[] = [
    ...(membershipTotal > 0
      ? [{ label: t('barangayCommittee.payment.categoryMembership'), amount: membershipTotal }]
      : []),
    ...(bcGroupFeeCollected > 0
      ? [{ label: t('barangayCommittee.payment.bcGroupFeeLabel'), amount: bcGroupFeeCollected }]
      : [])
  ]

  // Keeps the Acknowledgment Receipt tab's "Barangay Committee Members" row pre-filled with
  // the Membership Fee total. The B.C. Group Fee is deliberately NOT folded into its "Others"
  // row: it's not a registration fee at all, so a transaction that includes it needs the
  // Service Invoice tab instead (or a separate Record Bulk Payment covering just the
  // Membership Fee). No-ops once the cashier has actually edited the breakdown.
  useEffect(() => {
    receiptFields.autoFillBreakdown(
      { 'Barangay Committee Members': membershipTotal },
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
    if (!form.barangayCommitteeId) {
      toast.error(t('barangayCommittee.payment.toast.committeeRequired'))
      return
    }
    if (!committeeRegistration) {
      toast.error(t('barangayCommittee.payment.toast.noRegistration'))
      return
    }
    const memberLines = [
      {
        category: 'membership' as const,
        amountPerMember: isServiceInvoice ? 0 : form.membershipAmountPerMember
      }
    ].filter((l) => l.amountPerMember > 0)
    const flatLines = [{ category: 'bc_group_fee' as const, amount: bcGroupFeeCollected }].filter(
      (l) => l.amount > 0
    )

    if (memberLines.length > 0 && form.memberIds.length === 0) {
      toast.error(t('barangayCommittee.payment.toast.membersRequired'))
      return
    }
    if (memberLines.length === 0 && flatLines.length === 0) {
      toast.error(t('barangayCommittee.payment.toast.amountRequired'))
      return
    }
    if (!form.paidByName.trim()) {
      toast.error(t('barangayCommittee.payment.toast.paidByRequired'))
      return
    }

    // Validate and build the receipt BEFORE recording anything — a payment is never recorded
    // without a receipt to show for it (the Council's real process always issues one). Stored
    // on the payment record as-is so the Payment tab's own Print action can print/reprint it
    // later — recording no longer prints automatically (see that tab's Actions column).
    const committee = committees.find((c) => c.id === form.barangayCommitteeId)
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
      referenceNote: committee ? `Barangay Committee ${committee.name}` : undefined,
      payorName: form.paidByName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    addBulkPayment({
      barangayCommitteeId: form.barangayCommitteeId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    toast.success(t('barangayCommittee.payment.toast.recorded'))

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
