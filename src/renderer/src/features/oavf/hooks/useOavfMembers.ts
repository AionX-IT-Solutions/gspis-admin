import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOavfMemberStore } from '../store/oavfMember.store'
import { useOavfStore } from '../store/oavf.store'
import type { OavfMember } from '../types/oavfMember.types'

export function useOavfMembers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:oavf')
  const members = useOavfMemberStore((s) => s.members)
  const deleteMember = useOavfMemberStore((s) => s.deleteMember)
  const registrations = useOavfStore((s) => s.registrations)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<OavfMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OavfMember | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<OavfMember | null>(null)
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

  function openEdit(member: OavfMember) {
    setEditTarget(member)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const target = deleteTarget
    setDeleteTarget(null)
    const hasPayments = registrations.some((r) => r.oavfMemberId === target.id && !!r.receipt)
    if (hasPayments) {
      // Payment history is on the line — a second, explicit confirmation instead of
      // silently blocking, so a real cleanup need isn't a dead end.
      setForceDeleteTarget(target)
      return
    }
    deleteMember(target.id)
    toast.success(t('oavf.toast.deleted'))
  }

  function handleConfirmForceDelete() {
    if (!forceDeleteTarget || !canManage) return
    deleteMember(forceDeleteTarget.id, true)
    toast.success(t('oavf.toast.deleted'))
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
