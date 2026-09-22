import { useMemo, useState } from 'react'
import type { jsPDF } from 'jspdf'
import { Card } from '@/shared/components/ui/Card'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useTranslation } from 'react-i18next'
import type { JournalDisplayRow } from '../hooks/useScrdComputations'

interface JournalTabProps {
  rows: JournalDisplayRow[]
  loading: boolean
  emptyMessage: string
  onView: (rows: JournalDisplayRow[], monthLabel: string) => Promise<jsPDF>
  onExportExcel: (rows: JournalDisplayRow[], monthLabel: string) => void
  onExportPdf: (rows: JournalDisplayRow[], monthLabel: string) => void
  onExportWord: (rows: JournalDisplayRow[], monthLabel: string) => void
  monthLabel: string
  toastKeys: { excel: string; pdf: string; word: string }
}

export function JournalTab({
  rows,
  loading,
  emptyMessage,
  onView,
  onExportExcel,
  onExportPdf,
  onExportWord,
  monthLabel,
  toastKeys
}: JournalTabProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const [search, setSearch] = useState('')

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.particulars.toLowerCase().includes(q) ||
        (r.reference?.toLowerCase().includes(q) ?? false) ||
        r.category.toLowerCase().includes(q)
    )
  }, [rows, search])

  const journalColumns: Column<JournalDisplayRow>[] = [
    { key: 'date', header: t('scrd.columns.date'), render: (r) => formatDate(r.date) },
    { key: 'name', header: t('scrd.columns.payorPayee') },
    { key: 'particulars', header: t('scrd.columns.particulars') },
    { key: 'reference', header: t('scrd.columns.reference'), render: (r) => r.reference ?? '—' },
    { key: 'category', header: t('scrd.columns.category') },
    {
      key: 'receiptType',
      header: t('scrd.columns.receiptType'),
      render: (r) => r.receiptType ?? '—'
    },
    { key: 'bankAccount', header: t('scrd.columns.bankAccount') },
    {
      key: 'amount',
      header: t('scrd.columns.amount'),
      align: 'right',
      render: (r) => formatCurrency(r.amount)
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(journalColumns)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <ExportMenu
          label={t('scrd.exportJournalLabel')}
          onView={async () => preview.openPreview(await onView(rows, monthLabel))}
          onExportExcel={() => {
            onExportExcel(rows, monthLabel)
            toast.success(t(toastKeys.excel))
          }}
          onExportPdf={() => {
            onExportPdf(rows, monthLabel)
            toast.success(t(toastKeys.pdf))
          }}
          onExportWord={() => {
            onExportWord(rows, monthLabel)
            toast.success(t(toastKeys.word))
          }}
        />
      </div>
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('scrd.journalSearchPlaceholder')}
        count={filteredRows.length}
        columnsSlot={
          <ColumnsButton
            columns={journalColumns}
            hiddenColumns={hiddenColumns}
            onToggle={toggleColumn}
          />
        }
      />
      <Card padding="0px">
        <DataTable
          columns={journalColumns}
          data={filteredRows}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      </Card>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('scrd.exportJournalLabel')}
        onDownloadExcel={() => {
          onExportExcel(rows, monthLabel)
          toast.success(t(toastKeys.excel))
        }}
        onDownloadPdf={() => {
          onExportPdf(rows, monthLabel)
          toast.success(t(toastKeys.pdf))
        }}
        onDownloadWord={() => {
          onExportWord(rows, monthLabel)
          toast.success(t(toastKeys.word))
        }}
      />
    </>
  )
}
