import { motion } from 'framer-motion'
import { Receipt, Landmark, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency } from '@/shared/lib/utils'
import { AnnouncementsHighlight } from '../components/AnnouncementsHighlight'
import { BirthdaysHighlight } from '../components/BirthdaysHighlight'
import { BudgetHighlight } from '../components/BudgetHighlight'
import { StatCard, type StatCardProps } from '../components/StatCard'
import { ExpenseCategoryChart } from '../components/ExpenseCategoryChart'
import { QuickOverviewRow } from '../components/QuickOverviewRow'
import { RecentActivityCard } from '../components/RecentActivityCard'
import { useDashboard } from '../hooks/useDashboard'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Dashboard() {
  const { t } = useTranslation()
  const { toast, loading, totals, bankAccountBalances, totalBalance } = useDashboard()

  const stats: StatCardProps[] = [
    {
      title: t('dashboard.statCashBalance'),
      value: formatCurrency(totalBalance),
      note: t('dashboard.cashBalanceNote', { count: bankAccountBalances.length }),
      icon: <Landmark size={20} />,
      color: '#0ea5e9'
    },
    {
      title: t('dashboard.statExpenses'),
      value: formatCurrency(totals.expenseTotal),
      icon: <Receipt size={20} />,
      color: '#ef4444'
    }
  ]

  return (
    <motion.div
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}
          >
            {t('dashboard.title')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={() => toast.success(t('dashboard.refreshToast'))}
          >
            {t('dashboard.refreshButton')}
          </Button>
        </div>
      </div>

      {/* Birthdays + Announcements — both kept prominent right under the header, side by
          side on wide windows and stacked (birthdays first) once the window narrows past
          fitting both at a readable width. auto-fit collapses to one column cleanly when
          either highlight has nothing to show (each renders null when empty). */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        <BirthdaysHighlight />
        <AnnouncementsHighlight />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
            ))
          : stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
      </div>

      {/* Council Budget — income/expense vs. actual-to-date at a glance */}
      <BudgetHighlight />

      {/* Bank Balances breakdown */}
      {!loading && bankAccountBalances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          style={{ marginBottom: '20px' }}
        >
          <Card
            header={
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('dashboard.bankBalancesTitle')}
              </h2>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14
              }}
            >
              {bankAccountBalances.map((b) => (
                <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.account}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(b.closing)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Expenses by category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        style={{ marginBottom: '20px' }}
      >
        <Card
          header={
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('dashboard.expensesByCategoryTitle')}
            </h2>
          }
        >
          {loading ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
          ) : (
            <ExpenseCategoryChart data={totals.topCategories} />
          )}
        </Card>
      </motion.div>

      <QuickOverviewRow loading={loading} />
      <RecentActivityCard loading={loading} />
    </motion.div>
  )
}
