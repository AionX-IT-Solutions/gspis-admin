import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getExpenseVouchers } from '@/features/vouchers/lib/expenseVouchers'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'

export interface RecentActivityRow {
  kind: 'expense'
  date: string
  data: Voucher
}

export function useRecentActivityCard() {
  const navigate = useNavigate()
  const vouchers = useVouchersStore((s) => s.vouchers)

  const recentActivity: RecentActivityRow[] = useMemo(() => {
    const expenses = getExpenseVouchers(vouchers)
    const rows: RecentActivityRow[] = expenses.map((e) => ({
      kind: 'expense' as const,
      date: e.date,
      data: e
    }))
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
  }, [vouchers])

  return { navigate, recentActivity }
}
