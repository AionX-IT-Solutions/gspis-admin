import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAppStore } from '@/app/store/app.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import { useTrefoilGuildRegistrationStore } from '../store/trefoilGuildRegistration.store'
import type { TrefoilGuildRegistration } from '../types/trefoilGuildRegistration.types'

function emptyForm() {
  return {
    trefoilGuildId: '',
    memberIds: [] as string[],
    date: todayLocalIso(),
    paidByName: '',
    membershipAmountPerMember: 0,
    tgGroupFeeAmount: 0
  }
}

// The rates a guild actually owes are whatever its most recently filed Trefoil Guild
// Registration recorded (RegistrationRemittance.memberFeePerMember / tgGroupFee) — not a
// hardcoded app-wide default. "Most recent" mirrors the "current state" pattern used
// elsewhere (see features/troops's identical findLatestRegistration).
function findLatestRegistration(
  registrations: TrefoilGuildRegistration[],
  trefoilGuildId: string
): TrefoilGuildRegistration | undefined {
  return [...registrations]
    .filter((r) => r.trefoilGuildId === trefoilGuildId)
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0]
}

export function useRecordTGBulkPaymentModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const currentUser = useAppStore((s) => s.currentUser)
  const canManage = hasPermission('manage:trefoilGuild')
  const guilds = useTrefoilGuildStore((s) => s.guilds)
  const members = useTrefoilGuildStore((s) => s.members)
  const addBulkPayment = useTrefoilGuildStore((s) => s.addBulkPayment)
  const registrations = useTrefoilGuildRegistrationStore((s) => s.registrations)
  const [form, setForm] = useState(emptyForm())
  const receiptFields = useReceiptFields({}, open, initialReceiptType)

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open])

  const guildRegistration = useMemo(
    () => findLatestRegistration(registrations, form.trefoilGuildId),
    [registrations, form.trefoilGuildId]
  )

  // Picking a guild defaults to covering its whole active roster — stays freely editable
  // since a real remittance sometimes covers fewer members. The fee amounts are pulled
  // straight from that guild's latest filed registration and are NOT editable here (see the
  // fields' `readOnly` in RecordTGBulkPaymentModal.tsx) — this modal only ever collects what
  // was already recorded on file.
  function selectGuild(trefoilGuildId: string) {
    const guildMembersList = members.filter(
      (m) => m.trefoilGuildId === trefoilGuildId && m.isActive
    )
    const registration = findLatestRegistration(registrations, trefoilGuildId)
    setForm((f) => ({
      ...f,
      trefoilGuildId,
      memberIds: guildMembersList.map((m) => m.id),
      membershipAmountPerMember: registration?.remittance.memberFeePerMember ?? 0,
      tgGroupFeeAmount: registration?.tgGroupFee ?? 0
    }))
  }

  // Which fee is part of THIS collection is no longer a manual per-line toggle — it's
  // determined entirely by the receipt type already picked (see ReceiptTypePickerModal), and
  // the two are mutually exclusive: the Acknowledgment Receipt booklet has no Trefoil
  // Guild-specific registration-fee row (the Membership Fee falls back to a free-text "Others"
  // line — see the autoFillBreakdown note below), so an AR-based collection is Membership Fee
  // only. The T.G. Group Fee isn't a registration fee at all — it's collected on a Service
  // Invoice instead, which is T.G. Group Fee only (never Membership Fee, which always goes
  // through an AR). A single remittance covering both would need two separate Record Bulk
  // Payment transactions, one per receipt type.
  const isServiceInvoice = receiptFields.receiptType === 'service_invoice'
  const membershipTotal = isServiceInvoice
    ? 0
    : form.membershipAmountPerMember * form.memberIds.length
  const tgGroupFeeCollected = isServiceInvoice ? form.tgGroupFeeAmount : 0
  const grandTotal = membershipTotal + tgGroupFeeCollected

  // Service Invoice tab's itemized preview — one line per fee actually being collected in
  // this remittance, same labels shown on the form above.
  const officialReceiptLines: ReceiptBreakdownLine[] = [
    ...(membershipTotal > 0
      ? [{ label: t('trefoilGuild.payment.categoryMembership'), amount: membershipTotal }]
      : []),
    ...(tgGroupFeeCollected > 0
      ? [{ label: t('trefoilGuild.payment.tgGroupFeeLabel'), amount: tgGroupFeeCollected }]
      : [])
  ]

  // Keeps the Acknowledgment Receipt tab's "Others" row pre-filled with the Membership Fee
  // total — the AR booklet's fixed categories have no "Trefoil Guild"-specific row. Earlier
  // this mapped to the booklet's "Associate Members" row as a guess, but that row turned out
  // to be the real, distinct Associate Member module's own category (confirmed against its
  // actual paper form — see features/associateMember) — a Trefoil Guild is a different kind of
  // unit, so it now falls back to a free-text "Others" line instead of misusing that row. The
  // T.G. Group Fee is deliberately NOT folded in here: it's not a registration fee at all, so
  // a transaction that includes it needs the Service Invoice tab instead (or a separate Record
  // Bulk Payment covering just the Membership Fee). No-ops once the cashier has actually
  // edited the breakdown.
  useEffect(() => {
    receiptFields.autoFillBreakdown(
      {},
      { label: t('trefoilGuild.payment.categoryMembership'), amount: membershipTotal }
    )
    // `open` is deliberately included even though it's not read in the body — the "Others" row
    // otherwise never re-fills after the fields reset on open, whenever a new bulk payment
    // happens to total the exact same amount as the previous one (so this effect wouldn't
    // otherwise re-run).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipTotal, open])

  function handleSubmit() {
    if (!canManage) return
    if (!form.trefoilGuildId) {
      toast.error(t('trefoilGuild.payment.toast.guildRequired'))
      return
    }
    if (!guildRegistration) {
      toast.error(t('trefoilGuild.payment.toast.noRegistration'))
      return
    }
    const memberLines = [
      {
        category: 'membership' as const,
        amountPerMember: isServiceInvoice ? 0 : form.membershipAmountPerMember
      }
    ].filter((l) => l.amountPerMember > 0)
    const flatLines = [{ category: 'tg_group_fee' as const, amount: tgGroupFeeCollected }].filter(
      (l) => l.amount > 0
    )

    if (memberLines.length > 0 && form.memberIds.length === 0) {
      toast.error(t('trefoilGuild.payment.toast.membersRequired'))
      return
    }
    if (memberLines.length === 0 && flatLines.length === 0) {
      toast.error(t('trefoilGuild.payment.toast.amountRequired'))
      return
    }
    if (!form.paidByName.trim()) {
      toast.error(t('trefoilGuild.payment.toast.paidByRequired'))
      return
    }

    // Validate and build the receipt BEFORE recording anything — a payment is never recorded
    // without a receipt to show for it (the Council's real process always issues one). Stored
    // on the payment record as-is so the Payment tab's own Print action can print/reprint it
    // later — recording no longer prints automatically (see that tab's Actions column).
    const guild = guilds.find((g) => g.id === form.trefoilGuildId)
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
      referenceNote: guild ? `Trefoil Guild ${guild.name}` : undefined,
      payorName: form.paidByName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: receiptLines,
      cashierName: currentUser?.fullName ?? 'Cashier'
    }

    addBulkPayment({
      trefoilGuildId: form.trefoilGuildId,
      memberIds: form.memberIds,
      memberLines,
      flatLines,
      date: form.date,
      paidByName: form.paidByName.trim(),
      receipt
    })

    toast.success(t('trefoilGuild.payment.toast.recorded'))

    onOpenChange(false)
  }

  return {
    form,
    setForm,
    guildRegistration,
    selectGuild,
    isServiceInvoice,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  }
}
