import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useAssociateMemberRegistrationStore } from './associateMemberRegistration.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { AssociateMember } from '../types/associateMember.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function fullName(m: Pick<AssociateMember, 'firstName' | 'lastName'>) {
  return `${m.firstName} ${m.lastName}`.trim()
}

interface AssociateMemberState {
  members: AssociateMember[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addMember: (member: Omit<AssociateMember, 'id'>) => string
  updateMember: (id: string, patch: Partial<Omit<AssociateMember, 'id'>>) => void
  /** Blocked once any of the member's filed Registrations has a recorded payment — same
   *  "protect reconciled history" guard as features/troops's deleteTroop. `force` is the
   *  deliberate override; on a forced delete every Registration for this member (and any
   *  voucher it posted to) is cascade-deleted too, since an AssociateMemberRegistration has
   *  no meaning without its member. */
  deleteMember: (id: string, force?: boolean) => void
}

export const useAssociateMemberStore = create<AssociateMemberState>()((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const members = await hydrateCollection<AssociateMember>('associateMembers')
      set({ members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[associateMember.store] Failed to hydrate', err)
    }
  },

  addMember: (member) => {
    const created: AssociateMember = { ...member, id: crypto.randomUUID() }
    set((s) => ({ members: [created, ...s.members] }))
    persistDoc('associateMembers', created.id, created)
    appendAuditLog({
      action: 'associate_member_created',
      actorName: actorName(),
      entityType: 'associate_member',
      summary: `Associate Member ${fullName(created)} created.`
    })
    return created.id
  },

  updateMember: (id, patch) => {
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    const member = get().members.find((m) => m.id === id)
    if (member) persistDoc('associateMembers', id, member)
    appendAuditLog({
      action: 'associate_member_updated',
      actorName: actorName(),
      entityType: 'associate_member',
      summary: `Associate Member ${member ? fullName(member) : id} updated.`
    })
  },

  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const orphanedRegistrations = useAssociateMemberRegistrationStore
      .getState()
      .registrations.filter((r) => r.associateMemberId === id)
    const hasPayments = orphanedRegistrations.some((r) => !!r.receipt)
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('associateMembers', id)
    for (const registration of orphanedRegistrations) {
      deleteDocById('associateMemberRegistrations', registration.id)
      if (registration.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
    }
    useAssociateMemberRegistrationStore.setState((s) => ({
      registrations: s.registrations.filter((r) => r.associateMemberId !== id)
    }))
    appendAuditLog({
      action: 'associate_member_deleted',
      actorName: actorName(),
      entityType: 'associate_member',
      summary: `Associate Member ${member ? fullName(member) : id} and its ${orphanedRegistrations.length} registration(s) deleted.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  }
}))
