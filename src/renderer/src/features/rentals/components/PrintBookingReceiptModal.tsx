import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatCurrency } from '@/shared/lib/utils'
import type { ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import type { BookingRow } from '../hooks/useRentals'
import { usePrintBookingReceiptModal } from '../hooks/usePrintBookingReceiptModal'

interface PrintBookingReceiptModalProps {
  booking: BookingRow | null
  defaultCashierName: string
  onClose: () => void
  onPrinted: (receipt: ReceiptRecord) => void
  initialReceiptType?: ReceiptKind
}

export function PrintBookingReceiptModal({
  booking,
  defaultCashierName,
  onClose,
  onPrinted,
  initialReceiptType
}: PrintBookingReceiptModalProps) {
  const { t } = useTranslation()
  const {
    date,
    setDate,
    payorName,
    setPayorName,
    cashierName,
    setCashierName,
    officialReceiptLines,
    receiptAmount,
    handleSubmit,
    receiptType,
    setReceiptType,
    receiptNumber,
    setReceiptNumber,
    tin,
    setTin,
    address,
    setAddress,
    businessStyle,
    setBusinessStyle,
    modeOfPayment,
    setModeOfPayment,
    checkNumber,
    setCheckNumber,
    breakdown,
    setBreakdownAmount,
    othersLabel,
    setOthersLabel,
    othersAmount,
    setOthersAmount,
    acknowledgmentTotal
  } = usePrintBookingReceiptModal(
    booking,
    defaultCashierName,
    onClose,
    onPrinted,
    initialReceiptType
  )

  if (!booking) return null

  return (
    <Modal
      open={!!booking}
      onOpenChange={(open) => !open && onClose()}
      title={t('rentals.bookingReceipt.title', { name: booking.renterName })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('rentals.bookingReceipt.recordAndPrint')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        {t('rentals.bookingReceipt.hint')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 16
        }}
      >
        <FormField label={t('rentals.bookingReceipt.dateLabel')} required>
          <FieldInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <FormField label={t('rentals.bookingReceipt.payorLabel')} required>
          <FieldInput value={payorName} onChange={(e) => setPayorName(e.target.value)} />
        </FormField>
        <FormField label={t('rentals.bookingReceipt.cashierLabel')} required className="col-span-2">
          <FieldInput value={cashierName} onChange={(e) => setCashierName(e.target.value)} />
        </FormField>
      </div>

      <ReceiptFieldsSection
        receiptType={receiptType}
        onReceiptTypeChange={setReceiptType}
        receiptNumber={receiptNumber}
        onReceiptNumberChange={setReceiptNumber}
        tin={tin}
        onTinChange={setTin}
        address={address}
        onAddressChange={setAddress}
        businessStyle={businessStyle}
        onBusinessStyleChange={setBusinessStyle}
        modeOfPayment={modeOfPayment}
        onModeOfPaymentChange={setModeOfPayment}
        checkNumber={checkNumber}
        onCheckNumberChange={setCheckNumber}
        officialReceiptLines={officialReceiptLines}
        officialReceiptTotalLabel={t('rentals.table.amount')}
        officialReceiptTotal={receiptAmount}
        breakdown={breakdown}
        onBreakdownAmountChange={setBreakdownAmount}
        othersLabel={othersLabel}
        onOthersLabelChange={setOthersLabel}
        othersAmount={othersAmount}
        onOthersAmountChange={setOthersAmount}
        acknowledgmentTotal={acknowledgmentTotal}
        targetTotal={receiptAmount}
      />

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, textAlign: 'right' }}>
        {t('rentals.table.amount')}: {formatCurrency(receiptAmount)}
      </p>
    </Modal>
  )
}
