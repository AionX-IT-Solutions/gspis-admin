import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useAssociateMemberStore } from './associateMember.store'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function memberName(associateMemberId: string): string {
  const member = useAssociateMemberStore.getState().members.find((m) => m.id === associateMemberId)
  return member ? `${member.firstName} ${member.lastName}`.trim() : associateMemberId
}

interface AssociateMemberRegistrationState {
  registrations: AssociateMemberRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (
    registration: Omit<AssociateMemberRegistration, 'id' | 'createdAt' | 'createdBy'>
  ) => string
  updateRegistration: (
    id: string,
    patch: Partial<Omit<AssociateMemberRegistration, 'id' | 'createdAt' | 'createdBy'>>
  ) => void
  deleteRegistration: (id: string) => void
}

export const useAssociateMemberRegistrationStore = create<AssociateMemberRegistrationState>()(
  (set, get) => ({
    registrations: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const registrations = await hydrateCollection<AssociateMemberRegistration>(
          'associateMemberRegistrations'
        )
        set({ registrations, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[associateMemberRegistration.store] Failed to hydrate', err)
      }
    },

    addRegistration: (registration) => {
      const created: AssociateMemberRegistration = {
        ...registration,
        id: crypto.randomUUID(),
        createdBy: actorName(),
        createdAt: new Date().toISOString()
      }
      set((s) => ({ registrations: [created, ...s.registrations] }))
      persistDoc('associateMemberRegistrations', created.id, created)
      appendAuditLog({
        action: 'associate_member_registration_created',
        actorName: actorName(),
        entityType: 'associate_member_registration',
        summary: `Associate Member Registration filed for "${memberName(created.associateMemberId)}" (${created.schoolYear}).`
      })
      return created.id
    },

    updateRegistration: (id, patch) => {
      set((s) => ({
        registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
      const registration = get().registrations.find((r) => r.id === id)
      if (registration) persistDoc('associateMemberRegistrations', id, registration)
      appendAuditLog({
        action: 'associate_member_registration_updated',
        actorName: actorName(),
        entityType: 'associate_member_registration',
        summary: `Associate Member Registration for "${registration ? memberName(registration.associateMemberId) : id}" updated.`
      })
    },

    deleteRegistration: (id) => {
      const registration = get().registrations.find((r) => r.id === id)
      set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
      deleteDocById('associateMemberRegistrations', id)
      appendAuditLog({
        action: 'associate_member_registration_deleted',
        actorName: actorName(),
        entityType: 'associate_member_registration',
        summary: `Associate Member Registration for "${registration ? memberName(registration.associateMemberId) : id}" (${registration?.schoolYear ?? ''}) deleted.`
      })
    }
  })
)
