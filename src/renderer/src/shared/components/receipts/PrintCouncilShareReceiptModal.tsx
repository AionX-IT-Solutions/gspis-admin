import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from './ReceiptFieldsSection'
import { formatCurrency } from '@/shared/lib/utils'
import type { ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import {
  usePrintCouncilShareReceiptModal,
  type CouncilShareReceiptTarget
} from '@/shared/hooks/usePrintCouncilShareReceiptModal'

interface PrintCouncilShareReceiptModalProps {
  target: CouncilShareReceiptTarget | null
  defaultCashierName: string
  onClose: () => void
  onPrinted: (receipt: ReceiptRecord) => void
  initialReceiptType?: ReceiptKind
}

/** Shared by every module whose fee has a National-HQ-pass-through/Council-retained-share
 *  split (Troops, OAVF/Career Woman, Honorary Member, Associate Member, …) — see
 *  usePrintCouncilShareReceiptModal for the full rationale. */
export function PrintCouncilShareReceiptModal({
  target,
  defaultCashierName,
  onClose,
  onPrinted,
  initialReceiptType
}: PrintCouncilShareReceiptModalProps) {
  const { t } = useTranslation()
  const {
    date,
    setDate,
    payorName,
    setPayorName,
    cashierName,
    setCashierName,
    officialReceiptLines,
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
  } = usePrintCouncilShareReceiptModal(
    target,
    defaultCashierName,
    onClose,
    onPrinted,
    initialReceiptType
  )

  if (!target) return null

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={t('receipts.councilShareReceipt.title', { label: target.label })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('receipts.councilShareReceipt.recordAndPrint')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        {t('receipts.councilShareReceipt.hint')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 16
        }}
      >
        {/* Date gets its own full-width row instead of pairing with either label below —
            "Received From"/"Received By" both wrap to the same two lines at this column
            width, but "Date" is a single short word, so pairing it with either one left
            the shorter label's input sitting noticeably higher than its neighbor's. */}
        <FormField
          label={t('receipts.councilShareReceipt.dateLabel')}
          required
          className="col-span-2"
        >
          <FieldInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <FormField label={t('receipts.councilShareReceipt.payorLabel')} required>
          <FieldInput value={payorName} onChange={(e) => setPayorName(e.target.value)} />
        </FormField>
        <FormField label={t('receipts.councilShareReceipt.cashierLabel')} required>
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
        officialReceiptTotalLabel={t('receipts.councilShareReceipt.amountLabel')}
        officialReceiptTotal={target.councilShareAmount}
        breakdown={breakdown}
        onBreakdownAmountChange={setBreakdownAmount}
        othersLabel={othersLabel}
        onOthersLabelChange={setOthersLabel}
        othersAmount={othersAmount}
        onOthersAmountChange={setOthersAmount}
        acknowledgmentTotal={acknowledgmentTotal}
        targetTotal={target.councilShareAmount}
      />

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, textAlign: 'right' }}>
        {t('receipts.councilShareReceipt.amountLabel')}: {formatCurrency(target.councilShareAmount)}
      </p>
    </Modal>
  )
}
