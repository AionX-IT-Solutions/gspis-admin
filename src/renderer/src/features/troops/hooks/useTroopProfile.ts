import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useTroopsStore } from '../store/troops.store'
import { getMembershipYearLabel, isMembershipCurrent } from '../lib/membershipYear'
import type { ScoutMember, Troop } from '../types/troop.types'

export function useTroopProfile(troop: Troop | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:troops')
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const deleteScoutMember = useTroopsStore((s) => s.deleteScoutMember)
  const addScoutMember = useTroopsStore((s) => s.addScoutMember)
  const updateScoutMember = useTroopsStore((s) => s.updateScoutMember)
  const renewScoutMember = useTroopsStore((s) => s.renewScoutMember)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<ScoutMember | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ScoutMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScoutMember | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<ScoutMember | null>(null)
  const [viewMemberId, setViewMemberId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const currentMembershipYear = useMemo(() => getMembershipYearLabel(startMonth), [startMonth])

  const roster = useMemo(
    () =>
      troop
        ? scoutMembers
            .filter((m) => m.troopId === troop.id)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
        : [],
    [scoutMembers, troop]
  )

  const filteredRoster = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return roster
    return roster.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.guardianName?.toLowerCase().includes(q) ?? false) ||
        (m.level?.toLowerCase().includes(q) ?? false)
    )
  }, [roster, search])

  function isCurrent(member: ScoutMember) {
    return isMembershipCurrent(member.membershipYear, startMonth)
  }

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (member: ScoutMember) => {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleRenew(member: ScoutMember) {
    if (!canManage) return
    renewScoutMember(member.id, currentMembershipYear)
    toast.success(
      t('troops.roster.toast.renewed', { name: member.fullName, year: currentMembershipYear })
    )
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateScoutMember(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('troops.roster.toast.deactivated', { name: toggleTarget.fullName })
        : t('troops.roster.toast.reactivated', { name: toggleTarget.fullName })
    )
    setToggleTarget(null)
  }

  function commitDeleteMember(target: ScoutMember, force: boolean) {
    deleteScoutMember(target.id, force)
    toast.success(t('troops.roster.toast.deleted', { name: target.fullName }), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => addScoutMember(target) }
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    if ((target.payments?.length ?? 0) > 0) {
      // Payment history is on the line — a second, explicit confirmation instead of
      // silently blocking, so a real cleanup need isn't a dead end.
      setForceDeleteTarget(target)
      return
    }
    commitDeleteMember(target, false)
  }

  const handleConfirmForceDelete = () => {
    if (!forceDeleteTarget || !canManage) return
    commitDeleteMember(forceDeleteTarget, true)
    setForceDeleteTarget(null)
  }

  return {
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
  }
}
