import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type {
  BarangayCommittee,
  BarangayCommitteeMember,
  FlatFeeCategory,
  FlatFeePayment,
  MemberPaymentCategory
} from '../types/barangayCommittee.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface BarangayCommitteeState {
  committees: BarangayCommittee[]
  members: BarangayCommitteeMember[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addCommittee: (committee: BarangayCommittee) => void
  updateCommittee: (id: string, patch: Partial<BarangayCommittee>) => void
  deleteCommittee: (id: string, force?: boolean) => void

  addMember: (member: BarangayCommitteeMember) => void
  updateMember: (id: string, patch: Partial<BarangayCommitteeMember>) => void
  deleteMember: (id: string, force?: boolean) => void

  // One remittance event, potentially both the per-member Membership Fee and the flat B.C.
  // Group Fee at once — the BC Chairman pays once, not once per fee type. Mirrors
  // features/districtCommittee/store/districtCommittee.store.ts's addBulkPayment exactly.
  addBulkPayment: (input: {
    barangayCommitteeId: string
    memberIds: string[]
    memberLines: { category: MemberPaymentCategory; amountPerMember: number }[]
    flatLines: { category: FlatFeeCategory; amount: number }[]
    date: string
    paidByName: string
    /** Stamped identically onto every line this transaction creates — the Record Bulk
     *  Payment modal always prints a receipt. Lets the Payment tab reprint it later from any
     *  row sharing this transaction's bulkPaymentId. */
    receipt?: ReceiptRecord
  }) => { bulkPaymentId: string; flatPayments: FlatFeePayment[] }
  // Saves the voucher id postBulkPaymentVoucher() returned back onto every flat fee payment
  // of this transaction — a plumbing follow-up to addBulkPayment, not a user-facing action.
  attachBulkPaymentVoucher: (
    barangayCommitteeId: string,
    flatFeePaymentIds: string[],
    voucherId: string
  ) => void
  // Corrects a whole transaction's date/paid-by after the fact — applies to EVERY entry
  // sharing `bulkKey` regardless of category (one receipt per transaction). Returns this
  // transaction's flat fee payments (post-update) so the caller can rebuild its shared
  // voucher's account lines.
  updatePaymentGroup: (input: {
    barangayCommitteeId: string
    bulkKey: string
    date: string
    paidByName: string
  }) => { flatPayments: FlatFeePayment[] }
  // Removes every entry sharing `bulkKey` — the whole transaction. Returns the removed flat
  // fee payments so the caller can also delete their shared linked voucher.
  deletePaymentGroup: (input: { barangayCommitteeId: string; bulkKey: string }) => {
    removedFlatPayments: FlatFeePayment[]
  }
}

