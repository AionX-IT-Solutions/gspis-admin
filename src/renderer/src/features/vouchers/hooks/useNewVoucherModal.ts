import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVouchersStore } from '../store/vouchers.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { suggestVoucherNumber } from '../lib/voucherNumber'
import { isCashAdvanceDisbursement } from '../lib/expenseVouchers'
import type {
  ModeOfPayment,
  Voucher,
  VoucherAccountLine,
  VoucherType
} from '../types/vouchers.types'

export interface VoucherAccountLineForm {
  account: string
  description: string
  amount: number
}

type AccountLineSide = 'debitLines' | 'creditLines'

function todayIso() {
  return new Date().toISOString()
}

function emptyAccountLine(): VoucherAccountLineForm {
  return { account: '', description: '', amount: 0 }
}

function emptyForm(suggestedVoucherNumber: string) {
  return {
    voucherType: 'check_voucher' as VoucherType,
    voucherNumber: suggestedVoucherNumber,
    modeOfPayment: 'cash' as ModeOfPayment,
    checkNumber: '',
    payee: '',
    payeeAddress: '',
    // Left unset on purpose — a voucher with no bank chosen falls back to "Cash on Hand"
    // everywhere SCRD/Reports read bankAccountRef (see receiptVouchers.ts, useBankBalances.ts),
    // so leaving this blank is itself a valid, meaningful choice rather than a gap to force-fill.
    bankAccountRef: '',
    particulars: '',
    debitLines: [emptyAccountLine()],
    creditLines: [emptyAccountLine()],
    relatedVoucherId: '',
    cashAdvanceAmount: 0,
    cashAdvanceDate: '',
    amountRefunded: 0,
    refundOrNumber: '',
    refundDate: '',
    totalAmountSpent: 0
  }
}

// Splits a saved voucher's single accountLines array back into its debit-side and
// credit-side rows for editing — a real double-entry voucher can carry both at once.
function linesFromSide(
  lines: VoucherAccountLine[],
  side: 'debit' | 'credit'
): VoucherAccountLineForm[] {
  const rows = lines
    .filter((l) => l[side] > 0)
    .map((l) => ({ account: l.account, description: l.description ?? '', amount: l[side] }))
  return rows.length > 0 ? rows : [emptyAccountLine()]
}

function formFromVoucher(voucher: Voucher) {
  return {
    voucherType: voucher.voucherType,
    voucherNumber: voucher.voucherNumber,
    modeOfPayment: voucher.modeOfPayment,
    checkNumber: voucher.checkNumber ?? '',
    payee: voucher.payee,
    payeeAddress: voucher.payeeAddress ?? '',
    bankAccountRef: voucher.bankAccountRef ?? '',
    particulars: voucher.particulars,
    debitLines: linesFromSide(voucher.accountLines, 'debit'),
    creditLines: linesFromSide(voucher.accountLines, 'credit'),
    relatedVoucherId: voucher.relatedVoucherId ?? '',
    cashAdvanceAmount: voucher.cashAdvanceAmount ?? 0,
    cashAdvanceDate: voucher.cashAdvanceDate ?? '',
    amountRefunded: voucher.amountRefunded ?? 0,
    refundOrNumber: voucher.refundOrNumber ?? '',
    refundDate: voucher.refundDate ?? '',
    totalAmountSpent: voucher.totalAmountSpent ?? 0
  }
}

