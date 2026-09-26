import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, CalendarDays, ImageOff, Pencil, Plus, Printer, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app.store'
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
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ReceiptTypePickerModal } from '@/shared/components/receipts/ReceiptTypePickerModal'
import type { ReceiptKind } from '@/shared/types/receipt.types'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { BookingStatus } from '../types/rentals.types'
import { NewBookingModal } from '../components/NewBookingModal'
import { RentalSpaceFormModal } from '../components/RentalSpaceFormModal'
import { PrintBookingReceiptModal } from '../components/PrintBookingReceiptModal'
import { useRentals, type BookingRow } from '../hooks/useRentals'
import { useRentalsStore } from '../store/rentals.store'
import { paymentStatusOf, type PaymentStatus } from '../lib/bookingPricing'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<BookingStatus, 'warning' | 'success' | 'primary' | 'outline'> = {
  reserved: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'outline'
}

const STATUS_LABEL_KEY: Record<BookingStatus, string> = {
  reserved: 'rentals.status.reserved',
  confirmed: 'rentals.status.confirmed',
  completed: 'common.completed',
  cancelled: 'common.cancelled'
}

const PAYMENT_VARIANT: Record<PaymentStatus, 'outline' | 'warning' | 'success'> = {
  unpaid: 'outline',
  partial: 'warning',
  paid: 'success'
}

const PAYMENT_LABEL_KEY: Record<PaymentStatus, string> = {
  unpaid: 'rentals.payment.unpaid',
  partial: 'rentals.payment.downPayment',
  paid: 'rentals.payment.fullyPaid'
}

