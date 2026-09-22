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
  DistrictCommittee,
  DistrictCommitteeMember,
  FlatFeeCategory,
  FlatFeePayment,
  MemberPaymentCategory
} from '../types/districtCommittee.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface DistrictCommitteeState {
  committees: DistrictCommittee[]
  members: DistrictCommitteeMember[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addCommittee: (committee: DistrictCommittee) => void
  updateCommittee: (id: string, patch: Partial<DistrictCommittee>) => void
  deleteCommittee: (id: string, force?: boolean) => void

  addMember: (member: DistrictCommitteeMember) => void
  updateMember: (id: string, patch: Partial<DistrictCommitteeMember>) => void
  deleteMember: (id: string, force?: boolean) => void

  // One remittance event, potentially both the per-member Membership Fee and the flat D.C.
  // Group Fee at once — the District Field Adviser pays once, not once per fee type. Mirrors
  // features/troops/store/troops.store.ts's addBulkPayment exactly. Returns the id and the
  // created flat payments so the caller can best-effort post ONE shared voucher for them (see
  // features/districtCommittee/lib/dcVoucher.ts) — a permission-gated concern the caller
  // checks, not this store.
  addBulkPayment: (input: {
    districtCommitteeId: string
    memberIds: string[]
    memberLines: { category: MemberPaymentCategory; amountPerMember: number }[]
    flatLines: { category: FlatFeeCategory; amount: number }[]
    date: string
    paidByName: string
    /** Stamped identically onto every line this transaction creates when the Record Bulk
     *  Payment modal's "Print a receipt" toggle was used — lets the Payment tab reprint it
     *  later from any row sharing this transaction's bulkPaymentId. */
    receipt?: ReceiptRecord
  }) => { bulkPaymentId: string; flatPayments: FlatFeePayment[] }
  // Saves the voucher id postBulkPaymentVoucher() returned back onto every flat fee payment
  // of this transaction — a plumbing follow-up to addBulkPayment, not a user-facing action,
  // so it's silent (no audit log entry of its own).
  attachBulkPaymentVoucher: (
    districtCommitteeId: string,
    flatFeePaymentIds: string[],
    voucherId: string
  ) => void
  // Corrects a whole transaction's date/paid-by after the fact — the fee amounts themselves
  // are never editable here, so date and payer name are the only fields a correction can
  // touch. Applies to EVERY entry sharing `bulkKey` regardless of category (one receipt per
  // transaction). Returns this transaction's flat fee payments (post-update) so the caller
  // can rebuild its shared voucher's account lines.
  updatePaymentGroup: (input: {
    districtCommitteeId: string
    bulkKey: string
    date: string
    paidByName: string
  }) => { flatPayments: FlatFeePayment[] }
  // Removes every entry sharing `bulkKey` — the whole transaction. Returns the removed flat
  // fee payments so the caller can also delete their shared linked voucher.
  deletePaymentGroup: (input: { districtCommitteeId: string; bulkKey: string }) => {
    removedFlatPayments: FlatFeePayment[]
  }
}