export function useNewVoucherModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: Voucher | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const vouchers = useVouchersStore((s) => s.vouchers)
  const addVoucher = useVouchersStore((s) => s.addVoucher)
  const updateVoucher = useVouchersStore((s) => s.updateVoucher)
  const [form, setForm] = useState(
    editTarget
      ? formFromVoucher(editTarget)
      : emptyForm(suggestVoucherNumber(vouchers, 'check_voucher'))
  )

  // Radix's controlled Dialog only calls onOpenChange for its own internally-triggered
  // close events (Escape, overlay click, Dialog.Close) — never when the *parent* flips
  // `open` to true to launch Add/Edit, so that can't be where the form gets (re)seeded.
  // This re-syncs it every time the modal actually becomes visible instead.
  useEffect(() => {
    if (!open) return
    setForm(
      editTarget
        ? formFromVoucher(editTarget)
        : emptyForm(suggestVoucherNumber(vouchers, 'check_voucher'))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget])

  const totalDebit = form.debitLines.reduce((sum, l) => sum + (l.amount || 0), 0)
  const totalCredit = form.creditLines.reduce((sum, l) => sum + (l.amount || 0), 0)

  // A Journal Voucher liquidating a cash advance never has its account lines hand-typed
  // here — they're generated from the Summary of Expenses once receipts are logged (see
  // useExpenseSummaryModal's handleSave), so the manual Account Titles sections are
  // replaced by a note instead for this case.
  const isCashAdvanceLiquidation = form.voucherType === 'journal_voucher' && !!form.relatedVoucherId

  // Double-entry: every voucher must balance (total debits == total credits) — e.g. Dr Cash
  // 1000 / Cr Sales 1000, or Dr Trainings-Meals 100 + Trainings-Gas 1000 / Cr Cash 1100. The
  // one exception is a Check Voucher whose credit side was left blank — its credit is then
  // implicit (the bank/cash account in `bankAccountRef`, for the full debit total), which
  // balances by construction without needing a manual line. Itemizing the credit side at all
  // (optional on a Check Voucher, always required on a Journal Voucher) means it must match
  // the debit total exactly like any real double-entry.
  const creditIsItemized = form.creditLines.some((l) => l.account.trim() && l.amount > 0)
  const isBalanced =
    isCashAdvanceLiquidation ||
    (form.voucherType === 'check_voucher' && !creditIsItemized) ||
    totalDebit === totalCredit

  // Every Check Voucher on record that actually granted a cash advance — the only
  // vouchers a Journal Voucher's liquidation section can reference back to.
  const cashAdvanceSources = vouchers.filter(isCashAdvanceDisbursement)

  function setCashAdvanceSource(voucherId: string) {
    const source = cashAdvanceSources.find((v) => v.id === voucherId)
    setForm((f) => ({
      ...f,
      relatedVoucherId: voucherId,
      cashAdvanceAmount: source ? source.amount : f.cashAdvanceAmount,
      cashAdvanceDate: source ? source.date.slice(0, 10) : f.cashAdvanceDate
    }))
  }

  function setVoucherType(voucherType: VoucherType) {
    setForm((f) => ({
      ...f,
      voucherType,
      // The number belongs to a different sequence per type — re-suggest it, but only
      // for a brand-new voucher; an existing voucher's number never changes here.
      voucherNumber: editTarget ? f.voucherNumber : suggestVoucherNumber(vouchers, voucherType)
    }))
  }

  function addLine(side: AccountLineSide) {
    setForm((f) => ({ ...f, [side]: [...f[side], emptyAccountLine()] }))
  }

  function removeLine(side: AccountLineSide, index: number) {
    setForm((f) => ({
      ...f,
      [side]: f[side].length > 1 ? f[side].filter((_, i) => i !== index) : f[side]
    }))
  }

  function updateLine(
    side: AccountLineSide,
    index: number,
    patch: Partial<VoucherAccountLineForm>
  ) {
    setForm((f) => ({
      ...f,
      [side]: f[side].map((l, i) => (i === index ? { ...l, ...patch } : l))
    }))
  }

  function handleSubmit() {
    if (!hasPermission('manage:vouchers')) return
    const validDebitLines = form.debitLines.filter((l) => l.account.trim() && l.amount > 0)
    // A Check Voucher's credit side often still goes unitemized (falls back to
    // `bankAccountRef` as a single implicit credit line in the export) — itemizing it
    // here is optional, not exclusive to a Journal Voucher.
    const validCreditLines = form.creditLines.filter((l) => l.account.trim() && l.amount > 0)
    // A cash-advance liquidation JV is allowed to save with zero manual lines — they get
    // generated once its Summary of Expenses is saved (see isCashAdvanceLiquidation above).
    if (
      !form.payee.trim() ||
      (!isCashAdvanceLiquidation && validDebitLines.length === 0 && validCreditLines.length === 0)
    ) {
      toast.error(t('vouchers.toast.missingFields'))
      return
    }
    const totalDebitValid = validDebitLines.reduce((sum, l) => sum + l.amount, 0)
    const totalCreditValid = validCreditLines.reduce((sum, l) => sum + l.amount, 0)
    const creditValidIsItemized = validCreditLines.length > 0
    const isValidBalanced =
      isCashAdvanceLiquidation ||
      (form.voucherType === 'check_voucher' && !creditValidIsItemized) ||
      totalDebitValid === totalCreditValid
    if (!isValidBalanced) {
      toast.error(
        t('vouchers.toast.unbalanced', {
          debit: totalDebitValid.toFixed(2),
          credit: totalCreditValid.toFixed(2)
        })
      )
      return
    }
    const isJournalVoucher = form.voucherType === 'journal_voucher'
    const hasCashAdvance = isJournalVoucher && form.cashAdvanceAmount > 0
    // A cash advance can only be liquidated against a real Check Voucher that actually
    // disbursed it — otherwise the JV would be clearing an advance that was never really
    // released, with no paper trail behind it.
    if (hasCashAdvance && !form.relatedVoucherId) {
      toast.error(t('vouchers.toast.cashAdvanceSourceRequired'))
      return
    }

    const payload = {
      voucherType: form.voucherType,
      modeOfPayment: form.modeOfPayment,
      checkNumber:
        form.modeOfPayment === 'check' ? form.checkNumber.trim() || undefined : undefined,
      payee: form.payee.trim(),
      payeeAddress: form.payeeAddress.trim() || undefined,
      bankAccountRef: form.bankAccountRef.trim() || undefined,
      amount: Math.max(totalDebitValid, totalCreditValid),
      particulars: form.particulars.trim(),
      accountLines: [
        ...validDebitLines.map((l) => ({
          account: l.account.trim(),
          description: l.description.trim() || undefined,
          debit: l.amount,
          credit: 0
        })),
        ...validCreditLines.map((l) => ({
          account: l.account.trim(),
          description: l.description.trim() || undefined,
          debit: 0,
          credit: l.amount
        }))
      ],
      relatedVoucherId: hasCashAdvance ? form.relatedVoucherId || undefined : undefined,
      cashAdvanceAmount: hasCashAdvance ? form.cashAdvanceAmount : undefined,
      cashAdvanceDate: hasCashAdvance ? form.cashAdvanceDate || undefined : undefined,
      amountRefunded: hasCashAdvance ? form.amountRefunded : undefined,
      refundOrNumber: hasCashAdvance ? form.refundOrNumber.trim() || undefined : undefined,
      refundDate: hasCashAdvance ? form.refundDate || undefined : undefined,
      totalAmountSpent: hasCashAdvance ? form.totalAmountSpent : undefined
    }

    if (editTarget) {
      updateVoucher(editTarget.id, payload)
      toast.success(t('vouchers.toast.updated'))
    } else {
      addVoucher({
        voucherNumber:
          form.voucherNumber.trim() || suggestVoucherNumber(vouchers, form.voucherType),
        date: todayIso(),
        ...payload
      })
      toast.success(t('vouchers.toast.created'))
    }
    onOpenChange(false)
    setForm(emptyForm(suggestVoucherNumber(vouchers, 'check_voucher')))
  }

  return {
    form,
    setForm,
    setVoucherType,
    totalDebit,
    totalCredit,
    isCashAdvanceLiquidation,
    isBalanced,
    addLine,
    removeLine,
    updateLine,
    cashAdvanceSources,
    setCashAdvanceSource,
    handleSubmit
  }
}
