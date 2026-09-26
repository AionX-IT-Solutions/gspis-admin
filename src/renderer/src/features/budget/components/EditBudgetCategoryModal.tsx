import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { SuggestInput } from '@/shared/components/ui/SuggestInput'
import { formatCurrency } from '@/shared/lib/utils'
import {
  CASH_RECEIPT_CATEGORIES,
  type CashReceiptCategory
} from '@/features/scrd/types/cashReceipts.types'
import type { RentalSpaceCategory } from '@/features/rentals/types/rentals.types'
import type { PayrollEntry } from '@/features/hr/types/hr.types'
import { PAYROLL_FIELD_OPTIONS } from '../lib/budgetAutoActuals'
import { BUDGET_MONTH_LABELS, type BudgetCategory } from '../types/budget.types'
import type {
  BudgetSourceMapping,
  BudgetSourceRule,
  BudgetSourceType
} from '../types/budgetSourceMapping.types'

const RENTAL_SPACE_CATEGORIES: RentalSpaceCategory[] = ['hall', 'room', 'space']
const INCOME_SOURCE_TYPES: BudgetSourceType[] = ['voucher', 'pos', 'rental']
const EXPENSE_SOURCE_TYPES: BudgetSourceType[] = ['voucher', 'payroll']

interface EditBudgetCategoryModalProps {
  category: BudgetCategory | null
  /** This category's live-computed actuals (Jul-Jun), if it has a recognized POS/
   *  Rentals/Vouchers/Payroll source — offered per month as a one-click fill, never
   *  applied automatically so the council-approved figure always stays a deliberate edit. */
  autoMonthlyActuals?: number[]
  /** Looks up this category's user-configured Source rules by name — see
   *  budgetSourceMappings.store.ts. */
  getSourceMapping: (categoryName: string) => BudgetSourceMapping | undefined
  /** This fiscal year's own expense line names — suggested when picking which GL account
   *  text an expense line's 'voucher' rule should match. */
  expenseVoucherCategorySuggestions: string[]
  onClose: () => void
  onSave: (id: string, edit: { budgetedAmount: number; monthlyActuals: number[] }) => void
  onSaveSourceMapping: (categoryName: string, rules: BudgetSourceRule[]) => void
}

function newRule(): BudgetSourceRule {
  return { id: crypto.randomUUID(), sourceTypes: [] }
}

