import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useBarangayCommitteeStore } from './barangayCommittee.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import type { BarangayCommitteeRegistration } from '../types/barangayCommitteeRegistration.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Patches the live roster with each member's just-filed status, so the committee's roster
// reflects the latest registration without needing to open it — same "current state" pattern
// as features/districtCommittee's syncRosterFromRegistration. Best-effort: only touches
// members this registration actually links back to (memberId), never invents rows.
function syncRosterFromRegistration(registration: BarangayCommitteeRegistration) {
  const { updateMember } = useBarangayCommitteeStore.getState()
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

interface BarangayCommitteeRegistrationState {
  registrations: BarangayCommitteeRegistration[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addRegistration: (registration: BarangayCommitteeRegistration) => void
  updateRegistration: (id: string, patch: Partial<BarangayCommitteeRegistration>) => void
  deleteRegistration: (id: string) => void
}

export const useBarangayCommitteeRegistrationStore = create<BarangayCommitteeRegistrationState>()(
  (set, get) => ({
    registrations: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const registrations = await hydrateCollection<BarangayCommitteeRegistration>(
          'barangayCommitteeRegistrations'
        )
        set({ registrations, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[barangayCommitteeRegistration.store] Failed to hydrate', err)
      }
    },

    addRegistration: (registration) => {
      set((s) => ({ registrations: [registration, ...s.registrations] }))
      persist('barangayCommitteeRegistrations', registration.id, registration)
      syncRosterFromRegistration(registration)
      const committee = useBarangayCommitteeStore
        .getState()
        .committees.find((c) => c.id === registration.barangayCommitteeId)
      appendAuditLog({
        action: 'barangay_committee_registration_created',
        actorName: actorName(),
        entityType: 'barangay_committee_registration',
        summary: `Barangay Committee Registration filed for "${committee?.name ?? registration.barangayCommitteeId}" (${registration.schoolYear}).`
      })
    },

    updateRegistration: (id, patch) => {
      set((s) => ({
        registrations: s.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
      const registration = get().registrations.find((r) => r.id === id)
      if (registration) {
        persist('barangayCommitteeRegistrations', id, registration)
        syncRosterFromRegistration(registration)
      }
      const committee = registration
        ? useBarangayCommitteeStore
            .getState()
            .committees.find((c) => c.id === registration.barangayCommitteeId)
        : undefined
      appendAuditLog({
        action: 'barangay_committee_registration_updated',
        actorName: actorName(),
        entityType: 'barangay_committee_registration',
        summary: `Barangay Committee Registration for "${committee?.name ?? id}" updated.`
      })
    },

    deleteRegistration: (id) => {
      const registration = get().registrations.find((r) => r.id === id)
      const committee = registration
        ? useBarangayCommitteeStore
            .getState()
            .committees.find((c) => c.id === registration.barangayCommitteeId)
        : undefined
      set((s) => ({ registrations: s.registrations.filter((r) => r.id !== id) }))
      deleteDocById('barangayCommitteeRegistrations', id)
      // The Council-retained B.C. Group Fee voucher this filing auto-created (see
      // lib/bcVoucher.ts's syncRegistrationRemittanceVoucher) has no meaning once the filing
      // it backs is gone — clean it up too rather than leaving it dangling.
      if (registration?.linkedVoucherId) {
        useVouchersStore.getState().deleteVoucher(registration.linkedVoucherId)
      }
      appendAuditLog({
        action: 'barangay_committee_registration_deleted',
        actorName: actorName(),
        entityType: 'barangay_committee_registration',
        summary: `Barangay Committee Registration for "${committee?.name ?? id}" (${registration?.schoolYear ?? ''}) deleted.`
      })
    }
  })
)
