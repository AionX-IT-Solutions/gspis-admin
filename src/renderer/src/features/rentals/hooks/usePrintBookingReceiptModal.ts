import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useReceiptFields } from '@/shared/hooks/useReceiptFields'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { formatDate } from '@/shared/lib/utils'
import type { ReceiptBreakdownLine, ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import type { BookingRow } from './useRentals'

function todayInputDate() {
  return new Date().toISOString().slice(0, 10)
}

/** Prints the Council's official receipt for what a renter has paid on a facility booking —
 *  reuses the same Service Invoice/Acknowledgment Receipt booklets as every other collection
 *  point (see shared/lib/receiptPrint.ts). Unlike Daily Collections' deposit receipt, this
 *  posts as new income: it's the first record of this money changing hands, not a proof of
 *  custody transfer for cash already counted once. */
export function usePrintBookingReceiptModal(
  booking: BookingRow | null,
  defaultCashierName: string,
  onClose: () => void,
  onPrinted: (receipt: ReceiptRecord) => void,
  initialReceiptType?: ReceiptKind
) {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const receiptFields = useReceiptFields({}, booking?.id ?? null, initialReceiptType)

  const [date, setDate] = useState(todayInputDate())
  const [payorName, setPayorName] = useState('')
  const [cashierName, setCashierName] = useState(defaultCashierName)

  // Reseed whenever a different booking is opened for printing.
  useEffect(() => {
    if (!booking) return
    setDate(todayInputDate())
    setPayorName(booking.receipt?.payorName ?? booking.renterName)
    setCashierName(booking.receipt?.cashierName ?? defaultCashierName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id])

  const receiptAmount = booking
    ? booking.amountPaid && booking.amountPaid > 0
      ? booking.amountPaid
      : booking.totalAmount
    : 0

  const referenceNote = booking
    ? `${t('rentals.bookingReceipt.lineLabel', { space: booking.spaceName })} — ${formatDate(booking.bookingDate)}`
    : undefined

  const officialReceiptLines: ReceiptBreakdownLine[] = booking
    ? [{ label: referenceNote ?? booking.spaceName, amount: receiptAmount }]
    : []

  function handleSubmit() {
    if (!booking) return
    if (!receiptFields.receiptNumber.trim()) {
      toast.error(t('receipts.toast.receiptNumberRequired'))
      return
    }
    if (!payorName.trim()) {
      toast.error(t('rentals.bookingReceipt.toast.payorRequired'))
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
    if (Math.abs(collected - receiptAmount) > 0.01) {
      toast.error(t('receipts.toast.breakdownMismatch'))
      return
    }

    const receipt: ReceiptRecord = {
      receiptType: receiptFields.receiptType,
      receiptNumber: receiptFields.receiptNumber.trim(),
      date: new Date(date).toISOString(),
      referenceNote,
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
    booking,
    date,
    setDate,
    payorName,
    setPayorName,
    cashierName,
    setCashierName,
    officialReceiptLines,
    receiptAmount,
    handleSubmit,
    ...receiptFields
  }
}
