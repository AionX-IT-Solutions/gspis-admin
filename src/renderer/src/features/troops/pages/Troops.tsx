import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Tent, Plus, Pencil, Users, UserX, Trash2, Eye, Printer, Landmark } from 'lucide-react'
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
import { useAppStore } from '@/app/store/app.store'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { ReceiptTypePickerModal } from '@/shared/components/receipts/ReceiptTypePickerModal'
import type { ReceiptKind, ReceiptRecord } from '@/shared/types/receipt.types'
import { useTroopRegistrations } from '@/features/troopRegistration/hooks/useTroopRegistrations'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { TroopPickerModal } from '@/features/troopRegistration/components/TroopPickerModal'
import type { TroopRegistration } from '@/features/troopRegistration/types/troopRegistration.types'
import type { FlatFeeCategory, MemberPaymentCategory, Troop } from '../types/troop.types'
import { TroopFormModal } from '../components/TroopFormModal'
import { TroopsExportMenu } from '../components/TroopsExportMenu'
import { RecordBulkPaymentModal } from '../components/RecordBulkPaymentModal'
import { PrintCouncilShareReceiptModal } from '@/shared/components/receipts/PrintCouncilShareReceiptModal'
import type { CouncilShareReceiptTarget } from '@/shared/hooks/usePrintCouncilShareReceiptModal'
import {
  findRecordedMembershipPayment,
  membershipPaymentCouncilShare
} from '@/features/troopRegistration/lib/registrationPaymentStatus'
import { useTroops } from '../hooks/useTroops'
import { useTroopsStore } from '../store/troops.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Troops() {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab: 'troops' | 'registrations' | 'payments' =
    searchParams.get('tab') === 'registrations'
      ? 'registrations'
      : searchParams.get('tab') === 'payments'
        ? 'payments'
        : 'troops'
  const { hasPermission } = usePermissions()

  // Drill-down from the Membership Status Report — ?district=X[&ageLevel=Twinkler] narrows
  // the Registrations tab without touching its own free-text search.
  const districtParam = searchParams.get('district')
  const ageLevelParam = searchParams.get('ageLevel')
  function clearDistrictFilter() {
    setSearchParams(activeTab === 'troops' ? {} : { tab: activeTab })
  }

  const {
    loading,
    canManage,
    search,
    setSearch,
    filteredTroops,
    rosterStats,
    currentMembershipYear,
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
  } = useTroops()
  const hydrate = useTroopsStore((s) => s.hydrate)

  const {
    loading: regLoading,
    canManage: canManageReg,
    search: regSearch,
    setSearch: setRegSearch,
    filteredRegistrations,
    troopById,
    showTroopPicker,
    setShowTroopPicker,
    openTroopPicker,
    startRegistrationForTroop,
    deleteTarget: regDeleteTarget,
    setDeleteTarget: setRegDeleteTarget,
    handleConfirmDelete: handleConfirmDeleteRegistration
  } = useTroopRegistrations()
  const hydrateRegistrations = useTroopRegistrationStore((s) => s.hydrate)
  const allRegistrations = useTroopRegistrationStore((s) => s.registrations)
  const displayedRegistrations = useMemo(() => {
    if (!districtParam) return filteredRegistrations
    return filteredRegistrations.filter((r) => {
      if (troopById.get(r.troopId)?.district !== districtParam) return false
      if (ageLevelParam && r.ageLevel !== ageLevelParam) return false
      return true
    })
  }, [filteredRegistrations, troopById, districtParam, ageLevelParam])
  const allTroops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const troopByIdForPayments = useMemo(
    () => new Map(allTroops.map((tr) => [tr.id, tr])),
    [allTroops]
  )
  const canManagePayments = hasPermission('manage:troops')

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

  const updatePaymentGroup = useTroopsStore((s) => s.updatePaymentGroup)
  const deletePaymentGroup = useTroopsStore((s) => s.deletePaymentGroup)
  const setMembershipCouncilShareReceipt = useTroopsStore((s) => s.setMembershipCouncilShareReceipt)
  const currentUser = useAppStore((s) => s.currentUser)

  // Groups the underlying payment records (features/troops/store/troops.store.ts's
  // addBulkPayment) back into one row per TRANSACTION (bulkPaymentId) — a Troop Leader pays
  // once per remittance even when it covers Membership (per member) plus flat Troop Fee/
  // Thinking Day Fee all at once, and gets one receipt for it ("isang resibo every
  // transaction" — see flatFeeVoucher.ts's postBulkPaymentVoucher), so this groups
  // everything sharing a bulkPaymentId into a single row rather than one row per fee line.
  // Per-member lines come from scoutMembers[].payments (memberCount counts distinct payment
  // entries, one per covered member); flat lines come from troops[].flatFeePayments (don't
  // add to memberCount — nothing to attach a flat per-troop fee to). A payment recorded the
  // older one-at-a-time way (no bulkPaymentId) just shows as its own single-line group.
  interface PaymentRow {
    /** == bulkKey below — kept as its own field only so action handlers read intent, not the
     *  grouping mechanics, at the call site. */
    id: string
    bulkKey: string
    troopId: string
    date: string
    categories: (MemberPaymentCategory | FlatFeeCategory)[]
    paidByName: string
    memberCount: number
    totalAmount: number
    /** The receipt printed when this transaction was recorded (Record Bulk Payment's
     *  optional "Print a receipt" toggle) — every line sharing this bulkKey carries the same
     *  one, so whichever line is seen first wins. Undefined when printing wasn't used. */
    receipt?: ReceiptRecord
    /** The Council-retained share of whatever 'membership' amount this row collected (0 for a
     *  flat-fee-only row) — see membershipPaymentCouncilShare. Drives both the "Print Council
     *  Share Receipt" button's visibility (only on a Membership row) and its printed amount. */
    councilShareAmount: number
    /** The second, internal receipt already printed for this row's council share, if any — see
     *  PrintCouncilShareReceiptModal. Undefined until that button has been used once. */
    councilShareReceipt?: ReceiptRecord
  }
  const paymentRows = useMemo(() => {
    const groups = new Map<string, PaymentRow>()
    for (const member of scoutMembers) {
      for (const payment of member.payments ?? []) {
        const bulkKey = payment.bulkPaymentId ?? payment.id
        const councilShare =
          payment.category === 'membership'
            ? membershipPaymentCouncilShare(payment, member.troopId, allRegistrations)
            : 0
        const existing = groups.get(bulkKey)
        if (existing) {
          existing.memberCount += 1
          existing.totalAmount += payment.amount
          if (!existing.categories.includes(payment.category)) {
            existing.categories.push(payment.category)
          }
          existing.receipt ??= payment.receipt
          existing.councilShareAmount += councilShare
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
            councilShareAmount: councilShare,
            councilShareReceipt: payment.councilShareReceipt
          })
        }
      }
    }
    for (const troop of allTroops) {
      for (const payment of troop.flatFeePayments ?? []) {
        const bulkKey = payment.bulkPaymentId ?? payment.id
        const existing = groups.get(bulkKey)
        if (existing) {
          existing.totalAmount += payment.amount
          if (!existing.categories.includes(payment.category)) {
            existing.categories.push(payment.category)
          }
          existing.receipt ??= payment.receipt
        } else {
          groups.set(bulkKey, {
            id: bulkKey,
            bulkKey,
            troopId: troop.id,
            date: payment.date,
            categories: [payment.category],
            paidByName: payment.paidByName ?? '—',
            memberCount: 0,
            totalAmount: payment.amount,
            receipt: payment.receipt,
            councilShareAmount: 0
          })
        }
      }
    }
    return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
  }, [scoutMembers, allTroops, allRegistrations])

  const filteredPaymentRows = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    if (!q) return paymentRows
    return paymentRows.filter((row) => {
      const troop = troopByIdForPayments.get(row.troopId)
      return (
        (troop?.troopNumber ?? '').toLowerCase().includes(q) ||
        (troop?.troopName ?? '').toLowerCase().includes(q) ||
        row.paidByName.toLowerCase().includes(q)
      )
    })
  }, [paymentRows, paymentSearch, troopByIdForPayments])

  const [editPaymentTarget, setEditPaymentTarget] = useState<PaymentRow | null>(null)
  const [editPaymentDate, setEditPaymentDate] = useState('')
  const [editPaymentPaidBy, setEditPaymentPaidBy] = useState('')
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<PaymentRow | null>(null)

  function openEditPayment(row: PaymentRow) {
    setEditPaymentTarget(row)
    setEditPaymentDate(row.date)
    setEditPaymentPaidBy(row.paidByName === '—' ? '' : row.paidByName)
  }

  // The fee amounts themselves are never editable here (they're auto-computed from the
  // troop's filed registration — see useRecordBulkPaymentModal.ts), so this only ever
  // corrects the date and who paid — applied to the WHOLE transaction at once ("isang resibo
  // every transaction"), not just the one fee line the row happened to be found under.
  function handleConfirmEditPayment() {
    if (!editPaymentTarget) return
    updatePaymentGroup({
      troopId: editPaymentTarget.troopId,
      bulkKey: editPaymentTarget.bulkKey,
      date: editPaymentDate,
      paidByName: editPaymentPaidBy.trim()
    })
    setEditPaymentTarget(null)
  }

  function handleConfirmDeletePayment() {
    if (!deletePaymentTarget) return
    deletePaymentGroup({
      troopId: deletePaymentTarget.troopId,
      bulkKey: deletePaymentTarget.bulkKey
    })
    setDeletePaymentTarget(null)
  }

  async function handleReprintPayment(row: PaymentRow) {
    if (!row.receipt) return
    const result = await printReceipt(row.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  // The Membership Fee's council-retained share gets receipted a SECOND time in real life
  // (the member-facing AR/SI above already covers the full amount collected) — this opens
  // that second, internal receipt, going through the same up-front SI/AR picker as every
  // other receipt flow only the first time it's printed; reprinting reopens the modal
  // pre-filled with what was printed before instead (see usePrintCouncilShareReceiptModal).
  const [showCouncilReceiptTypePicker, setShowCouncilReceiptTypePicker] = useState(false)
  const [pendingCouncilReceiptRow, setPendingCouncilReceiptRow] = useState<PaymentRow | null>(null)
  const [councilReceiptType, setCouncilReceiptType] = useState<ReceiptKind>('service_invoice')
  const [councilReceiptRow, setCouncilReceiptRow] = useState<PaymentRow | null>(null)
  const councilReceiptTarget: CouncilShareReceiptTarget | null = councilReceiptRow
    ? {
        key: councilReceiptRow.bulkKey,
        label: troopByIdForPayments.get(councilReceiptRow.troopId)?.troopNumber ?? '—',
        councilShareAmount: councilReceiptRow.councilShareAmount,
        payorName: councilReceiptRow.paidByName === '—' ? '' : councilReceiptRow.paidByName,
        existingReceipt: councilReceiptRow.councilShareReceipt
      }
    : null

  function openCouncilShareReceipt(row: PaymentRow) {
    if (row.councilShareReceipt) {
      setCouncilReceiptType(row.councilShareReceipt.receiptType)
      setCouncilReceiptRow(row)
    } else {
      setPendingCouncilReceiptRow(row)
      setShowCouncilReceiptTypePicker(true)
    }
  }

  const columns: Column<Troop>[] = [
    { key: 'troopNumber', header: t('troops.table.troopNumber'), width: 'w-28' },
    { key: 'troopName', header: t('troops.table.troopName'), render: (r) => r.troopName ?? '—' },
    { key: 'level', header: t('troops.table.level') },
    { key: 'leaderName', header: t('troops.table.leaderName') },
    {
      key: 'memberCount',
      header: t('troops.table.members'),
      sortable: false,
      render: (r) => {
        const stats = rosterStats.get(r.id)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{stats?.total ?? 0}</span>
            {!!stats?.needsRenewal && (
              <Badge variant="warning">
                {t('troops.table.needsRenewal', { count: stats.needsRenewal })}
              </Badge>
            )}
          </div>
        )
      }
    },
    statusColumn<Troop>({
      key: 'isActive',
      header: t('troops.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<Troop>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/troops/${r.id}`)}
            title={t('troops.viewRoster')}
          >
            <Users size={13} />
          </Button>
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
              title={r.isActive ? t('troops.table.deactivate') : t('troops.table.reactivate')}
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

  const registrationColumns: Column<TroopRegistration>[] = [
    {
      key: 'troopNumber',
      header: t('troopRegistration.table.troopNumber'),
      render: (r) => troopById.get(r.troopId)?.troopNumber ?? '—'
    },
    {
      key: 'troopName',
      header: t('troopRegistration.table.troopName'),
      render: (r) => troopById.get(r.troopId)?.troopName ?? '—'
    },
    { key: 'schoolYear', header: t('troopRegistration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('troopRegistration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    {
      key: 'troopStatus',
      header: t('troopRegistration.table.troopStatus'),
      render: (r) => (
        <Badge variant={r.troopStatus === 'new' ? 'primary' : 'outline'}>
          {r.troopStatus === 'new'
            ? t('troopRegistration.form.statusNew')
            : t('troopRegistration.form.statusReRegistered')}
        </Badge>
      )
    },
    {
      key: 'troopNo',
      header: t('troopRegistration.table.troopNo'),
      render: (r) => r.troopNo || '—'
    },
    {
      key: 'receipt',
      header: t('troopRegistration.payment.table.status'),
      // Purely a read-only reflection of the Payment tab's own ledger (see
      // findRecordedMembershipPayment) — recording payment only ever happens from the
      // Payment tab itself, never from this badge.
      render: (r) =>
        findRecordedMembershipPayment(r, allRegistrations, scoutMembers) ? (
          <Badge variant="success">{t('common.paid')}</Badge>
        ) : (
          <Badge variant="outline">{t('common.unpaid')}</Badge>
        )
    },
    actionsColumn<TroopRegistration>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/troop-registration/${r.id}`)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/troop-registration/${r.id}`)}
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
    membership: t('troops.roster.payment.categoryMembership'),
    training: t('troops.roster.payment.categoryTraining'),
    camping: t('troops.roster.payment.categoryCamping'),
    troop_fee: t('troops.payment.troopFeeLabel'),
    thinking_day: t('troops.payment.thinkingDayFeeLabel')
  }

  const paymentColumns: Column<(typeof paymentRows)[number]>[] = [
    {
      key: 'troopNumber',
      header: t('troops.payment.table.troopNumber'),
      render: (r) => troopByIdForPayments.get(r.troopId)?.troopNumber ?? '—'
    },
    {
      key: 'date',
      header: t('troops.payment.table.date'),
      render: (r) => (r.date ? formatDate(r.date) : '—')
    },
    {
      key: 'category',
      header: t('troops.payment.table.category'),
      render: (r) => r.categories.map((c) => categoryLabels[c]).join(', ')
    },
    { key: 'paidByName', header: t('troops.payment.table.paidBy') },
    {
      key: 'memberCount',
      header: t('troops.payment.table.memberCount'),
      render: (r) => (r.memberCount > 0 ? String(r.memberCount) : '—')
    },
    {
      key: 'totalAmount',
      header: t('troops.payment.table.totalAmount'),
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
          {r.categories.includes('membership') && r.councilShareAmount > 0 && canManagePayments && (
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
      key="troops"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('troops.title')}
        subtitle={
          activeTab === 'troops'
            ? t('troops.subtitle', { year: currentMembershipYear })
            : activeTab === 'registrations'
              ? t('troopRegistration.subtitle')
              : t('troops.payment.subtitle')
        }
        icon={<Tent size={18} />}
        actions={
          activeTab === 'troops' ? (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              <TroopsExportMenu
                troops={filteredTroops.map((tr) => ({
                  ...tr,
                  memberCount: rosterStats.get(tr.id)?.total ?? 0
                }))}
                membershipYear={currentMembershipYear}
              />
              {canManage && (
                <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                  {t('troops.addButton')}
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
                  onClick={openTroopPicker}
                >
                  {t('troopRegistration.addButton')}
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
                  {t('troops.payment.addButton')}
                </Button>
              )}
            </>
          )
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams(v === 'troops' ? {} : { tab: v })}
      >
        <div style={{ marginBottom: 14 }}>
          <TabsList>
            <TabsTrigger value="troops">{t('troops.tabTroops')}</TabsTrigger>
            <TabsTrigger value="registrations">{t('troops.tabRegistrations')}</TabsTrigger>
            <TabsTrigger value="payments">{t('troops.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="troops">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('troops.searchPlaceholder')}
            count={filteredTroops.length}
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
              data={filteredTroops}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('troops.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={regSearch}
            onSearchChange={setRegSearch}
            searchPlaceholder={t('troopRegistration.searchPlaceholder')}
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
              <DistrictFilterChip
                district={districtParam}
                extraLabel={ageLevelParam ?? undefined}
                onClear={clearDistrictFilter}
              />
            )}
          </TableToolbar>
          <Card padding="0px">
            <DataTable
              columns={registrationColumns}
              data={displayedRegistrations}
              hiddenColumns={hiddenRegColumns}
              loading={regLoading}
              emptyMessage={t('troopRegistration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('troops.payment.searchPlaceholder')}
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
              emptyMessage={t('troops.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <TroopFormModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('troops.confirmDeactivate.title')
            : t('troops.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('troops.confirmDeactivate.message', {
                troopNumber: toggleTarget?.troopNumber ?? ''
              })
            : t('troops.confirmReactivate.message', {
                troopNumber: toggleTarget?.troopNumber ?? ''
              })
        }
        confirmLabel={
          toggleTarget?.isActive ? t('troops.table.deactivate') : t('troops.table.reactivate')
        }
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('troops.confirmDelete.title')}
        message={t('troops.confirmDelete.message', {
          troopNumber: deleteTarget?.troopNumber ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('troops.confirmForceDelete.title')}
        message={t('troops.confirmForceDelete.message', {
          troopNumber: forceDeleteTarget?.troopNumber ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />

      <TroopPickerModal
        open={showTroopPicker}
        onOpenChange={setShowTroopPicker}
        troops={allTroops}
        onPick={startRegistrationForTroop}
      />

      <ReceiptTypePickerModal
        open={showReceiptTypePicker}
        onOpenChange={setShowReceiptTypePicker}
        onSelect={handlePickReceiptType}
      />

      <RecordBulkPaymentModal
        open={showBulkPaymentModal}
        onOpenChange={setShowBulkPaymentModal}
        initialReceiptType={bulkPaymentReceiptType}
      />

      <ReceiptTypePickerModal
        open={showCouncilReceiptTypePicker}
        onOpenChange={setShowCouncilReceiptTypePicker}
        onSelect={(type) => {
          setCouncilReceiptType(type)
          setShowCouncilReceiptTypePicker(false)
          setCouncilReceiptRow(pendingCouncilReceiptRow)
          setPendingCouncilReceiptRow(null)
        }}
      />

      <PrintCouncilShareReceiptModal
        target={councilReceiptTarget}
        defaultCashierName={currentUser?.fullName ?? ''}
        onClose={() => setCouncilReceiptRow(null)}
        onPrinted={(receipt) => {
          if (councilReceiptRow) {
            setMembershipCouncilShareReceipt({
              troopId: councilReceiptRow.troopId,
              bulkKey: councilReceiptRow.bulkKey,
              receipt
            })
          }
        }}
        initialReceiptType={councilReceiptType}
      />

      <Modal
        open={!!editPaymentTarget}
        onOpenChange={(o) => !o && setEditPaymentTarget(null)}
        title={t('troops.payment.editModalTitle')}
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
          <FormField label={t('troops.payment.dateLabel')} required>
            <FieldInput
              type="date"
              value={editPaymentDate}
              onChange={(e) => setEditPaymentDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('troops.payment.paidByLabel')} required>
            <FieldInput
              value={editPaymentPaidBy}
              onChange={(e) => setEditPaymentPaidBy(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletePaymentTarget}
        title={t('troops.payment.confirmDelete.title')}
        message={t('troops.payment.confirmDelete.message', {
          category: deletePaymentTarget
            ? deletePaymentTarget.categories.map((c) => categoryLabels[c]).join(', ')
            : '',
          troopNumber: deletePaymentTarget
            ? (troopByIdForPayments.get(deletePaymentTarget.troopId)?.troopNumber ?? '')
            : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePayment}
        onCancel={() => setDeletePaymentTarget(null)}
      />

      <ConfirmDialog
        open={!!regDeleteTarget}
        title={t('troopRegistration.confirmDelete.title')}
        message={t('troopRegistration.confirmDelete.message', {
          troopNumber: regDeleteTarget
            ? (troopById.get(regDeleteTarget.troopId)?.troopNumber ?? '')
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
