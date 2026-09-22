import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Pencil, Plus, Printer, Trash2, UserPlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
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
import { formatDate } from '@/shared/lib/utils'
import { useToast } from '@/app/hooks/useToast'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import { isMembershipExpired, latestByDateApplied } from '@/shared/lib/membershipExpiry'
import type { AssociateMember } from '../types/associateMember.types'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'
import { AssociateMemberFormModal } from '../components/AssociateMemberFormModal'
import { AssociateMemberRegistrationFormModal } from '../components/AssociateMemberRegistrationFormModal'
import { AssociateMemberExportMenu } from '../components/AssociateMemberExportMenu'
import { RecordAssociateMemberPaymentModal } from '../components/RecordAssociateMemberPaymentModal'
import { AssociateMemberPaymentPickerModal } from '../components/AssociateMemberPaymentPickerModal'
import { useAssociateMembers } from '../hooks/useAssociateMembers'
import { useAssociateMemberRegistrations } from '../hooks/useAssociateMemberRegistrations'
import { useAssociateMemberStore } from '../store/associateMember.store'
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'

// The Associate Member fee is filed per school year, but the Council treats the membership
// itself as valid for 1 year from whichever Registration was last filed — same reasoning as
// OAVF/Career Woman (features/oavf/pages/OavfRegistrations.tsx).
const ASSOCIATE_MEMBER_VALIDITY_YEARS = 1

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function AssociateMembers() {
  const { t } = useTranslation()
  const toast = useToast()
  const printerDeviceName = usePrinterDeviceName()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab: 'members' | 'registrations' | 'payments' =
    searchParams.get('tab') === 'registrations'
      ? 'registrations'
      : searchParams.get('tab') === 'payments'
        ? 'payments'
        : 'members'

  // Drill-down from the Membership Status Report — ?district=X narrows the Members tab
  // without touching its own free-text search.
  const districtParam = searchParams.get('district')
  function clearDistrictFilter() {
    setSearchParams(activeTab === 'members' ? {} : { tab: activeTab })
  }

  const {
    loading,
    canManage,
    members,
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
    forceDeleteTarget,
    setForceDeleteTarget,
    handleConfirmForceDelete
  } = useAssociateMembers()
  const hydrate = useAssociateMemberStore((s) => s.hydrate)
  const displayedMembers = useMemo(
    () => (districtParam ? members.filter((m) => m.district === districtParam) : members),
    [members, districtParam]
  )

  const {
    loading: regLoading,
    canManage: canManageReg,
    registrations,
    memberById,
    search: regSearch,
    setSearch: setRegSearch,
    showDialog: showRegDialog,
    setShowDialog: setShowRegDialog,
    editTarget: regEditTarget,
    presetMemberId,
    openAdd: openAddRegistration,
    openEdit: openEditRegistration,
    deleteTarget: regDeleteTarget,
    setDeleteTarget: setRegDeleteTarget,
    handleConfirmDelete: handleConfirmDeleteRegistration,
    paymentTarget,
    setPaymentTarget
  } = useAssociateMemberRegistrations()
  const hydrateRegistrations = useAssociateMemberRegistrationStore((s) => s.hydrate)
  const allRegistrations = useAssociateMemberRegistrationStore((s) => s.registrations)

  const [paymentSearch, setPaymentSearch] = useState('')
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)
  const paidRegistrations = useMemo(
    () => allRegistrations.filter((r) => r.arNumber),
    [allRegistrations]
  )
  const filteredPaidRegistrations = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    if (!q) return paidRegistrations
    return paidRegistrations.filter((r) => {
      const member = memberById.get(r.associateMemberId)
      return (
        (member ? `${member.lastName} ${member.firstName}` : '').toLowerCase().includes(q) ||
        r.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [paidRegistrations, paymentSearch, memberById])

  async function handleReprint(r: AssociateMemberRegistration) {
    if (!r.receipt) return
    const result = await printReceipt(r.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  const columns: Column<AssociateMember>[] = [
    {
      key: 'lastName',
      header: t('associateMember.table.name'),
      render: (r) => `${r.lastName}, ${r.firstName}`
    },
    {
      key: 'district',
      header: t('associateMember.table.district'),
      render: (r) => r.district || '—'
    },
    { key: 'phone', header: t('associateMember.table.phone'), render: (r) => r.phone || '—' },
    {
      key: 'membershipStatus',
      header: t('associateMember.table.membershipStatus'),
      render: (r) => {
        const latest = latestByDateApplied(
          allRegistrations.filter((reg) => reg.associateMemberId === r.id)
        )
        if (!latest)
          return <Badge variant="outline">{t('associateMember.table.noRegistration')}</Badge>
        return isMembershipExpired(latest.dateApplied, ASSOCIATE_MEMBER_VALIDITY_YEARS) ? (
          <Badge variant="danger">{t('associateMember.table.expired')}</Badge>
        ) : (
          <Badge variant="success">{t('associateMember.table.active')}</Badge>
        )
      }
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openAddRegistration(r.id)}
              title={t('associateMember.registration.addButton')}
            >
              <UserPlus size={13} />
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

  const registrationColumns: Column<AssociateMemberRegistration>[] = [
    {
      key: 'amfNumber',
      header: t('associateMember.table.amfNumber'),
      render: (r) => r.amfNumber || '—'
    },
    {
      key: 'name',
      header: t('associateMember.registration.table.name'),
      render: (r) => {
        const m = memberById.get(r.associateMemberId)
        return m ? `${m.lastName}, ${m.firstName}` : '—'
      }
    },
    { key: 'schoolYear', header: t('associateMember.registration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('associateMember.registration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    {
      key: 'arNumber',
      header: t('associateMember.table.paymentStatus'),
      render: (r) =>
        r.arNumber ? (
          <Badge variant="success">{t('associateMember.table.paid')}</Badge>
        ) : (
          <Badge variant="outline">{t('associateMember.table.unpaid')}</Badge>
        )
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => {
        const member = memberById.get(r.associateMemberId)
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            {member && <AssociateMemberExportMenu data={{ member, registration: r }} />}
            {canManageReg && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditRegistration(r)}
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
        )
      }
    }
  ]
  const { hiddenColumns: hiddenRegColumns, toggleColumn: toggleRegColumn } =
    useColumnVisibility(registrationColumns)

  const paymentColumns: Column<AssociateMemberRegistration>[] = [
    {
      key: 'name',
      header: t('associateMember.payment.table.name'),
      render: (r) => {
        const m = memberById.get(r.associateMemberId)
        return m ? `${m.lastName}, ${m.firstName}` : '—'
      }
    },
    { key: 'schoolYear', header: t('associateMember.payment.table.schoolYear') },
    {
      key: 'arDate',
      header: t('associateMember.payment.table.date'),
      render: (r) => (r.arDate ? formatDate(r.arDate) : '—')
    },
    { key: 'arNumber', header: t('associateMember.payment.table.arNumber') },
    {
      key: 'membershipFeeTotal',
      header: t('associateMember.payment.table.amount'),
      render: (r) =>
        `₱${r.membershipFeeTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {r.receipt && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReprint(r)}
              title={t('receipts.reprintButton')}
            >
              <Printer size={13} />
            </Button>
          )}
          {canManageReg && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPaymentTarget(r)}
              title={t('common.edit')}
            >
              <Pencil size={13} />
            </Button>
          )}
        </div>
      )
    }
  ]
  const { hiddenColumns: hiddenPaymentColumns, toggleColumn: togglePaymentColumn } =
    useColumnVisibility(paymentColumns)

  return (
    <motion.div
      key="associate-members"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('associateMember.title')}
        subtitle={
          activeTab === 'members'
            ? t('associateMember.subtitle')
            : activeTab === 'registrations'
              ? t('associateMember.registration.subtitle')
              : t('associateMember.payment.subtitle')
        }
        icon={<UserCheck size={18} />}
        actions={
          activeTab === 'members' ? (
            <>
              <RefreshButton onRefresh={() => hydrate(true)} />
              {canManage && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => openAdd()}
                >
                  {t('associateMember.addButton')}
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
                  onClick={() => openAddRegistration()}
                >
                  {t('associateMember.registration.addButton')}
                </Button>
              )}
            </>
          ) : (
            <>
              <RefreshButton onRefresh={() => hydrateRegistrations(true)} />
              {canManageReg && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={() => setShowPaymentPicker(true)}
                >
                  {t('associateMember.payment.recordButton')}
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
            <TabsTrigger value="members">{t('associateMember.tabMembers')}</TabsTrigger>
            <TabsTrigger value="registrations">{t('associateMember.tabRegistrations')}</TabsTrigger>
            <TabsTrigger value="payments">{t('associateMember.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('associateMember.searchPlaceholder')}
            count={displayedMembers.length}
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
              data={displayedMembers}
              hiddenColumns={hiddenColumns}
              loading={loading}
              emptyMessage={t('associateMember.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={regSearch}
            onSearchChange={setRegSearch}
            searchPlaceholder={t('associateMember.registration.searchPlaceholder')}
            count={registrations.length}
            columnsSlot={
              <ColumnsButton
                columns={registrationColumns}
                hiddenColumns={hiddenRegColumns}
                onToggle={toggleRegColumn}
              />
            }
          />
          <Card padding="0px">
            <DataTable
              columns={registrationColumns}
              data={registrations}
              hiddenColumns={hiddenRegColumns}
              loading={regLoading}
              emptyMessage={t('associateMember.registration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('associateMember.payment.searchPlaceholder')}
            count={filteredPaidRegistrations.length}
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
              data={filteredPaidRegistrations}
              hiddenColumns={hiddenPaymentColumns}
              loading={regLoading}
              emptyMessage={t('associateMember.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <AssociateMemberFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
      />

      <AssociateMemberRegistrationFormModal
        open={showRegDialog}
        onOpenChange={setShowRegDialog}
        editTarget={regEditTarget}
        presetMemberId={presetMemberId}
      />

      <RecordAssociateMemberPaymentModal
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        registration={paymentTarget}
      />

      <AssociateMemberPaymentPickerModal
        open={showPaymentPicker}
        onOpenChange={setShowPaymentPicker}
        onPick={(r) => {
          setShowPaymentPicker(false)
          setPaymentTarget(r)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('associateMember.confirmDelete.title')}
        message={t('associateMember.confirmDelete.message', {
          name: deleteTarget ? `${deleteTarget.lastName}, ${deleteTarget.firstName}` : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('associateMember.confirmForceDelete.title')}
        message={t('associateMember.confirmForceDelete.message', {
          name: forceDeleteTarget
            ? `${forceDeleteTarget.lastName}, ${forceDeleteTarget.firstName}`
            : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!regDeleteTarget}
        title={t('associateMember.registration.confirmDelete.title')}
        message={t('associateMember.registration.confirmDelete.message', {
          name: regDeleteTarget
            ? (memberById.get(regDeleteTarget.associateMemberId)?.lastName ?? '')
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
