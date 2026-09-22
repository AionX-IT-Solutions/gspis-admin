import { motion } from 'framer-motion'
import { Check, Pencil, Plus, Printer, Receipt, Ticket, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { ExpenseSummaryModal } from '@/features/expenseSummary/components/ExpenseSummaryModal'
import { useExpenseSummaryModal } from '@/features/expenseSummary/hooks/useExpenseSummaryModal'
import { hasCashAdvance, cashAdvanceReimbursement } from '../lib/expenseVouchers'
import type { Voucher, VoucherStatus, VoucherType } from '../types/vouchers.types'
import { NewVoucherModal } from '../components/NewVoucherModal'
import { useVouchers } from '../hooks/useVouchers'
import { useVouchersStore } from '../store/vouchers.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<VoucherStatus, 'warning' | 'success' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  cancelled: 'outline'
}

const TYPE_KEY: Record<VoucherType, string> = {
  check_voucher: 'checkVoucher',
  journal_voucher: 'journalVoucher'
}

export function Vouchers() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    vouchers,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    advanceTarget,
    setAdvanceTarget,
    statusLabel,
    handleConfirmAdvance,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    handleView,
    handlePrintReceipt,
    preview,
    previewVoucher
  } = useVouchers()
  const hydrate = useVouchersStore((s) => s.hydrate)
  const expenseSummary = useExpenseSummaryModal()

  const columns: Column<Voucher>[] = [
    { key: 'voucherNumber', header: t('vouchers.table.number') },
    {
      key: 'voucherType',
      header: t('vouchers.table.type'),
      render: (r) => t(`vouchers.type.${TYPE_KEY[r.voucherType]}`)
    },
    { key: 'payee', header: t('vouchers.table.payee') },
    { key: 'particulars', header: t('vouchers.table.particulars') },
    {
      key: 'amount',
      header: t('vouchers.table.amount'),
      align: 'right',
      render: (r) => formatCurrency(r.amount)
    },
    { key: 'date', header: t('vouchers.table.date'), render: (r) => formatDate(r.date) },
    {
      key: 'status',
      header: t('vouchers.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{statusLabel(r.status)}</Badge>
    },
    {
      key: 'cashAdvanceAmount',
      header: t('vouchers.form.cashAdvanceAmount'),
      align: 'right',
      render: (r) => (r.cashAdvanceAmount !== undefined ? formatCurrency(r.cashAdvanceAmount) : '—')
    },
    {
      key: 'totalAmountSpent',
      header: t('vouchers.form.totalAmountSpent'),
      align: 'right',
      render: (r) => (r.totalAmountSpent !== undefined ? formatCurrency(r.totalAmountSpent) : '—')
    },
    {
      key: 'amountRefunded',
      header: t('vouchers.form.amountRefunded'),
      align: 'right',
      render: (r) => (r.amountRefunded ? formatCurrency(r.amountRefunded) : '—')
    },
    {
      key: 'refundOrNumber',
      header: t('vouchers.form.refundOrNumber'),
      render: (r) => r.refundOrNumber || '—'
    },
    {
      key: 'reimbursement',
      header: t('vouchers.table.reimbursement'),
      align: 'right',
      render: (r) => {
        const amount = hasCashAdvance(r) ? cashAdvanceReimbursement(r, r.totalAmountSpent ?? 0) : 0
        return amount > 0 ? formatCurrency(amount) : '—'
      }
    },
    {
      key: 'orNumber',
      header: t('vouchers.table.orNumber'),
      render: (r) => r.orNumber || '—'
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <ExportMenu
            iconOnly
            title={t('vouchers.table.exportTooltip')}
            onView={() => handleView(r)}
            onExportExcel={() => handleExportExcel(r)}
            onExportPdf={() => handleExportPdf(r)}
            onExportWord={() => handleExportWord(r)}
          />
          {(r.voucherType === 'check_voucher' || r.cashAdvanceAmount !== undefined) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => expenseSummary.open(r)}
              title={t('vouchers.table.expenseSummaryTooltip')}
            >
              <Receipt size={13} />
            </Button>
          )}
          {r.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePrintReceipt(r)}
              title={r.orNumber ? t('receipts.reprintButton') : t('receipts.printButton')}
            >
              <Printer size={13} />
            </Button>
          )}
          {canManage && r.status === 'pending' && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Check size={12} />}
              onClick={() => setAdvanceTarget(r)}
            >
              {t('vouchers.actions.approve')}
            </Button>
          )}
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="vouchers"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('vouchers.title')}
        subtitle={t('vouchers.subtitle')}
        icon={<Ticket size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('vouchers.newVoucherButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('vouchers.searchPlaceholder')}
        count={vouchers.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={vouchers}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('vouchers.table.empty')}
        />
      </Card>

      <NewVoucherModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <ConfirmDialog
        open={!!advanceTarget}
        title={t('vouchers.confirmApprove.title')}
        message={t('vouchers.confirmApprove.message', {
          number: advanceTarget?.voucherNumber ?? ''
        })}
        confirmLabel={t('vouchers.actions.approve')}
        onConfirm={handleConfirmAdvance}
        onCancel={() => setAdvanceTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('vouchers.confirmDelete.title')}
        message={t('vouchers.confirmDelete.message', { number: deleteTarget?.voucherNumber ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={previewVoucher?.voucherNumber}
        onDownloadExcel={() => previewVoucher && handleExportExcel(previewVoucher)}
        onDownloadPdf={() => previewVoucher && handleExportPdf(previewVoucher)}
        onDownloadWord={() => previewVoucher && handleExportWord(previewVoucher)}
      />

      <ExpenseSummaryModal
        voucher={expenseSummary.target}
        items={expenseSummary.items}
        canManage={expenseSummary.canManage}
        budgetCategory={expenseSummary.budgetCategory}
        onBudgetCategoryChange={expenseSummary.setBudgetCategory}
        onClose={expenseSummary.close}
        onAdd={expenseSummary.addItem}
        onRemove={expenseSummary.removeItem}
        onUpdate={expenseSummary.updateItem}
        onSave={expenseSummary.handleSave}
        onView={expenseSummary.handleView}
        onExportExcel={expenseSummary.handleExportExcel}
        onExportPdf={expenseSummary.handleExportPdf}
        onExportWord={expenseSummary.handleExportWord}
      />

      <DocumentPreviewModal
        open={expenseSummary.preview.open}
        onClose={expenseSummary.preview.closePreview}
        url={expenseSummary.preview.url}
        title={expenseSummary.target?.voucherNumber}
        onDownloadExcel={expenseSummary.handleExportExcel}
        onDownloadPdf={expenseSummary.handleExportPdf}
        onDownloadWord={expenseSummary.handleExportWord}
      />
    </motion.div>
  )
}
