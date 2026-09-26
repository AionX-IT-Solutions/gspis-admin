import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useIccgMemberStore } from '@/features/iccgRegistration/store/iccgMember.store'
import { useIccgRegistrationStore } from '@/features/iccgRegistration/store/iccgRegistration.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { todayLocalIso } from '@/shared/lib/utils'
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type {
  FlatFeeCategory,
  FlatFeePayment,
  MemberPayment,
  MemberPaymentCategory,
  ScoutMember,
  Troop
} from '../types/troop.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface TroopsState {
  troops: Troop[]
  scoutMembers: ScoutMember[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addTroop: (troop: Troop) => void
  updateTroop: (id: string, patch: Partial<Troop>) => void
  deleteTroop: (id: string, force?: boolean) => void

  addScoutMember: (member: ScoutMember) => void
  updateScoutMember: (id: string, patch: Partial<ScoutMember>) => void
  deleteScoutMember: (id: string, force?: boolean) => void
  renewScoutMember: (id: string, membershipYear: string) => void
  addMemberPayment: (memberId: string, payment: MemberPayment) => void
  // One remittance event, potentially several fee lines at once (e.g. Membership Fee per
  // member AND a flat Troop Fee AND a flat Thinking Day Fee in the same submission) — the
  // Troop Leader pays once, not once per fee type. Per-member lines fan out into one
  // MemberPayment per covered member per line; flat lines each become one FlatFeePayment
  // on the Troop itself (see FlatFeePayment — a flat fee has no member to attach to).
  // Every line created this way shares one generated bulkPaymentId, so the Payment tab
  // (features/troops/pages/Troops.tsx) can group them back into the lines of a single
  // event, and so SCRD's Cash Receipts Journal / Council Budget auto-actuals can read these
  // records directly (see features/scrd/lib/registrationCashReceipts.ts) without going
  // through a voucher.
  addBulkPayment: (input: {
    troopId: string
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
  // Corrects a whole transaction's date/paid-by after the fact — the fee amounts themselves
  // are never editable here (they're auto-computed from the troop's filed registration, see
  // useRecordBulkPaymentModal.ts), so date and payer name are the only fields a correction
  // can touch. Applies to EVERY entry sharing `bulkKey` regardless of category — a Bulk
  // Payment is one remittance event/one receipt ("isang resibo every transaction"), so
  // editing one of its lines edits all of them, across whichever structure each category
  // actually lives in (ScoutMember.payments for membership, Troop.flatFeePayments for
  // troop_fee/thinking_day).
  updatePaymentGroup: (input: {
    troopId: string
    bulkKey: string
    date: string
    paidByName: string
  }) => { flatPayments: FlatFeePayment[] }
  // Removes every entry sharing `bulkKey` — the whole transaction, not just one of its fee
  // lines or one member's share of it (same "one receipt per transaction" reasoning as
  // updatePaymentGroup above).
  deletePaymentGroup: (input: { troopId: string; bulkKey: string }) => {
    removedFlatPayments: FlatFeePayment[]
  }
  // Stamps the printed council-share receipt (see PrintCouncilShareReceiptModal) onto every
  // 'membership' MemberPayment sharing `bulkKey` — the flat troop_fee/thinking_day lines a
  // bulk payment might also carry have no council-share concept of their own, so only the
  // membership lines are touched.
  setMembershipCouncilShareReceipt: (input: {
    troopId: string
    bulkKey: string
    receipt: ReceiptRecord
  }) => void
}

export const useTroopsStore = create<TroopsState>()((set, get) => ({
  troops: [],
  scoutMembers: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [troops, scoutMembers] = await Promise.all([
        hydrateCollection<Troop>('troops'),
        hydrateCollection<ScoutMember>('scoutMembers')
      ])
      set({ troops, scoutMembers, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[troops.store] Failed to hydrate', err)
    }
  },

  addTroop: (troop) => {
    set((s) => ({ troops: [troop, ...s.troops] }))
    persist('troops', troop.id, troop)
    appendAuditLog({
      action: 'troop_created',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop.troopNumber} (${troop.leaderName}) created.`
    })
  },
  updateTroop: (id, patch) => {
    set((s) => ({ troops: s.troops.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
    const troop = get().troops.find((t) => t.id === id)
    if (troop) persist('troops', id, troop)
    appendAuditLog({
      action: 'troop_updated',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop?.troopNumber ?? id} updated.`
    })
  },
  // Blocked once any member has payment history — Daily Collections derives its per-day
  // totals live from scoutMembers[].payments, so deleting one would retroactively shrink an
  // already-reconciled prior day's report. Deactivate the troop/member instead (isActive),
  // which keeps that history intact. `force` is the deliberate override for when a hard
  // delete is truly wanted anyway (e.g. test/erroneous data) — the caller is responsible
  // for warning the user about the Daily Collections impact before setting it. Also cleans
  // up everything else that references this troop by id — filed Troop Registrations and ICCG
  // filings/roster — so nothing survives as a dangling record with no parent to view it from
  // (troopRegistrations' own deleteRegistration already cleans up the voucher it created).
  deleteTroop: (id, force = false) => {
    const troop = get().troops.find((t) => t.id === id)
    const orphanedMembers = get().scoutMembers.filter((m) => m.troopId === id)
    const orphanedIccgMembers = useIccgMemberStore
      .getState()
      .members.filter((m) => m.troopId === id)
    const hasPayments =
      orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0) ||
      orphanedIccgMembers.some((m) => (m.payments?.length ?? 0) > 0)
    if (hasPayments && !force) return
    set((s) => ({
      troops: s.troops.filter((t) => t.id !== id),
      scoutMembers: s.scoutMembers.filter((m) => m.troopId !== id)
    }))
    deleteDocById('troops', id)
    for (const member of orphanedMembers) deleteDocById('scoutMembers', member.id)

    const orphanedRegistrations = useTroopRegistrationStore
      .getState()
      .registrations.filter((r) => r.troopId === id)
    for (const registration of orphanedRegistrations) {
      useTroopRegistrationStore.getState().deleteRegistration(registration.id)
    }
    const orphanedIccgRegistrations = useIccgRegistrationStore
      .getState()
      .registrations.filter((r) => r.troopId === id)
    for (const registration of orphanedIccgRegistrations) {
      useIccgRegistrationStore.getState().deleteRegistration(registration.id)
    }
    for (const member of orphanedIccgMembers) {
      useIccgMemberStore.getState().deleteMember(member.id, true)
    }

    appendAuditLog({
      action: 'troop_deleted',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop?.troopNumber ?? id} and its ${orphanedMembers.length} member(s), ${orphanedRegistrations.length} registration(s), and ${orphanedIccgRegistrations.length} ICCG filing(s) deleted.${hasPayments ? ' Force-deleted despite recorded member payments.' : ''}`
    })
  },

  addScoutMember: (member) => {
    set((s) => ({ scoutMembers: [member, ...s.scoutMembers] }))
    persist('scoutMembers', member.id, member)
    const troop = get().troops.find((t) => t.id === member.troopId)
    appendAuditLog({
      action: 'scout_member_added',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member.fullName} added to Troop ${troop?.troopNumber ?? member.troopId}.`
    })
  },
  updateScoutMember: (id, patch) => {
    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) => (m.id === id ? { ...m, ...patch } : m))
    }))
    const member = get().scoutMembers.find((m) => m.id === id)
    if (member) persist('scoutMembers', id, member)
    appendAuditLog({
      action: 'scout_member_updated',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  // Same guard as deleteTroop above — a member with payment history can't be hard-deleted
  // unless the caller explicitly forces it (see deleteTroop's comment).
  deleteScoutMember: (id, force = false) => {
    const member = get().scoutMembers.find((m) => m.id === id)
    const hasPayments = (member?.payments?.length ?? 0) > 0
    if (hasPayments && !force) return
    set((s) => ({ scoutMembers: s.scoutMembers.filter((m) => m.id !== id) }))
    deleteDocById('scoutMembers', id)
    appendAuditLog({
      action: 'scout_member_deleted',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} removed.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  },
  renewScoutMember: (id, membershipYear) => {
    const renewedAt = todayLocalIso()
    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) =>
        m.id === id ? { ...m, membershipYear, renewedAt } : m
      )
    }))
    const member = get().scoutMembers.find((m) => m.id === id)
    if (member) persist('scoutMembers', id, member)
    appendAuditLog({
      action: 'scout_member_renewed',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} renewed for membership year ${membershipYear}.`
    })
  },
  addMemberPayment: (memberId, payment) => {
    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) =>
        m.id === memberId ? { ...m, payments: [...(m.payments ?? []), payment] } : m
      )
    }))
    const member = get().scoutMembers.find((m) => m.id === memberId)
    if (member) persist('scoutMembers', memberId, member)
    appendAuditLog({
      action: 'scout_member_payment_recorded',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? memberId} paid ₱${payment.amount.toFixed(2)} (${payment.category}).`
    })
  },
  addBulkPayment: ({ troopId, memberIds, memberLines, flatLines, date, paidByName, receipt }) => {
    const validMemberLines = memberLines.filter((l) => l.amountPerMember > 0)
    const validFlatLines = flatLines.filter((l) => l.amount > 0)
    const bulkPaymentId = crypto.randomUUID()

    if (validMemberLines.length > 0 && memberIds.length > 0) {
      const memberIdSet = new Set(memberIds)
      set((s) => ({
        scoutMembers: s.scoutMembers.map((m) =>
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
      const updatedMembers = get().scoutMembers.filter((m) => memberIdSet.has(m.id))
      for (const member of updatedMembers) persist('scoutMembers', member.id, member)
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
        troops: s.troops.map((t) =>
          t.id === troopId
            ? { ...t, flatFeePayments: [...(t.flatFeePayments ?? []), ...flatPayments] }
            : t
        )
      }))
      const updatedTroop = get().troops.find((t) => t.id === troopId)
      if (updatedTroop) persist('troops', troopId, updatedTroop)
    }

    const troop = get().troops.find((t) => t.id === troopId)
    const memberTotal =
      validMemberLines.reduce((sum, l) => sum + l.amountPerMember, 0) * memberIds.length
    const flatTotal = validFlatLines.reduce((sum, l) => sum + l.amount, 0)
    if (memberTotal + flatTotal > 0) {
      appendAuditLog({
        action: 'troop_bulk_payment_recorded',
        actorName: actorName(),
        entityType: 'scout_member',
        summary: `${paidByName} paid ₱${(memberTotal + flatTotal).toFixed(2)} for Troop ${troop?.troopNumber ?? troopId} (${validMemberLines.length} per-member line(s) × ${memberIds.length} member(s), ${validFlatLines.length} flat fee line(s)).`
      })
    }

    return { bulkPaymentId, flatPayments }
  },

  updatePaymentGroup: ({ troopId, bulkKey, date, paidByName }) => {
    const flatPayments: FlatFeePayment[] = []

    set((s) => ({
      troops: s.troops.map((t) => {
        if (t.id !== troopId) return t
        const updatedFlatFeePayments = (t.flatFeePayments ?? []).map((p) => {
          if ((p.bulkPaymentId ?? p.id) !== bulkKey) return p
          const updated = { ...p, date, paidByName }
          flatPayments.push(updated)
          return updated
        })
        return { ...t, flatFeePayments: updatedFlatFeePayments }
      })
    }))
    const troop = get().troops.find((t) => t.id === troopId)
    if (troop) persist('troops', troopId, troop)

    const affectedIds = new Set(
      get()
        .scoutMembers.filter(
          (m) =>
            m.troopId === troopId &&
            (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    if (affectedIds.size > 0) {
      set((s) => ({
        scoutMembers: s.scoutMembers.map((m) =>
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
      const updatedMembers = get().scoutMembers.filter((m) => affectedIds.has(m.id))
      for (const member of updatedMembers) persist('scoutMembers', member.id, member)
    }

    appendAuditLog({
      action: 'troop_bulk_payment_updated',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `Payment for Troop ${troop?.troopNumber ?? troopId} updated — date ${date}, paid by ${paidByName}.`
    })

    return { flatPayments }
  },

  deletePaymentGroup: ({ troopId, bulkKey }) => {
    const removedFlatPayments: FlatFeePayment[] = []

    set((s) => ({
      troops: s.troops.map((t) => {
        if (t.id !== troopId) return t
        const kept: FlatFeePayment[] = []
        for (const p of t.flatFeePayments ?? []) {
          if ((p.bulkPaymentId ?? p.id) === bulkKey) {
            removedFlatPayments.push(p)
          } else {
            kept.push(p)
          }
        }
        return { ...t, flatFeePayments: kept }
      })
    }))
    const troop = get().troops.find((t) => t.id === troopId)
    if (troop) persist('troops', troopId, troop)

    const affectedIds = new Set(
      get()
        .scoutMembers.filter(
          (m) =>
            m.troopId === troopId &&
            (m.payments ?? []).some((p) => (p.bulkPaymentId ?? p.id) === bulkKey)
        )
        .map((m) => m.id)
    )
    if (affectedIds.size > 0) {
      set((s) => ({
        scoutMembers: s.scoutMembers.map((m) =>
          affectedIds.has(m.id)
            ? {
                ...m,
                payments: (m.payments ?? []).filter((p) => (p.bulkPaymentId ?? p.id) !== bulkKey)
              }
            : m
        )
      }))
      const updatedMembers = get().scoutMembers.filter((m) => affectedIds.has(m.id))
      for (const member of updatedMembers) persist('scoutMembers', member.id, member)
    }

    appendAuditLog({
      action: 'troop_bulk_payment_deleted',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `Payment for Troop ${troop?.troopNumber ?? troopId} deleted.`
    })

    return { removedFlatPayments }
  },

  setMembershipCouncilShareReceipt: ({ troopId, bulkKey, receipt }) => {
    const affectedIds = new Set(
      get()
        .scoutMembers.filter(
          (m) =>
            m.troopId === troopId &&
            (m.payments ?? []).some(
              (p) => p.category === 'membership' && (p.bulkPaymentId ?? p.id) === bulkKey
            )
        )
        .map((m) => m.id)
    )
    if (affectedIds.size === 0) return

    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) =>
        affectedIds.has(m.id)
          ? {
              ...m,
              payments: (m.payments ?? []).map((p) =>
                p.category === 'membership' && (p.bulkPaymentId ?? p.id) === bulkKey
                  ? { ...p, councilShareReceipt: receipt }
                  : p
              )
            }
          : m
      )
    }))
    const updatedMembers = get().scoutMembers.filter((m) => affectedIds.has(m.id))
    for (const member of updatedMembers) persist('scoutMembers', member.id, member)

    const troop = get().troops.find((t) => t.id === troopId)
    appendAuditLog({
      action: 'troop_council_share_receipt_printed',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `Council-share receipt ${receipt.receiptNumber} printed for Troop ${troop?.troopNumber ?? troopId}'s Membership Fee remittance.`
    })
  }
}))
