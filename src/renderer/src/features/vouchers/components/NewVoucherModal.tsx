import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { SuggestInput } from '@/shared/components/ui/SuggestInput'
import { formatCurrency } from '@/shared/lib/utils'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import { CASH_RECEIPT_CATEGORIES } from '@/features/scrd/types/cashReceipts.types'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useBudgetStore } from '@/features/budget/store/budget.store'
import { stripCategoryNumbering } from '../lib/expenseVouchers'
import type { ModeOfPayment, Voucher, VoucherType } from '../types/vouchers.types'
import { useNewVoucherModal, type VoucherAccountLineForm } from '../hooks/useNewVoucherModal'

interface NewVoucherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: Voucher | null
}

export function NewVoucherModal({ open, onOpenChange, editTarget }: NewVoucherModalProps) {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    setVoucherType,
    totalDebit,
    totalCredit,
    isCashAdvanceLiquidation,
    isBalanced,
    addLine,
    removeLine,
    updateLine,
    cashAdvanceSources,
    setCashAdvanceSource,
    handleSubmit
  } = useNewVoucherModal(open, onOpenChange, editTarget)
  const allBanks = useBanksStore((s) => s.banks)
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])

  const budgetCategories = useBudgetStore((s) => s.categories)
  // Council Budget's own expense line items are suggested as account titles — vouchers
  // also allow free text (e.g. "SSS Premium Payable"), since real disbursement
  // vouchers debit balance-sheet accounts the Budget doesn't track alongside expense
  // lines it does. Latest fiscal year only, same as the Budget page's own default.
  const latestFiscalYear = useMemo(
    () => [...new Set(budgetCategories.map((c) => c.fiscalYear))].sort().at(-1),
    [budgetCategories]
  )
  const expenseAccountSuggestions = useMemo(
    () =>
      budgetCategories
        .filter((c) => c.fiscalYear === latestFiscalYear && c.section === 'expense')
        .sort((a, b) => a.order - b.order)
        .map((c) => stripCategoryNumbering(c.name)),
    [budgetCategories, latestFiscalYear]
  )
  // A Check Voucher's credit side is usually the bank/cash account the payment came
  // from, while a Journal Voucher's is usually an income category — offer both so the
  // one list works whichever voucher type is selected.
  const creditAccountSuggestions = useMemo(
    () => ['Cash on Hand', ...banks.map((b) => bankDisplayName(b)), ...CASH_RECEIPT_CATEGORIES],
    [banks]
  )
  const allVendors = useAccountingStore((s) => s.vendors)
  const vendors = useMemo(() => allVendors.filter((v) => v.status === 'active'), [allVendors])
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  // Same timing issue as the form itself (see useNewVoucherModal) — the parent opening
  // this modal never fires Radix's onOpenChange, so this has to watch `open` directly.
  useEffect(() => {
    if (open) setSelectedVendorId(null)
  }, [open])
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) ?? null
  const filteredVendors = useMemo(() => {
    const search = form.payee.trim().toLowerCase()
    if (!search) return []
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.company && v.company.toLowerCase().includes(search)) ||
        v.email.toLowerCase().includes(search)
    )
  }, [vendors, form.payee])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('vouchers.editVoucherTitle') : t('vouchers.newVoucherButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('common.save') : t('vouchers.form.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('vouchers.form.voucherType')} required>
          <FieldSelect
            value={form.voucherType}
            onChange={(e) => setVoucherType(e.target.value as VoucherType)}
            options={[
              { value: 'check_voucher', label: t('vouchers.type.checkVoucher') },
              { value: 'journal_voucher', label: t('vouchers.type.journalVoucher') }
            ]}
          />
        </FormField>
        <FormField label={t('vouchers.form.voucherNumber')} required>
          <FieldInput
            value={form.voucherNumber}
            onChange={(e) => setForm((f) => ({ ...f, voucherNumber: e.target.value }))}
            disabled={!!editTarget}
          />
        </FormField>
        <FormField label={t('vouchers.form.modeOfPayment')} required>
          <FieldSelect
            value={form.modeOfPayment}
            onChange={(e) =>
              setForm((f) => ({ ...f, modeOfPayment: e.target.value as ModeOfPayment }))
            }
            options={[
              { value: 'cash', label: t('vouchers.form.modeCash') },
              { value: 'check', label: t('vouchers.form.modeCheck') }
            ]}
          />
        </FormField>
        {form.modeOfPayment === 'check' && (
          <FormField label={t('vouchers.form.checkNumber')} className="col-span-2">
            <FieldInput
              value={form.checkNumber}
              onChange={(e) => setForm((f) => ({ ...f, checkNumber: e.target.value }))}
            />
          </FormField>
        )}
        <FormField label={t('vouchers.form.payee')} required>
          <div style={{ position: 'relative' }}>
            {selectedVendor ? (
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
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedVendor.company ?? selectedVendor.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {selectedVendor.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendorId(null)
                    setForm((f) => ({ ...f, payee: '' }))
                  }}
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
                  value={form.payee}
                  onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
                  placeholder={t('vouchers.form.payeePlaceholder')}
                  autoComplete="off"
                />
                {filteredVendors.length > 0 && (
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
                    {filteredVendors.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVendorId(v.id)
                          setForm((f) => ({ ...f, payee: v.company ?? v.name }))
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
                        <div style={{ fontWeight: 600 }}>{v.company ?? v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {v.name}
                          {v.email && <span> • {v.email}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </FormField>
        <FormField label={t('vouchers.form.payeeAddress')}>
          <FieldInput
            value={form.payeeAddress}
            onChange={(e) => setForm((f) => ({ ...f, payeeAddress: e.target.value }))}
          />
        </FormField>
        <FormField label={t('vouchers.form.bankAccount')} className="col-span-2">
          <FieldSelect
            value={form.bankAccountRef}
            onChange={(e) => setForm((f) => ({ ...f, bankAccountRef: e.target.value }))}
            placeholder={t('vouchers.form.bankAccountPlaceholder')}
            options={banks.map((b) => ({ value: bankDisplayName(b), label: bankDisplayName(b) }))}
          />
        </FormField>
        {!isCashAdvanceLiquidation ? (
          <>
            <AccountLinesSection
              label={t('vouchers.form.accountLinesLabel')}
              required={form.voucherType === 'check_voucher'}
              lines={form.debitLines}
              onAdd={() => addLine('debitLines')}
              onRemove={(i) => removeLine('debitLines', i)}
              onUpdate={(i, patch) => updateLine('debitLines', i, patch)}
              suggestions={expenseAccountSuggestions}
              totalLabel={t('vouchers.form.totalAmount')}
              total={totalDebit}
            />
            <AccountLinesSection
              label={t('vouchers.form.accountLinesLabelCredit')}
              lines={form.creditLines}
              onAdd={() => addLine('creditLines')}
              onRemove={(i) => removeLine('creditLines', i)}
              onUpdate={(i, patch) => updateLine('creditLines', i, patch)}
              suggestions={creditAccountSuggestions}
              totalLabel={t('vouchers.form.totalCredit')}
              total={totalCredit}
            />
            {!isBalanced && (
              <div
                className="col-span-2"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#f87171',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)'
                }}
              >
                {t('vouchers.form.unbalancedHint', {
                  debit: formatCurrency(totalDebit),
                  credit: formatCurrency(totalCredit)
                })}
              </div>
            )}
          </>
        ) : (
          <div
            className="col-span-2"
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}
          >
            {t('vouchers.form.cashAdvanceAutoLinesNote')}
          </div>
        )}
        {form.voucherType === 'journal_voucher' && (
          <div
            className="col-span-2"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--border-subtle)'
            }}
          >
            <p className="label" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              {t('vouchers.form.cashAdvanceSection')}
            </p>
            <FormField label={t('vouchers.form.cashAdvanceSource')} className="col-span-2">
              <FieldSelect
                value={form.relatedVoucherId}
                onChange={(e) => setCashAdvanceSource(e.target.value)}
                placeholder={t('vouchers.form.cashAdvanceSourcePlaceholder')}
                options={cashAdvanceSources.map((v) => ({
                  value: v.id,
                  label: `${v.voucherNumber} — ${v.payee} (${formatCurrency(v.amount)})`
                }))}
              />
              {cashAdvanceSources.length === 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {t('vouchers.form.cashAdvanceSourceEmptyHint')}
                </span>
              )}
            </FormField>
            <FormField label={t('vouchers.form.cashAdvanceAmount')}>
              <FieldInput
                type="number"
                min={0}
                value={form.cashAdvanceAmount || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cashAdvanceAmount: parseFloat(e.target.value) || 0 }))
                }
                placeholder="0.00"
                disabled={!form.relatedVoucherId}
              />
              {!form.relatedVoucherId && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {t('vouchers.form.cashAdvanceSourceRequiredHint')}
                </span>
              )}
            </FormField>
            <FormField label={t('vouchers.form.cashAdvanceDate')}>
              <FieldInput
                type="date"
                value={form.cashAdvanceDate}
                onChange={(e) => setForm((f) => ({ ...f, cashAdvanceDate: e.target.value }))}
                disabled={!form.relatedVoucherId}
              />
            </FormField>
            <FormField label={t('vouchers.form.totalAmountSpent')}>
              <FieldInput
                type="number"
                min={0}
                value={form.totalAmountSpent || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalAmountSpent: parseFloat(e.target.value) || 0 }))
                }
                placeholder="0.00"
                disabled
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isCashAdvanceLiquidation
                  ? t('vouchers.form.autoCalculatedField')
                  : t('vouchers.form.cashAdvanceSourceRequiredHint')}
              </span>
            </FormField>
            <FormField label={t('vouchers.form.amountRefunded')}>
              <FieldInput
                type="number"
                min={0}
                value={form.amountRefunded || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amountRefunded: parseFloat(e.target.value) || 0 }))
                }
                placeholder="0.00"
                disabled
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isCashAdvanceLiquidation
                  ? t('vouchers.form.autoCalculatedField')
                  : t('vouchers.form.cashAdvanceSourceRequiredHint')}
              </span>
            </FormField>
            <FormField label={t('vouchers.form.refundOrNumber')}>
              <FieldInput
                value={form.refundOrNumber}
                onChange={(e) => setForm((f) => ({ ...f, refundOrNumber: e.target.value }))}
              />
            </FormField>
            <FormField label={t('vouchers.form.refundDate')}>
              <FieldInput
                type="date"
                value={form.refundDate}
                onChange={(e) => setForm((f) => ({ ...f, refundDate: e.target.value }))}
              />
            </FormField>
          </div>
        )}
        <FormField label={t('vouchers.form.particulars')} className="col-span-2">
          <FieldTextArea
            value={form.particulars}
            onChange={(e) => setForm((f) => ({ ...f, particulars: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

interface AccountLinesSectionProps {
  label: string
  required?: boolean
  lines: VoucherAccountLineForm[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, patch: Partial<VoucherAccountLineForm>) => void
  suggestions: string[]
  totalLabel: string
  total: number
}

// One repeatable {account, amount} list — used once for the debit side and, on a
// Journal Voucher, again for the credit side, so a proper double-entry line can be
// built from two independent lists instead of one list whose direction is toggled.
function AccountLinesSection({
  label,
  required,
  lines,
  onAdd,
  onRemove,
  onUpdate,
  suggestions,
  totalLabel,
  total
}: AccountLinesSectionProps) {
  const { t } = useTranslation()
  return (
    <FormField label={label} required={required} className="col-span-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SuggestInput
              value={line.account}
              onChange={(value) => onUpdate(i, { account: value })}
              suggestions={suggestions}
              placeholder={t('vouchers.form.accountPlaceholder')}
            />
            <FieldInput
              value={line.description}
              onChange={(e) => onUpdate(i, { description: e.target.value })}
              placeholder={t('vouchers.form.descriptionPlaceholder')}
              style={{ flex: 1 }}
            />
            <FieldInput
              type="number"
              min={0}
              value={line.amount || ''}
              onChange={(e) => onUpdate(i, { amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              style={{ width: 130, textAlign: 'right' }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(i)}
              disabled={lines.length <= 1}
              aria-label={t('common.delete')}
              style={{ width: 30, height: 30, padding: 0, flexShrink: 0 }}
            >
              <Trash2 size={13} color="#f87171" />
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={12} />}
          onClick={onAdd}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('vouchers.form.addAccountLine')}
        </Button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            paddingTop: 8,
            marginTop: 2,
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
        >
          <span>{totalLabel}:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </FormField>
  )
}
