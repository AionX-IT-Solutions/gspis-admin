import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatDate } from '@/shared/lib/utils'
import { useTroopsStore } from '../store/troops.store'
import type { Troop } from '../types/troop.types'
import { useRecordBulkPaymentModal } from '../hooks/useRecordBulkPaymentModal'

interface RecordBulkPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function peso(n: number): string {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function troopLabel(troop: Troop): string {
  return troop.troopName ? `${troop.troopNumber} — ${troop.troopName}` : troop.troopNumber
}

export function RecordBulkPaymentModal({ open, onOpenChange }: RecordBulkPaymentModalProps) {
  const { t } = useTranslation()
  const allTroops = useTroopsStore((s) => s.troops)
  const {
    form,
    setForm,
    troopRegistration,
    selectTroop,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  } = useRecordBulkPaymentModal(open, onOpenChange)

  const troops = useMemo(() => allTroops.filter((tr) => tr.isActive), [allTroops])
  const selectedTroop = troops.find((tr) => tr.id === form.troopId) ?? null
  const [troopSearch, setTroopSearch] = useState('')
  // Same timing issue as the form itself (see useRecordBulkPaymentModal) — the parent opening
  // this modal never fires Radix's onOpenChange, so this has to watch `open` directly.
  useEffect(() => {
    if (open) setTroopSearch('')
  }, [open])
  const filteredTroops = useMemo(() => {
    const search = troopSearch.trim().toLowerCase()
    if (!search) return []
    return troops.filter(
      (tr) =>
        tr.troopNumber.toLowerCase().includes(search) ||
        (tr.troopName && tr.troopName.toLowerCase().includes(search))
    )
  }, [troops, troopSearch])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('troops.payment.modalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('troops.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('troops.payment.troopLabel')} required>
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
                <div style={{ fontWeight: 600 }}>{troopLabel(selectedTroop)}</div>
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
                  placeholder={t('troops.payment.troopPlaceholder')}
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
                        {troopLabel(tr)}
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
              color: 'var(--danger-text, #b91c1c)',
              background: 'var(--danger-bg, rgba(239,68,68,0.08))',
              border: '1px solid var(--danger-border, rgba(239,68,68,0.3))',
              borderRadius: 8,
              padding: '8px 10px'
            }}
          >
            {t('troops.payment.noRegistrationNote')}
          </div>
        )}

        {form.troopId && troopRegistration && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('troops.payment.ratesFromRegistration', {
              schoolYear: troopRegistration.schoolYear,
              date: formatDate(troopRegistration.dateApplied)
            })}
          </div>
        )}

        {form.troopId && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('troops.payment.membersLabel', { count: form.memberIds.length })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
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
                checked={form.includeMembership}
                onChange={(e) => setForm((f) => ({ ...f, includeMembership: e.target.checked }))}
              />
              {t('troops.roster.payment.categoryMembership')} (= ₱{peso(membershipTotal)})
            </label>
            <FieldInput
              type="number"
              value={form.membershipAmountPerMember || ''}
              readOnly
              disabled={!form.includeMembership}
            />
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
                checked={form.includeTroopFee}
                onChange={(e) => setForm((f) => ({ ...f, includeTroopFee: e.target.checked }))}
              />
              {t('troops.payment.troopFeeLabel')}
            </label>
            <FieldInput
              type="number"
              value={form.troopFeeAmount || ''}
              readOnly
              disabled={!form.includeTroopFee}
            />
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
                checked={form.includeThinkingDay}
                onChange={(e) => setForm((f) => ({ ...f, includeThinkingDay: e.target.checked }))}
              />
              {t('troops.payment.thinkingDayFeeLabel')}
            </label>
            <FieldInput
              type="number"
              value={form.thinkingDayFeeAmount || ''}
              readOnly
              disabled={!form.includeThinkingDay}
            />
          </div>
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
          <span>{t('troops.payment.totalLabel')}</span>
          <span>₱{peso(grandTotal)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('troops.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>

          <FormField label={t('troops.payment.paidByLabel')} required>
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
          officialReceiptTotalLabel={t('troops.payment.totalLabel')}
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
