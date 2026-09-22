import { useMemo } from 'react'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getExpenseVouchers, voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import { useBankBalances } from '@/features/scrd/hooks/useBankBalances'
import { useToast } from '@/app/hooks/useToast'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'

export function useDashboard() {
  const toast = useToast()
  const loading = useSkeletonLoading()
  const vouchers = useVouchersStore((s) => s.vouchers)
  const expenses = useMemo(() => getExpenseVouchers(vouchers), [vouchers])
  const { banks, bankAccountBalances, totalBalance } = useBankBalances()

  const totals = useMemo(() => {
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0)

    const expenseByCategory = new Map<string, number>()
    expenses.forEach((e) => {
      const category = voucherCategory(e)
      expenseByCategory.set(category, (expenseByCategory.get(category) ?? 0) + e.amount)
    })
    const topCategories = [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      expenseTotal,
      topCategories
    }
  }, [expenses])

  return {
    toast,
    loading,
    totals,
    banks,
    bankAccountBalances,
    totalBalance
  }
}
