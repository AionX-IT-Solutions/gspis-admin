import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Plus, Pencil, UserX, Trash2, Eye, Printer } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Modal } from '@/shared/components/ui/Modal'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { DistrictFilterChip } from '@/shared/components/ui/DistrictFilterChip'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { statusColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import { formatDate, formatAmount } from '@/shared/lib/utils'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { ReceiptTypePickerModal } from '@/shared/components/receipts/ReceiptTypePickerModal'
import type { ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useBarangayCommitteeRegistrations } from '../hooks/useBarangayCommitteeRegistrations'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import { BarangayCommitteePickerModal } from '../components/BarangayCommitteePickerModal'
import type { BarangayCommitteeRegistration } from '../types/barangayCommitteeRegistration.types'
import type {
  FlatFeeCategory,
  MemberPaymentCategory,
  BarangayCommittee
} from '../types/barangayCommittee.types'
import { BarangayCommitteeFormModal } from '../components/BarangayCommitteeFormModal'
import { RecordBCBulkPaymentModal } from '../components/RecordBCBulkPaymentModal'
import { useBarangayCommittees } from '../hooks/useBarangayCommittees'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function BarangayCommittees() {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab: 'committees' | 'registrations' | 'payments' =
    searchParams.get('tab') === 'registrations'
      ? 'registrations'
      : searchParams.get('tab') === 'payments'
        ? 'payments'
        : 'committees'
  const { hasPermission } = usePermissions()

  // Drill-down from the Membership Status Report — ?district=X narrows the Registrations
  // tab without touching its own free-text search.
  const districtParam = searchParams.get('district')
  function clearDistrictFilter() {
    setSearchParams(activeTab === 'committees' ? {} : { tab: activeTab })
  }

  const {
    loading,
    canManage,
    search,
    setSearch,
    filteredCommittees,
    memberCounts,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    forceDeleteTarget,
    setForceDeleteTarget,
    handleConfirmForceDelete
  } = useBarangayCommittees()
  const hydrate = useBarangayCommitteeStore((s) => s.hydrate)

  const {
    loading: regLoading,
    canManage: canManageReg,
    search: regSearch,
    setSearch: setRegSearch,
    filteredRegistrations,
    committeeById,
    showCommitteePicker,
    setShowCommitteePicker,
    openCommitteePicker,
    startRegistrationForCommittee,
    deleteTarget: regDeleteTarget,
    setDeleteTarget: setRegDeleteTarget,
    handleConfirmDelete: handleConfirmDeleteRegistration
  } = useBarangayCommitteeRegistrations()
  const hydrateRegistrations = useBarangayCommitteeRegistrationStore((s) => s.hydrate)
  const displayedRegistrations = useMemo(() => {
    if (!districtParam) return filteredRegistrations
    return filteredRegistrations.filter(
      (r) => committeeById.get(r.barangayCommitteeId)?.district === districtParam
    )
  }, [filteredRegistrations, committeeById, districtParam])
  const allCommittees = useBarangayCommitteeStore((s) => s.committees)
  const members = useBarangayCommitteeStore((s) => s.members)
  const committeeByIdForPayments = useMemo(
    () => new Map(allCommittees.map((c) => [c.id, c])),
    [allCommittees]
  )
  const canManagePayments = hasPermission('manage:barangayCommittee')

  const [paymentSearch, setPaymentSearch] = useState('')
  const [showReceiptTypePicker, setShowReceiptTypePicker] = useState(false)
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
  const [bulkPaymentReceiptType, setBulkPaymentReceiptType] =
    useState<ReceiptKind>('service_invoice')
  function handlePickReceiptType(type: ReceiptKind) {
    setBulkPaymentReceiptType(type)
    setShowReceiptTypePicker(false)
    setShowBulkPaymentModal(true)
  }
  const updatePaymentGroup = useBarangayCommitteeStore((s) => s.updatePaymentGroup)
  const deletePaymentGroup = useBarangayCommitteeStore((s) => s.deletePaymentGroup)

  // Groups the underlying payment records back into one row per TRANSACTION (bulkPaymentId)
  // — one receipt per remittance event, same reasoning as features/troops/pages/Troops.tsx.
  interface PaymentRow {
    id: string
    bulkKey: string
    barangayCommitteeId: string
    date: string
    categories: (MemberPaymentCategory | FlatFeeCategory)[]
    paidByName: string
    memberCount: number
    totalAmount: number
    /** The receipt printed when this transaction was recorded — every line sharing this
     *  bulkKey carries the same one, so whichever line is seen first wins. */
    receipt?: ReceiptRecord
  }
  const paymentRows = useMemo(() => {
    const groups = new Map<string, PaymentRow>()
    for (const member of members) {
      for (const payment of member.payments ?? []) {
        const bulkKey = payment.bulkPaymentId ?? payment.id
        const existing = groups.get(bulkKey)
        if (existing) {
          existing.memberCount += 1
          existing.totalAmount += payment.amount
          if (!existing.categories.includes(payment.category))
            existing.categories.push(payment.category)
          existing.receipt ??= payment.receipt
        } else {
          groups.set(bulkKey, {
            id: bulkKey,
            bulkKey,
            barangayCommitteeId: member.barangayCommitteeId,
            date: payment.date,
            categories: [payment.category],
            paidByName: payment.paidByName ?? '—',
            memberCount: 1,
            totalAmount: payment.amount,
            receipt: payment.receipt
          })
        }
      }
    }
    for (const committee of allCommittees) {
      for (const payment of committee.flatFeePayments ?? []) {
        const bulkKey = payment.bulkPaymentId ?? payment.id
        const existing = groups.get(bulkKey)
        if (existing) {
          existing.totalAmount += payment.amount
          if (!existing.categories.includes(payment.category))
            existing.categories.push(payment.category)
          existing.receipt ??= payment.receipt
        } else {
          groups.set(bulkKey, {
            id: bulkKey,
            bulkKey,
            barangayCommitteeId: committee.id,
            date: payment.date,
            categories: [payment.category],
            paidByName: payment.paidByName ?? '—',
            memberCount: 0,
            totalAmount: payment.amount,
            receipt: payment.receipt
          })
        }
      }
    }
    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
  }, [members, allCommittees])

  const filteredPaymentRows = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    if (!q) return paymentRows
    return paymentRows.filter((row) => {
      const committee = committeeByIdForPayments.get(row.barangayCommitteeId)
      return (
        (committee?.name ?? '').toLowerCase().includes(q) ||
        row.paidByName.toLowerCase().includes(q)
      )
    })
  }, [paymentRows, paymentSearch, committeeByIdForPayments])

  const [editPaymentTarget, setEditPaymentTarget] = useState<PaymentRow | null>(null)
  const [editPaymentDate, setEditPaymentDate] = useState('')
  const [editPaymentPaidBy, setEditPaymentPaidBy] = useState('')
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<PaymentRow | null>(null)

  function openEditPayment(row: PaymentRow) {
    setEditPaymentTarget(row)
    setEditPaymentDate(row.date)
    setEditPaymentPaidBy(row.paidByName === '—' ? '' : row.paidByName)
  }

  function handleConfirmEditPayment() {
    if (!editPaymentTarget) return
    updatePaymentGroup({
      barangayCommitteeId: editPaymentTarget.barangayCommitteeId,
      bulkKey: editPaymentTarget.bulkKey,
      date: editPaymentDate,
      paidByName: editPaymentPaidBy.trim()
    })
    setEditPaymentTarget(null)
  }

  function handleConfirmDeletePayment() {
    if (!deletePaymentTarget) return
    deletePaymentGroup({
      barangayCommitteeId: deletePaymentTarget.barangayCommitteeId,
      bulkKey: deletePaymentTarget.bulkKey
    })
    setDeletePaymentTarget(null)
  }

  async function handleReprintPayment(row: PaymentRow) {
    if (!row.receipt) return
    const result = await printReceipt(row.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  const columns: Column<BarangayCommittee>[] = [
    { key: 'name', header: t('barangayCommittee.table.name') },
    {
      key: 'address',
      header: t('barangayCommittee.table.address'),
      render: (r) => r.address ?? '—'
    },
    {
      key: 'districtCommitteeName',
      header: t('barangayCommittee.table.districtCommitteeName'),
      render: (r) => r.districtCommitteeName ?? '—'
    },
    { key: 'telNo', header: t('barangayCommittee.table.telNo'), render: (r) => r.telNo ?? '—' },
    {
      key: 'memberCount',
      header: t('barangayCommittee.table.members'),
      sortable: false,
      render: (r) => String(memberCounts.get(r.id) ?? 0)
    },
    statusColumn<BarangayCommittee>({
      key: 'isActive',
      header: t('barangayCommittee.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<BarangayCommittee>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setToggleTarget(r)}
              title={
                r.isActive
                  ? t('barangayCommittee.table.deactivate')
                  : t('barangayCommittee.table.reactivate')
              }
            >
              <UserX size={13} />
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
      ),
      t('common.actions')
    )
  ]
  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  const registrationColumns: Column<BarangayCommitteeRegistration>[] = [
    {
      key: 'name',
      header: t('barangayCommitteeRegistration.table.committeeName'),
      render: (r) => committeeById.get(r.barangayCommitteeId)?.name ?? '—'
    },
    { key: 'schoolYear', header: t('barangayCommitteeRegistration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('barangayCommitteeRegistration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    {
      key: 'registrationStatus',
      header: t('barangayCommitteeRegistration.table.registrationStatus'),
      render: (r) => (
        <Badge variant={r.registrationStatus === 'new' ? 'primary' : 'outline'}>
          {r.registrationStatus === 'new'
            ? t('barangayCommitteeRegistration.form.statusNew')
            : t('barangayCommitteeRegistration.form.statusReRegistered')}
        </Badge>
      )
    },
    actionsColumn<BarangayCommitteeRegistration>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/barangay-committee-registration/${r.id}`)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/barangay-committee-registration/${r.id}`)}
              title={t('common.edit')}
            >
              <Pencil size={13} />
            </Button>
          )}
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRegDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
      t('common.actions')
    )
  ]
  const { hiddenColumns: hiddenRegColumns, toggleColumn: toggleRegColumn } =
    useColumnVisibility(registrationColumns)

  const categoryLabels: Record<MemberPaymentCategory | FlatFeeCategory, string> = {
    membership: t('barangayCommittee.payment.categoryMembership'),
    bc_group_fee: t('barangayCommittee.payment.bcGroupFeeLabel')
  }

  const paymentColumns: Column<(typeof paymentRows)[number]>[] = [
    {
      key: 'committeeName',
      header: t('barangayCommittee.payment.table.committeeName'),
      render: (r) => committeeByIdForPayments.get(r.barangayCommitteeId)?.name ?? '—'
    },
    {
      key: 'date',
      header: t('barangayCommittee.payment.table.date'),
      render: (r) => (r.date ? formatDate(r.date) : '—')
    },
    {
      key: 'category',
      header: t('barangayCommittee.payment.table.category'),
      render: (r) => r.categories.map((c) => categoryLabels[c]).join(', ')
    },
    { key: 'paidByName', header: t('barangayCommittee.payment.table.paidBy') },
    {
      key: 'memberCount',
      header: t('barangayCommittee.payment.table.memberCount'),
      render: (r) => (r.memberCount > 0 ? String(r.memberCount) : '—')
    },
    {
      key: 'totalAmount',
      header: t('barangayCommittee.payment.table.totalAmount'),
      render: (r) => `₱${formatAmount(r.totalAmount)}`
    },
    actionsColumn<(typeof paymentRows)[number]>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {r.receipt && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReprintPayment(r)}
              title={t('receipts.reprintButton')}
            >
              <Printer size={13} />
            </Button>
          )}
          {canManagePayments && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditPayment(r)}
              title={t('common.edit')}
            >
              <Pencil size={13} />
            </Button>
          )}
          {canManagePayments && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeletePaymentTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
      t('common.actions')
    )
  ]
  const { hiddenColumns: hiddenPaymentColumns, toggleColumn: togglePaymentColumn } =
    useColumnVisibility(paymentColumns)

  return (
    <motion.div
      key="barangay-committee"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('barangayCommittee.title')}
        subtitle={
          activeTab === 'committees'
            ? t('barangayCommittee.subtitle')
            : activeTab === 'registrations'
              ? t('barangayCommitteeRegistration.subtitle')
              : t('barangayCommittee.payment.subtitle')
        }
        icon={<Landmark size={18} />}
        actions={
          activeTab === 'committees' ? (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              {canManage && (
                <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                  {t('barangayCommittee.addButton')}
                </Button>
              )}
            </>
          ) : activeTab === 'registrations' ? (
            <>
              <RefreshButton onRefresh={() => hydrateRegistrations(true)} />
              {canManageReg && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={openCommitteePicker}
                >
                  {t('barangayCommitteeRegistration.addButton')}
                </Button>
              )}
            </>
          ) : (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              {canManagePayments && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => setShowReceiptTypePicker(true)}
                >
                  {t('barangayCommittee.payment.addButton')}
                </Button>
              )}
            </>
          )
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams(v === 'committees' ? {} : { tab: v })}
      >
        <div style={{ marginBottom: 14 }}>
          <TabsList>
            <TabsTrigger value="committees">{t('barangayCommittee.tabCommittees')}</TabsTrigger>
            <TabsTrigger value="registrations">
              {t('barangayCommittee.tabRegistrations')}
            </TabsTrigger>
            <TabsTrigger value="payments">{t('barangayCommittee.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="committees">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('barangayCommittee.searchPlaceholder')}
            count={filteredCommittees.length}
            columnsSlot={
              <ColumnsButton
                columns={columns}
                hiddenColumns={hiddenColumns}
                onToggle={toggleColumn}
              />
            }
          />
          <Card padding="0px">
            <DataTable
              columns={columns}
              data={filteredCommittees}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('barangayCommittee.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={regSearch}
            onSearchChange={setRegSearch}
            searchPlaceholder={t('barangayCommitteeRegistration.searchPlaceholder')}
            count={displayedRegistrations.length}
            columnsSlot={
              <ColumnsButton
                columns={registrationColumns}
                hiddenColumns={hiddenRegColumns}
                onToggle={toggleRegColumn}
              />
            }
          >
            {districtParam && (
              <DistrictFilterChip district={districtParam} onClear={clearDistrictFilter} />
            )}
          </TableToolbar>
          <Card padding="0px">
            <DataTable
              columns={registrationColumns}
              data={displayedRegistrations}
              hiddenColumns={hiddenRegColumns}
              loading={regLoading}
              emptyMessage={t('barangayCommitteeRegistration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('barangayCommittee.payment.searchPlaceholder')}
            count={filteredPaymentRows.length}
            columnsSlot={
              <ColumnsButton
                columns={paymentColumns}
                hiddenColumns={hiddenPaymentColumns}
                onToggle={togglePaymentColumn}
              />
            }
          />
          <Card padding="0px">
            <DataTable
              columns={paymentColumns}
              data={filteredPaymentRows}
              hiddenColumns={hiddenPaymentColumns}
              loading={loading}
              emptyMessage={t('barangayCommittee.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <BarangayCommitteeFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('barangayCommittee.confirmDeactivate.title')
            : t('barangayCommittee.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('barangayCommittee.confirmDeactivate.message', { name: toggleTarget?.name ?? '' })
            : t('barangayCommittee.confirmReactivate.message', { name: toggleTarget?.name ?? '' })
        }
        confirmLabel={
          toggleTarget?.isActive
            ? t('barangayCommittee.table.deactivate')
            : t('barangayCommittee.table.reactivate')
        }
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('barangayCommittee.confirmDelete.title')}
        message={t('barangayCommittee.confirmDelete.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('barangayCommittee.confirmForceDelete.title')}
        message={t('barangayCommittee.confirmForceDelete.message', {
          name: forceDeleteTarget?.name ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />

      <BarangayCommitteePickerModal
        open={showCommitteePicker}
        onOpenChange={setShowCommitteePicker}
        committees={allCommittees}
        onPick={startRegistrationForCommittee}
      />

      <ReceiptTypePickerModal
        open={showReceiptTypePicker}
        onOpenChange={setShowReceiptTypePicker}
        onSelect={handlePickReceiptType}
      />

      <RecordBCBulkPaymentModal
        open={showBulkPaymentModal}
        onOpenChange={setShowBulkPaymentModal}
        initialReceiptType={bulkPaymentReceiptType}
      />

      <Modal
        open={!!editPaymentTarget}
        onOpenChange={(o) => !o && setEditPaymentTarget(null)}
        title={t('barangayCommittee.payment.editModalTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditPaymentTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmEditPayment}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label={t('barangayCommittee.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={editPaymentDate}
              onChange={(e) => setEditPaymentDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('barangayCommittee.payment.paidByLabel')} required>
            <FieldInput
              value={editPaymentPaidBy}
              onChange={(e) => setEditPaymentPaidBy(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletePaymentTarget}
        title={t('barangayCommittee.payment.confirmDelete.title')}
        message={t('barangayCommittee.payment.confirmDelete.message', {
          category: deletePaymentTarget
            ? deletePaymentTarget.categories.map((c) => categoryLabels[c]).join(', ')
            : '',
          name: deletePaymentTarget
            ? (committeeByIdForPayments.get(deletePaymentTarget.barangayCommitteeId)?.name ?? '')
            : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePayment}
        onCancel={() => setDeletePaymentTarget(null)}
      />

      <ConfirmDialog
        open={!!regDeleteTarget}
        title={t('barangayCommitteeRegistration.confirmDelete.title')}
        message={t('barangayCommitteeRegistration.confirmDelete.message', {
          name: regDeleteTarget
            ? (committeeById.get(regDeleteTarget.barangayCommitteeId)?.name ?? '')
            : '',
          schoolYear: regDeleteTarget?.schoolYear ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteRegistration}
        onCancel={() => setRegDeleteTarget(null)}
      />
    </motion.div>
  )
}
