import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { IccgRegistration } from '../types/iccgRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function troopLabel(troopId: string) {
  return useTroopsStore.getState().troops.find((t) => t.id === troopId)?.troopNumber ?? troopId
}

interface IccgRegistrationState {
  registrations: IccgRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (registration: IccgRegistration) => void
  updateRegistration: (id: string, patch: Partial<IccgRegistration>) => void
  deleteRegistration: (id: string) => void
}

export const useIccgRegistrationStore = create<IccgRegistrationState>()((set, get) => ({
  registrations: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const registrations = await hydrateCollection<IccgRegistration>('iccgRegistrations')
      set({ registrations, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[iccgRegistration.store] Failed to hydrate', err)
    }
  },

  addRegistration: (registration) => {
    set((s) => ({ registrations: [registration, ...s.registrations] }))
    persist('iccgRegistrations', registration.id, registration)
    appendAuditLog({
      action: 'iccg_registration_created',
      actorName: actorName(),
      entityType: 'iccg_registration',
      summary: `ICCG Registration filed for ${registration.school} (Troop ${troopLabel(registration.troopId)}, ${registration.schoolYear}).`
    })
  },

  updateRegistration: (id, patch) => {
    set((s) => ({
      registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
    }))
    const registration = get().registrations.find((r) => r.id === id)
    if (registration) persist('iccgRegistrations', id, registration)
    appendAuditLog({
      action: 'iccg_registration_updated',
      actorName: actorName(),
      entityType: 'iccg_registration',
      summary: `ICCG Registration for ${registration?.school ?? id} updated.`
    })
  },

  deleteRegistration: (id) => {
    const registration = get().registrations.find((r) => r.id === id)
    set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
    deleteDocById('iccgRegistrations', id)
    // The Council-retained-income voucher this filing auto-created (see
    // useIccgRegistrationForm.ts's syncIccgRegistrationVoucher) has no meaning once the
    // filing it backs is gone — clean it up too rather than leaving it dangling.
    if (registration?.linkedVoucherId) {
      useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
    }
    appendAuditLog({
      action: 'iccg_registration_deleted',
      actorName: actorName(),
      entityType: 'iccg_registration',
      summary: `ICCG Registration for ${registration?.school ?? id} (${registration?.schoolYear ?? ''}) deleted.`
    })
  }
}))
