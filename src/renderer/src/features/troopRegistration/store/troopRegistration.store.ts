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
import type { TroopRegistration } from '../types/troopRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Patches the live roster with each member's/leader's just-filed status, so the Troop and
// its roster reflect the latest registration without needing to open it — same "current
// state" pattern as ScoutMember.membershipYear/renewedAt. Best-effort: only touches
// members this registration actually links back to (scoutMemberId), never invents rows.
function syncRosterFromRegistration(registration: TroopRegistration) {
  const { updateTroop, updateScoutMember } = useTroopsStore.getState()
  const troop = useTroopsStore.getState().troops.find((t) => t.id === registration.troopId)
  if (troop) {
    const leader = registration.leaders[0]
    const coLeader = registration.leaders[1]
    updateTroop(troop.id, {
      ...(leader && {
        leaderBirthdate: leader.birthdate,
        leaderBeneficiary: leader.beneficiary,
        leaderTrained: leader.trained,
        leaderRboStatus: leader.rboStatus
      }),
      ...(coLeader && {
        assistantLeaderBirthdate: coLeader.birthdate,
        assistantLeaderBeneficiary: coLeader.beneficiary,
        assistantLeaderTrained: coLeader.trained,
        assistantLeaderRboStatus: coLeader.rboStatus
      })
    })
  }
  for (const member of registration.members) {
    if (!member.scoutMemberId) continue
    updateScoutMember(member.scoutMemberId, {
      patrol: member.patrol,
      gradeYear: member.gradeYear,
      beneficiary: member.beneficiary,
      lastRegistrationStatus: member.regStatus
    })
  }
}

interface TroopRegistrationState {
  registrations: TroopRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (registration: TroopRegistration) => void
  updateRegistration: (id: string, patch: Partial<TroopRegistration>) => void
  deleteRegistration: (id: string) => void
}

export const useTroopRegistrationStore = create<TroopRegistrationState>()((set, get) => ({
  registrations: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const registrations = await hydrateCollection<TroopRegistration>('troopRegistrations')
      set({ registrations, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[troopRegistration.store] Failed to hydrate', err)
    }
  },

  addRegistration: (registration) => {
    set((s) => ({ registrations: [registration, ...s.registrations] }))
    persist('troopRegistrations', registration.id, registration)
    syncRosterFromRegistration(registration)
    const troop = useTroopsStore.getState().troops.find((t) => t.id === registration.troopId)
    appendAuditLog({
      action: 'troop_registration_created',
      actorName: actorName(),
      entityType: 'troop_registration',
      summary: `Troop Registration filed for Troop ${troop?.troopNumber ?? registration.troopId} (${registration.schoolYear}).`
    })
  },

  updateRegistration: (id, patch) => {
    set((s) => ({
      registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
    }))
    const registration = get().registrations.find((r) => r.id === id)
    if (registration) {
      persist('troopRegistrations', id, registration)
      syncRosterFromRegistration(registration)
    }
    const troop = registration
      ? useTroopsStore.getState().troops.find((t) => t.id === registration.troopId)
      : undefined
    appendAuditLog({
      action: 'troop_registration_updated',
      actorName: actorName(),
      entityType: 'troop_registration',
      summary: `Troop Registration for Troop ${troop?.troopNumber ?? id} updated.`
    })
  },

  deleteRegistration: (id) => {
    const registration = get().registrations.find((r) => r.id === id)
    const troop = registration
      ? useTroopsStore.getState().troops.find((t) => t.id === registration.troopId)
      : undefined
    set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
    deleteDocById('troopRegistrations', id)
    // The Council-retained-income voucher this filing auto-created (see
    // useTroopRegistrationForm.ts's syncRemittanceVoucher) has no meaning once the filing
    // it backs is gone — clean it up too rather than leaving it dangling.
    if (registration?.linkedVoucherId) {
      useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
    }
    appendAuditLog({
      action: 'troop_registration_deleted',
      actorName: actorName(),
      entityType: 'troop_registration',
      summary: `Troop Registration for Troop ${troop?.troopNumber ?? id} (${registration?.schoolYear ?? ''}) deleted.`
    })
  }
}))
