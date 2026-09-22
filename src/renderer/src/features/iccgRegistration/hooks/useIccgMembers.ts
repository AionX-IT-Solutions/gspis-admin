import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useIccgMemberStore } from '../store/iccgMember.store'
import type { IccgMember } from '../types/iccgMember.types'

/** The Members tab's list state — the persistent per-troop ICCG roster (girls + adults),
 *  synced from filed registrations but also directly addable/editable here, same "Members"
 *  tab pattern as features/associateMember and features/honoraryMember. */
export function useIccgMembers() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:iccgRegistration')
  const members = useIccgMemberStore((s) => s.members)
  const deleteMember = useIccgMemberStore((s) => s.deleteMember)
  const updateMember = useIccgMemberStore((s) => s.updateMember)
  const troops = useTroopsStore((s) => s.troops)
  const troopById = useMemo(() => new Map(troops.map((tr) => [tr.id, tr])), [troops])

  const [search, setSearch] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editTarget, setEditTarget] = useState<IccgMember | null>(null)
  const [toggleTarget, setToggleTarget] = useState<IccgMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IccgMember | null>(null)
  const [forceDeleteTarget, setForceDeleteTarget] = useState<IccgMember | null>(null)

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      const troop = troopById.get(m.troopId)
      return (
        m.fullName.toLowerCase().includes(q) ||
        (troop?.troopNumber ?? '').toLowerCase().includes(q) ||
        (troop?.troopName ?? '').toLowerCase().includes(q)
      )
    })
  }, [members, search, troopById])

  function openAdd() {
    setEditTarget(null)
    setShowFormModal(true)
  }
  function openEdit(member: IccgMember) {
    setEditTarget(member)
    setShowFormModal(true)
  }

  function handleConfirmToggleActive() {
    if (!toggleTarget || !canManage) return
    updateMember(toggleTarget.id, { isActive: !toggleTarget.isActive })
    toast.success(
      toggleTarget.isActive
        ? t('iccgRegistration.members.toast.deactivated', { name: toggleTarget.fullName })
        : t('iccgRegistration.members.toast.reactivated', { name: toggleTarget.fullName })
    )
    setToggleTarget(null)
  }

  // Blocked once the member has payment history — escalates to the force-delete confirm
  // instead, same two-step pattern as features/trefoilGuild's deleteGuild/deleteMember.
  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    if ((deleteTarget.payments?.length ?? 0) > 0) {
      const target = deleteTarget
      setDeleteTarget(null)
      setForceDeleteTarget(target)
      return
    }
    deleteMember(deleteTarget.id)
    toast.success(t('iccgRegistration.members.toast.deleted', { name: deleteTarget.fullName }))
    setDeleteTarget(null)
  }

  function handleConfirmForceDelete() {
    if (!forceDeleteTarget || !canManage) return
    deleteMember(forceDeleteTarget.id, true)
    toast.success(t('iccgRegistration.members.toast.deleted', { name: forceDeleteTarget.fullName }))
    setForceDeleteTarget(null)
  }

  return {
    canManage,
    search,
    setSearch,
    filteredMembers,
    troopById,
    showFormModal,
    setShowFormModal,
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
