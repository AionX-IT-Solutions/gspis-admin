import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import type { BarangayCommitteeRegistration } from '../types/barangayCommitteeRegistration.types'

export function useBarangayCommitteeRegistrations() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:barangayCommittee')
  const registrations = useBarangayCommitteeRegistrationStore((s) => s.registrations)
  const deleteRegistration = useBarangayCommitteeRegistrationStore((s) => s.deleteRegistration)
  const committees = useBarangayCommitteeStore((s) => s.committees)

  const [search, setSearch] = useState('')
  const [showCommitteePicker, setShowCommitteePicker] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BarangayCommitteeRegistration | null>(null)

  const committeeById = useMemo(() => new Map(committees.map((c) => [c.id, c])), [committees])

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((reg) => {
      const committee = committeeById.get(reg.barangayCommitteeId)
      return (
        (committee?.name ?? '').toLowerCase().includes(q) ||
        reg.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [registrations, search, committeeById])

  function openCommitteePicker() {
    setShowCommitteePicker(true)
  }

  function startRegistrationForCommittee(barangayCommitteeId: string) {
    setShowCommitteePicker(false)
    navigate(`/barangay-committee-registration/new?barangayCommitteeId=${barangayCommitteeId}`)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('barangayCommitteeRegistration.toast.deleted'))
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
