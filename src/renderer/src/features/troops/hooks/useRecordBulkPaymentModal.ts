import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useTroopsStore } from '../store/troops.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import type { TroopRegistration } from '@/features/troopRegistration/types/troopRegistration.types'

function emptyForm() {
  return {
    troopId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    troopFeeAmount: 0,
    thinkingDayFeeAmount: 0
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

export function useRecordBulkPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:troops')
  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const addBulkPayment = useTroopsStore((s) => s.addBulkPayment)
  const registrations = useTroopRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

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

  // Which fees are part of THIS collection is no longer a manual per-line toggle — it's
  // determined entirely by the receipt type already picked (see ReceiptTypePickerModal), and
  // the two are mutually exclusive: the Acknowledgment Receipt booklet only has fixed Girl/
  // Leader/Co-Leader REGISTRATION fee rows, so an AR-based collection is Membership Fee only.
  // Troop Fee/Thinking Day Fee aren't registration fees at all — they're collected on a
  // Service Invoice instead, which is Troop Fee + Thinking Day Fee only (never Membership Fee,
  // which always goes through an AR). A single remittance covering both would need two
  // separate Record Bulk Payment transactions, one per receipt type.
  const isServiceInvoice = receiptFields.receiptType === 'service_invoice'
  const membershipTotal = isServiceInvoice
    ? 0
    : form.membershipAmountPerMember * form.memberIds.length
  const troopFeeCollected = isServiceInvoice ? form.troopFeeAmount : 0
  const thinkingDayCollected = isServiceInvoice ? form.thinkingDayFeeAmount : 0
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
    // `open` is deliberately included even though it's not read in the body — the "Girl" row
    // otherwise never re-fills after the fields reset on open, whenever a new bulk payment
    // happens to total the exact same amount as the previous one (so this effect wouldn't
    // otherwise re-run).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal, open])

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
        amountPerMember: isServiceInvoice ? 0 : form.membershipAmountPerMember
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
    // without a receipt to show for it (the Council's real process always issues one). Stored
    // on the payment record as-is so the Payment tab's own Print action can print/reprint it
    // later — recording no longer prints automatically (see that tab's Actions column).
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

    addBulkPayment({
      troopId: form.troopId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    toast.success(t('troops.payment.toast.recorded'))

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    troopRegistration,
    selectTroop,
    isServiceInvoice,
    membershipTotal,
    troopFeeCollected,
    thinkingDayCollected,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
