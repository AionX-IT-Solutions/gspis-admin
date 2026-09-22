import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePOSStore } from '../store/pos.store'
import { useAppStore } from '@/app/store/app.store'
import { formatCurrency } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { useHardwareScanner } from '@/shared/hooks/useHardwareScanner'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { silentPrintReceipt } from '../lib/receipt'
import {
  exportMonthlySalesReport,
  exportMonthlySalesReportPdf,
  exportMonthlySalesReportDocx,
  buildMonthlySalesReportPdfDoc
} from '../lib/nesExcelExport'
import type { PaymentMethod, Sale } from '../types/pos.types'

export function usePOS() {
  const { t } = useTranslation()
  const toast = useToast()
  const salesReportPreview = useDocumentPreview()
  const currentUser = useAppStore((s) => s.currentUser)
  const products = usePOSStore((s) => s.products)
  const members = usePOSStore((s) => s.members)
  const sales = usePOSStore((s) => s.sales)
  const cart = usePOSStore((s) => s.cart)
  const selectedMemberId = usePOSStore((s) => s.selectedMemberId)
  const manualMemberName = usePOSStore((s) => s.manualMemberName)
  const setManualMemberName = usePOSStore((s) => s.setManualMemberName)
  const addToCart = usePOSStore((s) => s.addToCart)
  const removeFromCart = usePOSStore((s) => s.removeFromCart)
  const setCartQuantity = usePOSStore((s) => s.setCartQuantity)
  const setSelectedMember = usePOSStore((s) => s.setSelectedMember)
  const checkout = usePOSStore((s) => s.checkout)
  const voidSale = usePOSStore((s) => s.voidSale)
  const deleteSale = usePOSStore((s) => s.deleteSale)

  const [search, setSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [printReceipt, setPrintReceipt] = useState(true)
  const [printerDeviceName, setPrinterDeviceName] = useState<string | null>(null)
  // Target sale for the void confirmation — deliberately separate from
  // lastSale so opening it can close the Sale-Complete modal in the same
  // tick (see openVoidConfirm), avoiding two Radix Dialogs stacked open
  // at once.
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null)
  const [voidReason, setVoidReason] = useState('')
  // Target sale for the delete confirmation — same reasoning as voidTarget above.
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null)

  useEffect(() => {
    window.api?.printer
      .getConfig()
      .then((cfg) => {
        setPrintReceipt(cfg.autoPrintReceipt)
        setPrinterDeviceName(cfg.deviceName)
      })
      .catch(() => {})
  }, [])

  function handleSetPrintReceipt(value: boolean) {
    setPrintReceipt(value)
    window.api?.printer.saveConfig({ autoPrintReceipt: value })
  }

  const activeProducts = products.filter((p) => p.isActive)
  const filtered = activeProducts.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  const filteredSales = useMemo(() => {
    const q = historySearch.trim().toLowerCase()
    if (!q) return sales
    return sales.filter(
      (s) => s.saleNumber.toLowerCase().includes(q) || s.cashierName.toLowerCase().includes(q)
    )
  }, [sales, historySearch])

  const member = members.find((m) => m.id === selectedMemberId)
  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const discount = member ? Math.round(subtotal * member.discountRate * 100) / 100 : 0
  const total = subtotal - discount

  // Suggestions for the member picker (same "auto search, or just type a name" pattern as
  // the Payee field in NewVoucherModal) — only while typing an unmatched name, since once a
  // real member is selected setSelectedMember already clears manualMemberName to ''.
  const filteredMembers = useMemo(() => {
    const q = manualMemberName.trim().toLowerCase()
    if (!q) return []
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
    )
  }, [members, manualMemberName])

  function processScannedCode(code: string) {
    const memberMatch = members.find((m) => m.code.toLowerCase() === code.toLowerCase())
    if (memberMatch) {
      setSelectedMember(memberMatch.id)
      toast.success(
        t('pos.toast.memberScanned', {
          name: memberMatch.name,
          rate: memberMatch.discountRate * 100
        })
      )
      return
    }

    const productMatch = activeProducts.find((p) => p.sku.toLowerCase() === code.toLowerCase())
    if (!productMatch) {
      toast.error(t('pos.toast.codeNotFound', { code }))
      return
    }
    const result = addToCart(productMatch)
    if (result.ok) toast.success(result.message)
    else toast.error(result.message)
  }

  // Global hardware barcode-scanner listener — see useHardwareScanner for how
  // HID keyboard-wedge scanners are detected.
  useHardwareScanner(processScannedCode)

  function handleAddToCart(productId: string) {
    const p = products.find((prod) => prod.id === productId)
    if (!p) return
    const r = addToCart(p)
    if (r.ok) toast.success(r.message)
    else toast.error(r.message)
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error(t('pos.toast.cartEmpty'))
      return
    }
    const sale = checkout(currentUser?.fullName ?? 'Cashier', paymentMethod)
    if (!sale) return

    setLastSale(sale)
    toast.success(
      t('pos.toast.saleCompleted', {
        saleNumber: sale.saleNumber,
        amount: formatCurrency(sale.totalAmount)
      })
    )

    if (printReceipt) {
      const result = await silentPrintReceipt(sale, printerDeviceName)
      if (!result.ok) {
        toast.error(t('pos.toast.silentPrintFailed'))
      }
    }
  }

  function openVoidConfirm(sale: Sale) {
    setLastSale(null)
    setVoidReason('')
    setVoidTarget(sale)
  }

  function closeVoidConfirm() {
    setVoidTarget(null)
    setVoidReason('')
  }

  function handleConfirmVoidSale() {
    if (!voidTarget) return
    if (!voidReason.trim()) {
      toast.error(t('pos.toast.voidReasonRequired'))
      return
    }
    voidSale(voidTarget.id, currentUser?.fullName ?? 'Cashier', voidReason.trim())
    toast.success(t('pos.toast.saleVoided', { saleNumber: voidTarget.saleNumber }))
    setVoidTarget(null)
    setVoidReason('')
  }

  function openDeleteConfirm(sale: Sale) {
    setLastSale(null)
    setDeleteTarget(sale)
  }

  function closeDeleteConfirm() {
    setDeleteTarget(null)
  }

  function handleConfirmDeleteSale() {
    if (!deleteTarget) return
    deleteSale(deleteTarget.id, currentUser?.fullName ?? 'Cashier')
    toast.success(t('pos.toast.saleDeleted', { saleNumber: deleteTarget.saleNumber }))
    setDeleteTarget(null)
  }

  // Always silent — printing straight to the configured receipt printer, no
  // OS "Save Print Output As" dialog. Used both for the Sale-Complete modal's
  // Print Receipt button and for reprinting from Sales History.
  async function handlePrintReceipt(sale: Sale) {
    const result = await silentPrintReceipt(sale, printerDeviceName)
    if (!result.ok) toast.error(t('pos.toast.silentPrintFailed'))
  }

  async function handleViewSalesReport() {
    if (sales.length === 0) {
      toast.error(t('products.toast.noSalesToReport'))
      return
    }
    const month = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    salesReportPreview.openPreview(await buildMonthlySalesReportPdfDoc(sales, month))
  }

  function handleExportSalesReport(fmt: 'excel' | 'pdf' | 'word') {
    if (sales.length === 0) {
      toast.error(t('products.toast.noSalesToReport'))
      return
    }
    const month = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    if (fmt === 'excel') {
      exportMonthlySalesReport(sales, month)
      toast.success(t('products.toast.salesReportExportedExcel'))
    } else if (fmt === 'pdf') {
      exportMonthlySalesReportPdf(sales, month)
      toast.success(t('products.toast.salesReportExportedPdf'))
    } else {
      exportMonthlySalesReportDocx(sales, month)
      toast.success(t('products.toast.salesReportExportedWord'))
    }
  }

  return {
    filtered,
    cart,
    sales: filteredSales,
    search,
    setSearch,
    historySearch,
    setHistorySearch,
    handleAddToCart,
    removeFromCart,
    setCartQuantity,
    member,
    selectedMemberId,
    setSelectedMember,
    manualMemberName,
    setManualMemberName,
    filteredMembers,
    paymentMethod,
    setPaymentMethod,
    printReceipt,
    setPrintReceipt: handleSetPrintReceipt,
    subtotal,
    discount,
    total,
    handleCheckout,
    lastSale,
    setLastSale,
    voidTarget,
    voidReason,
    setVoidReason,
    openVoidConfirm,
    closeVoidConfirm,
    handleConfirmVoidSale,
    deleteTarget,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleConfirmDeleteSale,
    handlePrintReceipt,
    handleExportSalesReport,
    handleViewSalesReport,
    salesReportPreview
  }
}