export function EditBudgetCategoryModal({
  category,
  autoMonthlyActuals,
  getSourceMapping,
  expenseVoucherCategorySuggestions,
  onClose,
  onSave,
  onSaveSourceMapping
}: EditBudgetCategoryModalProps) {
  const { t } = useTranslation()
  const [budgetedAmount, setBudgetedAmount] = useState('0')
  const [monthlyActuals, setMonthlyActuals] = useState<number[]>(Array(12).fill(0))
  const [rules, setRules] = useState<BudgetSourceRule[]>([])

  useEffect(() => {
    if (!category) return
    setBudgetedAmount(String(category.budgetedAmount))
    setMonthlyActuals(category.monthlyActuals)
    setRules(getSourceMapping(category.name)?.rules ?? [])
  }, [category, getSourceMapping])

  const totalActual = monthlyActuals.reduce((s, v) => s + v, 0)
  const isIncome = category?.section === 'income'
  const sourceTypes = isIncome ? INCOME_SOURCE_TYPES : EXPENSE_SOURCE_TYPES

  function updateRule(index: number, patch: Partial<BudgetSourceRule>) {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function toggleRuleSourceType(index: number, type: BudgetSourceType) {
    const rule = rules[index]
    const has = rule.sourceTypes.includes(type)
    const sourceTypes = has
      ? rule.sourceTypes.filter((t) => t !== type)
      : [...rule.sourceTypes, type]
    updateRule(index, {
      sourceTypes,
      voucherCategories: sourceTypes.includes('voucher')
        ? (rule.voucherCategories ?? [])
        : undefined,
      rentalSpaceCategory: sourceTypes.includes('rental') ? rule.rentalSpaceCategory : undefined,
      payrollField: sourceTypes.includes('payroll') ? rule.payrollField : undefined
    })
  }

  function toggleVoucherCategory(index: number, cat: string) {
    const rule = rules[index]
    const current = rule.voucherCategories ?? []
    updateRule(index, {
      voucherCategories: current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat]
    })
  }

  function handleSave() {
    if (!category) return
    const amount = parseFloat(budgetedAmount)
    onSave(category.id, {
      budgetedAmount: Number.isNaN(amount) ? 0 : amount,
      monthlyActuals
    })
    // A rule with nothing checked matches nothing and is just an unfinished row — drop it
    // rather than persist a source mapping that silently does nothing.
    onSaveSourceMapping(
      category.name,
      rules.filter((r) => r.sourceTypes.length > 0)
    )
  }

  const sourceTypeLabels: Record<BudgetSourceType, string> = {
    voucher: t('budget.editModal.source.sourceTypeVoucher'),
    pos: t('budget.editModal.source.sourceTypePos'),
    rental: t('budget.editModal.source.sourceTypeRental'),
    payroll: t('budget.editModal.source.sourceTypePayroll')
  }

  return (
    <Modal
      open={!!category}
      onOpenChange={(open) => !open && onClose()}
      title={category?.name}
      description={t('budget.editModal.subtitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ maxWidth: 220 }}>
          <FormField label={t('budget.editModal.budgetedAmount')}>
            <FieldInput
              type="number"
              min={0}
              step="0.01"
              value={budgetedAmount}
              onChange={(e) => setBudgetedAmount(e.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}
          >
            <p className="label" style={{ marginBottom: 0 }}>
              {t('budget.editModal.monthlyActuals')}
            </p>
            {autoMonthlyActuals?.some((v) => v > 0) && (
              <button
                type="button"
                onClick={() => setMonthlyActuals(autoMonthlyActuals)}
                style={{
                  fontSize: 11,
                  color: 'var(--accent-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {t('budget.editModal.useAllLiveData')}
              </button>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 8
            }}
          >
            {BUDGET_MONTH_LABELS.map((label, i) => {
              const autoValue = autoMonthlyActuals?.[i] ?? 0
              const showHint = autoValue > 0 && autoValue !== monthlyActuals[i]
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                    {label}
                  </span>
                  <FieldInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={monthlyActuals[i]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      setMonthlyActuals((arr) =>
                        arr.map((x, idx) => (idx === i ? (Number.isNaN(v) ? 0 : v) : x))
                      )
                    }}
                    style={{ textAlign: 'center', padding: '5px 4px', fontSize: 12.5 }}
                  />
                  {showHint && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonthlyActuals((arr) => arr.map((x, idx) => (idx === i ? autoValue : x)))
                      }
                      title={t('budget.editModal.liveDataHint')}
                      style={{
                        fontSize: 9.5,
                        color: 'var(--accent-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'center'
                      }}
                    >
                      {formatCurrency(autoValue)}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 10
          }}
        >
          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            {t('budget.editModal.totalActual')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(totalActual)}
          </span>
        </div>

        {category && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4
              }}
            >
              <p className="label" style={{ marginBottom: 0 }}>
                {t('budget.editModal.source.heading')}
              </p>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={13} />}
                onClick={() => setRules((prev) => [...prev, newRule()])}
              >
                {t('budget.editModal.source.addRule')}
              </Button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
              {isIncome
                ? t('budget.editModal.source.hintIncome')
                : t('budget.editModal.source.hintExpense')}
            </p>

            {rules.length === 0 ? (
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {t('budget.editModal.source.empty')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map((rule, i) => (
                  <div
                    key={rule.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                        {rule.sourceTypes.length === 0 && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {t('budget.editModal.source.sourceTypeNotSpecified')}
                          </span>
                        )}
                        {sourceTypes.map((st) => (
                          <label
                            key={st}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12.5,
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={rule.sourceTypes.includes(st)}
                              onChange={() => toggleRuleSourceType(i, st)}
                            />
                            {sourceTypeLabels[st]}
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setRules((prev) => prev.filter((_, idx) => idx !== i))}
                        title={t('budget.editModal.source.removeRule')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          padding: '0 10px',
                          color: '#f87171'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {rule.sourceTypes.includes('voucher') &&
                      (isIncome ? (
                        <CashReceiptCategoryCheckboxes
                          values={rule.voucherCategories ?? []}
                          onToggle={(cat) => toggleVoucherCategory(i, cat)}
                        />
                      ) : (
                        <VoucherCategoryChips
                          suggestions={expenseVoucherCategorySuggestions}
                          values={rule.voucherCategories ?? []}
                          onAdd={(v) =>
                            updateRule(i, {
                              voucherCategories: [...(rule.voucherCategories ?? []), v]
                            })
                          }
                          onRemove={(v) =>
                            updateRule(i, {
                              voucherCategories: (rule.voucherCategories ?? []).filter(
                                (x) => x !== v
                              )
                            })
                          }
                        />
                      ))}

                    {rule.sourceTypes.includes('rental') && (
                      <FieldSelect
                        value={rule.rentalSpaceCategory ?? ''}
                        onChange={(e) =>
                          updateRule(i, {
                            rentalSpaceCategory: (e.target.value || undefined) as
                              | RentalSpaceCategory
                              | undefined
                          })
                        }
                        placeholder={t('budget.editModal.source.rentalCategoryAny')}
                        options={RENTAL_SPACE_CATEGORIES.map((c) => ({
                          value: c,
                          label: t(`rentals.form.category${c[0].toUpperCase()}${c.slice(1)}`)
                        }))}
                      />
                    )}

                    {rule.sourceTypes.includes('payroll') && (
                      <FieldSelect
                        value={rule.payrollField ?? ''}
                        onChange={(e) =>
                          updateRule(i, {
                            payrollField: (e.target.value || undefined) as
                              | keyof PayrollEntry
                              | undefined
                          })
                        }
                        placeholder={t('budget.editModal.source.payrollFieldPlaceholder')}
                        options={PAYROLL_FIELD_OPTIONS.map((o) => ({
                          value: o.field,
                          label: o.label
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

interface CashReceiptCategoryCheckboxesProps {
  values: string[]
  onToggle: (category: CashReceiptCategory) => void
}

// Every income line links against CashReceiptCategory — a closed, canonical list (every
// category any of the 9 registration modules/POS/Rentals/manual entries can ever post under,
// see cashReceipts.types.ts) — so unlike an expense line's genuinely free-text GL Account name,
// there's no need for free text + suggestions here: checkboxes make every choice precise
// (no typos silently matching nothing) and complete (every real category is always listed).
function CashReceiptCategoryCheckboxes({ values, onToggle }: CashReceiptCategoryCheckboxesProps) {
  const { t } = useTranslation()
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
        {t('budget.editModal.source.voucherCategoriesLabel')}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {CASH_RECEIPT_CATEGORIES.map((cat) => (
          <label
            key={cat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <input type="checkbox" checked={values.includes(cat)} onChange={() => onToggle(cat)} />
            {cat}
          </label>
        ))}
      </div>
    </div>
  )
}

interface VoucherCategoryChipsProps {
  values: string[]
  suggestions: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

function VoucherCategoryChips({ values, suggestions, onAdd, onRemove }: VoucherCategoryChipsProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  function commit() {
    const v = draft.trim()
    if (!v || values.includes(v)) {
      setDraft('')
      return
    }
    onAdd(v)
    setDraft('')
  }

  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        {t('budget.editModal.source.voucherCategoriesLabel')}
      </p>
      <div
        style={{ display: 'flex', gap: 6 }}
        onKeyDown={(e) => {
          // Typing a category then hitting Save without ever clicking "Add" silently
          // discarded it (the draft text never left this component's own state) — Enter
          // now commits it too, same as clicking Add.
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
        }}
      >
        <SuggestInput
          value={draft}
          onChange={setDraft}
          suggestions={suggestions.filter((c) => !values.includes(c))}
          placeholder={t('budget.editModal.source.voucherCategoryPlaceholder')}
        />
        <Button variant="secondary" size="sm" onClick={commit}>
          {t('common.add')}
        </Button>
      </div>
      {values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {values.map((v) => (
            <span
              key={v}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                padding: '3px 8px',
                borderRadius: 999,
                background: 'var(--accent-primary-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              {v}
              <button
                type="button"
                onClick={() => onRemove(v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  color: 'var(--text-muted)'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
