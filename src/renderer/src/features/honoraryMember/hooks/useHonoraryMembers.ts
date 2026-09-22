import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useHonoraryMemberStore } from '../store/honoraryMember.store'
import { useHonoraryMemberRegistrationStore } from '../store/honoraryMemberRegistration.store'
import type { HonoraryMember } from '../types/honoraryMember.types'

export function useHonoraryMembers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:honoraryMember')
  const members = useHonoraryMemberStore((s) => s.members)
  const deleteMember = useHonoraryMemberStore((s) => s.deleteMember)
  const registrations = useHonoraryMemberRegistrationStore((s) => s.registrations)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<HonoraryMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HonoraryMember | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<HonoraryMember | null>(null)
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

  function openEdit(member: HonoraryMember) {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const hasPayments = registrations.some((r) => r.honoraryMemberId === target.id && !!r.receipt)
    if (hasPayments) {
      // Payment history is on the line — a second, explicit confirmation instead of
      // silently blocking, so a real cleanup need isn't a dead end.
      setForceDeleteTarget(target)
      return
    }
    deleteMember(target.id)
    toast.success(t('honoraryMember.toast.deleted'))
  }

  function handleConfirmForceDelete() {
    if (!forceDeleteTarget || !canManage) return
    deleteMember(forceDeleteTarget.id, true)
    toast.success(t('honoraryMember.toast.deleted'))
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
