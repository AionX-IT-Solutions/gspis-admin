import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useAppStore } from '@/app/store/app.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { uploadFile } from '@/shared/lib/storageSync'
import { formatDate, toInputDate, todayLocalIso } from '@/shared/lib/utils'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getReceiptRowsFromVouchers } from '@/features/vouchers/lib/receiptVouchers'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import { useDailyCollectionsStore } from '../store/dailyCollections.store'
import type {
  CashDepositLine,
  DailyCollectionAttachment,
  ManualReceiptLine
} from '../types/dailyCollection.types'
import {
  exportDailyCollectionsExcel,
  exportDailyCollectionsPdf,
  exportDailyCollectionsDocx,
  buildDailyCollectionsPdfDoc,
  type DailyCollectionsData,
  type DailyCollectionReceiptRow
} from '../lib/financialReportsExport'

function newManualLine(): ManualReceiptLine {
  return {
    id: crypto.randomUUID(),
    siNo: '',
    receivedFrom: '',
    nes: 0,
    bcFee: 0,
    csf: 0,
    iccg: 0,
    memReg: 0,
    rentals: 0,
    refundOfCa: 0,
    others: 0
  }
}

function newDepositLine(date: string): CashDepositLine {
  return {
    id: crypto.randomUUID(),
    bankId: '',
    bankName: '',
    saNo: '',
    purpose: '',
    amount: 0,
    coverageFrom: date,
    coverageTo: date
  }
}

function manualLineToRow(l: ManualReceiptLine): DailyCollectionReceiptRow {
  return {
    siNo: l.siNo,
    receivedFrom: l.receivedFrom,
    nes: l.nes,
    bcFee: l.bcFee,
    csf: l.csf,
    iccg: l.iccg,
    memReg: l.memReg,
    rentals: l.rentals,
    refundOfCa: l.refundOfCa,
    others: l.others,
    amount: l.nes + l.bcFee + l.csf + l.iccg + l.memReg + l.rentals + l.refundOfCa + l.others
  }
}

const emptyReceiptTotals = {
  nes: 0,
  bcFee: 0,
  csf: 0,
  iccg: 0,
  memReg: 0,
  rentals: 0,
  refundOfCa: 0,
  others: 0,
  amount: 0
}

