import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { useOavfMemberStore } from '../store/oavfMember.store'
import { useRecordOavfPaymentModal } from '../hooks/useRecordOavfPaymentModal'
import type { OavfRegistration } from '../types/oavf.types'
import type { ReceiptKind } from '@/shared/types/receipt.types'

interface RecordOavfPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: OavfRegistration | null
  initialReceiptType?: ReceiptKind
}

export function RecordOavfPaymentModal({
  open,
  onOpenChange,
  registration,
  initialReceiptType
}: RecordOavfPaymentModalProps) {
  const { t } = useTranslation()
  const members = useOavfMemberStore((s) => s.members)
  const member = registration ? members.find((m) => m.id === registration.oavfMemberId) : undefined
  const { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit } =
    useRecordOavfPaymentModal(open, onOpenChange, registration, initialReceiptType)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('oavf.payment.modalTitle', {
        name: member ? `${member.lastName}, ${member.firstName}` : ''
      })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('oavf.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('oavf.payment.membershipFeeTotal')}>
            <FieldInput
              type="number"
              value={form.membershipFeeTotal}
              onChange={(e) => setForm((f) => ({ ...f, membershipFeeTotal: e.target.value }))}
            />
          </FormField>
          <FormField label={t('oavf.payment.membershipFeeCouncilShare')}>
            <FieldInput
              type="number"
              value={form.membershipFeeCouncilShare}
              onChange={(e) =>
                setForm((f) => ({ ...f, membershipFeeCouncilShare: e.target.value }))
              }
            />
          </FormField>
        </div>
        <FormField label={t('oavf.payment.dateLabel')} required>
          <FieldInput
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </FormField>

        <ReceiptFieldsSection
          receiptType={receiptFields.receiptType}
          onReceiptTypeChange={receiptFields.setReceiptType}
          receiptNumber={receiptFields.receiptNumber}
          onReceiptNumberChange={receiptFields.setReceiptNumber}
          tin={receiptFields.tin}
          onTinChange={receiptFields.setTin}
          address={receiptFields.address}
          onAddressChange={receiptFields.setAddress}
          businessStyle={receiptFields.businessStyle}
          onBusinessStyleChange={receiptFields.setBusinessStyle}
          modeOfPayment={receiptFields.modeOfPayment}
          onModeOfPaymentChange={receiptFields.setModeOfPayment}
          checkNumber={receiptFields.checkNumber}
          onCheckNumberChange={receiptFields.setCheckNumber}
          officialReceiptLines={officialReceiptLines}
          officialReceiptTotalLabel={t('oavf.payment.totalLabel')}
          officialReceiptTotal={totalAmount}
          breakdown={receiptFields.breakdown}
          onBreakdownAmountChange={receiptFields.setBreakdownAmount}
          othersLabel={receiptFields.othersLabel}
          onOthersLabelChange={receiptFields.setOthersLabel}
          othersAmount={receiptFields.othersAmount}
          onOthersAmountChange={receiptFields.setOthersAmount}
          acknowledgmentTotal={receiptFields.acknowledgmentTotal}
          targetTotal={totalAmount}
        />
      </div>
    </Modal>
  )
}
