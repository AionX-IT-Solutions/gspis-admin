import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useOavfStore } from './oavf.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { OavfMember } from '../types/oavfMember.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function fullName(m: Pick<OavfMember, 'firstName' | 'lastName'>) {
  return `${m.firstName} ${m.lastName}`.trim()
}

interface OavfMemberState {
  members: OavfMember[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addMember: (member: Omit<OavfMember, 'id'>) => string
  updateMember: (id: string, patch: Partial<Omit<OavfMember, 'id'>>) => void
  /** Blocked once any of the member's filed Registrations has a recorded payment (a receipt
   *  and possibly a linked Journal Voucher on the line) — same "protect reconciled history"
   *  guard as features/troops's deleteTroop. `force` is the deliberate override; on a forced
   *  delete every Registration for this member (and any voucher it posted to) is cascade-
   *  deleted too, since an OavfRegistration has no meaning without its member (unlike Troop/
   *  Trefoil Guild's roster rows, which are frozen snapshots on the registration itself). */
  deleteMember: (id: string, force?: boolean) => void
}

export const useOavfMemberStore = create<OavfMemberState>()((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const members = await hydrateCollection<OavfMember>('oavfMembers')
      set({ members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[oavfMember.store] Failed to hydrate', err)
    }
  },

  addMember: (member) => {
    const created: OavfMember = { ...member, id: crypto.randomUUID() }
    set((s) => ({ members: [created, ...s.members] }))
    persistDoc('oavfMembers', created.id, created)
    appendAuditLog({
      action: 'oavf_member_created',
      actorName: actorName(),
      entityType: 'oavf_member',
      summary: `OAVF/Career Woman member ${fullName(created)} created.`
    })
    return created.id
  },

  updateMember: (id, patch) => {
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    const member = get().members.find((m) => m.id === id)
    if (member) persistDoc('oavfMembers', id, member)
    appendAuditLog({
      action: 'oavf_member_updated',
      actorName: actorName(),
      entityType: 'oavf_member',
      summary: `OAVF/Career Woman member ${member ? fullName(member) : id} updated.`
    })
  },

  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const orphanedRegistrations = useOavfStore
      .getState()
      .registrations.filter((r) => r.oavfMemberId === id)
    const hasPayments = orphanedRegistrations.some((r) => !!r.receipt)
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('oavfMembers', id)
    for (const registration of orphanedRegistrations) {
      deleteDocById('oavfRegistrations', registration.id)
      if (registration.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
    }
    useOavfStore.setState((s) => ({
      registrations: s.registrations.filter((r) => r.oavfMemberId !== id)
    }))
    appendAuditLog({
      action: 'oavf_member_deleted',
      actorName: actorName(),
      entityType: 'oavf_member',
      summary: `OAVF/Career Woman member ${member ? fullName(member) : id} and its ${orphanedRegistrations.length} registration(s) deleted.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  }
}))
