import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useTroopRegistrationStore } from '../store/troopRegistration.store'
import type { TroopRegistration } from '../types/troopRegistration.types'

export function useTroopRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:troopRegistration')
  const registrations = useTroopRegistrationStore((s) => s.registrations)
  const deleteRegistration = useTroopRegistrationStore((s) => s.deleteRegistration)
  const troops = useTroopsStore((s) => s.troops)

  const [search, setSearch] = useState('')
  const [showTroopPicker, setShowTroopPicker] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TroopRegistration | null>(null)

  const troopById = useMemo(() => new Map(troops.map((tr) => [tr.id, tr])), [troops])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((reg) => {
      const troop = troopById.get(reg.troopId)
      return (
        (troop?.troopNumber ?? '').toLowerCase().includes(q) ||
        (troop?.troopName ?? '').toLowerCase().includes(q) ||
        reg.schoolYear.toLowerCase().includes(q) ||
        (reg.troopNo ?? '').toLowerCase().includes(q)
      )
    })
  }, [registrations, search, troopById])

  function openTroopPicker() {
    setShowTroopPicker(true)
  }

  function startRegistrationForTroop(troopId: string) {
    setShowTroopPicker(false)
    navigate(`/troop-registration/new?troopId=${troopId}`)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('troopRegistration.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredRegistrations,
    troopById,
    showTroopPicker,
    setShowTroopPicker,
    openTroopPicker,
    startRegistrationForTroop,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}
