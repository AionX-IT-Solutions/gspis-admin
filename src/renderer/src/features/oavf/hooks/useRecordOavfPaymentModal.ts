import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import type { ReceiptBreakdownLine, ReceiptRecord } from '@/shared/types/receipt.types'
import { useOavfStore } from '../store/oavf.store'
import { useOavfMemberStore } from '../store/oavfMember.store'
import { syncOavfRegistrationVoucher } from '../lib/oavfVoucher'
import type { OavfRegistration } from '../types/oavf.types'

function emptyForm() {
  return { date: todayLocalIso(), membershipFeeTotal: '100.00', membershipFeeCouncilShare: '25.00' }
}

/**
 * OAVF/Career Woman's "Record Payment" flow — mirrors features/barangayCommittee/hooks/
 * useRecordBCBulkPaymentModal.ts's shape (mandatory receipt print, voucher posted only here,
 * never from the registration form itself), simplified for a single applicant: no committee
 * picker, no member checklist, no per-line include toggles — just the one Membership Fee for
 * one specific year's filing.
 */
export function useRecordOavfPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  registration: OavfRegistration | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:oavf')
  const updateRegistration = useOavfStore((s) => s.updateRegistration)
  const members = useOavfMemberStore((s) => s.members)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open)
  const printerDeviceName = usePrinterDeviceName()

  useEffect(() => {
    if (!open) return
    setForm({
      date: todayLocalIso(),
      membershipFeeTotal: registration?.membershipFeeTotal
        ? String(registration.membershipFeeTotal)
        : '100.00',
      membershipFeeCouncilShare: registration?.membershipFeeCouncilShare
        ? String(registration.membershipFeeCouncilShare)
        : '25.00'
    })
  }, [open, registration])

  const totalAmount = parseFloat(form.membershipFeeTotal) || 0

  // No fixed row on the AR booklet matches this category — it's collected under "Others" with
  // an explicit label, same treatment as every other single-person module this session.
  const officialReceiptLines: ReceiptBreakdownLine[] =
    totalAmount > 0 ? [{ label: t('oavf.payment.feeLabel'), amount: totalAmount }] : []

  useEffect(() => {
    receiptFields.autoFillBreakdown({}, { label: t('oavf.payment.feeLabel'), amount: totalAmount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount])

  function handleSubmit() {
    if (!canManage || !registration) return
    const member = members.find((m) => m.id === registration.oavfMemberId)
    if (!member) return
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

    const applicantName = `${member.firstName} ${member.lastName}`.trim()
    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(form.date).toISOString(),
      referenceNote: `OAVF/Career Woman — ${applicantName} (${registration.schoolYear})`,
      payorName: applicantName,
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    const councilShare = parseFloat(form.membershipFeeCouncilShare) || 0
    const updated: OavfRegistration = {
      ...registration,
      membershipFeeTotal: totalAmount,
      membershipFeeCouncilShare: councilShare,
      arNumber: receiptFields.receiptNumber.trim(),
      arDate: form.date,
      processedByName: currentUser?.fullName ?? 'Cashier',
      receipt
    }
    updateRegistration(registration.id, updated)

    // Firestore only lets super_admin/admin/accountant/manager write `vouchers` — skipped
    // entirely rather than attempted-and-denied when the signed-in user lacks
    // 'manage:vouchers'.
    if (hasPermission('manage:vouchers')) {
      const linkedVoucherId = syncOavfRegistrationVoucher(member, updated)
      if (linkedVoucherId !== updated.linkedVoucherId) {
        updateRegistration(registration.id, { linkedVoucherId })
      }
    }

    toast.success(t('oavf.payment.toast.recorded'))

    printReceipt(receipt, printerDeviceName).then((result) => {
      if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    })

    onOpenChange(false)
  }

  return { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit }
}
