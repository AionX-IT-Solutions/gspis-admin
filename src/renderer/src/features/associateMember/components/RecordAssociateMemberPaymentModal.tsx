import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { useAssociateMemberStore } from '../store/associateMember.store'
import { useRecordAssociateMemberPaymentModal } from '../hooks/useRecordAssociateMemberPaymentModal'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'
import type { ReceiptKind } from '@/shared/types/receipt.types'

interface RecordAssociateMemberPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: AssociateMemberRegistration | null
  initialReceiptType?: ReceiptKind
}

export function RecordAssociateMemberPaymentModal({
  open,
  onOpenChange,
  registration,
  initialReceiptType
}: RecordAssociateMemberPaymentModalProps) {
  const { t } = useTranslation()
  const members = useAssociateMemberStore((s) => s.members)
  const member = registration
    ? members.find((m) => m.id === registration.associateMemberId)
    : undefined
  const { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit } =
    useRecordAssociateMemberPaymentModal(open, onOpenChange, registration, initialReceiptType)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('associateMember.payment.modalTitle', {
        name: member ? `${member.lastName}, ${member.firstName}` : ''
      })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('associateMember.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('associateMember.payment.membershipFeeTotal')}>
            <FieldInput
              type="number"
              value={form.membershipFeeTotal}
              onChange={(e) => setForm((f) => ({ ...f, membershipFeeTotal: e.target.value }))}
            />
          </FormField>
          <FormField label={t('associateMember.payment.membershipFeeCouncilShare')}>
            <FieldInput
              type="number"
              value={form.membershipFeeCouncilShare}
              onChange={(e) =>
                setForm((f) => ({ ...f, membershipFeeCouncilShare: e.target.value }))
              }
            />
          </FormField>
        </div>
        <FormField label={t('associateMember.payment.dateLabel')} required>
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
          officialReceiptTotalLabel={t('associateMember.payment.totalLabel')}
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
