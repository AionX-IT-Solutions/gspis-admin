import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useIccgMemberStore } from '@/features/iccgRegistration/store/iccgMember.store'
import { useIccgRegistrationStore } from '@/features/iccgRegistration/store/iccgRegistration.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { useTroopsStore } from '../store/troops.store'
import { getMembershipYearLabel, isMembershipCurrent } from '../lib/membershipYear'
import type { Troop } from '../types/troop.types'

export function useTroops() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:troops')
  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const updateTroop = useTroopsStore((s) => s.updateTroop)
  const deleteTroop = useTroopsStore((s) => s.deleteTroop)
  const addTroop = useTroopsStore((s) => s.addTroop)
  const addScoutMember = useTroopsStore((s) => s.addScoutMember)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const troopRegistrations = useTroopRegistrationStore((s) => s.registrations)
  const addTroopRegistration = useTroopRegistrationStore((s) => s.addRegistration)
  const iccgMembers = useIccgMemberStore((s) => s.members)
  const addIccgMember = useIccgMemberStore((s) => s.addMember)
  const iccgRegistrations = useIccgRegistrationStore((s) => s.registrations)
  const addIccgRegistration = useIccgRegistrationStore((s) => s.addRegistration)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Troop | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Troop | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Troop | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<Troop | null>(null)
  const [search, setSearch] = useState('')

  const currentMembershipYear = useMemo(() => getMembershipYearLabel(startMonth), [startMonth])

  const rosterStats = useMemo(() => {
    const stats = new Map<string, { total: number; needsRenewal: number }>()
    for (const member of scoutMembers) {
      if (!member.isActive) continue
      const entry = stats.get(member.troopId) ?? { total: 0, needsRenewal: 0 }
      entry.total += 1
      if (!isMembershipCurrent(member.membershipYear, startMonth)) entry.needsRenewal += 1
      stats.set(member.troopId, entry)
    }
    return stats
  }, [scoutMembers, startMonth])

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (troop: Troop) => {
    setEditTarget(troop)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateTroop(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('troops.toast.deactivated', { troopNumber: toggleTarget.troopNumber })
        : t('troops.toast.reactivated', { troopNumber: toggleTarget.troopNumber })
    )
    setToggleTarget(null)
  }

  function commitDeleteTroop(target: Troop, force: boolean) {
    // Captured before deleteTroop() runs — it cascades to all of these (see
    // troops.store.ts), so Undo has to restore them too, not just the troop/roster.
    const orphanedMembers = scoutMembers.filter((m) => m.troopId === target.id)
    const orphanedRegistrations = troopRegistrations.filter((r) => r.troopId === target.id)
    const orphanedIccgMembers = iccgMembers.filter((m) => m.troopId === target.id)
    const orphanedIccgRegistrations = iccgRegistrations.filter((r) => r.troopId === target.id)
    deleteTroop(target.id, force)
    toast.success(t('troops.toast.deleted', { troopNumber: target.troopNumber }), {
      duration: 6000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          addTroop(target)
          orphanedMembers.forEach(addScoutMember)
          orphanedRegistrations.forEach(addTroopRegistration)
          orphanedIccgMembers.forEach(addIccgMember)
          orphanedIccgRegistrations.forEach(addIccgRegistration)
        }
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const orphanedMembers = scoutMembers.filter((m) => m.troopId === target.id)
    const orphanedIccgMembers = iccgMembers.filter((m) => m.troopId === target.id)
    if (
      orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0) ||
      orphanedIccgMembers.some((m) => (m.payments?.length ?? 0) > 0)
    ) {
      // Payment history is on the line — a second, explicit confirmation instead of
      // silently blocking, so a real cleanup need isn't a dead end.
      setForceDeleteTarget(target)
      return
    }
    commitDeleteTroop(target, false)
  }

  const handleConfirmForceDelete = () => {
    if (!forceDeleteTarget || !canManage) return
    commitDeleteTroop(forceDeleteTarget, true)
    setForceDeleteTarget(null)
  }

  const filteredTroops = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return troops
    return troops.filter(
      (tr) =>
        tr.troopNumber.toLowerCase().includes(q) ||
        tr.leaderName.toLowerCase().includes(q) ||
        (tr.troopName ?? '').toLowerCase().includes(q)
    )
  }, [troops, search])

  return {
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
  }
}
