import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { ReceiptFieldsSection } from '@/shared/components/receipts/ReceiptFieldsSection'
import { formatDate } from '@/shared/lib/utils'
import type { ReceiptKind } from '@/shared/types/receipt.types'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import { useRecordTGBulkPaymentModal } from '../hooks/useRecordTGBulkPaymentModal'

interface RecordTGBulkPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialReceiptType?: ReceiptKind
}

function peso(n: number): string {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function RecordTGBulkPaymentModal({
  open,
  onOpenChange,
  initialReceiptType
}: RecordTGBulkPaymentModalProps) {
  const { t } = useTranslation()
  const allGuilds = useTrefoilGuildStore((s) => s.guilds)
  const {
    form,
    setForm,
    guildRegistration,
    selectGuild,
    isServiceInvoice,
    membershipTotal,
    grandTotal,
    officialReceiptLines,
    receiptFields,
    handleSubmit
  } = useRecordTGBulkPaymentModal(open, onOpenChange, initialReceiptType)

  const guilds = useMemo(() => allGuilds.filter((g) => g.isActive), [allGuilds])
  const selectedGuild = guilds.find((g) => g.id === form.trefoilGuildId) ?? null
  const [guildSearch, setGuildSearch] = useState('')
  // Same timing issue as the form itself (see useRecordTGBulkPaymentModal) — the parent
  // opening this modal never fires Radix's onOpenChange, so this has to watch `open` directly.
  useEffect(() => {
    if (open) setGuildSearch('')
  }, [open])
  const filteredGuilds = useMemo(() => {
    const search = guildSearch.trim().toLowerCase()
    if (!search) return []
    return guilds.filter((g) => g.name.toLowerCase().includes(search))
  }, [guilds, guildSearch])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('trefoilGuild.payment.modalTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('trefoilGuild.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('trefoilGuild.payment.guildLabel')} required>
          <div style={{ position: 'relative' }}>
            {selectedGuild ? (
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
                <div style={{ fontWeight: 600 }}>{selectedGuild.name}</div>
                <button
                  type="button"
                  onClick={() => selectGuild('')}
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
                  value={guildSearch}
                  onChange={(e) => setGuildSearch(e.target.value)}
                  placeholder={t('trefoilGuild.payment.guildPlaceholder')}
                  autoComplete="off"
                />
                {filteredGuilds.length > 0 && (
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
                    {filteredGuilds.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          selectGuild(g.id)
                          setGuildSearch('')
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
                        {g.name}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </FormField>

        {form.trefoilGuildId && !guildRegistration && (
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
            {t('trefoilGuild.payment.noRegistrationNote')}
          </div>
        )}

        {form.trefoilGuildId && guildRegistration && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('trefoilGuild.payment.ratesFromRegistration', {
              schoolYear: guildRegistration.schoolYear,
              date: formatDate(guildRegistration.dateApplied)
            })}
          </div>
        )}

        {form.trefoilGuildId && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t('trefoilGuild.payment.membersLabel', { count: form.memberIds.length })}
          </div>
        )}

        {/* Which fee shows here is decided entirely by the receipt type already picked (see
            ReceiptTypePickerModal) — the two are mutually exclusive, not a manual checkbox:
            Acknowledgment Receipt is always Membership Fee only (the AR booklet has no T.G.
            Group Fee row), Service Invoice is always T.G. Group Fee only (never Membership
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
                {t('trefoilGuild.payment.categoryMembership')} (= ₱{peso(membershipTotal)})
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
                {t('trefoilGuild.payment.tgGroupFeeLabel')}
              </div>
              <FieldInput type="number" value={form.tgGroupFeeAmount || ''} readOnly disabled />
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
          <span>{t('trefoilGuild.payment.totalLabel')}</span>
          <span>₱{peso(grandTotal)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('trefoilGuild.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>

          <FormField label={t('trefoilGuild.payment.paidByLabel')} required>
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
          officialReceiptTotalLabel={t('trefoilGuild.payment.totalLabel')}
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
