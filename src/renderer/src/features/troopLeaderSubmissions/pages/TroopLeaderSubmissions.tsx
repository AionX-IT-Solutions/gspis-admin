import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ClipboardList, Eye, Trash2, UserX, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { TroopPickerModal } from '@/features/troopRegistration/components/TroopPickerModal'
import { TroopLeaderSubmissionDecisionModal } from '../components/TroopLeaderSubmissionDecisionModal'
import { TroopLeaderSubmissionDetailModal } from '../components/TroopLeaderSubmissionDetailModal'
import { useMembershipSubmissions, type SubmissionRow } from '../hooks/useMembershipSubmissions'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const STATUS_VARIANT: Record<SubmissionRow['status'], 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger'
}

export function TroopLeaderSubmissions() {
  const { t } = useTranslation()
  const {
    loading,
    categories,
    activeTab,
    setActiveTab,
    activeCategory,
    decideSubmission,
    hydrateActive,
    rows,
    search,
    setSearch,
    canManage,
    decision,
    setDecision,
    detailSubmission,
    setDetailTarget,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteSubmission,
    leaderAccounts,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive
  } = useMembershipSubmissions()

  const troops = useTroopsStore((s) => s.troops)
  // ICCG's submission carries no troop link (see mergeIccgSubmission.ts) — Approve for that
  // category collects one here first, then opens the normal confirm modal below.
  const [pendingTroopPick, setPendingTroopPick] = useState<SubmissionRow | null>(null)

  function startApprove(row: SubmissionRow) {
    if (activeCategory.requiresTroopPick) {
      setPendingTroopPick(row)
      return
    }
    setDecision({
      id: row.id,
      primaryLabel: row.primaryLabel,
      submittedByName: row.submittedByName,
      status: 'approved'
    })
  }

  const columns: Column<SubmissionRow>[] = [
    { key: 'primaryLabel', header: t('troopLeaderSubmissions.table.primary') },
    { key: 'submittedByName', header: t('troopLeaderSubmissions.table.submittedBy') },
    ...(activeCategory.hasRoster
      ? [
          {
            key: 'memberCount',
            header: t('troopLeaderSubmissions.table.members'),
            align: 'right' as const
          }
        ]
      : []),
    {
      key: 'status',
      header: t('troopLeaderSubmissions.table.status'),
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{t(`common.${r.status}`)}</Badge>
    },
    {
      key: 'id',
      header: t('troopLeaderSubmissions.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDetailTarget(r.id)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {r.status === 'pending' && canManage && (
            <>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Check size={12} />}
                onClick={() => startApprove(r)}
              >
                {t('troopLeaderSubmissions.approveButton')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<X size={12} />}
                onClick={() =>
                  setDecision({
                    id: r.id,
                    primaryLabel: r.primaryLabel,
                    submittedByName: r.submittedByName,
                    status: 'rejected'
                  })
                }
              >
                {t('troopLeaderSubmissions.rejectButton')}
              </Button>
            </>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} color="#f87171" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="troopLeaderSubmissions"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('troopLeaderSubmissions.title')}
        icon={<ClipboardList size={18} />}
        actions={<RefreshButton onRefresh={() => hydrateActive(true)} />}
      />

      <div style={{ marginBottom: 16 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>
                {t(c.tabLabelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('troopLeaderSubmissions.searchPlaceholder')}
        count={rows.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />
      <Card padding="0px" style={{ marginBottom: 16 }}>
        <DataTable
          columns={columns}
          data={rows}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('troopLeaderSubmissions.empty')}
        />
      </Card>

      <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>
        {t('troopLeaderSubmissions.accountsHeading')}
      </div>
      <Card padding="0px">
        <DataTable
          columns={[
            { key: 'fullName', header: t('users.table.fullName') },
            { key: 'email', header: t('users.table.email') },
            {
              key: 'isActive',
              header: t('users.table.status'),
              render: (r) => (
                <Badge variant={r.isActive ? 'success' : 'default'}>
                  {r.isActive ? t('common.active') : t('users.statusDisabled')}
                </Badge>
              )
            },
            {
              key: 'id',
              header: t('users.table.action'),
              sortable: false,
              align: 'right',
              render: (r) =>
                canManage ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<UserX size={12} />}
                      onClick={() => setToggleTarget(r)}
                    >
                      {r.isActive ? t('users.disable') : t('users.enable')}
                    </Button>
                  </div>
                ) : null
            }
          ]}
          data={leaderAccounts}
          emptyMessage={t('troopLeaderSubmissions.noAccounts')}
        />
      </Card>

      <TroopPickerModal
        open={!!pendingTroopPick}
        onOpenChange={(open) => !open && setPendingTroopPick(null)}
        troops={troops}
        onPick={(troopId) => {
          if (pendingTroopPick) {
            setDecision({
              id: pendingTroopPick.id,
              primaryLabel: pendingTroopPick.primaryLabel,
              submittedByName: pendingTroopPick.submittedByName,
              status: 'approved',
              extra: troopId
            })
          }
          setPendingTroopPick(null)
        }}
      />
      <TroopLeaderSubmissionDecisionModal
        decision={decision}
        decideSubmission={decideSubmission}
        onClose={() => setDecision(null)}
      />
      <TroopLeaderSubmissionDetailModal
        submission={detailSubmission}
        category={activeCategory}
        onClose={() => setDetailTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('troopLeaderSubmissions.confirmDelete.title')}
        message={t('troopLeaderSubmissions.confirmDelete.message', {
          primary: deleteTarget?.primaryLabel ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteSubmission}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive ? t('users.confirmDisable.title') : t('users.confirmEnable.title')
        }
        message={
          toggleTarget?.isActive
            ? t('users.confirmDisable.message', { fullName: toggleTarget?.fullName ?? '' })
            : t('users.confirmEnable.message', { fullName: toggleTarget?.fullName ?? '' })
        }
        confirmLabel={toggleTarget?.isActive ? t('users.disable') : t('users.enable')}
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />
    </motion.div>
  )
}
