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

  // Display-only grouping: rows sharing the same non-empty reference number are the same
  // physical receipt (e.g. a Service Invoice covering both Troop Fee and Thinking Day Fund in
  // one remittance) — "isang resibo, isang entry" (one receipt, one journal line), same as the
  // Council's real books. This is deliberately scoped to just the Journal table/export, not the
  // underlying `rows` — SCRD Summary's and Council Budget's per-category totals still need
  // Troop Fees and Thinking Day Fund counted separately, so useScrdComputations.ts's own
  // receiptRows (which those read from) stay ungrouped.
  const groupedRows = useMemo(() => {
    // A Map preserves insertion order, so iterating groups.values() below naturally keeps
    // first-seen order without needing a separate index.
    const groups = new Map<string, JournalDisplayRow>()
    for (const r of rows) {
      // No reference number to group by — every un-referenced row stands on its own, keyed by
      // its own id so it never collides with another un-referenced row.
      const key = r.reference || r.id
      const existing = groups.get(key)
      if (existing) {
        existing.amount += r.amount
        if (!existing.category.split(', ').includes(r.category)) {
          existing.category = `${existing.category}, ${r.category}`
        }
      } else {
        groups.set(key, { ...r })
      }
    }
    return [...groups.values()]
  }, [rows])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groupedRows
    return groupedRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.particulars.toLowerCase().includes(q) ||
        (r.reference?.toLowerCase().includes(q) ?? false) ||
        r.category.toLowerCase().includes(q)
    )
  }, [groupedRows, search])

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
          onView={async () => preview.openPreview(await onView(groupedRows, monthLabel))}
          onExportExcel={() => {
            onExportExcel(groupedRows, monthLabel)
            toast.success(t(toastKeys.excel))
          }}
          onExportPdf={() => {
            onExportPdf(groupedRows, monthLabel)
            toast.success(t(toastKeys.pdf))
          }}
          onExportWord={() => {
            onExportWord(groupedRows, monthLabel)
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
          onExportExcel(groupedRows, monthLabel)
          toast.success(t(toastKeys.excel))
        }}
        onDownloadPdf={() => {
          onExportPdf(groupedRows, monthLabel)
          toast.success(t(toastKeys.pdf))
        }}
        onDownloadWord={() => {
          onExportWord(groupedRows, monthLabel)
          toast.success(t(toastKeys.word))
        }}
      />
    </>
  )
}
