import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { RECEIPT_KIND_LABELS, type ReceiptRecord } from '@/shared/types/receipt.types'
import { useVouchersStore } from '../store/vouchers.store'
import {
  exportDisbursementVoucher,
  exportDisbursementVoucherPdf,
  exportDisbursementVoucherDocx,
  buildDisbursementVoucherPdfDoc,
  exportJournalVoucher,
  exportJournalVoucherPdf,
  exportJournalVoucherDocx,
  buildJournalVoucherPdfDoc
} from '../lib/voucherExcelExport'
import type { Voucher, VoucherStatus } from '../types/vouchers.types'

export function useVouchers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:vouchers')
  const printerDeviceName = usePrinterDeviceName()
  const vouchers = useVouchersStore((s) => s.vouchers)
  const decideVoucher = useVouchersStore((s) => s.decideVoucher)
  const deleteVoucher = useVouchersStore((s) => s.deleteVoucher)
  const updateVoucher = useVouchersStore((s) => s.updateVoucher)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Voucher | null>(null)
  const [advanceTarget, setAdvanceTarget] = useState<Voucher | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null)
  const preview = useDocumentPreview()
  const [previewVoucher, setPreviewVoucher] = useState<Voucher | null>(null)

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(voucher: Voucher) {
    setEditTarget(voucher)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteVoucher(deleteTarget.id)
    toast.success(t('vouchers.toast.deleted'))
    setDeleteTarget(null)
  }
  const [search, setSearch] = useState('')

  const filteredVouchers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vouchers
    return vouchers.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(q) ||
        v.payee.toLowerCase().includes(q) ||
        v.particulars.toLowerCase().includes(q)
    )
  }, [vouchers, search])

  // A liquidating Journal Voucher cross-references the Check Voucher that granted the
  // cash advance — resolved here (rather than baked into the voucher itself) since it's
  // just the other voucher's own number, always current.
  function relatedVoucherNumberOf(v: Voucher): string | undefined {
    return v.relatedVoucherId
      ? vouchers.find((x) => x.id === v.relatedVoucherId)?.voucherNumber
      : undefined
  }

  function statusLabel(status: VoucherStatus) {
    if (status === 'pending') return t('common.pending')
    if (status === 'approved') return t('common.approved')
    return t('common.cancelled')
  }

  function handleConfirmAdvance() {
    if (!advanceTarget || !canManage) return
    decideVoucher(advanceTarget.id, 'approved')
    toast.success(
      t('vouchers.toast.statusChanged', {
        number: advanceTarget.voucherNumber,
        status: statusLabel('approved')
      })
    )
    setAdvanceTarget(null)
  }

  async function handleView(v: Voucher) {
    setPreviewVoucher(v)
    const doc =
      v.voucherType === 'check_voucher'
        ? await buildDisbursementVoucherPdfDoc(v)
        : await buildJournalVoucherPdfDoc(v, relatedVoucherNumberOf(v))
    preview.openPreview(doc)
  }

  function handleExportExcel(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucher(v)
    else exportJournalVoucher(v, relatedVoucherNumberOf(v))
    toast.success(t('vouchers.toast.excelGenerated'))
  }

  function handleExportPdf(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucherPdf(v)
    else exportJournalVoucherPdf(v, relatedVoucherNumberOf(v))
    toast.success(t('vouchers.toast.pdfGenerated'))
  }

  function handleExportWord(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucherDocx(v)
    else exportJournalVoucherDocx(v, relatedVoucherNumberOf(v))
    toast.success(t('vouchers.toast.wordGenerated'))
  }

  // Prints a Service Invoice from any approved voucher's own recorded lines — a
  // receipt-direction Journal Voucher (orNumber set, see NewVoucherModal) already carries
  // everything a Service Invoice needs (Dr Cash on Hand / Cr income category lines, the
  // physical receipt number), so those are used as-is. Any other voucher (a Check Voucher's
  // disbursement, a cash-advance liquidation JV) has no credit-side breakdown worth printing,
  // so its debit lines — what the payment was actually for — are used instead, and the
  // voucher's own number stands in for a physical OR #.
  async function handlePrintReceipt(v: Voucher) {
    const creditLines = v.accountLines
      .filter((l) => l.credit > 0)
      .map((l) => ({ label: l.account, amount: l.credit }))
    const lines =
      creditLines.length > 0
        ? creditLines
        : v.accountLines
            .filter((l) => l.debit > 0)
            .map((l) => ({ label: l.account, amount: l.debit }))
    const receiptNumber = v.orNumber || v.voucherNumber
    const receipt: ReceiptRecord = {
      receiptType: 'service_invoice',
      receiptNumber,
      date: v.date,
      referenceNote: v.particulars,
      payorName: v.payee,
      address: v.payeeAddress,
      modeOfPayment: v.modeOfPayment,
      lines,
      cashierName: v.approvedBy ?? v.createdBy
    }
    const result = await printReceipt(receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
    // Remembers which booklet this voucher's receipt came from so SCRD's Cash Receipts
    // Journal can show it later — only needed the first time (a reprint already has both).
    if (!v.orNumber || !v.receiptType) {
      updateVoucher(v.id, {
        orNumber: receiptNumber,
        receiptType: RECEIPT_KIND_LABELS.service_invoice
      })
    }
  }

  return {
    loading,
    canManage,
    vouchers: filteredVouchers,
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
  }
}