export const useBarangayCommitteeStore = create<BarangayCommitteeState>()((set, get) => ({
  committees: [],
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [committees, members] = await Promise.all([
        hydrateCollection<BarangayCommittee>('barangayCommittees'),
        hydrateCollection<BarangayCommitteeMember>('barangayCommitteeMembers')
      ])
      set({ committees, members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[barangayCommittee.store] Failed to hydrate', err)
    }
  },

  addCommittee: (committee) => {
    set((s) => ({ committees: [committee, ...s.committees] }))
    persist('barangayCommittees', committee.id, committee)
    appendAuditLog({
      action: 'barangay_committee_created',
      actorName: actorName(),
      entityType: 'barangay_committee',
      summary: `Barangay Committee "${committee.name}" created.`
    })
  },
  updateCommittee: (id, patch) => {
    set((s) => ({
      committees: s.committees.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }))
    const committee = get().committees.find((c) => c.id === id)
    if (committee) persist('barangayCommittees', id, committee)
    appendAuditLog({
      action: 'barangay_committee_updated',
      actorName: actorName(),
      entityType: 'barangay_committee',
      summary: `Barangay Committee "${committee?.name ?? id}" updated.`
    })
  },
  // Blocked once any member has payment history — same reasoning as District Committee's
  // deleteCommittee. `force` is the deliberate override.
  deleteCommittee: (id, force = false) => {
    const committee = get().committees.find((c) => c.id === id)
    const orphanedMembers = get().members.filter((m) => m.barangayCommitteeId === id)
    const hasPayments = orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0)
    if (hasPayments && !force) return
    set((s) => ({
      committees: s.committees.filter((c) => c.id !== id),
      members: s.members.filter((m) => m.barangayCommitteeId !== id)
    }))
    deleteDocById('barangayCommittees', id)
    for (const member of orphanedMembers) deleteDocById('barangayCommitteeMembers', member.id)
    appendAuditLog({
      action: 'barangay_committee_deleted',
      actorName: actorName(),
      entityType: 'barangay_committee',
      summary: `Barangay Committee "${committee?.name ?? id}" and its ${orphanedMembers.length} member(s) deleted.${hasPayments ? ' Force-deleted despite recorded member payments.' : ''}`
    })
  },

  addMember: (member) => {
    set((s) => ({ members: [member, ...s.members] }))
    persist('barangayCommitteeMembers', member.id, member)
    const committee = get().committees.find((c) => c.id === member.barangayCommitteeId)
    appendAuditLog({
      action: 'barangay_committee_member_added',
      actorName: actorName(),
      entityType: 'barangay_committee_member',
      summary: `${member.fullName} added to Barangay Committee "${committee?.name ?? member.barangayCommitteeId}".`
    })
  },
  updateMember: (id, patch) => {
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m))
    }))
    const member = get().members.find((m) => m.id === id)
    if (member) persist('barangayCommitteeMembers', id, member)
    appendAuditLog({
      action: 'barangay_committee_member_updated',
      actorName: actorName(),
      entityType: 'barangay_committee_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const hasPayments = (member?.payments?.length ?? 0) > 0
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('barangayCommitteeMembers', id)
    appendAuditLog({
      action: 'barangay_committee_member_deleted',
      actorName: actorName(),
      entityType: 'barangay_committee_member',
      summary: `${member?.fullName ?? id} removed.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  },

  addBulkPayment: ({
    barangayCommitteeId,
    memberIds,
    memberLines,
    flatLines,
    date,
    paidByName,
    receipt
  }) => {
    const validMemberLines = memberLines.filter((l) => l.amountPerMember > 0)
    const validFlatLines = flatLines.filter((l) => l.amount > 0)
    const bulkPaymentId = crypto.randomUUID()

    if (validMemberLines.length > 0 && memberIds.length > 0) {
      const memberIdSet = new Set(memberIds)
      set((s) => ({
        members: s.members.map((m) =>
          memberIdSet.has(m.id)
            ? {
                ...m,
                payments: [
                  ...(m.payments ?? []),
                  ...validMemberLines.map((line) => ({
                    id: crypto.randomUUID(),
                    date,
                    amount: line.amountPerMember,
                    category: line.category,
                    bulkPaymentId,
                    paidByName,
                    receipt
                  }))
                ]
              }
            : m
        )
      }))
      const updatedMembers = get().members.filter((m) => memberIdSet.has(m.id))
      for (const member of updatedMembers) persist('barangayCommitteeMembers', member.id, member)
    }

    let flatPayments: FlatFeePayment[] = []
    if (validFlatLines.length > 0) {
      flatPayments = validFlatLines.map((line) => ({
        id: crypto.randomUUID(),
        date,
        amount: line.amount,
        category: line.category,
        bulkPaymentId,
        paidByName,
        receipt
      }))
      set((s) => ({
        committees: s.committees.map((c) =>
          c.id === barangayCommitteeId
            ? { ...c, flatFeePayments: [...(c.flatFeePayments ?? []), ...flatPayments] }
            : c
        )
      }))
      const updatedCommittee = get().committees.find((c) => c.id === barangayCommitteeId)
      if (updatedCommittee) persist('barangayCommittees', barangayCommitteeId, updatedCommittee)
    }

    const committee = get().committees.find((c) => c.id === barangayCommitteeId)
    const memberTotal =
      validMemberLines.reduce((sum, l) => sum + l.amountPerMember, 0) * memberIds.length
    const flatTotal = validFlatLines.reduce((sum, l) => sum + l.amount, 0)
    if (memberTotal + flatTotal > 0) {
      appendAuditLog({
        action: 'barangay_committee_bulk_payment_recorded',
        actorName: actorName(),
        entityType: 'barangay_committee_member',
        summary: `${paidByName} paid ₱${(memberTotal + flatTotal).toFixed(2)} for Barangay Committee "${committee?.name ?? barangayCommitteeId}" (${validMemberLines.length} per-member line(s) × ${memberIds.length} member(s), ${validFlatLines.length} flat fee line(s)).`
      })
    }

    return { bulkPaymentId, flatPayments }
  },

  attachBulkPaymentVoucher: (barangayCommitteeId, flatFeePaymentIds, voucherId) => {
    const idSet = new Set(flatFeePaymentIds)
    set((s) => ({
      committees: s.committees.map((c) =>
        c.id === barangayCommitteeId
          ? {
              ...c,
              flatFeePayments: (c.flatFeePayments ?? []).map((p) =>
                idSet.has(p.id) ? { ...p, linkedVoucherId: voucherId } : p
              )
            }
          : c
      )
    }))
    const committee = get().committees.find((c) => c.id === barangayCommitteeId)
    if (committee) persist('barangayCommittees', barangayCommitteeId, committee)
  },

  updatePaymentGroup: ({ barangayCommitteeId, bulkKey, date, paidByName }) => {
    const flatPayments: FlatFeePayment[] = []

    set((s) => ({
      committees: s.committees.map((c) => {
        if (c.id !== barangayCommitteeId) return c
        const updatedFlatFeePayments = (c.flatFeePayments ?? []).map((p) => {
          if ((p.bulkPaymentId ?? p.id) !== bulkKey) return p
          const updated = { ...p, date, paidByName }
          flatPayments.push(updated)
          return updated
        })
        return { ...c, flatFeePayments: updatedFlatFeePayments }
      })
    }))
    const committee = get().committees.find((c) => c.id === barangayCommitteeId)
    if (committee) persist('barangayCommittees', barangayCommitteeId, committee)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.barangayCommitteeId === barangayCommitteeId &&
            (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    if (affectedIds.size > 0) {
      set((s) => ({
        members: s.members.map((m) =>
          affectedIds.has(m.id)
            ? {
                ...m,
                payments: (m.payments ?? []).map((p) =>
                  (p.bulkPaymentId ?? p.id) === bulkKey ? { ...p, date, paidByName } : p
                )
              }
            : m
        )
      }))
      const updatedMembers = get().members.filter((m) => affectedIds.has(m.id))
      for (const member of updatedMembers) persist('barangayCommitteeMembers', member.id, member)
    }

    appendAuditLog({
      action: 'barangay_committee_bulk_payment_updated',
      actorName: actorName(),
      entityType: 'barangay_committee_member',
      summary: `Payment for Barangay Committee "${committee?.name ?? barangayCommitteeId}" updated — date ${date}, paid by ${paidByName}.`
    })

    return { flatPayments }
  },

  deletePaymentGroup: ({ barangayCommitteeId, bulkKey }) => {
    const removedFlatPayments: FlatFeePayment[] = []

    set((s) => ({
      committees: s.committees.map((c) => {
        if (c.id !== barangayCommitteeId) return c
        const kept: FlatFeePayment[] = []
        for (const p of c.flatFeePayments ?? []) {
          if ((p.bulkPaymentId ?? p.id) === bulkKey) {
            removedFlatPayments.push(p)
          } else {
            kept.push(p)
          }
        }
        return { ...c, flatFeePayments: kept }
      })
    }))
    const committee = get().committees.find((c) => c.id === barangayCommitteeId)
    if (committee) persist('barangayCommittees', barangayCommitteeId, committee)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.barangayCommitteeId === barangayCommitteeId &&
            (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    if (affectedIds.size > 0) {
      set((s) => ({
        members: s.members.map((m) =>
          affectedIds.has(m.id)
            ? {
                ...m,
                payments: (m.payments ?? []).filter((p) => (p.bulkPaymentId ?? p.id) !== bulkKey)
              }
            : m
        )
      }))
      const updatedMembers = get().members.filter((m) => affectedIds.has(m.id))
      for (const member of updatedMembers) persist('barangayCommitteeMembers', member.id, member)
    }

    appendAuditLog({
      action: 'barangay_committee_bulk_payment_deleted',
      actorName: actorName(),
      entityType: 'barangay_committee_member',
      summary: `Payment for Barangay Committee "${committee?.name ?? barangayCommitteeId}" deleted.`
    })

    return { removedFlatPayments }
  }
}))