export const useDistrictCommitteeStore = create<DistrictCommitteeState>()((set, get) => ({
  committees: [],
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [committees, members] = await Promise.all([
        hydrateCollection<DistrictCommittee>('districtCommittees'),
        hydrateCollection<DistrictCommitteeMember>('districtCommitteeMembers')
      ])
      set({ committees, members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[districtCommittee.store] Failed to hydrate', err)
    }
  },

  addCommittee: (committee) => {
    set((s) => ({ committees: [committee, ...s.committees] }))
    persist('districtCommittees', committee.id, committee)
    appendAuditLog({
      action: 'district_committee_created',
      actorName: actorName(),
      entityType: 'district_committee',
      summary: `District Committee "${committee.name}" created.`
    })
  },
  updateCommittee: (id, patch) => {
    set((s) => ({
      committees: s.committees.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }))
    const committee = get().committees.find((c) => c.id === id)
    if (committee) persist('districtCommittees', id, committee)
    appendAuditLog({
      action: 'district_committee_updated',
      actorName: actorName(),
      entityType: 'district_committee',
      summary: `District Committee "${committee?.name ?? id}" updated.`
    })
  },
  // Blocked once any member has payment history — same reasoning as Troops' deleteTroop
  // (Daily Collections derives its per-day totals live from members[].payments). `force` is
  // the deliberate override.
  deleteCommittee: (id, force = false) => {
    const committee = get().committees.find((c) => c.id === id)
    const orphanedMembers = get().members.filter((m) => m.districtCommitteeId === id)
    const hasPayments = orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0)
    if (hasPayments && !force) return
    set((s) => ({
      committees: s.committees.filter((c) => c.id !== id),
      members: s.members.filter((m) => m.districtCommitteeId !== id)
    }))
    deleteDocById('districtCommittees', id)
    for (const member of orphanedMembers) deleteDocById('districtCommitteeMembers', member.id)
    appendAuditLog({
      action: 'district_committee_deleted',
      actorName: actorName(),
      entityType: 'district_committee',
      summary: `District Committee "${committee?.name ?? id}" and its ${orphanedMembers.length} member(s) deleted.${hasPayments ? ' Force-deleted despite recorded member payments.' : ''}`
    })
  },

  addMember: (member) => {
    set((s) => ({ members: [member, ...s.members] }))
    persist('districtCommitteeMembers', member.id, member)
    const committee = get().committees.find((c) => c.id === member.districtCommitteeId)
    appendAuditLog({
      action: 'district_committee_member_added',
      actorName: actorName(),
      entityType: 'district_committee_member',
      summary: `${member.fullName} added to District Committee "${committee?.name ?? member.districtCommitteeId}".`
    })
  },
  updateMember: (id, patch) => {
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m))
    }))
    const member = get().members.find((m) => m.id === id)
    if (member) persist('districtCommitteeMembers', id, member)
    appendAuditLog({
      action: 'district_committee_member_updated',
      actorName: actorName(),
      entityType: 'district_committee_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const hasPayments = (member?.payments?.length ?? 0) > 0
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('districtCommitteeMembers', id)
    appendAuditLog({
      action: 'district_committee_member_deleted',
      actorName: actorName(),
      entityType: 'district_committee_member',
      summary: `${member?.fullName ?? id} removed.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  },

  addBulkPayment: ({
    districtCommitteeId,
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
      for (const member of updatedMembers) persist('districtCommitteeMembers', member.id, member)
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
          c.id === districtCommitteeId
            ? { ...c, flatFeePayments: [...(c.flatFeePayments ?? []), ...flatPayments] }
            : c
        )
      }))
      const updatedCommittee = get().committees.find((c) => c.id === districtCommitteeId)
      if (updatedCommittee) persist('districtCommittees', districtCommitteeId, updatedCommittee)
    }

    const committee = get().committees.find((c) => c.id === districtCommitteeId)
    const memberTotal =
      validMemberLines.reduce((sum, l) => sum + l.amountPerMember, 0) * memberIds.length
    const flatTotal = validFlatLines.reduce((sum, l) => sum + l.amount, 0)
    if (memberTotal + flatTotal > 0) {
      appendAuditLog({
        action: 'district_committee_bulk_payment_recorded',
        actorName: actorName(),
        entityType: 'district_committee_member',
        summary: `${paidByName} paid ₱${(memberTotal + flatTotal).toFixed(2)} for District Committee "${committee?.name ?? districtCommitteeId}" (${validMemberLines.length} per-member line(s) × ${memberIds.length} member(s), ${validFlatLines.length} flat fee line(s)).`
      })
    }

    return { bulkPaymentId, flatPayments }
  },

  attachBulkPaymentVoucher: (districtCommitteeId, flatFeePaymentIds, voucherId) => {
    const idSet = new Set(flatFeePaymentIds)
    set((s) => ({
      committees: s.committees.map((c) =>
        c.id === districtCommitteeId
          ? {
              ...c,
              flatFeePayments: (c.flatFeePayments ?? []).map((p) =>
                idSet.has(p.id) ? { ...p, linkedVoucherId: voucherId } : p
              )
            }
          : c
      )
    }))
    const committee = get().committees.find((c) => c.id === districtCommitteeId)
    if (committee) persist('districtCommittees', districtCommitteeId, committee)
  },

  updatePaymentGroup: ({ districtCommitteeId, bulkKey, date, paidByName }) => {
    const flatPayments: FlatFeePayment[] = []

    set((s) => ({
      committees: s.committees.map((c) => {
        if (c.id !== districtCommitteeId) return c
        const updatedFlatFeePayments = (c.flatFeePayments ?? []).map((p) => {
          if ((p.bulkPaymentId ?? p.id) !== bulkKey) return p
          const updated = { ...p, date, paidByName }
          flatPayments.push(updated)
          return updated
        })
        return { ...c, flatFeePayments: updatedFlatFeePayments }
      })
    }))
    const committee = get().committees.find((c) => c.id === districtCommitteeId)
    if (committee) persist('districtCommittees', districtCommitteeId, committee)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.districtCommitteeId === districtCommitteeId &&
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
      for (const member of updatedMembers) persist('districtCommitteeMembers', member.id, member)
    }

    appendAuditLog({
      action: 'district_committee_bulk_payment_updated',
      actorName: actorName(),
      entityType: 'district_committee_member',
      summary: `Payment for District Committee "${committee?.name ?? districtCommitteeId}" updated — date ${date}, paid by ${paidByName}.`
    })

    return { flatPayments }
  },

  deletePaymentGroup: ({ districtCommitteeId, bulkKey }) => {
    const removedFlatPayments: FlatFeePayment[] = []

    set((s) => ({
      committees: s.committees.map((c) => {
        if (c.id !== districtCommitteeId) return c
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
    const committee = get().committees.find((c) => c.id === districtCommitteeId)
    if (committee) persist('districtCommittees', districtCommitteeId, committee)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.districtCommitteeId === districtCommitteeId &&
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
      for (const member of updatedMembers) persist('districtCommitteeMembers', member.id, member)
    }

    appendAuditLog({
      action: 'district_committee_bulk_payment_deleted',
      actorName: actorName(),
      entityType: 'district_committee_member',
      summary: `Payment for District Committee "${committee?.name ?? districtCommitteeId}" deleted.`
    })

    return { removedFlatPayments }
  }
}))
