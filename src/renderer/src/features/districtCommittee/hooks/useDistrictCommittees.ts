import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDistrictCommitteeStore } from '../store/districtCommittee.store'
import { useDistrictCommitteeRegistrationStore } from '../store/districtCommitteeRegistration.store'
import type { DistrictCommittee } from '../types/districtCommittee.types'

export function useDistrictCommittees() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:districtCommittee')
  const committees = useDistrictCommitteeStore((s) => s.committees)
  const members = useDistrictCommitteeStore((s) => s.members)
  const updateCommittee = useDistrictCommitteeStore((s) => s.updateCommittee)
  const deleteCommittee = useDistrictCommitteeStore((s) => s.deleteCommittee)
  const addCommittee = useDistrictCommitteeStore((s) => s.addCommittee)
  const addMember = useDistrictCommitteeStore((s) => s.addMember)
  const registrations = useDistrictCommitteeRegistrationStore((s) => s.registrations)
  const addRegistration = useDistrictCommitteeRegistrationStore((s) => s.addRegistration)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<DistrictCommittee | null>(null)
  const [toggleTarget, setToggleTarget] = useState<DistrictCommittee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DistrictCommittee | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<DistrictCommittee | null>(null)
  const [search, setSearch] = useState('')

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const member of members) {
      if (!member.isActive) continue
      counts.set(member.districtCommitteeId, (counts.get(member.districtCommitteeId) ?? 0) + 1)
    }
    return counts
  }, [members])

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (committee: DistrictCommittee) => {
    setEditTarget(committee)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateCommittee(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('districtCommittee.toast.deactivated', { name: toggleTarget.name })
        : t('districtCommittee.toast.reactivated', { name: toggleTarget.name })
    )
    setToggleTarget(null)
  }

  function commitDelete(target: DistrictCommittee, force: boolean) {
    // Captured before deleteCommittee() runs — it cascades to filed Registrations too (see
    // districtCommittee.store.ts), so Undo has to restore them as well.
    const orphanedMembers = members.filter((m) => m.districtCommitteeId === target.id)
    const orphanedRegistrations = registrations.filter((r) => r.districtCommitteeId === target.id)
    deleteCommittee(target.id, force)
    toast.success(t('districtCommittee.toast.deleted', { name: target.name }), {
      duration: 6000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          addCommittee(target)
          orphanedMembers.forEach(addMember)
          orphanedRegistrations.forEach(addRegistration)
        }
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const orphanedMembers = members.filter((m) => m.districtCommitteeId === target.id)
    if (orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0)) {
      setForceDeleteTarget(target)
      return
    }
    commitDelete(target, false)
  }

  const handleConfirmForceDelete = () => {
    if (!forceDeleteTarget || !canManage) return
    commitDelete(forceDeleteTarget, true)
    setForceDeleteTarget(null)
  }

  const filteredCommittees = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return committees
    return committees.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q) ||
        (c.council ?? '').toLowerCase().includes(q)
    )
  }, [committees, search])

  return {
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
  }
}
