import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Pencil, Plus, Printer, Trash2, UserPlus } from 'lucide-react'
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
import { isMembershipExpired, latestByDateApplied } from '@/shared/lib/membershipExpiry'
import { useToast } from '@/app/hooks/useToast'
import { usePrinterDeviceName } from '@/shared/hooks/usePrinterDeviceName'
import { printReceipt } from '@/shared/lib/receiptPrint'
import type { OavfMember } from '../types/oavfMember.types'
import type { OavfRegistration } from '../types/oavf.types'
import { OavfMemberFormModal } from '../components/OavfMemberFormModal'
import { OavfRegistrationFormModal } from '../components/OavfRegistrationFormModal'
import { OavfExportMenu } from '../components/OavfExportMenu'
import { RecordOavfPaymentModal } from '../components/RecordOavfPaymentModal'
import { OavfPaymentPickerModal } from '../components/OavfPaymentPickerModal'
import { useOavfMembers } from '../hooks/useOavfMembers'
import { useOavfRegistrations } from '../hooks/useOavfRegistrations'
import { useOavfMemberStore } from '../store/oavfMember.store'
import { useOavfStore } from '../store/oavf.store'

// The paper form's own membership fee is a one-time-per-year filing, but the Council treats
// the membership itself as valid for a full year from whichever Registration was last filed
// — same reasoning as Associate Member (features/associateMember/pages/AssociateMembers.tsx).
const OAVF_VALIDITY_YEARS = 1

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function OavfRegistrations() {
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
  } = useOavfMembers()
  const hydrate = useOavfMemberStore((s) => s.hydrate)

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
  } = useOavfRegistrations()
  const hydrateRegistrations = useOavfStore((s) => s.hydrate)
  const allRegistrations = useOavfStore((s) => s.registrations)
  const displayedMembers = useMemo(
    () => (districtParam ? members.filter((m) => m.district === districtParam) : members),
    [members, districtParam]
  )

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
      const member = memberById.get(r.oavfMemberId)
      return (
        (member ? `${member.lastName} ${member.firstName}` : '').toLowerCase().includes(q) ||
        r.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [paidRegistrations, paymentSearch, memberById])

  async function handleReprint(r: OavfRegistration) {
    if (!r.receipt) return
    const result = await printReceipt(r.receipt, printerDeviceName)
    if (!result.ok) toast.error(t('receipts.toast.printFailed'))
  }

  const columns: Column<OavfMember>[] = [
    {
      key: 'lastName',
      header: t('oavf.table.name'),
      render: (r) => `${r.lastName}, ${r.firstName}`
    },
    { key: 'district', header: t('oavf.table.district'), render: (r) => r.district || '—' },
    { key: 'mobileNo', header: t('oavf.table.mobileNo'), render: (r) => r.mobileNo || '—' },
    {
      key: 'membershipStatus',
      header: t('oavf.table.membershipStatus'),
      render: (r) => {
        const latest = latestByDateApplied(
          allRegistrations.filter((reg) => reg.oavfMemberId === r.id)
        )
        if (!latest) return <Badge variant="outline">{t('oavf.table.noRegistration')}</Badge>
        return isMembershipExpired(latest.dateApplied, OAVF_VALIDITY_YEARS) ? (
          <Badge variant="danger">{t('oavf.table.expired')}</Badge>
        ) : (
          <Badge variant="success">{t('oavf.table.active')}</Badge>
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
              title={t('oavf.registration.addButton')}
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

  const registrationColumns: Column<OavfRegistration>[] = [
    {
      key: 'name',
      header: t('oavf.registration.table.name'),
      render: (r) => {
        const m = memberById.get(r.oavfMemberId)
        return m ? `${m.lastName}, ${m.firstName}` : '—'
      }
    },
    { key: 'schoolYear', header: t('oavf.registration.table.schoolYear') },
    {
      key: 'dateApplied',
      header: t('oavf.registration.table.dateApplied'),
      render: (r) => (r.dateApplied ? formatDate(r.dateApplied) : '—')
    },
    {
      key: 'arNumber',
      header: t('oavf.table.paymentStatus'),
      render: (r) =>
        r.arNumber ? (
          <Badge variant="success">{t('oavf.table.paid')}</Badge>
        ) : (
          <Badge variant="outline">{t('oavf.table.unpaid')}</Badge>
        )
    },
    {
      key: 'id',
      header: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (r) => {
        const member = memberById.get(r.oavfMemberId)
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            {member && <OavfExportMenu data={{ member, registration: r }} />}
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

  const paymentColumns: Column<OavfRegistration>[] = [
    {
      key: 'name',
      header: t('oavf.payment.table.name'),
      render: (r) => {
        const m = memberById.get(r.oavfMemberId)
        return m ? `${m.lastName}, ${m.firstName}` : '—'
      }
    },
    { key: 'schoolYear', header: t('oavf.payment.table.schoolYear') },
    {
      key: 'arDate',
      header: t('oavf.payment.table.date'),
      render: (r) => (r.arDate ? formatDate(r.arDate) : '—')
    },
    { key: 'arNumber', header: t('oavf.payment.table.arNumber') },
    {
      key: 'membershipFeeTotal',
      header: t('oavf.payment.table.amount'),
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
      key="oavf-registrations"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('oavf.title')}
        subtitle={
          activeTab === 'members'
            ? t('oavf.subtitle')
            : activeTab === 'registrations'
              ? t('oavf.registration.subtitle')
              : t('oavf.payment.subtitle')
        }
        icon={<Briefcase size={18} />}
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
                  {t('oavf.addButton')}
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
                  {t('oavf.registration.addButton')}
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
                  {t('oavf.payment.recordButton')}
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
            <TabsTrigger value="members">{t('oavf.tabMembers')}</TabsTrigger>
            <TabsTrigger value="registrations">{t('oavf.tabRegistrations')}</TabsTrigger>
            <TabsTrigger value="payments">{t('oavf.tabPayments')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('oavf.searchPlaceholder')}
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
              emptyMessage={t('oavf.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <TableToolbar
            search={regSearch}
            onSearchChange={setRegSearch}
            searchPlaceholder={t('oavf.registration.searchPlaceholder')}
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
              emptyMessage={t('oavf.registration.empty')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <TableToolbar
            search={paymentSearch}
            onSearchChange={setPaymentSearch}
            searchPlaceholder={t('oavf.payment.searchPlaceholder')}
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
              emptyMessage={t('oavf.payment.empty')}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <OavfMemberFormModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <OavfRegistrationFormModal
        open={showRegDialog}
        onOpenChange={setShowRegDialog}
        editTarget={regEditTarget}
        presetMemberId={presetMemberId}
      />

      <RecordOavfPaymentModal
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        registration={paymentTarget}
      />

      <OavfPaymentPickerModal
        open={showPaymentPicker}
        onOpenChange={setShowPaymentPicker}
        onPick={(r) => {
          setShowPaymentPicker(false)
          setPaymentTarget(r)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('oavf.confirmDelete.title')}
        message={t('oavf.confirmDelete.message', {
          name: deleteTarget ? `${deleteTarget.lastName}, ${deleteTarget.firstName}` : ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('oavf.confirmForceDelete.title')}
        message={t('oavf.confirmForceDelete.message', {
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
        title={t('oavf.registration.confirmDelete.title')}
        message={t('oavf.registration.confirmDelete.message', {
          name: regDeleteTarget
            ? (memberById.get(regDeleteTarget.oavfMemberId)?.lastName ?? '')
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
