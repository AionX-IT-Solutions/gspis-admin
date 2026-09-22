import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useHonoraryMemberRegistrationStore } from './honoraryMemberRegistration.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { HonoraryMember } from '../types/honoraryMember.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function fullName(m: Pick<HonoraryMember, 'firstName' | 'lastName'>) {
  return `${m.firstName} ${m.lastName}`.trim()
}

interface HonoraryMemberState {
  members: HonoraryMember[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addMember: (member: Omit<HonoraryMember, 'id'>) => string
  updateMember: (id: string, patch: Partial<Omit<HonoraryMember, 'id'>>) => void
  /** Blocked once any of the member's filed Registrations has a recorded payment — same
   *  "protect reconciled history" guard as features/troops's deleteTroop. `force` is the
   *  deliberate override; on a forced delete every Registration for this member (and any
   *  voucher it posted to) is cascade-deleted too, since a HonoraryMemberRegistration has no
   *  meaning without its member. */
  deleteMember: (id: string, force?: boolean) => void
}

export const useHonoraryMemberStore = create<HonoraryMemberState>()((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const members = await hydrateCollection<HonoraryMember>('honoraryMembers')
      set({ members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[honoraryMember.store] Failed to hydrate', err)
    }
  },

  addMember: (member) => {
    const created: HonoraryMember = { ...member, id: crypto.randomUUID() }
    set((s) => ({ members: [created, ...s.members] }))
    persistDoc('honoraryMembers', created.id, created)
    appendAuditLog({
      action: 'honorary_member_created',
      actorName: actorName(),
      entityType: 'honorary_member',
      summary: `Honorary Member ${fullName(created)} created.`
    })
    return created.id
  },

  updateMember: (id, patch) => {
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    const member = get().members.find((m) => m.id === id)
    if (member) persistDoc('honoraryMembers', id, member)
    appendAuditLog({
      action: 'honorary_member_updated',
      actorName: actorName(),
      entityType: 'honorary_member',
      summary: `Honorary Member ${member ? fullName(member) : id} updated.`
    })
  },

  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const orphanedRegistrations = useHonoraryMemberRegistrationStore
      .getState()
      .registrations.filter((r) => r.honoraryMemberId === id)
    const hasPayments = orphanedRegistrations.some((r) => !!r.receipt)
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('honoraryMembers', id)
    for (const registration of orphanedRegistrations) {
      deleteDocById('honoraryMemberRegistrations', registration.id)
      if (registration.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
    }
    useHonoraryMemberRegistrationStore.setState((s) => ({
      registrations: s.registrations.filter((r) => r.honoraryMemberId !== id)
    }))
    appendAuditLog({
      action: 'honorary_member_deleted',
      actorName: actorName(),
      entityType: 'honorary_member',
      summary: `Honorary Member ${member ? fullName(member) : id} and its ${orphanedRegistrations.length} registration(s) deleted.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  }
}))
