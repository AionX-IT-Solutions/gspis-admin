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
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type { IccgMember, MemberPayment, MemberPaymentCategory } from '../types/iccgMember.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function troopLabel(troopId: string) {
  return useTroopsStore.getState().troops.find((t) => t.id === troopId)?.troopNumber ?? troopId
}

interface IccgMemberState {
  members: IccgMember[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>

  addMember: (member: IccgMember) => void
  updateMember: (id: string, patch: Partial<IccgMember>) => void
  deleteMember: (id: string, force?: boolean) => void

  // One remittance event covering however many members it paid for, potentially both Girls
  // and Adults rate lines at once — the CGS Adult Leader pays once, not once per rate tier.
  // Mirrors features/trefoilGuild's addBulkPayment, minus the flat-fee half — every line here
  // is per-member, but (unlike Trefoil Guild's pure-pass-through member fee) only each line's
  // council-share portion posts to a voucher, see iccgVoucher.ts.
  addBulkPayment: (input: {
    lines: {
      memberIds: string[]
      amountPerMember: number
      councilShareAmountPerMember: number
      category: MemberPaymentCategory
    }[]
    date: string
    paidByName: string
    /** Stamped identically onto every payment this transaction creates — Record Bulk Payment
     *  always prints a receipt. Lets the Payment tab reprint it later from any row sharing
     *  this transaction's bulkPaymentId. */
    receipt?: ReceiptRecord
  }) => { bulkPaymentId: string; payments: MemberPayment[] }
  // Corrects a whole transaction's date/paid-by after the fact — applies to every entry
  // sharing `bulkKey`.
  updatePaymentGroup: (input: { bulkKey: string; date: string; paidByName: string }) => {
    payments: MemberPayment[]
  }
  // Removes every entry sharing `bulkKey` — the whole transaction.
  deletePaymentGroup: (bulkKey: string) => { removedPayments: MemberPayment[] }
  // Stamps the printed council-share receipt (see PrintCouncilShareReceiptModal) onto every
  // payment sharing `bulkKey` — mirrors features/troops/store/troops.store.ts's
  // setMembershipCouncilShareReceipt, simpler here since every ICCG payment category (unlike
  // Troops' mix of Membership/flat fees) carries its own council-share portion.
  setCouncilShareReceipt: (input: { bulkKey: string; receipt: ReceiptRecord }) => void
}

export const useIccgMemberStore = create<IccgMemberState>()((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const members = await hydrateCollection<IccgMember>('iccgMembers')
      set({ members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[iccgMember.store] Failed to hydrate', err)
    }
  },

  addMember: (member) => {
    set((s) => ({ members: [member, ...s.members] }))
    persist('iccgMembers', member.id, member)
    appendAuditLog({
      action: 'iccg_member_added',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `${member.fullName} added to ICCG roster — Troop ${troopLabel(member.troopId)}.`
    })
  },
  updateMember: (id, patch) => {
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    const member = get().members.find((m) => m.id === id)
    if (member) persist('iccgMembers', id, member)
    appendAuditLog({
      action: 'iccg_member_updated',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const hasPayments = (member?.payments?.length ?? 0) > 0
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('iccgMembers', id)
    appendAuditLog({
      action: 'iccg_member_deleted',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `${member?.fullName ?? id} removed.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  },

  addBulkPayment: ({ lines, date, paidByName, receipt }) => {
    const bulkPaymentId = crypto.randomUUID()
    const validLines = lines.filter((l) => l.amountPerMember > 0 && l.memberIds.length > 0)
    const payments: MemberPayment[] = []
    let totalMemberCount = 0

    if (validLines.length > 0) {
      const paymentsByMemberId = new Map<string, MemberPayment[]>()
      for (const line of validLines) {
        totalMemberCount += line.memberIds.length
        for (const memberId of line.memberIds) {
          const payment: MemberPayment = {
            id: crypto.randomUUID(),
            date,
            amount: line.amountPerMember,
            councilShareAmount: line.councilShareAmountPerMember,
            category: line.category,
            bulkPaymentId,
            paidByName,
            receipt
          }
          payments.push(payment)
          const existing = paymentsByMemberId.get(memberId) ?? []
          existing.push(payment)
          paymentsByMemberId.set(memberId, existing)
        }
      }
      set((s) => ({
        members: s.members.map((m) => {
          const newPayments = paymentsByMemberId.get(m.id)
          return newPayments ? { ...m, payments: [...(m.payments ?? []), ...newPayments] } : m
        })
      }))
      const updatedMembers = get().members.filter((m) => paymentsByMemberId.has(m.id))
      for (const member of updatedMembers) persist('iccgMembers', member.id, member)
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    if (total > 0) {
      appendAuditLog({
        action: 'iccg_bulk_payment_recorded',
        actorName: actorName(),
        entityType: 'iccg_member',
        summary: `${paidByName} paid ₱${total.toFixed(2)} for ${totalMemberCount} ICCG member(s).`
      })
    }

    return { bulkPaymentId, payments }
  },

  updatePaymentGroup: ({ bulkKey, date, paidByName }) => {
    const payments: MemberPayment[] = []
    const affectedIds = new Set(
      get()
        .members.filter((m) =>
          (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    set((s) => ({
      members: s.members.map((m) => {
        if (!affectedIds.has(m.id)) return m
        const updatedPayments = (m.payments ?? []).map((p) => {
          if ((p.bulkPaymentId ?? p.id) !== bulkKey) return p
          const updated = { ...p, date, paidByName }
          payments.push(updated)
          return updated
        })
        return { ...m, payments: updatedPayments }
      })
    }))
    const updatedMembers = get().members.filter((m) => affectedIds.has(m.id))
    for (const member of updatedMembers) persist('iccgMembers', member.id, member)

    appendAuditLog({
      action: 'iccg_bulk_payment_updated',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `ICCG payment updated — date ${date}, paid by ${paidByName}.`
    })

    return { payments }
  },

  deletePaymentGroup: (bulkKey) => {
    const removedPayments: MemberPayment[] = []
    const affectedIds = new Set(
      get()
        .members.filter((m) =>
          (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    set((s) => ({
      members: s.members.map((m) => {
        if (!affectedIds.has(m.id)) return m
        const kept: MemberPayment[] = []
        for (const p of m.payments ?? []) {
          if ((p.bulkPaymentId ?? p.id) === bulkKey) removedPayments.push(p)
          else kept.push(p)
        }
        return { ...m, payments: kept }
      })
    }))
    const updatedMembers = get().members.filter((m) => affectedIds.has(m.id))
    for (const member of updatedMembers) persist('iccgMembers', member.id, member)

    appendAuditLog({
      action: 'iccg_bulk_payment_deleted',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `ICCG payment deleted.`
    })

    return { removedPayments }
  },

  setCouncilShareReceipt: ({ bulkKey, receipt }) => {
    const affectedIds = new Set(
      get()
        .members.filter((m) =>
          (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    if (affectedIds.size === 0) return

    set((s) => ({
      members: s.members.map((m) =>
        affectedIds.has(m.id)
          ? {
              ...m,
              payments: (m.payments ?? []).map((p) =>
                (p.bulkPaymentId ?? p.id) === bulkKey ? { ...p, councilShareReceipt: receipt } : p
              )
            }
          : m
      )
    }))
    const updatedMembers = get().members.filter((m) => affectedIds.has(m.id))
    for (const member of updatedMembers) persist('iccgMembers', member.id, member)

    appendAuditLog({
      action: 'iccg_council_share_receipt_printed',
      actorName: actorName(),
      entityType: 'iccg_member',
      summary: `Council-share receipt ${receipt.receiptNumber} printed for an ICCG payment.`
    })
  }
}))
