import { motion } from 'framer-motion'
import { Barcode, ImageOff, Minus, Plus, Printer, ShoppingCart, Trash2, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { FieldInput, FieldSelect, FormField, FieldTextArea } from '@/shared/components/ui/FormField'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { StyledSwitch } from '@/features/settings/components/primitives'
import { currencyColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { usePOS } from '../hooks/usePOS'
import type { PaymentMethod, Sale } from '../types/pos.types'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function POS() {
  const { t } = useTranslation()
  const {
    filtered,
    cart,
    sales,
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
    setPrintReceipt,
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
  } = usePOS()

  const paymentMethodLabel = (method: PaymentMethod) =>
    method === 'cash'
      ? t('pos.paymentMethods.cash')
      : method === 'card'
        ? t('pos.paymentMethods.card')
        : t('pos.paymentMethods.eWallet')

  const historyColumns: Column<Sale>[] = [
    {
      key: 'saleNumber',
      header: t('pos.history.table.saleNumber'),
      render: (r) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          {r.saleNumber}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: t('pos.history.table.date'),
      render: (r) =>
        `${formatDate(r.createdAt)} ${new Date(r.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`
    },
    { key: 'cashierName', header: t('pos.history.table.cashier') },
    {
      key: 'items',
      header: t('pos.history.table.items'),
      sortable: false,
      render: (r) => t('pos.history.itemsCount', { count: r.items.length })
    },
    {
      key: 'paymentMethod',
      header: t('pos.history.table.payment'),
      render: (r) => paymentMethodLabel(r.paymentMethod)
    },
    currencyColumn<Sale>({ key: 'totalAmount', header: t('pos.history.table.total') }),
    {
      key: 'voided',
      header: t('pos.history.table.status'),
      render: (r) => (
        <span
          title={
            r.voided && r.voidReason
              ? t('pos.history.voidReasonTooltip', { reason: r.voidReason })
              : undefined
          }
        >
          <Badge variant={r.voided ? 'danger' : 'success'}>
            {r.voided ? t('pos.history.status.voided') : t('pos.history.status.completed')}
          </Badge>
        </span>
      )
    },
    actionsColumn<Sale>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Printer size={12} />}
            onClick={() => handlePrintReceipt(r)}
          >
            {t('pos.history.printButton')}
          </Button>
          {!r.voided && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openVoidConfirm(r)}
              style={{ color: '#f87171' }}
            >
              {t('pos.history.voidButton')}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            title={t('pos.history.deleteButton')}
            onClick={() => openDeleteConfirm(r)}
            style={{ color: '#f87171' }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ),
      t('pos.history.table.actions')
    )
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(historyColumns)

  return (
    <motion.div
      key="pos"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <PageHeader title={t('pos.title')} icon={<ShoppingCart size={18} />} />

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">{t('pos.tabs.register')}</TabsTrigger>
          <TabsTrigger value="history">{t('pos.tabs.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="flex flex-col flex-1 min-h-0 pt-3">
          <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
            {/* Product catalog */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <FieldInput
                  placeholder={t('pos.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 10,
                  alignContent: 'start'
                }}
              >
                {filtered.map((p) => (
                  <Card key={p.id} hoverable padding="12px" style={{ cursor: 'pointer' }}>
                    <div onClick={() => handleAddToCart(p.id)}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 8,
                          overflow: 'hidden',
                          marginBottom: 8,
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageOff size={20} color="var(--text-muted)" strokeWidth={1.5} />
                        )}
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.name}</p>
                      <p
                        style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          fontFamily: "'JetBrains Mono', monospace",
                          marginBottom: 6
                        }}
                      >
                        {p.sku}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formatCurrency(p.sellingPrice)}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: p.stockQuantity <= p.reorderLevel ? '#f87171' : 'var(--text-muted)'
                        }}
                      >
                        {t('pos.stockLabel', { count: p.stockQuantity })}
                      </p>
                    </div>
                  </Card>
                ))}
                {filtered.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {t('pos.noProductsMatch')}
                  </p>
                )}
              </div>
            </div>

            {/* Cart */}
            <Card
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 320 }}
              padding="16px"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <ShoppingCart size={14} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {t('pos.cart.title', { count: cart.length })}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                {cart.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('pos.cart.empty')}</p>
                )}
                {cart.map((line) => (
                  <div
                    key={line.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {line.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatCurrency(line.unitPrice)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCartQuantity(line.productId, line.quantity - 1)}
                    >
                      <Minus size={11} />
                    </Button>
                    <span style={{ fontSize: 12, width: 20, textAlign: 'center' }}>
                      {line.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCartQuantity(line.productId, line.quantity + 1)}
                    >
                      <Plus size={11} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(line.productId)}
                    >
                      <Trash2 size={12} color="#f87171" />
                    </Button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 12
                }}
              >
                <div style={{ position: 'relative' }}>
                  {selectedMemberId && member ? (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: 'var(--accent-primary-subtle)',
                        border: '1px solid var(--accent-primary)',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: 40
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          -{member.discountRate * 100}%
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                          fontSize: 16,
                          padding: 4
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <FieldInput
                        value={manualMemberName}
                        onChange={(e) => setManualMemberName(e.target.value)}
                        placeholder={t('pos.cart.memberSearchPlaceholder')}
                        autoComplete="off"
                      />
                      {filteredMembers.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: 4,
                            border: '1px solid var(--border-default)',
                            borderRadius: 8,
                            maxHeight: 220,
                            overflowY: 'auto',
                            backgroundColor: '#ffffff',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {filteredMembers.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => setSelectedMember(m.id)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border-subtle)',
                                fontSize: 13,
                                backgroundColor: '#ffffff',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff'
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>{m.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                -{m.discountRate * 100}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <FieldSelect
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  options={[
                    { value: 'cash', label: t('pos.paymentMethods.cash') },
                    { value: 'card', label: t('pos.paymentMethods.card') },
                    { value: 'e-wallet', label: t('pos.paymentMethods.eWallet') }
                  ]}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '2px 2px'
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {t('pos.cart.printReceipt')}
                  </span>
                  <StyledSwitch checked={printReceipt} onCheckedChange={setPrintReceipt} />
                </div>

                <div
                  style={{
                    fontSize: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    marginTop: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('pos.cart.subtotal')}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('pos.cart.discount')}</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 4
                    }}
                  >
                    <span>{t('pos.cart.total')}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  style={{ marginTop: 8 }}
                >
                  {t('pos.completeSale')}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-3">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <ExportMenu
              label={t('products.export.salesReport')}
              onView={handleViewSalesReport}
              onExportExcel={() => handleExportSalesReport('excel')}
              onExportPdf={() => handleExportSalesReport('pdf')}
              onExportWord={() => handleExportSalesReport('word')}
            />
          </div>
          <DocumentPreviewModal
            open={salesReportPreview.open}
            onClose={salesReportPreview.closePreview}
            url={salesReportPreview.url}
            title={t('products.export.salesReport')}
            onDownloadExcel={() => handleExportSalesReport('excel')}
            onDownloadPdf={() => handleExportSalesReport('pdf')}
            onDownloadWord={() => handleExportSalesReport('word')}
          />
          <TableToolbar
            search={historySearch}
            onSearchChange={setHistorySearch}
            searchPlaceholder={t('pos.history.searchPlaceholder')}
            count={sales.length}
            columnsSlot={
              <ColumnsButton
                columns={historyColumns}
                hiddenColumns={hiddenColumns}
                onToggle={toggleColumn}
              />
            }
          />
          <Card padding="0px">
            <DataTable
              columns={historyColumns}
              data={sales}
              hiddenColumns={hiddenColumns}
              emptyMessage={t('pos.history.emptyMessage')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        open={!!lastSale}
        onOpenChange={(open) => !open && setLastSale(null)}
        title={t('pos.modal.saleCompleteTitle', { saleNumber: lastSale?.saleNumber ?? '' })}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Undo2 size={13} />}
              onClick={() => lastSale && openVoidConfirm(lastSale)}
              style={{ color: '#f87171', marginRight: 'auto' }}
            >
              {t('pos.modal.undoSale')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setLastSale(null)}>
              {t('common.close')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer size={13} />}
              onClick={() => lastSale && handlePrintReceipt(lastSale)}
            >
              {t('pos.modal.printReceipt')}
            </Button>
          </>
        }
      >
        {lastSale && (
          <div style={{ fontSize: 13 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
                color: '#34d399'
              }}
            >
              <Barcode size={16} />{' '}
              {t('pos.modal.paymentReceivedVia', { method: lastSale.paymentMethod.toUpperCase() })}
            </div>
            {lastSale.items.map((item) => (
              <div
                key={item.productId}
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                marginTop: 8,
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700
              }}
            >
              <span>{t('pos.cart.total')}</span>
              <span>{formatCurrency(lastSale.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!voidTarget}
        onOpenChange={(open) => !open && closeVoidConfirm()}
        title={t('pos.modal.undoSaleConfirmTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeVoidConfirm}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmVoidSale}>
              {t('pos.modal.undoSale')}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
          {t('pos.modal.undoSaleConfirmMessage', { saleNumber: voidTarget?.saleNumber ?? '' })}
        </p>
        <FormField label={t('pos.modal.undoSaleReasonLabel')} required>
          <FieldTextArea
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder={t('pos.modal.undoSaleReasonPlaceholder')}
            autoFocus
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('pos.modal.deleteSaleConfirmTitle')}
        message={t('pos.modal.deleteSaleConfirmMessage', {
          saleNumber: deleteTarget?.saleNumber ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteSale}
        onCancel={closeDeleteConfirm}
      />
    </motion.div>
  )
}
