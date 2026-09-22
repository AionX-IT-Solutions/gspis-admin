import type { CSSProperties } from 'react'
import { Pencil, Trash2, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { formatCurrency } from '@/shared/lib/utils'
import { actualToDate, groupTotalLabel, type BudgetGroupSummary } from '../lib/budgetCalculations'
import { PAYROLL_FIELD_OPTIONS, type AutoActualSourceKey } from '../lib/budgetAutoActuals'
import type { BudgetCategory, BudgetSection } from '../types/budget.types'
import type {
  BudgetSourceMapping,
  BudgetSourceRule,
  BudgetSourceType
} from '../types/budgetSourceMapping.types'
import type { TFunction } from 'i18next'

const GRID = '1fr 130px 130px 110px 56px'

const headCellStyle: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--text-muted)'
}
const groupHeadingStyle: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginTop: 14,
  marginBottom: 4
}
const groupTotalStyle: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--text-primary)'
}
const subGroupHeadingStyle: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginTop: 6,
  marginBottom: 2,
  paddingLeft: 8
}
const amountStyle: CSSProperties = {
  fontSize: 12.5,
  color: 'var(--text-primary)',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums'
}

function varianceColor(variance: number, section: BudgetSection): string {
  const favorable = section === 'income' ? variance >= 0 : variance <= 0
  if (variance === 0) return 'var(--text-muted)'
  return favorable ? '#34d399' : '#f87171'
}

/** One source kind's own piece of a rule's description (e.g. "Rentals: hall") — a rule can
 *  combine more than one kind at once (see BudgetSourceRule.sourceTypes). */
function describeSourceType(type: BudgetSourceType, rule: BudgetSourceRule, t: TFunction): string {
  const typeKey = `sourceType${type[0].toUpperCase()}${type.slice(1)}`
  const typeLabel = t(`budget.editModal.source.${typeKey}`)
  let detail = ''
  if (type === 'voucher' && rule.voucherCategories?.length) {
    detail = rule.voucherCategories.join(', ')
  } else if (type === 'troopPayment' && rule.troopPaymentCategories?.length) {
    detail = rule.troopPaymentCategories.join(', ')
  } else if (type === 'rental' && rule.rentalSpaceCategory) {
    detail = rule.rentalSpaceCategory
  } else if (type === 'payroll' && rule.payrollField) {
    detail = PAYROLL_FIELD_OPTIONS.find((o) => o.field === rule.payrollField)?.label ?? ''
  }
  return detail ? `${typeLabel}: ${detail}` : typeLabel
}

/** What the source-linked (⚡) tooltip shows — which source kind(s) this line pulls its
 *  actual from, and the specific categories named on each, so hovering answers "where is
 *  this linked" without needing to open Edit. */
function describeRule(rule: BudgetSourceRule, t: TFunction): string {
  if (rule.sourceTypes.length === 0) return t('budget.editModal.source.sourceTypeNotSpecified')
  return rule.sourceTypes.map((type) => describeSourceType(type, rule, t)).join(' + ')
}

function describeSourceMapping(mapping: BudgetSourceMapping, t: TFunction): string {
  return mapping.rules.map((r) => describeRule(r, t)).join('; ')
}

interface BudgetSectionTableProps {
  section: BudgetSection
  groups: BudgetGroupSummary[]
  canManage: boolean
  onEdit: (category: BudgetCategory) => void
  onDelete: (category: BudgetCategory) => void
  /** Opens the Add Line modal locked to this exact group/subGroup bucket. */
  onAddLine: (group: string, subGroup: string) => void
  /** Category ids with a live figure computed from real POS/Rentals/Vouchers/Payroll
   *  data, mapped to which specific source rule matched — shown as a small indicator
   *  (with a tooltip naming the source) so it's clear which lines are wired up and
   *  where their figure actually comes from. */
  autoActualSourceByCategory?: Map<string, AutoActualSourceKey>
  /** Looks up a category's configured Source rules by name, for the ⚡ tooltip's detail text. */
  getSourceMapping?: (categoryName: string) => BudgetSourceMapping | undefined
}

