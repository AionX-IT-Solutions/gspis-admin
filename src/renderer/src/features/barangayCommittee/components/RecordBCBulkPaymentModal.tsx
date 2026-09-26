import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatDate } from '@/shared/lib/utils'
import type { ReceiptKind } from '@/shared/types/receipt.types'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useRecordBCBulkPaymentModal } from '../hooks/useRecordBCBulkPaymentModal'

interface RecordBCBulkPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialReceiptType?: ReceiptKind
}

function peso(n: number): string {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RecordBCBulkPaymentModal({
  open,
  onOpenChange,
  initialReceiptType
}: RecordBCBulkPaymentModalProps) {
  const { t } = useTranslation()
  const allCommittees = useBarangayCommitteeStore((s) => s.committees)
  const {
    form,
    setForm,
    committeeRegistration,
    selectCommittee,
    isServiceInvoice,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  } = useRecordBCBulkPaymentModal(open, onOpenChange, initialReceiptType)

  const committees = useMemo(() => allCommittees.filter((c) => c.isActive), [allCommittees])
  const selectedCommittee = committees.find((c) => c.id === form.barangayCommitteeId) ?? null
  const [committeeSearch, setCommitteeSearch] = useState('')
  // Same timing issue as the form itself (see useRecordBCBulkPaymentModal) — the parent
  // opening this modal never fires Radix's onOpenChange, so this has to watch `open` directly.
  useEffect(() => {
    if (open) setCommitteeSearch('')
  }, [open])
  const filteredCommittees = useMemo(() => {
    const search = committeeSearch.trim().toLowerCase()
    if (!search) return []
    return committees.filter((c) => c.name.toLowerCase().includes(search))
  }, [committees, committeeSearch])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('barangayCommittee.payment.modalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('barangayCommittee.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('barangayCommittee.payment.committeeLabel')} required>
          <div style={{ position: 'relative' }}>
            {selectedCommittee ? (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--accent-primary-subtle)',
                  border: '1px solid var(--accent-primary)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 40
                }}
              >
                <div style={{ fontWeight: 600 }}>{selectedCommittee.name}</div>
                <button
                  type="button"
                  onClick={() => selectCommittee('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: 16,
                    padding: 4
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <FieldInput
                  value={committeeSearch}
                  onChange={(e) => setCommitteeSearch(e.target.value)}
                  placeholder={t('barangayCommittee.payment.committeePlaceholder')}
                  autoComplete="off"
                />
                {filteredCommittees.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      maxHeight: 240,
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {filteredCommittees.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          selectCommittee(c.id)
                          setCommitteeSearch('')
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 13,
                          backgroundColor: '#ffffff',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </FormField>

        {form.barangayCommitteeId && !committeeRegistration && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--danger-text, #b91c1c)',
              background: 'var(--danger-bg, rgba(239,68,68,0.08))',
              border: '1px solid var(--danger-border, rgba(239,68,68,0.3))',
              borderRadius: 8,
              padding: '8px 10px'
            }}
          >
            {t('barangayCommittee.payment.noRegistrationNote')}
          </div>
        )}

        {form.barangayCommitteeId && committeeRegistration && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('barangayCommittee.payment.ratesFromRegistration', {
              schoolYear: committeeRegistration.schoolYear,
              date: formatDate(committeeRegistration.dateApplied)
            })}
          </div>
        )}

        {form.barangayCommitteeId && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('barangayCommittee.payment.membersLabel', { count: form.memberIds.length })}
          </div>
        )}

        {/* Which fee shows here is decided entirely by the receipt type already picked (see
            ReceiptTypePickerModal) — the two are mutually exclusive, not a manual checkbox:
            Acknowledgment Receipt is always Membership Fee only (the AR booklet has no B.C.
            Group Fee row), Service Invoice is always B.C. Group Fee only (never Membership
            Fee, which always goes through an AR instead). */}
        <div style={{ display: 'flex', gap: 14 }}>
          {!isServiceInvoice && (
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase'
                }}
              >
                {t('barangayCommittee.payment.categoryMembership')} (= ₱{peso(membershipTotal)})
              </div>
              <FieldInput
                type="number"
                value={form.membershipAmountPerMember || ''}
                readOnly
                disabled
              />
            </div>
          )}
          {isServiceInvoice && (
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  textTransform: 'uppercase'
                }}
              >
                {t('barangayCommittee.payment.bcGroupFeeLabel')}
              </div>
              <FieldInput type="number" value={form.bcGroupFeeAmount || ''} readOnly disabled />
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 700,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--accent-primary-subtle)'
          }}
        >
          <span>{t('barangayCommittee.payment.totalLabel')}</span>
          <span>₱{peso(grandTotal)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('barangayCommittee.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>

          <FormField label={t('barangayCommittee.payment.paidByLabel')} required>
            <FieldInput
              value={form.paidByName}
              onChange={(e) => setForm((f) => ({ ...f, paidByName: e.target.value }))}
            />
          </FormField>
        </div>

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
          officialReceiptTotalLabel={t('barangayCommittee.payment.totalLabel')}
          officialReceiptTotal={grandTotal}
          breakdown={receiptFields.breakdown}
          onBreakdownAmountChange={receiptFields.setBreakdownAmount}
          othersLabel={receiptFields.othersLabel}
          onOthersLabelChange={receiptFields.setOthersLabel}
          othersAmount={receiptFields.othersAmount}
          onOthersAmountChange={receiptFields.setOthersAmount}
          acknowledgmentTotal={receiptFields.acknowledgmentTotal}
          targetTotal={grandTotal}
        />
      </div>
    </Modal>
  )
}
