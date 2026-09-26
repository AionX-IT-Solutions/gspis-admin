import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { IdCard, Landmark, Plus, Pencil, Trash2, Eye, Printer, UserX } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { DistrictFilterChip } from '@/shared/components/ui/DistrictFilterChip'
import { actionsColumn, statusColumn } from '@/shared/lib/columnHelpers'
import { formatDate, formatAmount } from '@/shared/lib/utils'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { useAppStore } from '@/app/store/app.store'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { PrintCouncilShareReceiptModal } from '@/shared/components/receipts/PrintCouncilShareReceiptModal'
import type { CouncilShareReceiptTarget } from '@/shared/hooks/usePrintCouncilShareReceiptModal'
import type { ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useIccgRegistrationStore } from '../store/iccgRegistration.store'
import { useIccgMemberStore } from '../store/iccgMember.store'
import { TroopPickerModal } from '@/features/troopRegistration/components/TroopPickerModal'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import type { IccgRegistration } from '../types/iccgRegistration.types'
import type { IccgMember, MemberPaymentCategory } from '../types/iccgMember.types'
import { useIccgRegistrations } from '../hooks/useIccgRegistrations'
import { useIccgMembers } from '../hooks/useIccgMembers'
import { RecordIccgBulkPaymentModal } from '../components/RecordIccgBulkPaymentModal'
import { IccgMemberFormModal } from '../components/IccgMemberFormModal'
import { findRecordedIccgPayment } from '../lib/registrationPaymentStatus'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function IccgRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab: 'members' | 'registrations' | 'payments' =
    searchParams.get('tab') === 'registrations'
      ? 'registrations'
      : searchParams.get('tab') === 'payments'
        ? 'payments'
        : 'members'

  // Drill-down from the Membership Status Report — ?district=X narrows the Registration tab
  // without touching its own free-text search, same pattern as every other registration list
  // page.
  const districtParam = searchParams.get('district')
  function clearDistrictFilter() {
    setSearchParams(activeTab === 'members' ? {} : { tab: activeTab })
  }

  const {
    loading,
    canManage,
    search,
    setSearch,
    filteredRegistrations,
    troopById,
    showTroopPicker,
    setShowTroopPicker,
    openTroopPicker,
    startRegistrationForTroop,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useIccgRegistrations()
  const troops = useTroopsStore((s) => s.troops)
  const hydrate = useIccgRegistrationStore((s) => s.hydrate)
  const allRegistrations = useIccgRegistrationStore((s) => s.registrations)
  const displayedRegistrations = useMemo(() => {
    if (!districtParam) return filteredRegistrations
    return filteredRegistrations.filter((r) => troopById.get(r.troopId)?.district === districtParam)
  }, [filteredRegistrations, troopById, districtParam])

  const {
    canManage: canManageMembers,
    search: memberSearch,
    setSearch: setMemberSearch,
    filteredMembers,
    troopById: memberTroopById,
    showFormModal: showMemberFormModal,
    setShowFormModal: setShowMemberFormModal,
    editTarget: memberEditTarget,
    openAdd: openAddMember,
    openEdit: openEditMember,
    toggleTarget: memberToggleTarget,
    setToggleTarget: setMemberToggleTarget,
    handleConfirmToggleActive: handleConfirmMemberToggleActive,
    deleteTarget: memberDeleteTarget,
    setDeleteTarget: setMemberDeleteTarget,
    handleConfirmDelete: handleConfirmMemberDelete,
    forceDeleteTarget: memberForceDeleteTarget,
    setForceDeleteTarget: setMemberForceDeleteTarget,
    handleConfirmForceDelete: handleConfirmMemberForceDelete
  } = useIccgMembers()

  const members = useIccgMemberStore((s) => s.members)
  const hydrateMembers = useIccgMemberStore((s) => s.hydrate)
  const updatePaymentGroup = useIccgMemberStore((s) => s.updatePaymentGroup)
  const deletePaymentGroup = useIccgMemberStore((s) => s.deletePaymentGroup)
  const setCouncilShareReceipt = useIccgMemberStore((s) => s.setCouncilShareReceipt)
  const currentUser = useAppStore((s) => s.currentUser)
  const canManagePayments = hasPermission('manage:iccgRegistration')
  const [paymentSearch, setPaymentSearch] = useState('')
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
  // Record Payment always uses the Acknowledgment Receipt booklet — no picker. The Council
  // Share Receipt below is the opposite: always Service Invoice.
  const bulkPaymentReceiptType: ReceiptKind = 'acknowledgment_receipt'

  // Groups the underlying payment records back into one row per TRANSACTION (bulkPaymentId)
  // — one receipt per remittance event, same reasoning as features/trefoilGuild's own
  // Payment tab.
  interface PaymentRow {
    id: string
    bulkKey: string
    troopId: string
    date: string
    categories: MemberPaymentCategory[]
    paidByName: string
    memberCount: number
    totalAmount: number
    receipt?: ReceiptRecord
    /** The Council-retained share of this row's totalAmount — summed straight from each
     *  payment's own councilShareAmount (unlike Troops, no ratio to compute here). */
    councilShareAmount: number
    /** The second, internal receipt already printed for this row's council share, if any — see
     *  PrintCouncilShareReceiptModal. */
    councilShareReceipt?: ReceiptRecord
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
          existing.councilShareAmount += payment.councilShareAmount
          existing.councilShareReceipt ??= payment.councilShareReceipt
        } else {
          groups.set(bulkKey, {
            id: bulkKey,
            bulkKey,
            troopId: member.troopId,
            date: payment.date,
            categories: [payment.category],
            paidByName: payment.paidByName ?? '—',
            memberCount: 1,
            totalAmount: payment.amount,
            receipt: payment.receipt,
            councilShareAmount: payment.councilShareAmount,
            councilShareReceipt: payment.councilShareReceipt
          })
        }
      }
    }
    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
  }, [members])

  const filteredPaymentRows = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    if (!q) return paymentRows
    return paymentRows.filter((row) => {
      const troop = troopById.get(row.troopId)
      return (
        (troop?.troopNumber ?? '').toLowerCase().includes(q) ||
        row.paidByName.toLowerCase().includes(q)
      )
    })
  }, [paymentRows, paymentSearch, troopById])

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
      bulkKey: editPaymentTarget.bulkKey,
      date: editPaymentDate,
      paidByName: editPaymentPaidBy.trim()
    })
    setEditPaymentTarget(null)
  }

  function handleConfirmDeletePayment() {
    if (!deletePaymentTarget) return
    deletePaymentGroup(deletePaymentTarget.bulkKey)
    setDeletePaymentTarget(null)
  }

  async function handleReprintPayment(row: PaymentRow) {
    if (!row.receipt) return
    const result = await printReceipt(row.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  // The Council-retained share of this fee gets receipted a SECOND time in real life (the
  // member-facing AR above already covers the full amount collected) — same flow as Troops'/
  // OAVF's Payments tab (see usePrintCouncilShareReceiptModal). Unlike the Acknowledgment
  // Receipt recorded above, this internal share is always billed via Service Invoice — no picker.
  const [councilReceiptType, setCouncilReceiptType] = useState<ReceiptKind>('service_invoice')
  const [councilReceiptRow, setCouncilReceiptRow] = useState<PaymentRow | null>(null)
  const councilReceiptTarget: CouncilShareReceiptTarget | null = councilReceiptRow
    ? {
        key: councilReceiptRow.bulkKey,
        label: troopById.get(councilReceiptRow.troopId)?.troopNumber ?? '—',
        councilShareAmount: councilReceiptRow.councilShareAmount,
        payorName: councilReceiptRow.paidByName === '—' ? '' : councilReceiptRow.paidByName,
        existingReceipt: councilReceiptRow.councilShareReceipt
      }
    : null

  function openCouncilShareReceipt(row: PaymentRow) {
    setCouncilReceiptType(row.councilShareReceipt?.receiptType ?? 'service_invoice')
    setCouncilReceiptRow(row)
  }

  const columns: Column<IccgRegistration>[] = [
    { key: 'school', header: t('iccgRegistration.table.school') },
    {
      key: 'troopNumber',
      header: t('iccgRegistration.table.troopNumber'),
      render: (r) => troopById.get(r.troopId)?.troopNumber ?? '—'
    },
    { key: 'schoolYear', header: t('iccgRegistration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('iccgRegistration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    { key: 'girls', header: t('iccgRegistration.table.girls'), render: (r) => r.girls.length },
    { key: 'adults', header: t('iccgRegistration.table.adults'), render: (r) => r.adults.length },
    {
      key: 'total',
      header: t('iccgRegistration.table.total'),
      render: (r) => `₱${formatAmount(r.fee.total)}`
    },
    {
      key: 'receipt',
      header: t('iccgRegistration.regPayment.table.status'),
      // Purely a read-only reflection of the Payment tab's own roster ledger (see
      // findRecordedIccgPayment) — recording payment only ever happens from the Payment tab
      // itself, never from this badge.
      render: (r) =>
        findRecordedIccgPayment(r, allRegistrations, members) ? (
          <Badge variant="success">{t('common.paid')}</Badge>
        ) : (
          <Badge variant="outline">{t('common.unpaid')}</Badge>
        )
    },
    actionsColumn<IccgRegistration>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/iccg-registration/${r.id}`)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/iccg-registration/${r.id}`)}
              title={t('common.edit')}
            >
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
      ),
      t('common.actions')
    )
  ]
  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  const roleLabels: Record<IccgMember['role'], string> = {
    girl: t('iccgRegistration.members.roleGirl'),
    adult: t('iccgRegistration.members.roleAdult')
  }

  const memberColumns: Column<IccgMember>[] = [
    {
      key: 'troopNumber',
      header: t('iccgRegistration.members.table.troopNumber'),
      render: (m) => memberTroopById.get(m.troopId)?.troopNumber ?? '—'
    },
    { key: 'fullName', header: t('iccgRegistration.members.table.name') },
    {
      key: 'role',
      header: t('iccgRegistration.members.table.role'),
      render: (m) => roleLabels[m.role]
    },
    {
      key: 'gradeYear',
      header: t('iccgRegistration.members.table.gradeYear'),
      render: (m) => m.gradeYear || '—'
    },
    {
      key: 'email',
      header: t('iccgRegistration.members.table.email'),
      render: (m) => m.email || '—'
    },
    statusColumn<IccgMember>({
      key: 'isActive',
      header: t('iccgRegistration.members.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<IccgMember>(
      (m) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {canManageMembers && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditMember(m)}
              title={t('common.edit')}
            >
              <Pencil size={13} />
            </Button>
          )}
          {canManageMembers && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMemberToggleTarget(m)}
              title={
                m.isActive
                  ? t('iccgRegistration.members.deactivate')
                  : t('iccgRegistration.members.reactivate')
              }
            >
              <UserX size={13} />
            </Button>
          )}
          {canManageMembers && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMemberDeleteTarget(m)}
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
  const { hiddenColumns: hiddenMemberColumns, toggleColumn: toggleMemberColumn } =
    useColumnVisibility(memberColumns)

  const categoryLabels: Record<MemberPaymentCategory, string> = {
    girls_fee: t('iccgRegistration.payment.girlsFeeLabel'),
    adults_fee: t('iccgRegistration.payment.adultsFeeLabel')
  }

  const paymentColumns: Column<(typeof paymentRows)[number]>[] = [
    {
      key: 'troopNumber',
      header: t('iccgRegistration.payment.table.troopNumber'),
      render: (r) => troopById.get(r.troopId)?.troopNumber ?? '—'
    },
    {
      key: 'date',
      header: t('iccgRegistration.payment.table.date'),
      render: (r) => (r.date ? formatDate(r.date) : '—')
    },
    {
      key: 'category',
      header: t('iccgRegistration.payment.table.category'),
      render: (r) => r.categories.map((c) => categoryLabels[c]).join(', ')
    },
    { key: 'paidByName', header: t('iccgRegistration.payment.table.paidBy') },
    { key: 'memberCount', header: t('iccgRegistration.payment.table.memberCount') },
    {
      key: 'totalAmount',
      header: t('iccgRegistration.payment.table.totalAmount'),
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
          {r.councilShareAmount > 0 && canManagePayments && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openCouncilShareReceipt(r)}
              title={
                r.councilShareReceipt
                  ? t('receipts.councilShareReceipt.reprintButton')
                  : t('receipts.councilShareReceipt.button')
              }
            >
              <Landmark size={13} />
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
      key="iccg-registrations"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('iccgRegistration.title')}
        subtitle={
          activeTab === 'members'
            ? t('iccgRegistration.members.subtitle')
            : activeTab === 'registrations'
              ? t('iccgRegistration.subtitle')
              : t('iccgRegistration.payment.subtitle')
        }
        icon={<IdCard size={18} />}
        actions={
          activeTab === 'members' ? (
            <>
              <RefreshButton onRefresh={() => hydrateMembers(true)} />
              {canManageMembers && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={openAddMember}
                >
                  {t('iccgRegistration.members.addButton')}
                </Button>
              )}
            </>
          ) : activeTab === 'registrations' ? (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              {canManage && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={openTroopPicker}
                >
                  {t('iccgRegistration.addButton')}
                </Button>
              )}
            </>
          ) : (
            <>
              <RefreshButton onRefresh={() => hydrateMembers(true)} />
              {canManagePayments && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => setShowBulkPaymentModal(true)}
                >
                  {t('iccgRegistration.payment.addButton')}
                </Button>
              )}
            </>
          )
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams(v === 'members' ? {} : { tab: v })}
      >
        <div style={{ marginBottom: 14 }}>
          <TabsList>
            <TabsTrigger value="members">{t('iccgRegistration.tabMembers')}</TabsTrigger>
            <TabsTrigger value="registrations">
              {t('iccgRegistration.tabRegistrations')}
            </TabsTrigger>
            <TabsTrigger value="payments">{t('iccgRegistration.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members">
          <TableToolbar
            search={memberSearch}
            onSearchChange={setMemberSearch}
            searchPlaceholder={t('iccgRegistration.members.searchPlaceholder')}
            count={filteredMembers.length}
            columnsSlot={
              <ColumnsButton
                columns={memberColumns}
                hiddenColumns={hiddenMemberColumns}
                onToggle={toggleMemberColumn}
              />
            }
          />
          <Card padding="0px">
            <DataTable
              columns={memberColumns}
              data={filteredMembers}
              hiddenColumns={hiddenMemberColumns}
              loading={loading}
              emptyMessage={t('iccgRegistration.members.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('iccgRegistration.searchPlaceholder')}
            count={displayedRegistrations.length}
            columnsSlot={
              <ColumnsButton
                columns={columns}
                hiddenColumns={hiddenColumns}
                onToggle={toggleColumn}
              />
            }
          >
            {districtParam && (
              <DistrictFilterChip district={districtParam} onClear={clearDistrictFilter} />
            )}
          </TableToolbar>
          <Card padding="0px">
            <DataTable
              columns={columns}
              data={displayedRegistrations}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('iccgRegistration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('iccgRegistration.payment.searchPlaceholder')}
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
              emptyMessage={t('iccgRegistration.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <TroopPickerModal
        open={showTroopPicker}
        onOpenChange={setShowTroopPicker}
        troops={troops}
        onPick={startRegistrationForTroop}
      />

      <IccgMemberFormModal
        open={showMemberFormModal}
        onOpenChange={setShowMemberFormModal}
        editTarget={memberEditTarget}
      />

      <ConfirmDialog
        open={!!memberToggleTarget}
        title={
          memberToggleTarget?.isActive
            ? t('iccgRegistration.members.confirmDeactivate.title')
            : t('iccgRegistration.members.confirmReactivate.title')
        }
        message={
          memberToggleTarget?.isActive
            ? t('iccgRegistration.members.confirmDeactivate.message', {
                name: memberToggleTarget?.fullName ?? ''
              })
            : t('iccgRegistration.members.confirmReactivate.message', {
                name: memberToggleTarget?.fullName ?? ''
              })
        }
        confirmLabel={
          memberToggleTarget?.isActive
            ? t('iccgRegistration.members.deactivate')
            : t('iccgRegistration.members.reactivate')
        }
        danger={memberToggleTarget?.isActive}
        onConfirm={handleConfirmMemberToggleActive}
        onCancel={() => setMemberToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!memberDeleteTarget}
        title={t('iccgRegistration.members.confirmDelete.title')}
        message={t('iccgRegistration.members.confirmDelete.message', {
          name: memberDeleteTarget?.fullName ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmMemberDelete}
        onCancel={() => setMemberDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!memberForceDeleteTarget}
        title={t('iccgRegistration.members.confirmForceDelete.title')}
        message={t('iccgRegistration.members.confirmForceDelete.message', {
          name: memberForceDeleteTarget?.fullName ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmMemberForceDelete}
        onCancel={() => setMemberForceDeleteTarget(null)}
      />

      <RecordIccgBulkPaymentModal
        open={showBulkPaymentModal}
        onOpenChange={setShowBulkPaymentModal}
        initialReceiptType={bulkPaymentReceiptType}
      />

      <PrintCouncilShareReceiptModal
        target={councilReceiptTarget}
        defaultCashierName={currentUser?.fullName ?? ''}
        onClose={() => setCouncilReceiptRow(null)}
        onPrinted={(receipt) => {
          if (councilReceiptRow) {
            setCouncilShareReceipt({ bulkKey: councilReceiptRow.bulkKey, receipt })
          }
        }}
        initialReceiptType={councilReceiptType}
      />

      <Modal
        open={!!editPaymentTarget}
        onOpenChange={(o) => !o && setEditPaymentTarget(null)}
        title={t('iccgRegistration.payment.editModalTitle')}
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
          <FormField label={t('iccgRegistration.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={editPaymentDate}
              onChange={(e) => setEditPaymentDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('iccgRegistration.payment.paidByLabel')} required>
            <FieldInput
              value={editPaymentPaidBy}
              onChange={(e) => setEditPaymentPaidBy(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletePaymentTarget}
        title={t('iccgRegistration.payment.confirmDelete.title')}
        message={t('iccgRegistration.payment.confirmDelete.message', {
          category: deletePaymentTarget
            ? deletePaymentTarget.categories.map((c) => categoryLabels[c]).join(', ')
            : '',
          troopNumber: deletePaymentTarget
            ? (troopById.get(deletePaymentTarget.troopId)?.troopNumber ?? '')
            : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePayment}
        onCancel={() => setDeletePaymentTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('iccgRegistration.confirmDelete.title')}
        message={t('iccgRegistration.confirmDelete.message', {
          school: deleteTarget?.school ?? '',
          schoolYear: deleteTarget?.schoolYear ?? ''
        })}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
