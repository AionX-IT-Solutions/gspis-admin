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
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'
import { useAssociateMemberStore } from '../store/associateMember.store'
import { syncAssociateMemberRegistrationVoucher } from '../lib/associateMemberVoucher'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

// Unlike OAVF/Honorary Member, the Acknowledgment Receipt booklet's fixed row list
// (shared/lib/receiptCategories.ts) has an exact "Associate Members" category — the real photo
// of this module's own AMF booklet confirmed the name, so this is the one module that DOESN'T
// fall back to a free-text "Others" line.
const AR_CATEGORY = 'Associate Members'

function emptyForm() {
  return { date: todayLocalIso(), membershipFeeTotal: '50.00', membershipFeeCouncilShare: '20.00' }
}

/** Associate Member's "Record Payment" flow — mirrors features/oavf/hooks/
 *  useRecordOavfPaymentModal.ts's National/Council split (₱50 total, ₱30 forwarded to
 *  National as a pure pass-through, ₱20 retained by Council), but maps to the AR booklet's
 *  real fixed "Associate Members" row instead of an "Others" line. */
export function useRecordAssociateMemberPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  registration: AssociateMemberRegistration | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:associateMember')
  const updateRegistration = useAssociateMemberRegistrationStore((s) => s.updateRegistration)
  const members = useAssociateMemberStore((s) => s.members)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open)
  const printerDeviceName = usePrinterDeviceName()

  useEffect(() => {
    if (!open) return
    setForm({
      date: todayLocalIso(),
      membershipFeeTotal: registration?.membershipFeeTotal
        ? String(registration.membershipFeeTotal)
        : '50.00',
      membershipFeeCouncilShare: registration?.membershipFeeCouncilShare
        ? String(registration.membershipFeeCouncilShare)
        : '20.00'
    })
  }, [open, registration])

  const totalAmount = parseFloat(form.membershipFeeTotal) || 0

  const officialReceiptLines: ReceiptBreakdownLine[] =
    totalAmount > 0 ? [{ label: AR_CATEGORY, amount: totalAmount }] : []

  useEffect(() => {
    receiptFields.autoFillBreakdown({ [AR_CATEGORY]: totalAmount }, { label: '', amount: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount])

  function handleSubmit() {
    if (!canManage || !registration) return
    const member = members.find((m) => m.id === registration.associateMemberId)
    if (!member) return
    if (totalAmount <= 0) {
      toast.error(t('associateMember.payment.toast.amountRequired'))
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

    const applicantName = `${member.firstName} ${member.lastName}`.trim()
    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(form.date).toISOString(),
      referenceNote: `Associate Member — ${applicantName} (${registration.schoolYear})`,
      payorName: applicantName,
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    const councilShare = parseFloat(form.membershipFeeCouncilShare) || 0
    const updated: AssociateMemberRegistration = {
      ...registration,
      membershipFeeTotal: totalAmount,
      membershipFeeCouncilShare: councilShare,
      arNumber: receiptFields.receiptNumber.trim(),
      arDate: form.date,
      processedByName: currentUser?.fullName ?? 'Cashier',
      receipt
    }
    updateRegistration(registration.id, updated)

    if (hasPermission('manage:vouchers')) {
      const linkedVoucherId = syncAssociateMemberRegistrationVoucher(member, updated)
      if (linkedVoucherId !== updated.linkedVoucherId) {
        updateRegistration(registration.id, { linkedVoucherId })
      }
    }

    toast.success(t('associateMember.payment.toast.recorded'))

    printReceipt(receipt, printerDeviceName).then((result) => {
      if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    })

    onOpenChange(false)
  }

  return { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit }
}
