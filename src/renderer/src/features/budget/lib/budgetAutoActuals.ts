import type { Sale } from '@/features/pos/types/pos.types'
import type { RentalBooking, RentalSpace } from '@/features/rentals/types/rentals.types'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import type { PayrollEntry } from '@/features/hr/types/hr.types'
import type { CashReceipt } from '@/features/scrd/types/cashReceipts.types'
import type { ScoutMember } from '@/features/troops/types/troop.types'
import {
  getExpenseVouchers,
  voucherCategory,
  hasCashAdvance,
  cashAdvanceLiquidationExpenseLines,
  linkedBudgetCategoryName
} from '@/features/vouchers/lib/expenseVouchers'
import { fiscalMonthIndex } from '@/shared/lib/fiscalYear'
import type { BudgetCategory } from '../types/budget.types'
import type { BudgetSourceMapping } from '../types/budgetSourceMapping.types'

function emptyMonths(): number[] {
  return Array(12).fill(0)
}

/** Strips the workbook's leading ordinal ("1. ", "23. ") and normalizes case/whitespace so a
 *  budget category name can be compared against a voucher's free-text GL account — also the
 *  category identity a user-configured BudgetSourceMapping is keyed on (see
 *  budgetSourceMappings.store.ts), so a mapping survives a category being re-seeded each
 *  fiscal year the same way these built-in rules always have. */
export function normalizeCategoryName(name: string): string {
  return name
    .replace(/^\d+[.)]?\s*/, '')
    .toLowerCase()
    .trim()
}

// The field picker a user-configured 'payroll' rule offers (EditBudgetCategoryModal) — a
// personnel-service expense line maps 1:1 onto one PayrollEntry field, since payroll
// deductions aren't recorded as vouchers.
export const PAYROLL_FIELD_OPTIONS: {
  field: keyof PayrollEntry
  category: string
  label: string
}[] = [
  { field: 'basicSalary', category: 'salaries', label: 'Salaries' },
  { field: 'sss', category: 'sss contributions', label: 'SSS Contributions' },
  { field: 'philhealth', category: 'philhealth contributions', label: 'PhilHealth Contributions' },
  { field: 'pagibig', category: 'pag-ibig contributions', label: 'Pag-IBIG Contributions' },
  { field: 'thirteenthMonthPay', category: '13th month pay', label: '13th Month Pay' },
  { field: 'cashGift', category: 'cash gift', label: 'Cash Gift' },
  { field: 'cola', category: 'cost of living allowance', label: 'Cost of Living Allowance' },
  {
    field: 'representation',
    category: 'representation of executive',
    label: 'Representation of Executive'
  }
]

interface AutoActualSources {
  sales: Sale[]
  bookings: RentalBooking[]
  spaces: RentalSpace[]
  vouchers: Voucher[]
  payroll: PayrollEntry[]
  cashReceipts: CashReceipt[]
  scoutMembers: ScoutMember[]
  /** User-configured overrides (see EditBudgetCategoryModal's "Source" section /
   *  budgetSourceMappings.store.ts) — a category with a non-empty mapping here is computed
   *  purely from its rules, taking over from the built-in defaults below entirely rather than
   *  merging with them. Covers both income and expense lines. */
  sourceMappings: BudgetSourceMapping[]
}

/** `budget.autoSource.userConfigured` in the locale files — every auto-actual now comes from
 *  an explicit user-configured Source mapping (see EditBudgetCategoryModal), so this is the
 *  only value ever produced; kept as its own type (rather than a plain boolean) so a future
 *  additional source kind doesn't require reshaping every caller again. */
export type AutoActualSourceKey = 'userConfigured'

export interface AutoActualEntry {
  months: number[]
  sourceKey: AutoActualSourceKey
}

/** For each budget category the council has explicitly linked a Source to (see
 *  EditBudgetCategoryModal's "Source" section / budgetSourceMappings.store.ts), sums that
 *  source into the same 12-slot Jul-Jun shape as `BudgetCategory.monthlyActuals` — purely a
 *  reference figure the Edit modal can offer to fill in; never overwrites the
 *  council-approved manual actuals on its own. There is no built-in guessing — a category
 *  with no configured Source is simply absent from the returned map and stays entirely
 *  manual. */
