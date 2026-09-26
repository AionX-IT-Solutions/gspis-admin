import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useIccgMemberStore } from '../store/iccgMember.store'
import { useIccgRegistrationStore } from '../store/iccgRegistration.store'
import type { IccgRegistration } from '../types/iccgRegistration.types'

// GSP Membership Fee default: ₱20/member, of which ₱5 is Council income (see
// iccgRegistration.types.ts's emptyFee) — used until a real filed registration suggests
// otherwise.
function emptyForm() {
  return {
    troopId: '',
    girlMemberIds: [] as string[],
    adultMemberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    amountPerGirl: 20,
    amountPerAdult: 20,
    councilShareAmountPerGirl: 5,
    councilShareAmountPerAdult: 5,
    includeGirls: true,
    includeAdults: true
  }
}

// The rates a troop actually owes are whatever its most recently filed ICCG Registration
// recorded (its own fee box's per-member total/council-share) — not a hardcoded app-wide
// default. "Most recent" mirrors the "current state" pattern used elsewhere (see
// features/trefoilGuild's identical findLatestRegistration).
function findLatestRegistration(
  registrations: IccgRegistration[],
  troopId: string
): IccgRegistration | undefined {
  return [...registrations]
    .filter((r) => r.troopId === troopId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

export function useRecordIccgBulkPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:iccgRegistration')
  const members = useIccgMemberStore((s) => s.members)
  const addBulkPayment = useIccgMemberStore((s) => s.addBulkPayment)
  const registrations = useIccgRegistrationStore((s) => s.registrations)
  const troops = useTroopsStore((s) => s.troops)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const troopRegistration = useMemo(
    () => findLatestRegistration(registrations, form.troopId),
    [registrations, form.troopId]
  )
  const selectedTroop = useMemo(
    () => troops.find((tr) => tr.id === form.troopId),
    [troops, form.troopId]
  )

  // Picking a troop defaults to covering its whole active ICCG roster — stays freely editable
  // since a real remittance sometimes covers fewer members. The per-member rates (both the
  // full amount and the Council's retained share of it) are suggested from that troop's
  // latest filed registration's own fee box and stay editable here since a Payment tab
  // collection doesn't have to match the filing exactly.
  function selectTroop(troopId: string) {
    const troopMembers = members.filter((m) => m.troopId === troopId && m.isActive)
    const registration = findLatestRegistration(registrations, troopId)
    setForm((f) => ({
      ...f,
      troopId,
      girlMemberIds: troopMembers.filter((m) => m.role === 'girl').map((m) => m.id),
      adultMemberIds: troopMembers.filter((m) => m.role === 'adult').map((m) => m.id),
      amountPerGirl: registration?.fee.feePerMemberTotal ?? f.amountPerGirl,
      amountPerAdult: registration?.fee.feePerMemberTotal ?? f.amountPerAdult,
      councilShareAmountPerGirl:
        registration?.fee.feePerMemberCouncilShare ?? f.councilShareAmountPerGirl,
      councilShareAmountPerAdult:
        registration?.fee.feePerMemberCouncilShare ?? f.councilShareAmountPerAdult
    }))
  }

  // Each fee line can be switched off for this specific transaction (e.g. collecting just the
  // Girls fee this time) — same reasoning as Trefoil Guild's includeMembership/
  // includeTgGroupFee toggles. Totals here are the FULL amount collected (what the receipt
  // shows) — the Council-retained share (posted to a voucher) is computed separately below.
  const girlsTotal = form.includeGirls ? form.amountPerGirl * form.girlMemberIds.length : 0
  const adultsTotal = form.includeAdults ? form.amountPerAdult * form.adultMemberIds.length : 0
  const grandTotal = girlsTotal + adultsTotal

  // The Council-retained slice of the totals above — what actually posts to a voucher (see
  // iccgVoucher.ts). Shown alongside the full totals so the person recording payment can see
  // how much of what's collected is Council income vs. forwarded to National HQ.
  const girlsCouncilShareTotal = form.includeGirls
    ? form.councilShareAmountPerGirl * form.girlMemberIds.length
    : 0
  const adultsCouncilShareTotal = form.includeAdults
    ? form.councilShareAmountPerAdult * form.adultMemberIds.length
    : 0
  const councilShareGrandTotal = girlsCouncilShareTotal + adultsCouncilShareTotal

  const officialReceiptLines: ReceiptBreakdownLine[] = [
    ...(girlsTotal > 0
      ? [{ label: t('iccgRegistration.payment.girlsFeeLabel'), amount: girlsTotal }]
      : []),
    ...(adultsTotal > 0
      ? [{ label: t('iccgRegistration.payment.adultsFeeLabel'), amount: adultsTotal }]
      : [])
  ]

  // Keeps the Acknowledgment Receipt tab's fixed "Girl" row pre-filled with the Girls fee
  // total, and its free-text "Others" row with the Adults fee (the AR booklet's fixed
  // categories have no separate ICCG Adult row — see shared/lib/receiptCategories.ts). No-op
  // once the cashier has actually edited the breakdown.
  useEffect(() => {
    receiptFields.autoFillBreakdown(girlsTotal > 0 ? { Girl: girlsTotal } : {}, {
      label: t('iccgRegistration.payment.adultsFeeLabel'),
      amount: adultsTotal
    })
    // `open` is deliberately included even though it's not read in the body — the rows
    // otherwise never re-fill after the fields reset on open, whenever a new bulk payment
    // happens to total the exact same amounts as the previous one (so this effect wouldn't
    // otherwise re-run).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [girlsTotal, adultsTotal, open])

  function handleSubmit() {
    if (!canManage) return
    if (!form.troopId) {
      toast.error(t('iccgRegistration.payment.toast.troopRequired'))
      return
    }
    // Unlike Trefoil Guild/Barangay/District Committee (whose per-member rate lives only on
    // their filed Registration), ICCG members can be added directly from the Members tab with
    // no registration on file yet — the rate inputs already default to the standard ₱20/₱5
    // split (see emptyForm above), so a missing registration is only a hint, never a hard
    // block, to record payment.
    const lines = [
      {
        memberIds: form.girlMemberIds,
        amountPerMember: form.includeGirls ? form.amountPerGirl : 0,
        councilShareAmountPerMember: form.includeGirls ? form.councilShareAmountPerGirl : 0,
        category: 'girls_fee' as const
      },
      {
        memberIds: form.adultMemberIds,
        amountPerMember: form.includeAdults ? form.amountPerAdult : 0,
        councilShareAmountPerMember: form.includeAdults ? form.councilShareAmountPerAdult : 0,
        category: 'adults_fee' as const
      }
    ].filter((l) => l.amountPerMember > 0 && l.memberIds.length > 0)

    if (lines.length === 0) {
      toast.error(t('iccgRegistration.payment.toast.amountRequired'))
      return
    }
    if (!form.paidByName.trim()) {
      toast.error(t('iccgRegistration.payment.toast.paidByRequired'))
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
    if (Math.abs(collected - grandTotal) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }
    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(form.date).toISOString(),
      referenceNote: `ICCG — ${troopRegistration?.school ?? selectedTroop?.troopName ?? selectedTroop?.troopNumber ?? ''}`,
      payorName: form.paidByName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    addBulkPayment({
      lines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    toast.success(t('iccgRegistration.payment.toast.recorded'))

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    troopRegistration,
    selectTroop,
    girlsTotal,
    adultsTotal,
    grandTotal,
    girlsCouncilShareTotal,
    adultsCouncilShareTotal,
    councilShareGrandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
