import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import { useRecordHonoraryMemberPaymentModal } from '../hooks/useRecordHonoraryMemberPaymentModal'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

interface RecordHonoraryMemberPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: HonoraryMemberRegistration | null
}

export function RecordHonoraryMemberPaymentModal({
  open,
  onOpenChange,
  registration
}: RecordHonoraryMemberPaymentModalProps) {
  const { t } = useTranslation()
  const members = useHonoraryMemberStore((s) => s.members)
  const member = registration
    ? members.find((m) => m.id === registration.honoraryMemberId)
    : undefined
  const { form, setForm, totalAmount, officialReceiptLines, receiptFields, handleSubmit } =
    useRecordHonoraryMemberPaymentModal(open, onOpenChange, registration)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('honoraryMember.payment.modalTitle', {
        name: member ? `${member.lastName}, ${member.firstName}` : ''
      })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('honoraryMember.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('honoraryMember.payment.membershipFeeTotal')}>
            <FieldInput
              type="number"
              value={form.membershipFeeTotal}
              onChange={(e) => setForm((f) => ({ ...f, membershipFeeTotal: e.target.value }))}
            />
          </FormField>
          <FormField label={t('honoraryMember.payment.membershipFeeCouncilShare')}>
            <FieldInput
              type="number"
              value={form.membershipFeeCouncilShare}
              onChange={(e) =>
                setForm((f) => ({ ...f, membershipFeeCouncilShare: e.target.value }))
              }
            />
          </FormField>
        </div>
        <FormField label={t('honoraryMember.payment.dateLabel')} required>
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
          officialReceiptTotalLabel={t('honoraryMember.payment.totalLabel')}
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
