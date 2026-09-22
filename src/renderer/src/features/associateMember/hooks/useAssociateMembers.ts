import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAssociateMemberStore } from '../store/associateMember.store'
import { useAssociateMemberRegistrationStore } from '../store/associateMemberRegistration.store'
import type { AssociateMember } from '../types/associateMember.types'

export function useAssociateMembers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:associateMember')
  const members = useAssociateMemberStore((s) => s.members)
  const deleteMember = useAssociateMemberStore((s) => s.deleteMember)
  const registrations = useAssociateMemberRegistrationStore((s) => s.registrations)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<AssociateMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AssociateMember | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<AssociateMember | null>(null)
  const [search, setSearch] = useState('')

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) =>
        m.lastName.toLowerCase().includes(q) ||
        m.firstName.toLowerCase().includes(q) ||
        m.homeAddress.toLowerCase().includes(q)
    )
  }, [members, search])

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(member: AssociateMember) {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const hasPayments = registrations.some((r) => r.associateMemberId === target.id && !!r.receipt)
    if (hasPayments) {
      // Payment history is on the line — a second, explicit confirmation instead of
      // silently blocking, so a real cleanup need isn't a dead end.
      setForceDeleteTarget(target)
      return
    }
    deleteMember(target.id)
    toast.success(t('associateMember.toast.deleted'))
  }

  function handleConfirmForceDelete() {
    if (!forceDeleteTarget || !canManage) return
    deleteMember(forceDeleteTarget.id, true)
    toast.success(t('associateMember.toast.deleted'))
    setForceDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    members: filteredMembers,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    forceDeleteTarget,
    setForceDeleteTarget,
    handleConfirmForceDelete
  }
}
