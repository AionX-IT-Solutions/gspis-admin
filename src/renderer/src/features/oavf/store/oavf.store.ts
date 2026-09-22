import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useOavfMemberStore } from './oavfMember.store'
import type { OavfRegistration } from '../types/oavf.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function memberName(oavfMemberId: string): string {
  const member = useOavfMemberStore.getState().members.find((m) => m.id === oavfMemberId)
  return member ? `${member.firstName} ${member.lastName}`.trim() : oavfMemberId
}

interface OavfState {
  registrations: OavfRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (
    registration: Omit<OavfRegistration, 'id' | 'createdAt' | 'createdBy'>
  ) => string
  updateRegistration: (
    id: string,
    patch: Partial<Omit<OavfRegistration, 'id' | 'createdAt' | 'createdBy'>>
  ) => void
  deleteRegistration: (id: string) => void
}

export const useOavfStore = create<OavfState>()((set, get) => ({
  registrations: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const registrations = await hydrateCollection<OavfRegistration>('oavfRegistrations')
      set({ registrations, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[oavf.store] Failed to hydrate', err)
    }
  },

  addRegistration: (registration) => {
    const created: OavfRegistration = {
      ...registration,
      id: crypto.randomUUID(),
      createdBy: actorName(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ registrations: [created, ...s.registrations] }))
    persistDoc('oavfRegistrations', created.id, created)
    appendAuditLog({
      action: 'oavf_registration_created',
      actorName: actorName(),
      entityType: 'oavf_registration',
      summary: `OAVF/Career Woman Registration filed for "${memberName(created.oavfMemberId)}" (${created.schoolYear}).`
    })
    return created.id
  },

  updateRegistration: (id, patch) => {
    set((s) => ({
      registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
    }))
    const registration = get().registrations.find((r) => r.id === id)
    if (registration) persistDoc('oavfRegistrations', id, registration)
    appendAuditLog({
      action: 'oavf_registration_updated',
      actorName: actorName(),
      entityType: 'oavf_registration',
      summary: `OAVF/Career Woman Registration for "${registration ? memberName(registration.oavfMemberId) : id}" updated.`
    })
  },

  deleteRegistration: (id) => {
    const registration = get().registrations.find((r) => r.id === id)
    set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
    deleteDocById('oavfRegistrations', id)
    appendAuditLog({
      action: 'oavf_registration_deleted',
      actorName: actorName(),
      entityType: 'oavf_registration',
      summary: `OAVF/Career Woman Registration for "${registration ? memberName(registration.oavfMemberId) : id}" (${registration?.schoolYear ?? ''}) deleted.`
    })
  }
}))
