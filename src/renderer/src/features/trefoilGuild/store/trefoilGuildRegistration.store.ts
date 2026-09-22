import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useTrefoilGuildStore } from './trefoilGuild.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { TrefoilGuildRegistration } from '../types/trefoilGuildRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Patches the live roster with each member's just-filed status, so the guild's roster
// reflects the latest registration without needing to open it — same "current state" pattern
// as features/barangayCommittee's syncRosterFromRegistration. Best-effort: only touches
// members this registration actually links back to (memberId), never invents rows.
function syncRosterFromRegistration(registration: TrefoilGuildRegistration) {
  const { updateMember } = useTrefoilGuildStore.getState()
  for (const member of registration.members) {
    if (!member.memberId) continue
    updateMember(member.memberId, {
      position: member.position,
      beneficiary: member.beneficiary,
      lastRegistrationStatus: member.regStatus
    })
  }
}

interface TrefoilGuildRegistrationState {
  registrations: TrefoilGuildRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (registration: TrefoilGuildRegistration) => void
  updateRegistration: (id: string, patch: Partial<TrefoilGuildRegistration>) => void
  deleteRegistration: (id: string) => void
}

export const useTrefoilGuildRegistrationStore = create<TrefoilGuildRegistrationState>()(
  (set, get) => ({
    registrations: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const registrations = await hydrateCollection<TrefoilGuildRegistration>(
          'trefoilGuildRegistrations'
        )
        set({ registrations, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[trefoilGuildRegistration.store] Failed to hydrate', err)
      }
    },

    addRegistration: (registration) => {
      set((s) => ({ registrations: [registration, ...s.registrations] }))
      persist('trefoilGuildRegistrations', registration.id, registration)
      syncRosterFromRegistration(registration)
      const guild = useTrefoilGuildStore
        .getState()
        .guilds.find((g) => g.id === registration.trefoilGuildId)
      appendAuditLog({
        action: 'trefoil_guild_registration_created',
        actorName: actorName(),
        entityType: 'trefoil_guild_registration',
        summary: `Trefoil Guild Registration filed for "${guild?.name ?? registration.trefoilGuildId}" (${registration.schoolYear}).`
      })
    },

    updateRegistration: (id, patch) => {
      set((s) => ({
        registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
      const registration = get().registrations.find((r) => r.id === id)
      if (registration) {
        persist('trefoilGuildRegistrations', id, registration)
        syncRosterFromRegistration(registration)
      }
      const guild = registration
        ? useTrefoilGuildStore.getState().guilds.find((g) => g.id === registration.trefoilGuildId)
        : undefined
      appendAuditLog({
        action: 'trefoil_guild_registration_updated',
        actorName: actorName(),
        entityType: 'trefoil_guild_registration',
        summary: `Trefoil Guild Registration for "${guild?.name ?? id}" updated.`
      })
    },

    deleteRegistration: (id) => {
      const registration = get().registrations.find((r) => r.id === id)
      const guild = registration
        ? useTrefoilGuildStore.getState().guilds.find((g) => g.id === registration.trefoilGuildId)
        : undefined
      set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
      deleteDocById('trefoilGuildRegistrations', id)
      // The Council-retained T.G. Group Fee voucher this filing auto-created (see
      // lib/tgVoucher.ts's syncRegistrationRemittanceVoucher) has no meaning once the filing
      // it backs is gone — clean it up too rather than leaving it dangling.
      if (registration?.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
      appendAuditLog({
        action: 'trefoil_guild_registration_deleted',
        actorName: actorName(),
        entityType: 'trefoil_guild_registration',
        summary: `Trefoil Guild Registration for "${guild?.name ?? id}" (${registration?.schoolYear ?? ''}) deleted.`
      })
    }
  })
)
