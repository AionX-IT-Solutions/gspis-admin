import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'
import { useAssociateMemberStore } from '../store/associateMember.store'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

export function useAssociateMemberRegistrations() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:associateMember')
  const registrations = useAssociateMemberRegistrationStore((s) => s.registrations)
  const deleteRegistration = useAssociateMemberRegistrationStore((s) => s.deleteRegistration)
  const members = useAssociateMemberStore((s) => s.members)

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<AssociateMemberRegistration | null>(null)
  const [presetMemberId, setPresetMemberId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AssociateMemberRegistration | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<AssociateMemberRegistration | null>(null)
  const [search, setSearch] = useState('')

  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter((r) => {
      const member = memberById.get(r.associateMemberId)
      return (
        (member ? `${member.lastName} ${member.firstName}` : '').toLowerCase().includes(q) ||
        r.schoolYear.toLowerCase().includes(q)
      )
    })
  }, [registrations, search, memberById])

  function openAdd(forMemberId?: string) {
    setEditTarget(null)
    setPresetMemberId(forMemberId ?? null)
    setShowDialog(true)
  }

  function openEdit(registration: AssociateMemberRegistration) {
    setEditTarget(registration)
    setPresetMemberId(null)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRegistration(deleteTarget.id)
    toast.success(t('associateMember.registration.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    registrations: filteredRegistrations,
    memberById,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    presetMemberId,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    paymentTarget,
    setPaymentTarget
  }
}
