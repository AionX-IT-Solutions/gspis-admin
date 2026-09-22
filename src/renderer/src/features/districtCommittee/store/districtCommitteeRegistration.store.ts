import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useDistrictCommitteeStore } from './districtCommittee.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { DistrictCommitteeRegistration } from '../types/districtCommitteeRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Patches the live roster with each member's just-filed status, so the committee's roster
// reflects the latest registration without needing to open it — same "current state" pattern
// as features/troopRegistration's syncRosterFromRegistration. Best-effort: only touches
// members this registration actually links back to (memberId), never invents rows.
function syncRosterFromRegistration(registration: DistrictCommitteeRegistration) {
  const { updateMember } = useDistrictCommitteeStore.getState()
  for (const member of registration.members) {
    if (!member.memberId) continue
    updateMember(member.memberId, {
      position: member.position,
      groupRepresented: member.groupRepresented,
      beneficiary: member.beneficiary,
      lastRegistrationStatus: member.regStatus
    })
  }
}

interface DistrictCommitteeRegistrationState {
  registrations: DistrictCommitteeRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (registration: DistrictCommitteeRegistration) => void
  updateRegistration: (id: string, patch: Partial<DistrictCommitteeRegistration>) => void
  deleteRegistration: (id: string) => void
}

export const useDistrictCommitteeRegistrationStore = create<DistrictCommitteeRegistrationState>()(
  (set, get) => ({
    registrations: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const registrations = await hydrateCollection<DistrictCommitteeRegistration>(
          'districtCommitteeRegistrations'
        )
        set({ registrations, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[districtCommitteeRegistration.store] Failed to hydrate', err)
      }
    },

    addRegistration: (registration) => {
      set((s) => ({ registrations: [registration, ...s.registrations] }))
      persist('districtCommitteeRegistrations', registration.id, registration)
      syncRosterFromRegistration(registration)
      const committee = useDistrictCommitteeStore
        .getState()
        .committees.find((c) => c.id === registration.districtCommitteeId)
      appendAuditLog({
        action: 'district_committee_registration_created',
        actorName: actorName(),
        entityType: 'district_committee_registration',
        summary: `District Committee Registration filed for "${committee?.name ?? registration.districtCommitteeId}" (${registration.schoolYear}).`
      })
    },

    updateRegistration: (id, patch) => {
      set((s) => ({
        registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
      const registration = get().registrations.find((r) => r.id === id)
      if (registration) {
        persist('districtCommitteeRegistrations', id, registration)
        syncRosterFromRegistration(registration)
      }
      const committee = registration
        ? useDistrictCommitteeStore
            .getState()
            .committees.find((c) => c.id === registration.districtCommitteeId)
        : undefined
      appendAuditLog({
        action: 'district_committee_registration_updated',
        actorName: actorName(),
        entityType: 'district_committee_registration',
        summary: `District Committee Registration for "${committee?.name ?? id}" updated.`
      })
    },

    deleteRegistration: (id) => {
      const registration = get().registrations.find((r) => r.id === id)
      const committee = registration
        ? useDistrictCommitteeStore
            .getState()
            .committees.find((c) => c.id === registration.districtCommitteeId)
        : undefined
      set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
      deleteDocById('districtCommitteeRegistrations', id)
      // The Council-retained D.C. Group Fee voucher this filing auto-created (see
      // lib/dcVoucher.ts's syncRegistrationRemittanceVoucher) has no meaning once the filing
      // it backs is gone — clean it up too rather than leaving it dangling.
      if (registration?.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
      appendAuditLog({
        action: 'district_committee_registration_deleted',
        actorName: actorName(),
        entityType: 'district_committee_registration',
        summary: `District Committee Registration for "${committee?.name ?? id}" (${registration?.schoolYear ?? ''}) deleted.`
      })
    }
  })
)
