import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useHonoraryMemberStore } from './honoraryMember.store'
import type { HonoraryMemberRegistration } from '../types/honoraryMemberRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function memberName(honoraryMemberId: string): string {
  const member = useHonoraryMemberStore.getState().members.find((m) => m.id === honoraryMemberId)
  return member ? `${member.firstName} ${member.lastName}`.trim() : honoraryMemberId
}

interface HonoraryMemberRegistrationState {
  registrations: HonoraryMemberRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (
    registration: Omit<HonoraryMemberRegistration, 'id' | 'createdAt' | 'createdBy'>
  ) => string
  updateRegistration: (
    id: string,
    patch: Partial<Omit<HonoraryMemberRegistration, 'id' | 'createdAt' | 'createdBy'>>
  ) => void
  deleteRegistration: (id: string) => void
}

export const useHonoraryMemberRegistrationStore = create<HonoraryMemberRegistrationState>()(
  (set, get) => ({
    registrations: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const registrations = await hydrateCollection<HonoraryMemberRegistration>(
          'honoraryMemberRegistrations'
        )
        set({ registrations, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[honoraryMemberRegistration.store] Failed to hydrate', err)
      }
    },

    addRegistration: (registration) => {
      const created: HonoraryMemberRegistration = {
        ...registration,
        id: crypto.randomUUID(),
        createdBy: actorName(),
        createdAt: new Date().toISOString()
      }
      set((s) => ({ registrations: [created, ...s.registrations] }))
      persistDoc('honoraryMemberRegistrations', created.id, created)
      appendAuditLog({
        action: 'honorary_member_registration_created',
        actorName: actorName(),
        entityType: 'honorary_member_registration',
        summary: `Honorary Member Registration filed for "${memberName(created.honoraryMemberId)}" (${created.schoolYear}).`
      })
      return created.id
    },

    updateRegistration: (id, patch) => {
      set((s) => ({
        registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
      const registration = get().registrations.find((r) => r.id === id)
      if (registration) persistDoc('honoraryMemberRegistrations', id, registration)
      appendAuditLog({
        action: 'honorary_member_registration_updated',
        actorName: actorName(),
        entityType: 'honorary_member_registration',
        summary: `Honorary Member Registration for "${registration ? memberName(registration.honoraryMemberId) : id}" updated.`
      })
    },

    deleteRegistration: (id) => {
      const registration = get().registrations.find((r) => r.id === id)
      set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
      deleteDocById('honoraryMemberRegistrations', id)
      appendAuditLog({
        action: 'honorary_member_registration_deleted',
        actorName: actorName(),
        entityType: 'honorary_member_registration',
        summary: `Honorary Member Registration for "${registration ? memberName(registration.honoraryMemberId) : id}" (${registration?.schoolYear ?? ''}) deleted.`
      })
    }
  })
)