export function computeBudgetAutoActuals(
  categories: BudgetCategory[],
  fiscalYear: string,
  sources: AutoActualSources
): Map<string, AutoActualEntry> {
  const result = new Map<string, AutoActualEntry>()
  if (!fiscalYear) return result

  const mappingsByName = new Map(sources.sourceMappings.map((m) => [m.categoryName, m]))
  const expenseVouchers = getExpenseVouchers(sources.vouchers)
  // Journal Vouchers liquidating a Cash Advance (see deriveCashAdvanceLiquidation) — their
  // itemized debit lines are real Council Budget expense spending too, just recorded on a
  // JV instead of a Check Voucher, so they need their own matching pass below (a single
  // liquidation JV can itemize spending across several different budget lines at once,
  // unlike a Check Voucher's single GL account).
  const liquidationVouchers = sources.vouchers.filter(
    (v) => v.voucherType === 'journal_voucher' && v.status === 'approved' && hasCashAdvance(v)
  )

  for (const category of categories) {
    if (category.fiscalYear !== fiscalYear) continue
    const normalized = normalizeCategoryName(category.name)
    const months = emptyMonths()
    let sourceKey: AutoActualSourceKey | null = null

    if (category.section === 'income') {
      // No built-in guessing on the income side — every income line stays fully manual
      // unless the council explicitly links a source for it (see EditBudgetCategoryModal's
      // "Source" section / budgetSourceMappings.store.ts).
      const userMapping = mappingsByName.get(normalized)
      if (userMapping && userMapping.rules.length > 0) {
        sourceKey = 'userConfigured'
        for (const rule of userMapping.rules) {
          // Independent `if`s, not `else if` — a rule can combine more than one source kind
          // at once (see BudgetSourceRule.sourceTypes), so every kind it lists must run.
          if (rule.sourceTypes.includes('voucher')) {
            const wanted = rule.voucherCategories ?? []
            for (const r of sources.cashReceipts) {
              if (!wanted.includes(r.category)) continue
              const idx = fiscalMonthIndex(r.date, fiscalYear)
              if (idx !== null) months[idx] += r.amount
            }
          }
          if (rule.sourceTypes.includes('troopPayment')) {
            const wanted = rule.troopPaymentCategories ?? []
            for (const member of sources.scoutMembers) {
              for (const payment of member.payments ?? []) {
                if (!wanted.includes(payment.category)) continue
                const idx = fiscalMonthIndex(payment.date, fiscalYear)
                if (idx !== null) months[idx] += payment.amount
              }
            }
          }
          if (rule.sourceTypes.includes('pos')) {
            for (const s of sources.sales) {
              if (s.voided) continue
              const idx = fiscalMonthIndex(s.createdAt, fiscalYear)
              if (idx !== null) months[idx] += s.totalAmount
            }
          }
          if (rule.sourceTypes.includes('rental')) {
            for (const b of sources.bookings) {
              if (b.status !== 'confirmed' && b.status !== 'completed') continue
              if (rule.rentalSpaceCategory) {
                const space = sources.spaces.find((sp) => sp.id === b.rentalSpaceId)
                if (space?.category !== rule.rentalSpaceCategory) continue
              }
              const idx = fiscalMonthIndex(b.bookingDate, fiscalYear)
              if (idx !== null) months[idx] += b.amountPaid ?? b.totalAmount
            }
          }
        }
      }
    } else {
      // No built-in guessing on the expense side either — every expense line stays fully
      // manual unless the council explicitly links a source for it (voucher GL account
      // text(s) or a payroll field — see EditBudgetCategoryModal's "Source" section /
      // budgetSourceMappings.store.ts).
      const userMapping = mappingsByName.get(normalized)
      if (userMapping && userMapping.rules.length > 0) {
        sourceKey = 'userConfigured'
        for (const rule of userMapping.rules) {
          // Independent `if`s, not `else if` — a rule can combine more than one source kind
          // at once (see BudgetSourceRule.sourceTypes), so every kind it lists must run.
          if (rule.sourceTypes.includes('voucher')) {
            // Unlike the income side's CashReceipt.category (already a clean canonical
            // string), an expense voucher's GL account text can carry the workbook's
            // ordinal/compound-item suffixes a cash-advance liquidation line adds — normalize
            // both sides before comparing.
            const wanted = (rule.voucherCategories ?? []).map((c) => normalizeCategoryName(c))
            for (const v of expenseVouchers) {
              if (
                !wanted.includes(
                  normalizeCategoryName(linkedBudgetCategoryName(voucherCategory(v)))
                )
              ) {
                continue
              }
              const idx = fiscalMonthIndex(v.date, fiscalYear)
              if (idx !== null) months[idx] += v.amount
            }
            for (const v of liquidationVouchers) {
              for (const line of cashAdvanceLiquidationExpenseLines(v)) {
                if (
                  !wanted.includes(normalizeCategoryName(linkedBudgetCategoryName(line.account)))
                ) {
                  continue
                }
                const idx = fiscalMonthIndex(v.date, fiscalYear)
                if (idx !== null) months[idx] += line.debit
              }
            }
          }
          if (rule.sourceTypes.includes('payroll') && rule.payrollField) {
            for (const p of sources.payroll) {
              if (p.status !== 'paid') continue
              const value = p[rule.payrollField]
              if (typeof value !== 'number') continue
              const idx = fiscalMonthIndex(p.periodEnd, fiscalYear)
              if (idx !== null) months[idx] += value
            }
          }
        }
      }
    }

    if (sourceKey) result.set(category.id, { months, sourceKey })
  }

  return result
}
