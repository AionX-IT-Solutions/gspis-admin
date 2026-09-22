import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useDailyCollectionsStore } from '../store/dailyCollections.store'
import { IncomeStatementTab } from '../components/IncomeStatementTab'
import { DailyCollectionsTab } from '../components/DailyCollectionsTab'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Reports() {
  const { t } = useTranslation()
  const periodLabel = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  const hydrateVouchers = useVouchersStore((s) => s.hydrate)
  const hydratePOS = usePOSStore((s) => s.hydrate)
  const hydrateRentals = useRentalsStore((s) => s.hydrate)
  const hydrateTroops = useTroopsStore((s) => s.hydrate)
  const hydrateDailyCollections = useDailyCollectionsStore((s) => s.hydrate)

  async function handleRefresh() {
    await Promise.all([
      hydrateVouchers(true),
      hydratePOS(true),
      hydrateRentals(true),
      hydrateTroops(true),
      hydrateDailyCollections(true)
    ])
  }

  return (
    <motion.div
      key="reports"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('reports.title')}
        icon={<BarChart3 size={18} />}
        actions={<RefreshButton onRefresh={handleRefresh} />}
      />

      <Tabs defaultValue="pnl">
        <div style={{ marginBottom: 20 }}>
          <TabsList>
            <TabsTrigger value="pnl">{t('reports.tabs.pnl')}</TabsTrigger>
            <TabsTrigger value="daily-collections">
              {t('reports.tabs.dailyCollections')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pnl">
          <IncomeStatementTab periodLabel={periodLabel} />
        </TabsContent>

        <TabsContent value="daily-collections">
          <DailyCollectionsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
