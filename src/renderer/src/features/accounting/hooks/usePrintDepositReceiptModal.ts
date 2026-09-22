import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import type { ReceiptBreakdownLine, ReceiptRecord } from '@/shared/types/receipt.types'
import type { CashDepositLine } from '../types/dailyCollection.types'

function todayInputDate() {
  return new Date().toISOString().slice(0, 10)
}

/** Prints an internal-transmittal receipt for handing collected cash over for deposit —
 *  deliberately does NOT touch the Vouchers store at all. The deposit itself already moves
 *  the amount from Cash on Hand to the named bank (see useBankBalances.ts's `deposits`
 *  handling), so posting a Journal Voucher here too would recognize the same cash as income
 *  a second time. This is proof of custody transfer only: who handed the cash over (payor),
 *  who received it for deposit (cashierName/signature), for how much, and why (referenceNote
 *  = the deposit's own purpose). */
export function usePrintDepositReceiptModal(
  deposit: CashDepositLine | null,
  defaultPayorName: string,
  defaultCashierName: string,
  onClose: () => void,
  onPrinted: (receipt: ReceiptRecord) => void
) {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const receiptFields = useReceiptFields({}, deposit?.id ?? null)

  const [date, setDate] = useState(todayInputDate())
  const [payorName, setPayorName] = useState(defaultPayorName)
  const [cashierName, setCashierName] = useState(defaultCashierName)

  // Reseed whenever a different deposit is opened for printing.
  useEffect(() => {
    if (!deposit) return
    setDate(todayInputDate())
    setPayorName(deposit.receipt?.payorName ?? defaultPayorName)
    setCashierName(deposit.receipt?.cashierName ?? defaultCashierName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deposit?.id])

  const officialReceiptLines: ReceiptBreakdownLine[] = deposit
    ? [{ label: deposit.purpose.trim() || 'Cash Deposit', amount: deposit.amount }]
    : []

  function handleSubmit() {
    if (!deposit) return
    if (!receiptFields.receiptNumber.trim()) {
      toast.error(t('receipts.toast.receiptNumberRequired'))
      return
    }
    if (!payorName.trim()) {
      toast.error(t('reports.dailyCollections.depositReceipt.toast.payorRequired'))
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
    if (Math.abs(collected - deposit.amount) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }

    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(date).toISOString(),
      referenceNote: deposit.purpose.trim() || undefined,
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
    deposit,
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
