import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Eye, Plus, Pencil, RefreshCw, UserX, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import { formatDate } from '@/shared/lib/utils'
import { useTrainingProfilesStore } from '@/features/trainingProfiles/store/trainingProfiles.store'
import { useTroopsStore } from '../store/troops.store'
import { useTroopProfile } from '../hooks/useTroopProfile'
import { ScoutMemberFormModal } from '../components/ScoutMemberFormModal'
import { ViewMemberModal } from '../components/ViewMemberModal'
import { RosterExportMenu } from '../components/RosterExportMenu'
import type { RosterExportRow } from '../lib/rosterExport'
import type { ScoutMember } from '../types/troop.types'

export function TroopProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const troop = useTroopsStore((s) => s.troops.find((tr) => tr.id === id) ?? null)
  const trainingProfiles = useTrainingProfilesStore((s) => s.profiles)
  // Reverse lookup — Training Profile is the one that picks a Troop (see
  // TrainingProfileFormModal's "Which Troop" field), not the other way around, so this
  // side just searches for whoever currently claims to lead this troop.
  const leaderProfile = troop
    ? (trainingProfiles.find((p) => p.troopId === troop.id && p.troopRole === 'leader') ?? null)
    : null
  const assistantLeaderProfile = troop
    ? (trainingProfiles.find((p) => p.troopId === troop.id && p.troopRole === 'assistant_leader') ??
      null)
    : null

  const {
    canManage,
    roster,
    filteredRoster,
    search,
    setSearch,
    currentMembershipYear,
    isCurrent,
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
    handleConfirmForceDelete,
    handleRenew,
    viewMemberId,
    setViewMemberId
  } = useTroopProfile(troop)

  const rosterExportRows: RosterExportRow[] = useMemo(
    () =>
      roster.map((r) => ({
        ...r,
        membershipStatusLabel: isCurrent(r)
          ? t('troops.roster.table.current', { year: r.membershipYear })
          : t('troops.roster.table.needsRenewalBadge', { year: r.membershipYear })
      })),
    [roster, isCurrent, t]
  )

  const columns: Column<ScoutMember>[] = [
    { key: 'fullName', header: t('troops.roster.table.fullName') },
    {
      key: 'birthdate',
      header: t('troops.roster.table.birthdate'),
      render: (r) => formatDate(r.birthdate)
    },
    { key: 'level', header: t('troops.roster.table.level'), render: (r) => r.level || '—' },
    {
      key: 'guardianName',
      header: t('troops.roster.table.guardian'),
      render: (r) => r.guardianName || '—'
    },
    {
      key: 'membershipYear',
      header: t('troops.roster.table.membership'),
      render: (r) =>
        isCurrent(r) ? (
          <Badge variant="success">
            {t('troops.roster.table.current', { year: r.membershipYear })}
          </Badge>
        ) : (
          <Badge variant="warning">
            {t('troops.roster.table.needsRenewalBadge', { year: r.membershipYear })}
          </Badge>
        )
    },
    actionsColumn<ScoutMember>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMemberId(r.id)}
            title={t('common.view')}
          >
            <Eye size={13} />
          </Button>
          {canManage && !isCurrent(r) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRenew(r)}
              title={t('troops.roster.renewButton')}
            >
              <RefreshCw size={13} />
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

  if (!troop) return null

  return (
    <div className="page-wrapper">
      <PageHeader
        title={troop.troopNumber}
        subtitle={troop.troopName || troop.level}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/troops')}
            leftIcon={<ArrowLeft size={14} />}
          >
            {t('common.back')}
          </Button>
        }
      />

      <Card padding="16px" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('troops.form.level')}</div>
            <div style={{ fontSize: 14 }}>{troop.level}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.leaderName')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.leaderName}</div>
            {leaderProfile ? (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {t('troops.form.trainingsCompletedCount', {
                  count: leaderProfile.completedTrainings.length
                })}
              </div>
            ) : (
              troop.leaderName && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t('troops.profile.notLinkedToProfile')}
                </div>
              )
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.assistantLeaderName')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.assistantLeaderName || '—'}</div>
            {assistantLeaderProfile && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {t('troops.form.trainingsCompletedCount', {
                  count: assistantLeaderProfile.completedTrainings.length
                })}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.school')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.school || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.barangay')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.barangay || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.meetingPlace')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.meetingPlace || '—'}</div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)'
            }}
          >
            {t('troops.roster.heading')}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {t('troops.subtitle', { year: currentMembershipYear })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <RosterExportMenu
            roster={rosterExportRows}
            troopNumber={troop.troopNumber}
            membershipYear={currentMembershipYear}
          />
          {canManage && (
            <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
              {t('troops.roster.addButton')}
            </Button>
          )}
        </div>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('troops.roster.searchPlaceholder')}
        count={filteredRoster.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredRoster}
          hiddenColumns={hiddenColumns}
          emptyMessage={t('troops.roster.empty')}
        />
      </Card>

      <ScoutMemberFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        troopId={troop.id}
        currentMembershipYear={currentMembershipYear}
        editTarget={editTarget}
      />

      <ViewMemberModal memberId={viewMemberId} onClose={() => setViewMemberId(null)} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('troops.roster.confirmDeactivate.title')
            : t('troops.roster.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('troops.roster.confirmDeactivate.message', { name: toggleTarget?.fullName ?? '' })
            : t('troops.roster.confirmReactivate.message', { name: toggleTarget?.fullName ?? '' })
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
        title={t('troops.roster.confirmDelete.title')}
        message={t('troops.roster.confirmDelete.message', { name: deleteTarget?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!forceDeleteTarget}
        title={t('troops.roster.confirmForceDelete.title')}
        message={t('troops.roster.confirmForceDelete.message', {
          name: forceDeleteTarget?.fullName ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmForceDelete}
        onCancel={() => setForceDeleteTarget(null)}
      />
    </div>
  )
}

export default TroopProfile