function formatTime(value: string): string {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function Rentals() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    spaces,
    rows,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    bookingEditTarget,
    bookingForm,
    setBookingForm,
    openAddBooking,
    openEditBooking,
    handleSaveBooking,
    bookingDeleteTarget,
    setBookingDeleteTarget,
    handleConfirmDeleteBooking,
    statusChangeTarget,
    setStatusChangeTarget,
    requestStatusChange,
    handleConfirmStatusChange,
    showSpaceForm,
    setShowSpaceForm,
    spaceEditTarget,
    openAddSpace,
    openEditSpace,
    spaceForm,
    setSpaceForm,
    handleSaveSpace,
    spaceDeleteTarget,
    setSpaceDeleteTarget,
    handleConfirmDeleteSpace
  } = useRentals()
  const hydrate = useRentalsStore((s) => s.hydrate)
  const updateBooking = useRentalsStore((s) => s.updateBooking)
  const currentUser = useAppStore((s) => s.currentUser)

  const [printingBooking, setPrintingBooking] = useState<BookingRow | null>(null)
  const [bookingReceiptType, setBookingReceiptType] = useState<ReceiptKind>('service_invoice')
  const [showReceiptTypePicker, setShowReceiptTypePicker] = useState(false)
  const [pendingPrintBooking, setPendingPrintBooking] = useState<BookingRow | null>(null)

  const columns: Column<BookingRow>[] = [
    { key: 'spaceName', header: t('rentals.table.space') },
    {
      key: 'bookingDate',
      header: t('rentals.table.date'),
      render: (r) => (
        <>
          {formatDate(r.bookingDate)}
          {r.startTime && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' · '}
              {formatTime(r.startTime)}
              {r.endTime ? ` – ${formatTime(r.endTime)}` : ''}
            </span>
          )}
        </>
      )
    },
    { key: 'renterName', header: t('rentals.table.renter') },
    {
      key: 'totalAmount',
      header: t('rentals.table.amount'),
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          <span>{formatCurrency(r.totalAmount)}</span>
          {!!r.excessHours && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {t('rentals.table.excessIncluded', {
                hours: r.excessHours,
                amount: formatCurrency(r.excessAmount ?? 0)
              })}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'amountPaid',
      header: t('rentals.table.payment'),
      render: (r) => {
        const paymentStatus = paymentStatusOf(r.totalAmount, r.amountPaid)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Badge variant={PAYMENT_VARIANT[paymentStatus]}>
              {t(PAYMENT_LABEL_KEY[paymentStatus])}
            </Badge>
            {paymentStatus !== 'unpaid' && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {formatCurrency(r.amountPaid ?? 0)} / {formatCurrency(r.totalAmount)}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      header: t('rentals.table.status'),
      render: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]}>{t(STATUS_LABEL_KEY[r.status])}</Badge>
      )
    },
    {
      key: 'id',
      header: t('rentals.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          {canManage && r.status === 'reserved' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => requestStatusChange(r, 'confirmed')}
            >
              {t('rentals.confirmButton')}
            </Button>
          )}
          {canManage && r.status === 'confirmed' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => requestStatusChange(r, 'completed')}
            >
              {t('rentals.markCompletedButton')}
            </Button>
          )}
          {canManage && (r.amountPaid ?? 0) > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (r.receipt) {
                  setBookingReceiptType(r.receipt.receiptType)
                  setPrintingBooking(r)
                } else {
                  setPendingPrintBooking(r)
                  setShowReceiptTypePicker(true)
                }
              }}
              title={r.receipt ? t('receipts.reprintButton') : t('receipts.printButton')}
              style={{ padding: 4 }}
            >
              <Printer size={12} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditBooking(r)}
              title={t('common.edit')}
              style={{ padding: 4 }}
            >
              <Pencil size={12} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBookingDeleteTarget(r)}
              title={t('common.delete')}
              style={{ padding: 4 }}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="rentals"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('rentals.title')}
        icon={<Building2 size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={openAddSpace}
              >
                {t('rentals.addSpaceButton')}
              </Button>
            )}
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={openAddBooking}
              >
                {t('rentals.newBookingButton')}
              </Button>
            )}
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 16
        }}
      >
        {spaces.map((space) => (
          <Card key={space.id} padding="0px" style={{ overflow: 'hidden' }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {space.imageUrl ? (
                <img
                  src={space.imageUrl}
                  alt={space.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageOff size={22} color="var(--text-muted)" strokeWidth={1.5} />
              )}
            </div>
            <div style={{ padding: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{space.name}</p>
                  {space.category && (
                    <Badge variant="default">
                      {t(
                        `rentals.form.category${space.category[0].toUpperCase()}${space.category.slice(1)}`
                      )}
                    </Badge>
                  )}
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditSpace(space)}
                      title={t('common.edit')}
                      style={{ padding: 4 }}
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSpaceDeleteTarget(space)}
                      title={t('common.delete')}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                {space.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>
                  {formatCurrency(space.ratePerDay)}
                  {t('rentals.perDay')}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {t('rentals.capacity')} {space.capacity}
                </span>
              </div>
              {!!space.baseHours && !!space.excessHourlyRate && (
                <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  {t('rentals.form.excessRateSummary', {
                    hours: space.baseHours,
                    rate: formatCurrency(space.excessHourlyRate)
                  })}
                </p>
              )}
            </div>
          </Card>
        ))}
        {spaces.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            {t('rentals.noSpaces')}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CalendarDays size={16} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{t('rentals.bookingsTitle')}</span>
      </div>
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('rentals.searchPlaceholder')}
        count={rows.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={rows}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('rentals.empty')}
        />
      </Card>

      <NewBookingModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={bookingEditTarget}
        spaces={spaces}
        form={bookingForm}
        setForm={setBookingForm}
        onSave={handleSaveBooking}
      />
      <PrintBookingReceiptModal
        booking={printingBooking}
        defaultCashierName={currentUser?.fullName ?? ''}
        onClose={() => setPrintingBooking(null)}
        onPrinted={(receipt) => {
          if (printingBooking) updateBooking(printingBooking.id, { receipt })
        }}
        initialReceiptType={bookingReceiptType}
      />
      <ReceiptTypePickerModal
        open={showReceiptTypePicker}
        onOpenChange={setShowReceiptTypePicker}
        onSelect={(type) => {
          setBookingReceiptType(type)
          setShowReceiptTypePicker(false)
          setPrintingBooking(pendingPrintBooking)
          setPendingPrintBooking(null)
        }}
      />
      <RentalSpaceFormModal
        open={showSpaceForm}
        onOpenChange={setShowSpaceForm}
        editTarget={spaceEditTarget}
        form={spaceForm}
        setForm={setSpaceForm}
        onSave={handleSaveSpace}
      />
      <ConfirmDialog
        open={!!spaceDeleteTarget}
        title={t('rentals.confirmDeleteSpace.title')}
        message={t('rentals.confirmDeleteSpace.message', { name: spaceDeleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteSpace}
        onCancel={() => setSpaceDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!bookingDeleteTarget}
        title={t('rentals.confirmDeleteBooking.title')}
        message={t('rentals.confirmDeleteBooking.message', {
          name: bookingDeleteTarget?.renterName ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteBooking}
        onCancel={() => setBookingDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!statusChangeTarget}
        title={
          statusChangeTarget?.nextStatus === 'confirmed'
            ? t('rentals.confirmStatusChange.confirmTitle')
            : t('rentals.confirmStatusChange.completeTitle')
        }
        message={
          statusChangeTarget?.nextStatus === 'confirmed'
            ? t('rentals.confirmStatusChange.confirmMessage', {
                name: statusChangeTarget?.booking.renterName ?? ''
              })
            : t('rentals.confirmStatusChange.completeMessage', {
                name: statusChangeTarget?.booking.renterName ?? ''
              })
        }
        confirmLabel={
          statusChangeTarget?.nextStatus === 'confirmed'
            ? t('rentals.confirmButton')
            : t('rentals.markCompletedButton')
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusChangeTarget(null)}
      />
    </motion.div>
  )
}
