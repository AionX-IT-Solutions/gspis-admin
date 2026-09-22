import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import type { BarangayCommittee } from '../types/barangayCommittee.types'

export function useBarangayCommittees() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:barangayCommittee')
  const committees = useBarangayCommitteeStore((s) => s.committees)
  const members = useBarangayCommitteeStore((s) => s.members)
  const updateCommittee = useBarangayCommitteeStore((s) => s.updateCommittee)
  const deleteCommittee = useBarangayCommitteeStore((s) => s.deleteCommittee)
  const addCommittee = useBarangayCommitteeStore((s) => s.addCommittee)
  const addMember = useBarangayCommitteeStore((s) => s.addMember)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<BarangayCommittee | null>(null)
  const [toggleTarget, setToggleTarget] = useState<BarangayCommittee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BarangayCommittee | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<BarangayCommittee | null>(null)
  const [search, setSearch] = useState('')

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const member of members) {
      if (!member.isActive) continue
      counts.set(member.barangayCommitteeId, (counts.get(member.barangayCommitteeId) ?? 0) + 1)
    }
    return counts
  }, [members])

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (committee: BarangayCommittee) => {
    setEditTarget(committee)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateCommittee(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('barangayCommittee.toast.deactivated', { name: toggleTarget.name })
        : t('barangayCommittee.toast.reactivated', { name: toggleTarget.name })
    )
    setToggleTarget(null)
  }

  function commitDelete(target: BarangayCommittee, force: boolean) {
    const orphanedMembers = members.filter((m) => m.barangayCommitteeId === target.id)
    deleteCommittee(target.id, force)
    toast.success(t('barangayCommittee.toast.deleted', { name: target.name }), {
      duration: 6000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          addCommittee(target)
          orphanedMembers.forEach(addMember)
        }
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const orphanedMembers = members.filter((m) => m.barangayCommitteeId === target.id)
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
