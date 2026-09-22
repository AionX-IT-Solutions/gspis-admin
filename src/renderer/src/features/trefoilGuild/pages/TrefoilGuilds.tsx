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
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import { useTrefoilGuildRegistrations } from '../hooks/useTrefoilGuildRegistrations'
import { useTrefoilGuildRegistrationStore } from '../store/trefoilGuildRegistration.store'
import { TrefoilGuildPickerModal } from '../components/TrefoilGuildPickerModal'
import type { TrefoilGuildRegistration } from '../types/trefoilGuildRegistration.types'
import type {
  FlatFeeCategory,
  MemberPaymentCategory,
  TrefoilGuild
} from '../types/trefoilGuild.types'
import { TrefoilGuildFormModal } from '../components/TrefoilGuildFormModal'
import { RecordTGBulkPaymentModal } from '../components/RecordTGBulkPaymentModal'
import { useTrefoilGuilds } from '../hooks/useTrefoilGuilds'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import { syncBulkPaymentVoucher, deleteBulkPaymentVoucher } from '../lib/tgVoucher'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function TrefoilGuilds() {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab: 'guilds' | 'registrations' | 'payments' =
    searchParams.get('tab') === 'registrations'
      ? 'registrations'
      : searchParams.get('tab') === 'payments'
        ? 'payments'
        : 'guilds'
  const { hasPermission } = usePermissions()

  // Drill-down from the Membership Status Report — ?district=X narrows the Registrations
  // tab without touching its own free-text search.
  const districtParam = searchParams.get('district')
  function clearDistrictFilter() {
    setSearchParams(activeTab === 'guilds' ? {} : { tab: activeTab })
  }

  const {
    loading,
    canManage,
    search,
    setSearch,
    filteredGuilds,
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
  } = useTrefoilGuilds()
  const hydrate = useTrefoilGuildStore((s) => s.hydrate)

  const {
    loading: regLoading,
    canManage: canManageReg,
    search: regSearch,
    setSearch: setRegSearch,
    filteredRegistrations,
    guildById,
    showGuildPicker,
    setShowGuildPicker,
    openGuildPicker,
    startRegistrationForGuild,
    deleteTarget: regDeleteTarget,
    setDeleteTarget: setRegDeleteTarget,
    handleConfirmDelete: handleConfirmDeleteRegistration
  } = useTrefoilGuildRegistrations()
  const hydrateRegistrations = useTrefoilGuildRegistrationStore((s) => s.hydrate)
  const displayedRegistrations = useMemo(() => {
    if (!districtParam) return filteredRegistrations
    return filteredRegistrations.filter(
      (r) => guildById.get(r.trefoilGuildId)?.district === districtParam
    )
  }, [filteredRegistrations, guildById, districtParam])
  const allGuilds = useTrefoilGuildStore((s) => s.guilds)
  const members = useTrefoilGuildStore((s) => s.members)
  const guildByIdForPayments = useMemo(() => new Map(allGuilds.map((g) => [g.id, g])), [allGuilds])
  const canManagePayments = hasPermission('manage:trefoilGuild')

  const [paymentSearch, setPaymentSearch] = useState('')
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
  const updatePaymentGroup = useTrefoilGuildStore((s) => s.updatePaymentGroup)
  const deletePaymentGroup = useTrefoilGuildStore((s) => s.deletePaymentGroup)

  // Groups the underlying payment records back into one row per TRANSACTION (bulkPaymentId)
  // — one receipt per remittance event, same reasoning as features/troops/pages/Troops.tsx.
  interface PaymentRow {
    id: string
    bulkKey: string
    trefoilGuildId: string
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
            trefoilGuildId: member.trefoilGuildId,
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
    for (const guild of allGuilds) {
      for (const payment of guild.flatFeePayments ?? []) {
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
            trefoilGuildId: guild.id,
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
  }, [members, allGuilds])

  const filteredPaymentRows = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    if (!q) return paymentRows
    return paymentRows.filter((row) => {
      const guild = guildByIdForPayments.get(row.trefoilGuildId)
      return (
        (guild?.name ?? '').toLowerCase().includes(q) || row.paidByName.toLowerCase().includes(q)
      )
    })
  }, [paymentRows, paymentSearch, guildByIdForPayments])

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
    const { flatPayments } = updatePaymentGroup({
      trefoilGuildId: editPaymentTarget.trefoilGuildId,
      bulkKey: editPaymentTarget.bulkKey,
      date: editPaymentDate,
      paidByName: editPaymentPaidBy.trim()
    })
    const guild = guildByIdForPayments.get(editPaymentTarget.trefoilGuildId)
    const linkedVoucherId = flatPayments.find((p) => p.linkedVoucherId)?.linkedVoucherId
    if (guild && linkedVoucherId && hasPermission('manage:vouchers')) {
      syncBulkPaymentVoucher(
        guild,
        linkedVoucherId,
        flatPayments,
        editPaymentDate,
        editPaymentPaidBy.trim()
      )
    }
    setEditPaymentTarget(null)
  }

  function handleConfirmDeletePayment() {
    if (!deletePaymentTarget) return
    const { removedFlatPayments } = deletePaymentGroup({
      trefoilGuildId: deletePaymentTarget.trefoilGuildId,
      bulkKey: deletePaymentTarget.bulkKey
    })
    const linkedVoucherId = removedFlatPayments.find((p) => p.linkedVoucherId)?.linkedVoucherId
    if (linkedVoucherId && hasPermission('manage:vouchers')) {
      deleteBulkPaymentVoucher(linkedVoucherId)
    }
    setDeletePaymentTarget(null)
  }

  async function handleReprintPayment(row: PaymentRow) {
    if (!row.receipt) return
    const result = await printReceipt(row.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  const columns: Column<TrefoilGuild>[] = [
    { key: 'name', header: t('trefoilGuild.table.name') },
    {
      key: 'guildNumber',
      header: t('trefoilGuild.table.guildNumber'),
      render: (r) => r.guildNumber ?? '—'
    },
    { key: 'address', header: t('trefoilGuild.table.address'), render: (r) => r.address ?? '—' },
    { key: 'telNo', header: t('trefoilGuild.table.telNo'), render: (r) => r.telNo ?? '—' },
    {
      key: 'memberCount',
      header: t('trefoilGuild.table.members'),
      sortable: false,
      render: (r) => String(memberCounts.get(r.id) ?? 0)
    },
    statusColumn<TrefoilGuild>({
      key: 'isActive',
      header: t('trefoilGuild.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<TrefoilGuild>(
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
                r.isActive ? t('trefoilGuild.table.deactivate') : t('trefoilGuild.table.reactivate')
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

  const registrationColumns: Column<TrefoilGuildRegistration>[] = [
    {
      key: 'name',
      header: t('trefoilGuildRegistration.table.guildName'),
      render: (r) => guildById.get(r.trefoilGuildId)?.name ?? '—'
    },
    { key: 'schoolYear', header: t('trefoilGuildRegistration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('trefoilGuildRegistration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    {
      key: 'registrationStatus',
      header: t('trefoilGuildRegistration.table.registrationStatus'),
      render: (r) => (
        <Badge variant={r.registrationStatus === 'new' ? 'primary' : 'outline'}>
          {r.registrationStatus === 'new'
            ? t('trefoilGuildRegistration.form.statusNew')
            : t('trefoilGuildRegistration.form.statusReRegistered')}
        </Badge>
      )
    },
    actionsColumn<TrefoilGuildRegistration>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/trefoil-guild-registration/${r.id}`)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/trefoil-guild-registration/${r.id}`)}
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
    membership: t('trefoilGuild.payment.categoryMembership'),
    tg_group_fee: t('trefoilGuild.payment.tgGroupFeeLabel')
  }

  const paymentColumns: Column<(typeof paymentRows)[number]>[] = [
    {
      key: 'guildName',
      header: t('trefoilGuild.payment.table.guildName'),
      render: (r) => guildByIdForPayments.get(r.trefoilGuildId)?.name ?? '—'
    },
    {
      key: 'date',
      header: t('trefoilGuild.payment.table.date'),
      render: (r) => (r.date ? formatDate(r.date) : '—')
    },
    {
      key: 'category',
      header: t('trefoilGuild.payment.table.category'),
      render: (r) => r.categories.map((c) => categoryLabels[c]).join(', ')
    },
    { key: 'paidByName', header: t('trefoilGuild.payment.table.paidBy') },
    {
      key: 'memberCount',
      header: t('trefoilGuild.payment.table.memberCount'),
      render: (r) => (r.memberCount > 0 ? String(r.memberCount) : '—')
    },
    {
      key: 'totalAmount',
      header: t('trefoilGuild.payment.table.totalAmount'),
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
      key="trefoil-guild"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('trefoilGuild.title')}
        subtitle={
          activeTab === 'guilds'
            ? t('trefoilGuild.subtitle')
            : activeTab === 'registrations'
              ? t('trefoilGuildRegistration.subtitle')
              : t('trefoilGuild.payment.subtitle')
        }
        icon={<Landmark size={18} />}
        actions={
          activeTab === 'guilds' ? (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              {canManage && (
                <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                  {t('trefoilGuild.addButton')}
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
                  onClick={openGuildPicker}
                >
                  {t('trefoilGuildRegistration.addButton')}
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
                  onClick={() => setShowBulkPaymentModal(true)}
                >
                  {t('trefoilGuild.payment.addButton')}
                </Button>
              )}
            </>
          )
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams(v === 'guilds' ? {} : { tab: v })}
      >
        <div style={{ marginBottom: 14 }}>
          <TabsList>
            <TabsTrigger value="guilds">{t('trefoilGuild.tabGuilds')}</TabsTrigger>
            <TabsTrigger value="registrations">{t('trefoilGuild.tabRegistrations')}</TabsTrigger>
            <TabsTrigger value="payments">{t('trefoilGuild.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guilds">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('trefoilGuild.searchPlaceholder')}
            count={filteredGuilds.length}
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
              data={filteredGuilds}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('trefoilGuild.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={regSearch}
            onSearchChange={setRegSearch}
            searchPlaceholder={t('trefoilGuildRegistration.searchPlaceholder')}
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
              emptyMessage={t('trefoilGuildRegistration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('trefoilGuild.payment.searchPlaceholder')}
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
              emptyMessage={t('trefoilGuild.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <TrefoilGuildFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('trefoilGuild.confirmDeactivate.title')
            : t('trefoilGuild.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('trefoilGuild.confirmDeactivate.message', { name: toggleTarget?.name ?? '' })
            : t('trefoilGuild.confirmReactivate.message', { name: toggleTarget?.name ?? '' })
        }
        confirmLabel={
          toggleTarget?.isActive
            ? t('trefoilGuild.table.deactivate')
            : t('trefoilGuild.table.reactivate')
        }
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('trefoilGuild.confirmDelete.title')}
        message={t('trefoilGuild.confirmDelete.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('trefoilGuild.confirmForceDelete.title')}
        message={t('trefoilGuild.confirmForceDelete.message', {
          name: forceDeleteTarget?.name ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />

      <TrefoilGuildPickerModal
        open={showGuildPicker}
        onOpenChange={setShowGuildPicker}
        guilds={allGuilds}
        onPick={startRegistrationForGuild}
      />

      <RecordTGBulkPaymentModal
        open={showBulkPaymentModal}
        onOpenChange={setShowBulkPaymentModal}
      />

      <Modal
        open={!!editPaymentTarget}
        onOpenChange={(o) => !o && setEditPaymentTarget(null)}
        title={t('trefoilGuild.payment.editModalTitle')}
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
          <FormField label={t('trefoilGuild.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={editPaymentDate}
              onChange={(e) => setEditPaymentDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('trefoilGuild.payment.paidByLabel')} required>
            <FieldInput
              value={editPaymentPaidBy}
              onChange={(e) => setEditPaymentPaidBy(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletePaymentTarget}
        title={t('trefoilGuild.payment.confirmDelete.title')}
        message={t('trefoilGuild.payment.confirmDelete.message', {
          category: deletePaymentTarget
            ? deletePaymentTarget.categories.map((c) => categoryLabels[c]).join(', ')
            : '',
          name: deletePaymentTarget
            ? (guildByIdForPayments.get(deletePaymentTarget.trefoilGuildId)?.name ?? '')
            : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePayment}
        onCancel={() => setDeletePaymentTarget(null)}
      />

      <ConfirmDialog
        open={!!regDeleteTarget}
        title={t('trefoilGuildRegistration.confirmDelete.title')}
        message={t('trefoilGuildRegistration.confirmDelete.message', {
          name: regDeleteTarget ? (guildById.get(regDeleteTarget.trefoilGuildId)?.name ?? '') : '',
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
