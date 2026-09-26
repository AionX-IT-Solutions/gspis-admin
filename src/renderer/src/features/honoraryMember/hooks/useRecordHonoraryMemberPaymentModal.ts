import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useHonoraryMemberRegistrationStore } from '../store/honoraryMemberRegistration.store'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

function emptyForm() {
  return { date: todayLocalIso(), membershipFeeTotal: '150.00', membershipFeeCouncilShare: '60.00' }
}

/** Honorary Member's "Record Payment" flow — mirrors features/oavf/hooks/
 *  useRecordOavfPaymentModal.ts's National/Council split (₱150 total, ₱90 forwarded to
 *  National as a pure pass-through, ₱60 retained by Council). */
export function useRecordHonoraryMemberPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  registration: HonoraryMemberRegistration | null,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:honoraryMember')
  const updateRegistration = useHonoraryMemberRegistrationStore((s) => s.updateRegistration)
  const members = useHonoraryMemberStore((s) => s.members)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

  useEffect(() => {
    if (!open) return
    setForm({
      date: todayLocalIso(),
      membershipFeeTotal: registration?.membershipFeeTotal
        ? String(registration.membershipFeeTotal)
        : '150.00',
      membershipFeeCouncilShare: registration?.membershipFeeCouncilShare
        ? String(registration.membershipFeeCouncilShare)
        : '60.00'
    })
  }, [open, registration])

  const totalAmount = parseFloat(form.membershipFeeTotal) || 0

  const officialReceiptLines: ReceiptBreakdownLine[] =
    totalAmount > 0 ? [{ label: t('honoraryMember.payment.feeLabel'), amount: totalAmount }] : []

  useEffect(() => {
    receiptFields.autoFillBreakdown(
      {},
      { label: t('honoraryMember.payment.feeLabel'), amount: totalAmount }
    )
    // `open` is deliberately included even though it's not read in the body — the "Others" row
    // otherwise never re-fills after the fields reset on open, since this fee's amount defaults
    // to the same fixed total every time and so this effect wouldn't otherwise re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount, open])

  function handleSubmit() {
    if (!canManage || !registration) return
    const member = members.find((m) => m.id === registration.honoraryMemberId)
    if (!member) return
    if (totalAmount <= 0) {
      toast.error(t('honoraryMember.payment.toast.amountRequired'))
      return
    }
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
    if (Math.abs(collected - totalAmount) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }

    const memberName = `${member.firstName} ${member.lastName}`.trim()
    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(form.date).toISOString(),
      referenceNote: `Honorary Member — ${memberName} (${registration.schoolYear})`,
      payorName: memberName,
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    const councilShare = parseFloat(form.membershipFeeCouncilShare) || 0
    const updated: HonoraryMemberRegistration = {
      ...registration,
      membershipFeeTotal: totalAmount,
      membershipFeeCouncilShare: councilShare,
      arNumber: receiptFields.receiptNumber.trim(),
      arDate: form.date,
      processedByName: currentUser?.fullName ?? 'Cashier',
      receipt
    }
    updateRegistration(registration.id, updated)

    toast.success(t('honoraryMember.payment.toast.recorded'))

    onOpenChange(false)
  }

  return { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit }
}
