import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useIccgRegistrationStore } from '../store/iccgRegistration.store'
import type { IccgRegistration } from '../types/iccgRegistration.types'

export function useIccgRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:iccgRegistration')
  const registrations = useIccgRegistrationStore((s) => s.registrations)
  const deleteRegistration = useIccgRegistrationStore((s) => s.deleteRegistration)
  const troops = useTroopsStore((s) => s.troops)

  const [search, setSearch] = useState('')
  const [showTroopPicker, setShowTroopPicker] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IccgRegistration | null>(null)

  const troopById = useMemo(() => new Map(troops.map((tr) => [tr.id, tr])), [troops])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((reg) => {
      const troop = troopById.get(reg.troopId)
      return (
        reg.school.toLowerCase().includes(q) ||
        (troop?.troopNumber ?? '').toLowerCase().includes(q) ||
        (troop?.troopName ?? '').toLowerCase().includes(q) ||
        reg.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [registrations, search, troopById])

  function openTroopPicker() {
    setShowTroopPicker(true)
  }

  function startRegistrationForTroop(troopId: string) {
    setShowTroopPicker(false)
    navigate(`/iccg-registration/new?troopId=${troopId}`)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('iccgRegistration.toast.deleted'))
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
