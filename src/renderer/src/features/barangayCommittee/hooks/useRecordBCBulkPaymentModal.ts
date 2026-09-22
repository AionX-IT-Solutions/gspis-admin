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
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import type { BarangayCommitteeRegistration } from '../types/barangayCommitteeRegistration.types'
import { postBulkPaymentVoucher } from '../lib/bcVoucher'

function emptyForm() {
  return {
    barangayCommitteeId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    bcGroupFeeAmount: 0,
    includeMembership: true,
    includeBcGroupFee: true
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

export function useRecordBCBulkPaymentModal(open: boolean, onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:barangayCommittee')
  const committees = useBarangayCommitteeStore((s) => s.committees)
  const members = useBarangayCommitteeStore((s) => s.members)
  const addBulkPayment = useBarangayCommitteeStore((s) => s.addBulkPayment)
  const attachBulkPaymentVoucher = useBarangayCommitteeStore((s) => s.attachBulkPaymentVoucher)
  const registrations = useBarangayCommitteeRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open)
  const printerDeviceName = usePrinterDeviceName()

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

  // Each fee line can be switched off for this specific transaction (e.g. collecting just the
  // Membership Fee this time so it can be receipted cleanly as an Acknowledgment Receipt,
  // leaving the B.C. Group Fee for a separate remittance) — the rates stay whatever the
  // registration filed, only whether they're part of THIS collection changes.
  const membershipTotal = form.includeMembership
    ? form.membershipAmountPerMember * form.memberIds.length
    : 0
  const bcGroupFeeCollected = form.includeBcGroupFee ? form.bcGroupFeeAmount : 0
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal])

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
        amountPerMember: form.includeMembership ? form.membershipAmountPerMember : 0
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
    // without a receipt to show for it (the Council's real process always issues one). Built
    // once here and reused as-is both for storage (so the Payment tab can reprint it later)
    // and for the actual print call below.
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

    const { flatPayments } = addBulkPayment({
      barangayCommitteeId: form.barangayCommitteeId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    // The B.C. Group Fee line (this transaction's only voucher-worthy line — Membership Fee
    // has no council share, see barangayCommittee.types.ts) posts to ONE shared voucher for
    // the whole transaction, same "one receipt per transaction" reasoning as Troops/District
    // Committee. Firestore only lets super_admin/admin/accountant/manager write `vouchers`
    // (not hr, even though hr can record this payment) — skipped entirely rather than
    // attempted-and-denied when the signed-in user lacks 'manage:vouchers'.
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

    toast.success(t('barangayCommittee.payment.toast.recorded'))

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
