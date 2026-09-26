import type { RentalSpaceCategory } from '@/features/rentals/types/rentals.types'
import type { PayrollEntry } from '@/features/hr/types/hr.types'

// Where a Council Budget line's live "actual" figure is pulled from — user-configured per
// line via EditBudgetCategoryModal's "Source" section, replacing budgetAutoActuals.ts's
// built-in default rule for that line once at least one rule is saved (an empty rule list
// reverts the line to that built-in default rather than to zero). Income lines can use
// 'voucher' (Cash Receipt category — every registration module's fee, including a Troop's own
// per-member roster payments, is a CashReceiptCategory checkbox under this one source type; see
// registrationCashReceipts.ts), 'pos', or 'rental'; expense lines can use 'voucher' (matched
// against a voucher's GL account text instead) or 'payroll'.
export type BudgetSourceType = 'voucher' | 'pos' | 'rental' | 'payroll'

export interface BudgetSourceRule {
  id: string
  /** Which kind(s) of source this rule pulls from — a rule can combine more than one at once
   *  (e.g. Point of Sale + Rentals both counted together) instead of needing a separate rule
   *  per kind; each kind's own matching criteria below (voucherCategories, etc.) applies
   *  independently and simultaneously. Empty only ever appears in a rule still being
   *  configured in EditBudgetCategoryModal — the modal filters these out on Save so a real
   *  BudgetSourceMapping document never actually carries one. */
  sourceTypes: BudgetSourceType[]
  /** 'voucher' only. On an income line: one or more Cash Receipt categories (checkboxes off
   *  the closed CashReceiptCategory list) whose credited amount counts toward this line. On an
   *  expense line: one or more GL account names (free text, same as a voucher's Account Title)
   *  whose debited amount counts toward this line — lets a line aggregate vouchers whose
   *  account text doesn't already match the line's own name verbatim, the same way the
   *  built-in default (exact-name match) already handles the common case. */
  voucherCategories?: string[]
  /** 'rental' only (income) — which kind of rental space counts; omitted means every
   *  confirmed/completed booking regardless of space category. */
  rentalSpaceCategory?: RentalSpaceCategory
  /** 'payroll' only (expense) — which paid-payroll field counts toward this line (see
   *  PAYROLL_FIELD_OPTIONS in budgetAutoActuals.ts). */
  payrollField?: keyof PayrollEntry
}

export interface BudgetSourceMapping {
  /** Sanitized Firestore doc id — see mappingDocId in budgetSourceMappings.store.ts. */
  id: string
  /** The normalized budget category name this mapping applies to (see normalizeCategoryName
   *  in budgetAutoActuals.ts) — the same category identity auto-actuals already keys on, so a
   *  mapping survives a budget category being re-seeded each fiscal year. */
  categoryName: string
  rules: BudgetSourceRule[]
  updatedAt: string
  updatedBy: string
}
