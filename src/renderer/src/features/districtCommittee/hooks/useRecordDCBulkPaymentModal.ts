import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import type { ReceiptBreakdownLine, ReceiptRecord } from '@/shared/types/receipt.types'
import { useDistrictCommitteeStore } from '../store/districtCommittee.store'
import { useDistrictCommitteeRegistrationStore } from '../store/districtCommitteeRegistration.store'
import type { DistrictCommitteeRegistration } from '../types/districtCommitteeRegistration.types'
import { postBulkPaymentVoucher } from '../lib/dcVoucher'

function emptyForm() {
  return {
    districtCommitteeId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    dcGroupFeeAmount: 0,
    includeMembership: true,
    includeDcGroupFee: true
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

export function useRecordDCBulkPaymentModal(open: boolean, onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:districtCommittee')
  const committees = useDistrictCommitteeStore((s) => s.committees)
  const members = useDistrictCommitteeStore((s) => s.members)
  const addBulkPayment = useDistrictCommitteeStore((s) => s.addBulkPayment)
  const attachBulkPaymentVoucher = useDistrictCommitteeStore((s) => s.attachBulkPaymentVoucher)
  const registrations = useDistrictCommitteeRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open)
  const printerDeviceName = usePrinterDeviceName()

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

  // Each fee line can be switched off for this specific transaction (e.g. collecting just the
  // Membership Fee this time so it can be receipted cleanly as an Acknowledgment Receipt,
  // leaving the D.C. Group Fee for a separate remittance) — the rates stay whatever the
  // registration filed, only whether they're part of THIS collection changes.
  const membershipTotal = form.includeMembership
    ? form.membershipAmountPerMember * form.memberIds.length
    : 0
  const dcGroupFeeCollected = form.includeDcGroupFee ? form.dcGroupFeeAmount : 0
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal])

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
        amountPerMember: form.includeMembership ? form.membershipAmountPerMember : 0
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
    // without a receipt to show for it (the Council's real process always issues one). Built
    // once here and reused as-is both for storage (so the Payment tab can reprint it later)
    // and for the actual print call below.
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

    const { flatPayments } = addBulkPayment({
      districtCommitteeId: form.districtCommitteeId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    // The D.C. Group Fee line (this transaction's only voucher-worthy line — Membership Fee
    // has no council share, see districtCommittee.types.ts) posts to ONE shared voucher for
    // the whole transaction, same "one receipt per transaction" reasoning as Troops. Firestore
    // only lets super_admin/admin/accountant/manager write `vouchers` (not hr, even though hr
    // can record this payment) — skipped entirely rather than attempted-and-denied when the
    // signed-in user lacks 'manage:vouchers'.
    if (committee && flatPayments.length > 0 && hasPermission('manage:vouchers')) {
      const voucherId = postBulkPaymentVoucher(
        committee,
        flatPayments,
        form.date,
        form.paidByName.trim(),
        receipt
      )
      if (voucherId) {
        attachBulkPaymentVoucher(
          committee.id,
          flatPayments.map((p) => p.id),
          voucherId
        )
      }
    }

    toast.success(t('districtCommittee.payment.toast.recorded'))

    printReceipt(receipt, printerDeviceName).then((result) => {
      if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    })

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    committeeRegistration,
    selectCommittee,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
