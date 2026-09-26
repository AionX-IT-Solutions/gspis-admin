import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatDate } from '@/shared/lib/utils'
import type { ReceiptKind } from '@/shared/types/receipt.types'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useRecordIccgBulkPaymentModal } from '../hooks/useRecordIccgBulkPaymentModal'

interface RecordIccgBulkPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialReceiptType?: ReceiptKind
}

function peso(n: number): string {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RecordIccgBulkPaymentModal({
  open,
  onOpenChange,
  initialReceiptType
}: RecordIccgBulkPaymentModalProps) {
  const { t } = useTranslation()
  const allTroops = useTroopsStore((s) => s.troops)
  const {
    form,
    setForm,
    troopRegistration,
    selectTroop,
    girlsTotal,
    adultsTotal,
    grandTotal,
    girlsCouncilShareTotal,
    adultsCouncilShareTotal,
    councilShareGrandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  } = useRecordIccgBulkPaymentModal(open, onOpenChange, initialReceiptType)

  const troops = useMemo(() => allTroops.filter((tr) => tr.isActive), [allTroops])
  const selectedTroop = troops.find((tr) => tr.id === form.troopId) ?? null
  const [troopSearch, setTroopSearch] = useState('')
  useEffect(() => {
    if (open) setTroopSearch('')
  }, [open])
  const filteredTroops = useMemo(() => {
    const search = troopSearch.trim().toLowerCase()
    if (!search) return []
    return troops.filter(
      (tr) =>
        tr.troopNumber.toLowerCase().includes(search) ||
        (tr.troopName ?? '').toLowerCase().includes(search)
    )
  }, [troops, troopSearch])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('iccgRegistration.payment.modalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('iccgRegistration.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('iccgRegistration.payment.troopLabel')} required>
          <div style={{ position: 'relative' }}>
            {selectedTroop ? (
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
                <div style={{ fontWeight: 600 }}>
                  {selectedTroop.troopNumber}{' '}
                  {selectedTroop.troopName ? `— ${selectedTroop.troopName}` : ''}
                </div>
                <button
                  type="button"
                  onClick={() => selectTroop('')}
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
                  value={troopSearch}
                  onChange={(e) => setTroopSearch(e.target.value)}
                  placeholder={t('iccgRegistration.payment.troopPlaceholder')}
                  autoComplete="off"
                />
                {filteredTroops.length > 0 && (
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
                    {filteredTroops.map((tr) => (
                      <div
                        key={tr.id}
                        onClick={() => {
                          selectTroop(tr.id)
                          setTroopSearch('')
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
                        {tr.troopNumber} {tr.troopName ? `— ${tr.troopName}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </FormField>

        {form.troopId && !troopRegistration && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--glass-bg)',
              border: '1px dashed var(--border-default)',
              borderRadius: 8,
              padding: '8px 10px'
            }}
          >
            {t('iccgRegistration.payment.noRegistrationNote')}
          </div>
        )}

        {form.troopId && troopRegistration && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('iccgRegistration.payment.ratesFromRegistration', {
              schoolYear: troopRegistration.schoolYear,
              date: formatDate(troopRegistration.dateApplied)
            })}
          </div>
        )}

        {form.troopId && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('iccgRegistration.payment.membersLabel', {
              girls: form.girlMemberIds.length,
              adults: form.adultMemberIds.length
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 6,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              <input
                type="checkbox"
                checked={form.includeGirls}
                onChange={(e) => setForm((f) => ({ ...f, includeGirls: e.target.checked }))}
              />
              {t('iccgRegistration.payment.girlsFeeLabel')} (= ₱{peso(girlsTotal)})
            </label>
            <FieldInput
              type="number"
              value={form.amountPerGirl || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountPerGirl: parseFloat(e.target.value) || 0 }))
              }
              disabled={!form.includeGirls}
            />
            <div style={{ marginTop: 8 }}>
              <FormField
                label={`${t('iccgRegistration.payment.councilShareLabel')} (= ₱${peso(girlsCouncilShareTotal)})`}
              >
                <FieldInput
                  type="number"
                  value={form.councilShareAmountPerGirl || ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      councilShareAmountPerGirl: parseFloat(e.target.value) || 0
                    }))
                  }
                  disabled={!form.includeGirls}
                />
              </FormField>
            </div>
          </div>
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 6,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              <input
                type="checkbox"
                checked={form.includeAdults}
                onChange={(e) => setForm((f) => ({ ...f, includeAdults: e.target.checked }))}
              />
              {t('iccgRegistration.payment.adultsFeeLabel')} (= ₱{peso(adultsTotal)})
            </label>
            <FieldInput
              type="number"
              value={form.amountPerAdult || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountPerAdult: parseFloat(e.target.value) || 0 }))
              }
              disabled={!form.includeAdults}
            />
            <div style={{ marginTop: 8 }}>
              <FormField
                label={`${t('iccgRegistration.payment.councilShareLabel')} (= ₱${peso(adultsCouncilShareTotal)})`}
              >
                <FieldInput
                  type="number"
                  value={form.councilShareAmountPerAdult || ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      councilShareAmountPerAdult: parseFloat(e.target.value) || 0
                    }))
                  }
                  disabled={!form.includeAdults}
                />
              </FormField>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--accent-primary-subtle)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <span>{t('iccgRegistration.payment.totalLabel')}</span>
            <span>₱{peso(grandTotal)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text-muted)'
            }}
          >
            <span>{t('iccgRegistration.payment.councilRetainedTotal')}</span>
            <span>₱{peso(councilShareGrandTotal)}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('iccgRegistration.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>

          <FormField label={t('iccgRegistration.payment.paidByLabel')} required>
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
          officialReceiptTotalLabel={t('iccgRegistration.payment.totalLabel')}
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