export function useDailyCollectionsTab() {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:reports')
  const currentUser = useAppStore((s) => s.currentUser)

  const reports = useDailyCollectionsStore((s) => s.reports)
  const saveReportAction = useDailyCollectionsStore((s) => s.saveReport)
  const addAttachmentAction = useDailyCollectionsStore((s) => s.addAttachment)
  const deleteAttachmentAction = useDailyCollectionsStore((s) => s.deleteAttachment)

  const sales = usePOSStore((s) => s.sales)
  const bookings = useRentalsStore((s) => s.bookings)
  const spaces = useRentalsStore((s) => s.spaces)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const troops = useTroopsStore((s) => s.troops)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const cashReceipts = useMemo(() => getReceiptRowsFromVouchers(vouchers), [vouchers])
  const banks = useBanksStore((s) => s.banks)

  // The report is normally a single calendar date (dateFrom === dateTo), matching the
  // Council's one-form-per-day paper form — that stays the default and the only mode that's
  // editable/saveable. Widening dateTo past dateFrom switches to a read-only consolidated
  // view across every saved day in between (for e.g. depositing/exporting a week's worth of
  // accumulated, undeposited cash in one bank trip) without changing how each day is stored.
  const [dateFrom, setDateFromRaw] = useState(todayLocalIso())
  const [dateTo, setDateToRaw] = useState(todayLocalIso())
  const isRange = dateFrom !== dateTo

  function setDateFrom(value: string) {
    setDateFromRaw(value)
    setDateToRaw((prev) => (value > prev ? value : prev))
  }
  function setDateTo(value: string) {
    setDateToRaw(value)
    setDateFromRaw((prev) => (value < prev ? value : prev))
  }

  const existingReport = !isRange ? (reports.find((r) => r.date === dateFrom) ?? null) : null

  const [beginningBalance, setBeginningBalance] = useState(0)
  const [manualReceipts, setManualReceipts] = useState<ManualReceiptLine[]>([])
  const [deposits, setDeposits] = useState<CashDepositLine[]>([])
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  // Sums auto-generated receipts (POS sales, rental bookings, membership payments, approved
  // JV cash receipts) across whatever dates match `datePredicate` — used below to carry the
  // undeposited balance forward across days that were never opened/saved as their own report,
  // since those days' auto receipts would otherwise silently vanish from the running total.
  function autoReceiptsTotalWhere(datePredicate: (date: string) => boolean): number {
    let total = 0
    for (const s of sales) {
      if (s.voided || !datePredicate(toInputDate(s.createdAt))) continue
      total += s.totalAmount
    }
    for (const b of bookings) {
      if (!datePredicate(b.bookingDate) || (b.status !== 'confirmed' && b.status !== 'completed'))
        continue
      total += b.amountPaid ?? b.totalAmount
    }
    for (const m of scoutMembers) {
      for (const payment of m.payments ?? []) {
        if (payment.amount <= 0 || !datePredicate(payment.date)) continue
        total += payment.amount
      }
    }
    for (const r of cashReceipts) {
      if (!datePredicate(toInputDate(r.date))) continue
      total += r.amount
    }
    return total
  }

  // The true running undeposited balance as of the start of `date` — the closest saved
  // report's own beginning balance plus every day's receipts minus deposits since, including
  // gap days nobody opened a report for. Falls back to that day's own saved beginning balance
  // when a report already exists for it.
  function beginningBalanceAsOf(date: string): number {
    const saved = reports.find((r) => r.date === date)
    if (saved) return saved.beginningBalance
    const anchor = reports
      .filter((r) => r.date < date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
    if (!anchor) return 0
    const anchorManualTotal = anchor.manualReceipts.reduce(
      (s, l) =>
        s + l.nes + l.bcFee + l.csf + l.iccg + l.memReg + l.rentals + l.refundOfCa + l.others,
      0
    )
    const anchorDepositTotal = anchor.deposits.reduce((s, d) => s + d.amount, 0)
    const anchorAutoTotal = autoReceiptsTotalWhere((d) => d === anchor.date)
    const gapAutoTotal = autoReceiptsTotalWhere((d) => d > anchor.date && d < date)
    const running =
      anchor.beginningBalance +
      anchorAutoTotal +
      anchorManualTotal -
      anchorDepositTotal +
      gapAutoTotal
    return Math.max(0, Math.round(running * 100) / 100)
  }

  // Loads the saved report for dateFrom, or seeds a blank one carrying forward the running
  // undeposited balance — only in single-day mode; range mode is read-only, so there's
  // nothing to load into the editable fields.
  useEffect(() => {
    if (isRange) return
    if (existingReport) {
      setBeginningBalance(existingReport.beginningBalance)
      setManualReceipts(existingReport.manualReceipts)
      setDeposits(existingReport.deposits)
      return
    }
    setBeginningBalance(beginningBalanceAsOf(dateFrom))
    setManualReceipts([])
    setDeposits([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, isRange, existingReport?.id])

  // Clears the single-day editable state on entering range mode, so a stale in-progress edit
  // doesn't render mixed in with the range's read-only rows.
  useEffect(() => {
    if (!isRange) return
    setManualReceipts([])
    setDeposits([])
  }, [isRange])

  // Auto-generated rows (POS/Rentals/Troops/JV) for every date in [dateFrom, dateTo] — a
  // single day is just the range's degenerate case, so this covers both modes.
  const rawAutoReceiptRows: DailyCollectionReceiptRow[] = useMemo(() => {
    const rows: DailyCollectionReceiptRow[] = []
    const inRange = (d: string) => d >= dateFrom && d <= dateTo

    for (const s of sales) {
      if (s.voided || !inRange(toInputDate(s.createdAt))) continue
      rows.push({
        siNo: s.saleNumber,
        receivedFrom: s.memberName ?? t('reports.dailyCollections.walkIn'),
        nes: s.totalAmount,
        bcFee: 0,
        csf: 0,
        iccg: 0,
        memReg: 0,
        rentals: 0,
        refundOfCa: 0,
        others: 0,
        amount: s.totalAmount
      })
    }

    for (const b of bookings) {
      if (!inRange(b.bookingDate) || (b.status !== 'confirmed' && b.status !== 'completed'))
        continue
      const amount = b.amountPaid ?? b.totalAmount
      rows.push({
        siNo: spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? '',
        receivedFrom: b.renterName,
        nes: 0,
        bcFee: 0,
        csf: 0,
        iccg: 0,
        memReg: 0,
        rentals: amount,
        refundOfCa: 0,
        others: 0,
        amount
      })
    }

    for (const m of scoutMembers) {
      for (const payment of m.payments ?? []) {
        if (payment.amount <= 0 || !inRange(payment.date)) continue
        rows.push({
          siNo: troops.find((tr) => tr.id === m.troopId)?.troopNumber ?? '',
          receivedFrom: m.fullName,
          nes: 0,
          bcFee: 0,
          csf: 0,
          iccg: 0,
          memReg: payment.amount,
          rentals: 0,
          refundOfCa: 0,
          others: 0,
          amount: payment.amount
        })
      }
    }

    // Approved Journal Voucher credit lines (Cash Receipts) — Cash Advance Refunds, Barangay
    // Committee/ICCG/Council Support Fund, Trefoil/District Committee/OAVF/Honorary/Associate
    // remittances, etc. A handful of these match one of the paper form's own fixed columns
    // (see CashReceiptCategory in scrd/types/cashReceipts.types.ts for the exact account text
    // each registration module posts) and land there, same as Mem. Reg./Rentals do above for
    // their own auto sources; everything else still doesn't fit any fixed column, so it lands
    // under "Others" as before.
    for (const r of cashReceipts) {
      if (!inRange(toInputDate(r.date))) continue
      const isRefundOfCa = r.category === 'Cash Advance Refund'
      const isBcFee = r.category === 'BC Group Fee'
      const isCsf = r.category === 'Council Support Fund'
      const isIccg = r.category === 'ICCG Registration Fee'
      const isOthers = !isRefundOfCa && !isBcFee && !isCsf && !isIccg
      rows.push({
        siNo: r.referenceNumber ?? '',
        receivedFrom: r.payor,
        nes: 0,
        bcFee: isBcFee ? r.amount : 0,
        csf: isCsf ? r.amount : 0,
        iccg: isIccg ? r.amount : 0,
        memReg: 0,
        rentals: 0,
        refundOfCa: isRefundOfCa ? r.amount : 0,
        others: isOthers ? r.amount : 0,
        amount: r.amount
      })
    }

    return rows
  }, [sales, bookings, spaces, scoutMembers, troops, cashReceipts, dateFrom, dateTo, t])

  // Every saved report touching the selected range — only meaningful in range mode, where it
  // supplies the (read-only) manual receipts, deposits, and attachments that would otherwise
  // live behind each individual day's editable form.
  const rangeReports = useMemo(
    () => reports.filter((r) => r.date >= dateFrom && r.date <= dateTo),
    [reports, dateFrom, dateTo]
  )

  // In range mode, hand-entered receipt lines aren't editable here (they belong to whichever
  // day they were saved under), so fold them into the same read-only/locked rows as the
  // auto-generated ones instead of the editable manualReceipts table.
  const autoReceiptRows: DailyCollectionReceiptRow[] = useMemo(() => {
    if (!isRange) return rawAutoReceiptRows
    const savedManualRows = rangeReports.flatMap((r) => r.manualReceipts.map(manualLineToRow))
    return [...rawAutoReceiptRows, ...savedManualRows]
  }, [isRange, rawAutoReceiptRows, rangeReports])

  const manualReceiptRows: DailyCollectionReceiptRow[] = useMemo(
    () => manualReceipts.map(manualLineToRow),
    [manualReceipts]
  )

  const receiptRows = useMemo(
    () => [...autoReceiptRows, ...manualReceiptRows],
    [autoReceiptRows, manualReceiptRows]
  )

  const receiptTotals = useMemo(
    () =>
      receiptRows.reduce(
        (t, r) => ({
          nes: t.nes + r.nes,
          bcFee: t.bcFee + r.bcFee,
          csf: t.csf + r.csf,
          iccg: t.iccg + r.iccg,
          memReg: t.memReg + r.memReg,
          rentals: t.rentals + r.rentals,
          refundOfCa: t.refundOfCa + r.refundOfCa,
          others: t.others + r.others,
          amount: t.amount + r.amount
        }),
        { ...emptyReceiptTotals }
      ),
    [receiptRows]
  )

  // Deposits follow this split: editable local state for the single day being worked on, or
  // a read-only union of every saved day's rows when viewing a range. Attachments have no
  // local draft state at all — uploading/deleting one commits straight to the store (see
  // handleUploadAttachment/handleDeleteAttachment below), so this always reads the store's
  // current value directly rather than mirroring it into local state that could go stale.
  const effectiveDeposits: CashDepositLine[] = isRange
    ? rangeReports.flatMap((r) => r.deposits)
    : deposits
  const effectiveAttachments: DailyCollectionAttachment[] = isRange
    ? rangeReports.flatMap((r) => r.attachments)
    : (existingReport?.attachments ?? [])
  const effectiveBeginningBalance = isRange ? beginningBalanceAsOf(dateFrom) : beginningBalance

  const totalCashCollection = receiptTotals.amount
  const totalCashOnHand = effectiveBeginningBalance + totalCashCollection
  const totalDeposited = effectiveDeposits.reduce((s, d) => s + d.amount, 0)
  const balanceUndeposited = totalCashOnHand - totalDeposited

  function addManualReceipt() {
    if (isRange) return
    setManualReceipts((p) => [...p, newManualLine()])
  }
  function updateManualReceipt(id: string, patch: Partial<ManualReceiptLine>) {
    setManualReceipts((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function removeManualReceipt(id: string) {
    setManualReceipts((p) => p.filter((l) => l.id !== id))
  }

  function addDeposit() {
    if (isRange) return
    setDeposits((p) => [...p, newDepositLine(dateFrom)])
  }
  function updateDeposit(id: string, patch: Partial<CashDepositLine>) {
    setDeposits((p) => p.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }
  function setDepositBank(id: string, bankId: string) {
    const bank = banks.find((b) => b.id === bankId)
    setDeposits((p) =>
      p.map((d) =>
        d.id === id
          ? {
              ...d,
              bankId,
              bankName: bank ? bankDisplayName(bank) : '',
              saNo: bank?.accountNumber ?? ''
            }
          : d
      )
    )
  }
  function removeDeposit(id: string) {
    setDeposits((p) => p.filter((d) => d.id !== id))
  }

  function handleSave() {
    if (!canManage || isRange) return
    saveReportAction({
      date: dateFrom,
      beginningBalance,
      manualReceipts,
      deposits,
      preparedBy: existingReport?.preparedBy ?? currentUser?.fullName ?? 'System'
    })
    toast.success(t('reports.dailyCollections.toast.saved'))
  }

  async function handleUploadAttachment(file: File) {
    if (!canManage || isRange) return
    setUploadingAttachment(true)
    try {
      const path = `dailyCollectionAttachments/${dateFrom}/${Date.now()}-${file.name}`
      const url = await uploadFile(path, file)
      addAttachmentAction(dateFrom, {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        storagePath: path,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.fullName ?? 'System'
      })
      toast.success(t('reports.dailyCollections.toast.attachmentUploaded'))
    } catch {
      toast.error(t('reports.dailyCollections.toast.attachmentFailed'))
    } finally {
      setUploadingAttachment(false)
    }
  }

  function handleDeleteAttachment(attachmentId: string) {
    if (!canManage || isRange || !existingReport) return
    deleteAttachmentAction(existingReport.id, attachmentId)
    toast.success(t('reports.dailyCollections.toast.attachmentDeleted'))
  }

  const dateLabel = isRange
    ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
    : formatDate(dateFrom)
  const preparedByDisplay = existingReport?.preparedBy ?? currentUser?.fullName ?? ''

  // The exported paper form only has a Bank/S-A No./Purpose/Amount deposit table (matches
  // the Council's physical form exactly), so a multi-day coverage range rides along inside
  // the Purpose cell instead of adding a column — keeps the printed form's layout unchanged.
  function depositPurposeForExport(d: CashDepositLine): string {
    if (d.coverageFrom && d.coverageTo && d.coverageFrom !== d.coverageTo) {
      const range = `${formatDate(d.coverageFrom)} – ${formatDate(d.coverageTo)}`
      return d.purpose ? `${d.purpose} (covers ${range})` : `Covers ${range}`
    }
    return d.purpose
  }

  function reportData(): DailyCollectionsData {
    return {
      dateLabel,
      preparedBy: preparedByDisplay,
      beginningBalance: effectiveBeginningBalance,
      receiptRows,
      receiptTotals,
      totalCashCollection,
      totalCashOnHand,
      depositRows: effectiveDeposits.map((d) => ({
        bankName: d.bankName,
        saNo: d.saNo,
        purpose: depositPurposeForExport(d),
        amount: d.amount
      })),
      totalDeposited,
      balanceUndeposited
    }
  }

  async function handleView() {
    preview.openPreview(await buildDailyCollectionsPdfDoc(reportData()))
  }
  function handleExportExcel() {
    exportDailyCollectionsExcel(reportData())
    toast.success(t('reports.dailyCollections.toast.excel'))
  }
  function handleExportPdf() {
    exportDailyCollectionsPdf(reportData())
    toast.success(t('reports.dailyCollections.toast.pdf'))
  }
  function handleExportWord() {
    exportDailyCollectionsDocx(reportData())
    toast.success(t('reports.dailyCollections.toast.word'))
  }

  return {
    canManage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRange,
    beginningBalance: effectiveBeginningBalance,
    setBeginningBalance,
    autoReceiptRows,
    manualReceipts,
    addManualReceipt,
    updateManualReceipt,
    removeManualReceipt,
    receiptTotals,
    totalCashCollection,
    totalCashOnHand,
    deposits: effectiveDeposits,
    banks,
    addDeposit,
    updateDeposit,
    setDepositBank,
    removeDeposit,
    totalDeposited,
    balanceUndeposited,
    attachments: effectiveAttachments,
    uploadingAttachment,
    handleUploadAttachment,
    handleDeleteAttachment,
    isSaved: !isRange && !!existingReport,
    handleSave,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preparedByDisplay
  }
}
