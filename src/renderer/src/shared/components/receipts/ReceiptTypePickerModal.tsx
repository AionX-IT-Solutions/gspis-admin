import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import type { ReceiptKind } from '@/shared/types/receipt.types'

interface ReceiptTypePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: ReceiptKind) => void
}

const optionStyle: CSSProperties = {
  textAlign: 'left',
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid var(--border-default)',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'background-color 0.15s, border-color 0.15s'
}

/** Shown the instant "Record Payment" is clicked, across every module that collects a
 *  payment (Troops & Membership, Barangay/District Committee, Trefoil Guild, OAVF,
 *  Honorary/Associate Member, ICCG, Daily Collections deposit receipts) — asks up front
 *  which of the Council's two receipt booklets this collection will use, instead of
 *  leaving that choice as an easy-to-miss tab buried at the bottom of the full payment
 *  form (see ReceiptFieldsSection). The caller opens the full form right after with the
 *  picked type preset (see each module's useRecordXPaymentModal `initialReceiptType`). */
export function ReceiptTypePickerModal({
  open,
  onOpenChange,
  onSelect
}: ReceiptTypePickerModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('receipts.typePicker.title')} size="sm">
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, marginBottom: 14 }}>
        {t('receipts.typePicker.subtitle')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          style={optionStyle}
          onClick={() => onSelect('service_invoice')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)'
            e.currentTarget.style.borderColor = 'var(--accent-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            {t('receipts.tabServiceInvoice')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {t('receipts.typePicker.serviceInvoiceHint')}
          </div>
        </button>

        <button
          type="button"
          style={optionStyle}
          onClick={() => onSelect('acknowledgment_receipt')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)'
            e.currentTarget.style.borderColor = 'var(--accent-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            {t('receipts.tabAcknowledgmentReceipt')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {t('receipts.typePicker.acknowledgmentReceiptHint')}
          </div>
        </button>
      </div>
    </Modal>
  )
}
