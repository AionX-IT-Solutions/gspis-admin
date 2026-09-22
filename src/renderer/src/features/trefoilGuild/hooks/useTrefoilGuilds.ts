import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import type { TrefoilGuild } from '../types/trefoilGuild.types'

export function useTrefoilGuilds() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trefoilGuild')
  const guilds = useTrefoilGuildStore((s) => s.guilds)
  const members = useTrefoilGuildStore((s) => s.members)
  const updateGuild = useTrefoilGuildStore((s) => s.updateGuild)
  const deleteGuild = useTrefoilGuildStore((s) => s.deleteGuild)
  const addGuild = useTrefoilGuildStore((s) => s.addGuild)
  const addMember = useTrefoilGuildStore((s) => s.addMember)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<TrefoilGuild | null>(null)
  const [toggleTarget, setToggleTarget] = useState<TrefoilGuild | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TrefoilGuild | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<TrefoilGuild | null>(null)
  const [search, setSearch] = useState('')

  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const member of members) {
      if (!member.isActive) continue
      counts.set(member.trefoilGuildId, (counts.get(member.trefoilGuildId) ?? 0) + 1)
    }
    return counts
  }, [members])

  const openAdd = () => {
    setEditTarget(null)
    setShowDialog(true)
  }

  const openEdit = (guild: TrefoilGuild) => {
    setEditTarget(guild)
    setShowDialog(true)
  }

  const handleConfirmToggleActive = () => {
    if (!toggleTarget || !canManage) return
    updateGuild(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.info(
      toggleTarget.isActive
        ? t('trefoilGuild.toast.deactivated', { name: toggleTarget.name })
        : t('trefoilGuild.toast.reactivated', { name: toggleTarget.name })
    )
    setToggleTarget(null)
  }

  function commitDelete(target: TrefoilGuild, force: boolean) {
    const orphanedMembers = members.filter((m) => m.trefoilGuildId === target.id)
    deleteGuild(target.id, force)
    toast.success(t('trefoilGuild.toast.deleted', { name: target.name }), {
      duration: 6000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          addGuild(target)
          orphanedMembers.forEach(addMember)
        }
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const orphanedMembers = members.filter((m) => m.trefoilGuildId === target.id)
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

  const filteredGuilds = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return guilds
    return guilds.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.address ?? '').toLowerCase().includes(q) ||
        (g.council ?? '').toLowerCase().includes(q)
    )
  }, [guilds, search])

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredGuilds,
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
