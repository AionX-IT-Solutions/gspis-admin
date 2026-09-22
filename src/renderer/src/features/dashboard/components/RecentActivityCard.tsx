import { motion } from 'framer-motion'
import { ArrowRight, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import { useRecentActivityCard } from '../hooks/useRecentActivityCard'

interface RecentActivityCardProps {
  loading?: boolean
}

export function RecentActivityCard({ loading }: RecentActivityCardProps) {
  const { t } = useTranslation()
  const { navigate, recentActivity } = useRecentActivityCard()

  if (loading) {
    return (
      <Card
        header={
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('dashboard.recentActivityTitle')}
          </h2>
        }
        padding="16px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 48, borderRadius: 8, opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.65 }}
    >
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('dashboard.recentActivityTitle')}
            </h2>
            <button
              onClick={() => navigate('/vouchers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--accent-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t('dashboard.viewAll')} <ArrowRight size={12} />
            </button>
          </div>
        }
        padding="16px"
      >
        <div>
          {recentActivity.map((row, i) => {
            const title = `${voucherCategory(row.data)} · ${row.data.payee}`
            return (
              <motion.div
                key={`${row.kind}-${row.data.id}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom:
                    i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                    flexShrink: 0
                  }}
                >
                  <Receipt size={14} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {title}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {formatDate(row.date)}
                  </span>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                  -{formatCurrency(row.data.amount)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}
