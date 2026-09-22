import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useScrdComputations } from '../hooks/useScrdComputations'
import { JournalTab } from '../components/JournalTab'
import { SummaryTab } from '../components/SummaryTab'
import { useCashReceiptsStore } from '../store/cashReceipts.store'
import { useBanksStore, bankDisplayName } from '../store/banks.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useDailyCollectionsStore } from '@/features/accounting/store/dailyCollections.store'
import {
  exportCashReceiptsJournal,
  exportCashReceiptsJournalPdf,
  exportCashReceiptsJournalDocx,
  buildCashReceiptsJournalPdfDoc,
  exportCashDisbursementJournal,
  exportCashDisbursementJournalPdf,
  exportCashDisbursementJournalDocx,
  buildCashDisbursementJournalPdfDoc
} from '../lib/scrdExcelExport'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function SCRD() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const data = useScrdComputations()
  const hydrateCashReceipts = useCashReceiptsStore((s) => s.hydrate)
  const hydrateBanks = useBanksStore((s) => s.hydrate)
  const hydrateVouchers = useVouchersStore((s) => s.hydrate)
  const hydratePOS = usePOSStore((s) => s.hydrate)
  const hydrateRentals = useRentalsStore((s) => s.hydrate)
  const hydrateDailyCollections = useDailyCollectionsStore((s) => s.hydrate)

  const bankAccountNames = data.banks.map(bankDisplayName)

  async function handleRefresh() {
    await Promise.all([
      hydrateCashReceipts(true),
      hydrateBanks(true),
      hydrateVouchers(true),
      hydratePOS(true),
      hydrateRentals(true),
      hydrateDailyCollections(true)
    ])
  }

  return (
    <motion.div
      key="scrd"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('scrd.title')}
        subtitle={data.monthLabel}
        icon={<FileText size={18} />}
        actions={<RefreshButton onRefresh={handleRefresh} />}
      />

      <Tabs defaultValue="receipts">
        <TabsList>
          <TabsTrigger value="receipts">{t('scrd.tabs.receipts')}</TabsTrigger>
          <TabsTrigger value="disbursements">{t('scrd.tabs.disbursements')}</TabsTrigger>
          <TabsTrigger value="summary">{t('scrd.tabs.summary')}</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="pt-4">
          <JournalTab
            rows={data.receiptRows}
            loading={loading}
            emptyMessage={t('scrd.emptyReceipts')}
            monthLabel={data.monthLabel}
            onView={(rows, monthLabel) =>
              buildCashReceiptsJournalPdfDoc(rows, monthLabel, bankAccountNames)
            }
            onExportExcel={(rows, monthLabel) =>
              exportCashReceiptsJournal(rows, monthLabel, bankAccountNames)
            }
            onExportPdf={(rows, monthLabel) =>
              exportCashReceiptsJournalPdf(rows, monthLabel, bankAccountNames)
            }
            onExportWord={(rows, monthLabel) =>
              exportCashReceiptsJournalDocx(rows, monthLabel, bankAccountNames)
            }
            toastKeys={{
              excel: 'scrd.toast.receiptsExcel',
              pdf: 'scrd.toast.receiptsPdf',
              word: 'scrd.toast.receiptsWord'
            }}
          />
        </TabsContent>

        <TabsContent value="disbursements" className="pt-4">
          <JournalTab
            rows={data.disbursementRows}
            loading={loading}
            emptyMessage={t('scrd.emptyDisbursements')}
            monthLabel={data.monthLabel}
            onView={(rows, monthLabel) =>
              buildCashDisbursementJournalPdfDoc(rows, monthLabel, bankAccountNames)
            }
            onExportExcel={(rows, monthLabel) =>
              exportCashDisbursementJournal(rows, monthLabel, bankAccountNames)
            }
            onExportPdf={(rows, monthLabel) =>
              exportCashDisbursementJournalPdf(rows, monthLabel, bankAccountNames)
            }
            onExportWord={(rows, monthLabel) =>
              exportCashDisbursementJournalDocx(rows, monthLabel, bankAccountNames)
            }
            toastKeys={{
              excel: 'scrd.toast.disbursementsExcel',
              pdf: 'scrd.toast.disbursementsPdf',
              word: 'scrd.toast.disbursementsWord'
            }}
          />
        </TabsContent>

        <TabsContent value="summary" className="pt-4">
          <SummaryTab {...data} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
