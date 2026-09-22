import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { useHRStore } from '@/features/hr/store/hr.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { getReceiptRowsFromVouchers } from '@/features/vouchers/lib/receiptVouchers'
import { stripCategoryNumbering } from '@/features/vouchers/lib/expenseVouchers'
import { useBudgetStore, type BudgetCategoryEdit } from '../store/budget.store'
import { useBudgetSourceMappingsStore } from '../store/budgetSourceMappings.store'
import { groupCategories, sectionTotals } from '../lib/budgetCalculations'
import { computeBudgetAutoActuals } from '../lib/budgetAutoActuals'
import type { BudgetSourceRule } from '../types/budgetSourceMapping.types'
import {
  buildBudgetPdfDoc,
  exportBudgetDocx,
  exportBudgetExcel,
  exportBudgetPdf,
  type BudgetReportData
} from '../lib/budgetReportExport'
import type { BudgetCategory, BudgetSection } from '../types/budget.types'
import { nextFiscalYearLabel } from '@/shared/lib/fiscalYear'

export function useBudget() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const preview = useDocumentPreview()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:budget')
  const allCategories = useBudgetStore((s) => s.categories)
  const updateCategory = useBudgetStore((s) => s.updateCategory)
  const addCategoryAction = useBudgetStore((s) => s.addCategory)
  const deleteCategoryAction = useBudgetStore((s) => s.deleteCategory)
  const createFiscalYearAction = useBudgetStore((s) => s.createFiscalYear)
  const deleteFiscalYearAction = useBudgetStore((s) => s.deleteFiscalYear)

  const sales = usePOSStore((s) => s.sales)
  const bookings = useRentalsStore((s) => s.bookings)
  const spaces = useRentalsStore((s) => s.spaces)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const payroll = useHRStore((s) => s.payroll)
  const cashReceipts = useMemo(() => getReceiptRowsFromVouchers(vouchers), [vouchers])
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const sourceMappings = useBudgetSourceMappingsStore((s) => s.mappings)
  const getSourceMapping = useBudgetSourceMappingsStore((s) => s.getMapping)
  const setSourceMapping = useBudgetSourceMappingsStore((s) => s.setMapping)

  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BudgetCategory | null>(null)
  const [deleteYearTarget, setDeleteYearTarget] = useState<string | null>(null)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('')
  // `null` context = the page-level "Add Line" button (everything editable); a set
  // context = the per-subgroup "+ Add Line" action (section/group/subGroup locked to
  // that row's bucket). `showAddLine` is separate so the modal can close (hiding its
  // fields) without losing the last-used context mid-animation.
  const [showAddLine, setShowAddLine] = useState(false)
  const [addLineContext, setAddLineContext] = useState<{
    section: BudgetSection
    group: string
    subGroup: string
  } | null>(null)

  const availableFiscalYears = useMemo(
    () => [...new Set(allCategories.map((c) => c.fiscalYear))].sort(),
    [allCategories]
  )
  // Falls back to the latest known year until the user picks a different one, and
  // recovers automatically if the selected year's data ever disappears.
  const fiscalYear = availableFiscalYears.includes(selectedFiscalYear)
    ? selectedFiscalYear
    : (availableFiscalYears.at(-1) ?? '')

  const categories = useMemo(
    () => allCategories.filter((c) => c.fiscalYear === fiscalYear),
    [allCategories, fiscalYear]
  )

  const incomeGroups = useMemo(() => groupCategories(categories, 'income'), [categories])
  const expenseGroups = useMemo(() => groupCategories(categories, 'expense'), [categories])
  const incomeTotals = useMemo(() => sectionTotals(categories, 'income'), [categories])
  const expenseTotals = useMemo(() => sectionTotals(categories, 'expense'), [categories])
  const netBudgeted = incomeTotals.totalBudgeted - expenseTotals.totalBudgeted
  const netActual = incomeTotals.totalActual - expenseTotals.totalActual

  // Suggestion lists for the Add Line modal's Group/SubGroup fields — existing labels
  // for this fiscal year, so a typo doesn't silently start a stray duplicate bucket.
  const groupsBySection = useMemo<Record<BudgetSection, string[]>>(
    () => ({
      income: [...new Set(categories.filter((c) => c.section === 'income').map((c) => c.group))],
      expense: [...new Set(categories.filter((c) => c.section === 'expense').map((c) => c.group))]
    }),
    [categories]
  )
  const subGroupsByGroup = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const c of categories) {
      if (!c.subGroup) continue
      map.set(c.group, [...new Set([...(map.get(c.group) ?? []), c.subGroup])])
    }
    return map
  }, [categories])

  // Suggestions for an expense line's configured 'voucher' source rule — this fiscal year's
  // own expense line names, the same suggestion list NewVoucherModal already offers when
  // someone types a Check Voucher's GL Account, so a rule usually just points at one of these
  // rather than needing free text for the common case.
  const expenseVoucherCategorySuggestions = useMemo(
    () =>
      categories.filter((c) => c.section === 'expense').map((c) => stripCategoryNumbering(c.name)),
    [categories]
  )

  // Reference figures pulled live from POS/Rentals/Vouchers/Payroll/Troop payments for
  // whichever budget lines have a confident real-data match — offered in the Edit modal as a
  // one-click fill, never silently overwriting the council-approved manual actuals.
  const autoActualsByCategory = useMemo(
    () =>
      computeBudgetAutoActuals(categories, fiscalYear, {
        sales,
        bookings,
        spaces,
        vouchers,
        payroll,
        cashReceipts,
        scoutMembers,
        sourceMappings
      }),
    [
      categories,
      fiscalYear,
      sales,
      bookings,
      spaces,
      vouchers,
      payroll,
      cashReceipts,
      scoutMembers,
      sourceMappings
    ]
  )

  function handleSaveCategory(id: string, edit: BudgetCategoryEdit) {
    if (!canManage) return
    updateCategory(id, edit)
    toast.success(t('budget.toast.updated'))
    setEditingCategory(null)
  }

  // A line's source rules are a separate record (see budgetSourceMappings.store.ts), keyed by
  // category name rather than id, so a Save here is independent of handleSaveCategory above —
  // both happen from the same modal Save click, but touch different collections.
  function handleSaveSourceMapping(categoryName: string, rules: BudgetSourceRule[]) {
    if (!canManage) return
    setSourceMapping(categoryName, rules)
  }

  function openAddLine(
    context: { section: BudgetSection; group: string; subGroup: string } | null
  ) {
    setAddLineContext(context)
    setShowAddLine(true)
  }

  function handleAddLine(input: {
    section: BudgetSection
    group: string
    subGroup: string
    name: string
    budgetedAmount: number
  }) {
    if (!canManage) return
    if (!input.name.trim() || !input.group.trim() || input.budgetedAmount <= 0) {
      toast.error(t('budget.toast.addLineMissingFields'))
      return
    }
    addCategoryAction({ ...input, fiscalYear })
    toast.success(t('budget.toast.categoryAdded'))
    setShowAddLine(false)
  }

  function handleConfirmDeleteCategory() {
    if (!deleteTarget || !canManage) return
    deleteCategoryAction(deleteTarget.id)
    toast.success(t('budget.toast.categoryDeleted', { name: deleteTarget.name }))
    setDeleteTarget(null)
  }

  function handleConfirmDeleteFiscalYear() {
    if (!deleteYearTarget || !canManage) return
    deleteFiscalYearAction(deleteYearTarget)
    toast.success(t('budget.toast.fiscalYearDeleted', { year: deleteYearTarget }))
    setDeleteYearTarget(null)
  }

  function handleCreateFiscalYear(newFiscalYear: string) {
    if (!canManage) return
    const trimmed = newFiscalYear.trim()
    if (!trimmed) {
      toast.error(t('budget.toast.fiscalYearRequired'))
      return
    }
    const result = createFiscalYearAction(trimmed)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    setSelectedFiscalYear(trimmed)
    toast.success(t('budget.toast.fiscalYearCreated', { year: trimmed }))
  }

  const reportData: BudgetReportData = {
    fiscalYear,
    incomeGroups,
    expenseGroups,
    incomeTotals,
    expenseTotals,
    netBudgeted,
    netActual
  }

  async function handleView() {
    preview.openPreview(await buildBudgetPdfDoc(reportData))
  }

  function handleExportExcel() {
    exportBudgetExcel(reportData)
    toast.success(t('budget.toast.excel'))
  }

  function handleExportPdf() {
    exportBudgetPdf(reportData)
    toast.success(t('budget.toast.pdf'))
  }

  function handleExportWord() {
    exportBudgetDocx(reportData)
    toast.success(t('budget.toast.word'))
  }

  return {
    loading,
    canManage,
    fiscalYear,
    setSelectedFiscalYear,
    availableFiscalYears,
    suggestedNextFiscalYear: nextFiscalYearLabel(availableFiscalYears.at(-1) ?? ''),
    handleCreateFiscalYear,
    incomeGroups,
    expenseGroups,
    incomeTotals,
    expenseTotals,
    netBudgeted,
    netActual,
    autoActualsByCategory,
    editingCategory,
    setEditingCategory,
    handleSaveCategory,
    getSourceMapping,
    handleSaveSourceMapping,
    expenseVoucherCategorySuggestions,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteCategory,
    deleteYearTarget,
    setDeleteYearTarget,
    handleConfirmDeleteFiscalYear,
    showAddLine,
    setShowAddLine,
    addLineContext,
    openAddLine,
    handleAddLine,
    groupsBySection,
    subGroupsByGroup,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}