export function BudgetSectionTable({
  section,
  groups,
  canManage,
  onEdit,
  onDelete,
  onAddLine,
  autoActualSourceByCategory,
  getSourceMapping
}: BudgetSectionTableProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 8,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span style={headCellStyle} />
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.budgeted')}</span>
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.actual')}</span>
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.variance')}</span>
        <span />
      </div>

      {groups.map((group) => (
        <div key={group.group}>
          <p style={groupHeadingStyle}>{group.group}</p>
          {group.subGroups.map((sg) => (
            <div key={sg.subGroup || group.group}>
              {sg.subGroup && <p style={subGroupHeadingStyle}>{sg.subGroup}</p>}
              {sg.items.map((item) => {
                const actual = actualToDate(item)
                const variance = actual - item.budgetedAmount
                const sourceKey = autoActualSourceByCategory?.get(item.id)
                const sourceMapping = sourceKey ? getSourceMapping?.(item.name) : undefined
                const sourceTooltip = sourceMapping
                  ? describeSourceMapping(sourceMapping, t)
                  : t('budget.autoSource.userConfigured')
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: GRID,
                      gap: 8,
                      alignItems: 'center',
                      padding: '6px 0',
                      paddingLeft: 8,
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      {item.name}
                      {sourceKey && (
                        <Tooltip content={sourceTooltip}>
                          <Zap size={10} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                        </Tooltip>
                      )}
                    </span>
                    <span style={amountStyle}>{formatCurrency(item.budgetedAmount)}</span>
                    <span style={amountStyle}>{formatCurrency(actual)}</span>
                    <span style={{ ...amountStyle, color: varianceColor(variance, section) }}>
                      {formatCurrency(variance)}
                    </span>
                    {canManage ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <button
                          onClick={() => onEdit(item)}
                          title={t('common.edit')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: 4,
                            borderRadius: 6
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                        {item.isCustom && (
                          <button
                            onClick={() => onDelete(item)}
                            title={t('common.delete')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: 4,
                              borderRadius: 6
                            }}
                          >
                            <Trash2 size={12} color="#f87171" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span />
                    )}
                  </div>
                )
              })}
              {canManage && (
                <button
                  onClick={() => onAddLine(group.group, sg.subGroup)}
                  style={{
                    display: 'block',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent-primary)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '4px 0 4px 8px'
                  }}
                >
                  + {t('budget.table.addLine')}
                </button>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  gap: 8,
                  padding: '6px 0',
                  paddingLeft: 8
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('budget.table.subtotal')}
                </span>
                <span style={{ ...amountStyle, fontWeight: 700 }}>
                  {formatCurrency(sg.totalBudgeted)}
                </span>
                <span style={{ ...amountStyle, fontWeight: 700 }}>
                  {formatCurrency(sg.totalActual)}
                </span>
                <span
                  style={{
                    ...amountStyle,
                    fontWeight: 700,
                    color: varianceColor(sg.totalActual - sg.totalBudgeted, section)
                  }}
                >
                  {formatCurrency(sg.totalActual - sg.totalBudgeted)}
                </span>
                <span />
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 8,
              padding: '8px 0',
              marginTop: 2,
              borderTop: '1px solid var(--border-default)',
              borderBottom: '2px double var(--border-default)'
            }}
          >
            <span style={groupTotalStyle}>
              {groupTotalLabel(section, group.group) ??
                t('budget.table.groupTotal', { group: group.group })}
            </span>
            <span style={{ ...amountStyle, fontWeight: 700 }}>
              {formatCurrency(group.totalBudgeted)}
            </span>
            <span style={{ ...amountStyle, fontWeight: 700 }}>
              {formatCurrency(group.totalActual)}
            </span>
            <span
              style={{
                ...amountStyle,
                fontWeight: 700,
                color: varianceColor(group.totalActual - group.totalBudgeted, section)
              }}
            >
              {formatCurrency(group.totalActual - group.totalBudgeted)}
            </span>
            <span />
          </div>
        </div>
      ))}
    </div>
  )
}
