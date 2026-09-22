import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDistrictCommitteeStore } from '../store/districtCommittee.store'
import { useDistrictCommitteeRegistrationStore } from '../store/districtCommitteeRegistration.store'
import type { DistrictCommitteeRegistration } from '../types/districtCommitteeRegistration.types'

export function useDistrictCommitteeRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:districtCommittee')
  const registrations = useDistrictCommitteeRegistrationStore((s) => s.registrations)
  const deleteRegistration = useDistrictCommitteeRegistrationStore((s) => s.deleteRegistration)
  const committees = useDistrictCommitteeStore((s) => s.committees)

  const [search, setSearch] = useState('')
  const [showCommitteePicker, setShowCommitteePicker] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DistrictCommitteeRegistration | null>(null)

  const committeeById = useMemo(() => new Map(committees.map((c) => [c.id, c])), [committees])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((reg) => {
      const committee = committeeById.get(reg.districtCommitteeId)
      return (
        (committee?.name ?? '').toLowerCase().includes(q) ||
        reg.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [registrations, search, committeeById])

  function openCommitteePicker() {
    setShowCommitteePicker(true)
  }

  function startRegistrationForCommittee(districtCommitteeId: string) {
    setShowCommitteePicker(false)
    navigate(`/district-committee-registration/new?districtCommitteeId=${districtCommitteeId}`)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('districtCommitteeRegistration.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    search,
    setSearch,
    filteredRegistrations,
    committeeById,
    showCommitteePicker,
    setShowCommitteePicker,
    openCommitteePicker,
    startRegistrationForCommittee,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}
