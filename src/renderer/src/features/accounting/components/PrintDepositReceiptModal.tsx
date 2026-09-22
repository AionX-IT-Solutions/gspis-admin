import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatCurrency } from '@/shared/lib/utils'
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type { CashDepositLine } from '../types/dailyCollection.types'
import { usePrintDepositReceiptModal } from '../hooks/usePrintDepositReceiptModal'

interface PrintDepositReceiptModalProps {
  deposit: CashDepositLine | null
  defaultPayorName: string
  defaultCashierName: string
  onClose: () => void
  onPrinted: (receipt: ReceiptRecord) => void
}

export function PrintDepositReceiptModal({
  deposit,
  defaultPayorName,
  defaultCashierName,
  onClose,
  onPrinted
}: PrintDepositReceiptModalProps) {
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
  } = usePrintDepositReceiptModal(deposit, defaultPayorName, defaultCashierName, onClose, onPrinted)

  if (!deposit) return null

  return (
    <Modal
      open={!!deposit}
      onOpenChange={(open) => !open && onClose()}
      title={t('reports.dailyCollections.depositReceipt.title')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('invoices.payment.recordAndPrint')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        {t('reports.dailyCollections.depositReceipt.hint')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 16
        }}
      >
        <FormField label={t('invoices.payment.date')} required>
          <FieldInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <FormField label={t('reports.dailyCollections.depositReceipt.payorLabel')} required>
          <FieldInput value={payorName} onChange={(e) => setPayorName(e.target.value)} />
        </FormField>
        <FormField
          label={t('reports.dailyCollections.depositReceipt.cashierLabel')}
          required
          className="col-span-2"
        >
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
        officialReceiptTotalLabel={t('reports.dailyCollections.table.amount')}
        officialReceiptTotal={deposit.amount}
        breakdown={breakdown}
        onBreakdownAmountChange={setBreakdownAmount}
        othersLabel={othersLabel}
        onOthersLabelChange={setOthersLabel}
        othersAmount={othersAmount}
        onOthersAmountChange={setOthersAmount}
        acknowledgmentTotal={acknowledgmentTotal}
        targetTotal={deposit.amount}
      />

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, textAlign: 'right' }}>
        {t('reports.dailyCollections.table.amount')}: {formatCurrency(deposit.amount)}
      </p>
    </Modal>
  )
}
