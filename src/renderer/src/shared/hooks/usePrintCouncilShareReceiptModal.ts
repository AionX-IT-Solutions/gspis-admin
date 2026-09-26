import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useReceiptFields } from './useReceiptFields'
import { usePrinterDeviceName } from './usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'

function todayInputDate() {
  return new Date().toISOString().slice(0, 10)
}

export interface CouncilShareReceiptTarget {
  /** Uniquely identifies what's being receipted (a bulk payment's key, a registration id, …) —
   *  only used to reset the receipt fields form whenever a different target is opened. */
  key: string
  /** Shown in the modal's title — e.g. a Troop number or an applicant's full name. */
  label: string
  councilShareAmount: number
  /** Defaults the "Received From" field — whoever physically paid the original fee. */
  payorName: string
  /** The council-share receipt already printed for this target, if any — reseeds the form for
   *  a reprint the same way usePrintDepositReceiptModal does. */
  existingReceipt?: ReceiptRecord
}

/** Prints a SECOND, internal receipt for the Council's own retained share of a Membership/
 *  registration fee already receipted once at the module's own "Record Payment" step.
 *  Deliberately does NOT touch Cash Receipts/SCRD/Budget at all by itself — each module's own
 *  registrationCashReceipts.ts function only counts this money once this receipt exists (see
 *  e.g. findReceiptedCouncilShare for Troops, or an OavfRegistration's own councilShareReceipt
 *  field), computed straight from the same ledger this reads from. This is proof-of-issuance
 *  paperwork only, for whoever physically receipts the Council's cut a second time in real
 *  life — shared by every module whose fee has this pass-through split (Troops, OAVF/Career
 *  Woman, Honorary Member, Associate Member, …). */
export function usePrintCouncilShareReceiptModal(
  target: CouncilShareReceiptTarget | null,
  defaultCashierName: string,
  onClose: () => void,
  onPrinted: (receipt: ReceiptRecord) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const receiptFields = useReceiptFields({}, target?.key ?? null, initialReceiptType)

  const [date, setDate] = useState(todayInputDate())
  const [payorName, setPayorName] = useState('')
  const [cashierName, setCashierName] = useState(defaultCashierName)

  // Reseed whenever a different target's council-share receipt is opened for printing.
  useEffect(() => {
    if (!target) return
    setDate(todayInputDate())
    setPayorName(target.existingReceipt?.payorName ?? target.payorName)
    setCashierName(target.existingReceipt?.cashierName ?? defaultCashierName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.key])

  const officialReceiptLines: ReceiptBreakdownLine[] = target
    ? [
        {
          label: t('receipts.councilShareReceipt.lineLabel'),
          amount: target.councilShareAmount
        }
      ]
    : []

  function handleSubmit() {
    if (!target) return
    if (!receiptFields.receiptNumber.trim()) {
      toast.error(t('receipts.toast.receiptNumberRequired'))
      return
    }
    if (!payorName.trim()) {
      toast.error(t('receipts.councilShareReceipt.toast.payorRequired'))
      return
    }

    const breakdownLines: ReceiptBreakdownLine[] =
      receiptFields.receiptType === 'acknowledgment_receipt'
        ? receiptFields.buildAcknowledgmentLines()
        : officialReceiptLines

    if (breakdownLines.length === 0) {
      toast.error(t('receipts.toast.breakdownRequired'))
      return
    }
    const collected = breakdownLines.reduce((s, l) => s + l.amount, 0)
    if (Math.abs(collected - target.councilShareAmount) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }

    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(date).toISOString(),
      referenceNote: t('receipts.councilShareReceipt.lineLabel'),
      payorName: payorName.trim(),
      tin: receiptFields.tin.trim() || undefined,
      address: receiptFields.address.trim() || undefined,
      businessStyle: receiptFields.businessStyle.trim() || undefined,
      modeOfPayment: receiptFields.modeOfPayment,
      lines: breakdownLines,
      cashierName: cashierName.trim() || 'Cashier'
    }

    printReceipt(receipt, printerDeviceName).then((result) => {
      if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    })

    onPrinted(receipt)
    onClose()
  }

  return {
    target,
    date,
    setDate,
    payorName,
    setPayorName,
    cashierName,
    setCashierName,
    officialReceiptLines,
    handleSubmit,
    ...receiptFields
  }
}
