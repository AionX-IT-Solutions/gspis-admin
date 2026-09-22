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
import { useTroopsStore } from '../store/troops.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import type { TroopRegistration } from '@/features/troopRegistration/types/troopRegistration.types'
import { postBulkPaymentVoucher } from '../lib/flatFeeVoucher'

function emptyForm() {
  return {
    troopId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    troopFeeAmount: 0,
    thinkingDayFeeAmount: 0,
    includeMembership: true,
    includeTroopFee: true,
    includeThinkingDay: true
  }
}

// The rates a troop actually owes are whatever its most recently filed Troop Registration
// recorded (RegistrationRemittance.membershipFeePerMemberTotal / troopFee / thinkingDayFee)
// — not a hardcoded app-wide default, since a rate change or a troop's own filed figures can
// differ. "Most recent" mirrors the "current state" pattern used elsewhere (e.g.
// ScoutMember.lastRegistrationStatus) rather than requiring the user to pick a school year.
function findLatestRegistration(
  registrations: TroopRegistration[],
  troopId: string
): TroopRegistration | undefined {
  return [...registrations]
    .filter((r) => r.troopId === troopId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

export function useRecordBulkPaymentModal(open: boolean, onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:troops')
  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const addBulkPayment = useTroopsStore((s) => s.addBulkPayment)
  const attachBulkPaymentVoucher = useTroopsStore((s) => s.attachBulkPaymentVoucher)
  const registrations = useTroopRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open)
  const printerDeviceName = usePrinterDeviceName()

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const troopRegistration = useMemo(
    () => findLatestRegistration(registrations, form.troopId),
    [registrations, form.troopId]
  )

  // Picking a troop defaults to covering its whole active roster and paid-by to its
  // leader — both stay freely editable (uncheck a member, retype the payer) since a real
  // remittance sometimes covers fewer members or gets handed over by someone else. The fee
  // amounts, though, are pulled straight from that troop's latest filed registration and are
  // NOT editable here (see the fields' `readOnly` in RecordBulkPaymentModal.tsx) — this
  // modal only ever collects what was already recorded on file, never a different figure.
  function selectTroop(troopId: string) {
    const troop = troops.find((tr) => tr.id === troopId)
    const members = scoutMembers.filter((m) => m.troopId === troopId && m.isActive)
    const registration = findLatestRegistration(registrations, troopId)
    setForm((f) => ({
      ...f,
      troopId,
      memberIds: members.map((m) => m.id),
      paidByName: troop?.leaderName ?? '',
      membershipAmountPerMember: registration?.remittance.membershipFeePerMemberTotal ?? 0,
      troopFeeAmount: registration?.troopFee ?? 0,
      thinkingDayFeeAmount: registration?.remittance.thinkingDayFee ?? 0
    }))
  }

  // Each fee line can be switched off for this specific transaction (e.g. collecting just the
  // Membership Fee this time so it can be receipted cleanly as an Acknowledgment Receipt,
  // leaving Troop Fee/Thinking Day Fee for a separate remittance) — the rates themselves stay
  // whatever the registration filed, only whether they're part of THIS collection changes.
  const membershipTotal = form.includeMembership
    ? form.membershipAmountPerMember * form.memberIds.length
    : 0
  const troopFeeCollected = form.includeTroopFee ? form.troopFeeAmount : 0
  const thinkingDayCollected = form.includeThinkingDay ? form.thinkingDayFeeAmount : 0
  const grandTotal = membershipTotal + troopFeeCollected + thinkingDayCollected

  // Service Invoice tab's itemized preview — one line per fee actually being collected in
  // this remittance, same labels shown on the form above.
  const officialReceiptLines: ReceiptBreakdownLine[] = [
    ...(membershipTotal > 0
      ? [{ label: t('troops.roster.payment.categoryMembership'), amount: membershipTotal }]
      : []),
    ...(troopFeeCollected > 0
      ? [{ label: t('troops.payment.troopFeeLabel'), amount: troopFeeCollected }]
      : []),
    ...(thinkingDayCollected > 0
      ? [{ label: t('troops.payment.thinkingDayFeeLabel'), amount: thinkingDayCollected }]
      : [])
  ]

  // Keeps the Acknowledgment Receipt tab's "Girl" row pre-filled with the Membership Fee
  // total — troop members are always "Girl" on the AR booklet's Registration Fee table.
  // Troop Fee/Thinking Day Fee are deliberately NOT folded into its "Others" row: they're not
  // registration fees at all, so a transaction that includes them needs the Service Invoice
  // tab instead (or a separate Record Bulk Payment covering just the Membership Fee). No-ops
  // once the cashier has actually edited the breakdown.
  useEffect(() => {
    receiptFields.autoFillBreakdown({ Girl: membershipTotal }, { label: '', amount: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal])

  function handleSubmit() {
    if (!canManage) return
    if (!form.troopId) {
      toast.error(t('troops.payment.toast.troopRequired'))
      return
    }
    if (!troopRegistration) {
      toast.error(t('troops.payment.toast.noRegistration'))
      return
    }
    const memberLines = [
      {
        category: 'membership' as const,
        amountPerMember: form.includeMembership ? form.membershipAmountPerMember : 0
      }
    ].filter((l) => l.amountPerMember > 0)
    const flatLines = [
      { category: 'troop_fee' as const, amount: troopFeeCollected },
      { category: 'thinking_day' as const, amount: thinkingDayCollected }
    ].filter((l) => l.amount > 0)

    if (memberLines.length > 0 && form.memberIds.length === 0) {
      toast.error(t('troops.payment.toast.membersRequired'))
      return
    }
    if (memberLines.length === 0 && flatLines.length === 0) {
      toast.error(t('troops.payment.toast.amountRequired'))
      return
    }
    if (!form.paidByName.trim()) {
      toast.error(t('troops.payment.toast.paidByRequired'))
      return
    }

    // Validate and build the receipt BEFORE recording anything — a payment is never recorded
    // without a receipt to show for it (the Council's real process always issues one). Built
    // once here and reused as-is both for storage (so the Payment tab can reprint it later)
    // and for the actual print call below.
    const troop = troops.find((tr) => tr.id === form.troopId)
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
      referenceNote: troop ? `Troop ${troop.troopNumber}` : undefined,
      payorName: form.paidByName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    const { flatPayments } = addBulkPayment({
      troopId: form.troopId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    // All of this transaction's flat fee lines (Troop Fee, Thinking Day Fee) post to ONE
    // shared approved voucher — one receipt per remittance, not one per fee type — so it
    // reaches SCRD's Cash Receipts / the Council Budget's income auto-actuals, same as every
    // other real income source in this app. Firestore only lets super_admin/admin/
    // accountant/manager write `vouchers` (not hr, even though hr can record this payment) —
    // skipped entirely rather than attempted-and-denied when the signed-in user lacks
    // 'manage:vouchers'.
    if (troop && flatPayments.length > 0 && hasPermission('manage:vouchers')) {
      const voucherId = postBulkPaymentVoucher(
        troop,
        flatPayments,
        form.date,
        form.paidByName.trim(),
        receipt
      )
      if (voucherId) {
        attachBulkPaymentVoucher(
          troop.id,
          flatPayments.map((p) => p.id),
          voucherId
        )
      }
    }

    toast.success(t('troops.payment.toast.recorded'))

    printReceipt(receipt, printerDeviceName).then((result) => {
      if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    })

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    troopRegistration,
    selectTroop,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
