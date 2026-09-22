import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import { useTrefoilGuildRegistrationStore } from '../store/trefoilGuildRegistration.store'
import type { TrefoilGuildRegistration } from '../types/trefoilGuildRegistration.types'

export function useTrefoilGuildRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trefoilGuild')
  const registrations = useTrefoilGuildRegistrationStore((s) => s.registrations)
  const deleteRegistration = useTrefoilGuildRegistrationStore((s) => s.deleteRegistration)
  const guilds = useTrefoilGuildStore((s) => s.guilds)

  const [search, setSearch] = useState('')
  const [showGuildPicker, setShowGuildPicker] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TrefoilGuildRegistration | null>(null)

  const guildById = useMemo(() => new Map(guilds.map((g) => [g.id, g])), [guilds])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((reg) => {
      const guild = guildById.get(reg.trefoilGuildId)
      return (
        (guild?.name ?? '').toLowerCase().includes(q) || reg.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [registrations, search, guildById])

  function openGuildPicker() {
    setShowGuildPicker(true)
  }

  function startRegistrationForGuild(trefoilGuildId: string) {
    setShowGuildPicker(false)
    navigate(`/trefoil-guild-registration/new?trefoilGuildId=${trefoilGuildId}`)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('trefoilGuildRegistration.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredRegistrations,
    guildById,
    showGuildPicker,
    setShowGuildPicker,
    openGuildPicker,
    startRegistrationForGuild,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}
