import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useTrefoilGuildRegistrationStore } from './trefoilGuildRegistration.store'
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type {
  TrefoilGuild,
  TrefoilGuildMember,
  FlatFeeCategory,
  FlatFeePayment,
  MemberPaymentCategory
} from '../types/trefoilGuild.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface TrefoilGuildState {
  guilds: TrefoilGuild[]
  members: TrefoilGuildMember[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addGuild: (guild: TrefoilGuild) => void
  updateGuild: (id: string, patch: Partial<TrefoilGuild>) => void
  deleteGuild: (id: string, force?: boolean) => void

  addMember: (member: TrefoilGuildMember) => void
  updateMember: (id: string, patch: Partial<TrefoilGuildMember>) => void
  deleteMember: (id: string, force?: boolean) => void

  // One remittance event, potentially both the per-member Membership Fee and the flat T.G.
  // Group Fee at once — the TG Chairman pays once, not once per fee type. Mirrors
  // features/barangayCommittee/store/barangayCommittee.store.ts's addBulkPayment exactly.
  addBulkPayment: (input: {
    trefoilGuildId: string
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
  // Corrects a whole transaction's date/paid-by after the fact — applies to EVERY entry
  // sharing `bulkKey` regardless of category (one receipt per transaction).
  updatePaymentGroup: (input: {
    trefoilGuildId: string
    bulkKey: string
    date: string
    paidByName: string
  }) => { flatPayments: FlatFeePayment[] }
  // Removes every entry sharing `bulkKey` — the whole transaction.
  deletePaymentGroup: (input: { trefoilGuildId: string; bulkKey: string }) => {
    removedFlatPayments: FlatFeePayment[]
  }
}

export const useTrefoilGuildStore = create<TrefoilGuildState>()((set, get) => ({
  guilds: [],
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [guilds, members] = await Promise.all([
        hydrateCollection<TrefoilGuild>('trefoilGuilds'),
        hydrateCollection<TrefoilGuildMember>('trefoilGuildMembers')
      ])
      set({ guilds, members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[trefoilGuild.store] Failed to hydrate', err)
    }
  },

  addGuild: (guild) => {
    set((s) => ({ guilds: [guild, ...s.guilds] }))
    persist('trefoilGuilds', guild.id, guild)
    appendAuditLog({
      action: 'trefoil_guild_created',
      actorName: actorName(),
      entityType: 'trefoil_guild',
      summary: `Trefoil Guild "${guild.name}" created.`
    })
  },
  updateGuild: (id, patch) => {
    set((s) => ({
      guilds: s.guilds.map((g) => (g.id === id ? { ...g, ...patch } : g))
    }))
    const guild = get().guilds.find((g) => g.id === id)
    if (guild) persist('trefoilGuilds', id, guild)
    appendAuditLog({
      action: 'trefoil_guild_updated',
      actorName: actorName(),
      entityType: 'trefoil_guild',
      summary: `Trefoil Guild "${guild?.name ?? id}" updated.`
    })
  },
  // Blocked once any member has payment history — same reasoning as Barangay/District
  // Committee's deleteCommittee. `force` is the deliberate override. Also cleans up filed
  // Trefoil Guild Registrations that reference this guild by id — same "no dangling records"
  // fix as Troops' deleteTroop.
  deleteGuild: (id, force = false) => {
    const guild = get().guilds.find((g) => g.id === id)
    const orphanedMembers = get().members.filter((m) => m.trefoilGuildId === id)
    const hasPayments = orphanedMembers.some((m) => (m.payments?.length ?? 0) > 0)
    if (hasPayments && !force) return
    set((s) => ({
      guilds: s.guilds.filter((g) => g.id !== id),
      members: s.members.filter((m) => m.trefoilGuildId !== id)
    }))
    deleteDocById('trefoilGuilds', id)
    for (const member of orphanedMembers) deleteDocById('trefoilGuildMembers', member.id)

    const orphanedRegistrations = useTrefoilGuildRegistrationStore
      .getState()
      .registrations.filter((r) => r.trefoilGuildId === id)
    for (const registration of orphanedRegistrations) {
      useTrefoilGuildRegistrationStore.getState().deleteRegistration(registration.id)
    }

    appendAuditLog({
      action: 'trefoil_guild_deleted',
      actorName: actorName(),
      entityType: 'trefoil_guild',
      summary: `Trefoil Guild "${guild?.name ?? id}" and its ${orphanedMembers.length} member(s) and ${orphanedRegistrations.length} registration(s) deleted.${hasPayments ? ' Force-deleted despite recorded member payments.' : ''}`
    })
  },

  addMember: (member) => {
    set((s) => ({ members: [member, ...s.members] }))
    persist('trefoilGuildMembers', member.id, member)
    const guild = get().guilds.find((g) => g.id === member.trefoilGuildId)
    appendAuditLog({
      action: 'trefoil_guild_member_added',
      actorName: actorName(),
      entityType: 'trefoil_guild_member',
      summary: `${member.fullName} added to Trefoil Guild "${guild?.name ?? member.trefoilGuildId}".`
    })
  },
  updateMember: (id, patch) => {
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m))
    }))
    const member = get().members.find((m) => m.id === id)
    if (member) persist('trefoilGuildMembers', id, member)
    appendAuditLog({
      action: 'trefoil_guild_member_updated',
      actorName: actorName(),
      entityType: 'trefoil_guild_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  deleteMember: (id, force = false) => {
    const member = get().members.find((m) => m.id === id)
    const hasPayments = (member?.payments?.length ?? 0) > 0
    if (hasPayments && !force) return
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('trefoilGuildMembers', id)
    appendAuditLog({
      action: 'trefoil_guild_member_deleted',
      actorName: actorName(),
      entityType: 'trefoil_guild_member',
      summary: `${member?.fullName ?? id} removed.${hasPayments ? ' Force-deleted despite recorded payments.' : ''}`
    })
  },

  addBulkPayment: ({
    trefoilGuildId,
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
      for (const member of updatedMembers) persist('trefoilGuildMembers', member.id, member)
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
        guilds: s.guilds.map((g) =>
          g.id === trefoilGuildId
            ? { ...g, flatFeePayments: [...(g.flatFeePayments ?? []), ...flatPayments] }
            : g
        )
      }))
      const updatedGuild = get().guilds.find((g) => g.id === trefoilGuildId)
      if (updatedGuild) persist('trefoilGuilds', trefoilGuildId, updatedGuild)
    }

    const guild = get().guilds.find((g) => g.id === trefoilGuildId)
    const memberTotal =
      validMemberLines.reduce((sum, l) => sum + l.amountPerMember, 0) * memberIds.length
    const flatTotal = validFlatLines.reduce((sum, l) => sum + l.amount, 0)
    if (memberTotal + flatTotal > 0) {
      appendAuditLog({
        action: 'trefoil_guild_bulk_payment_recorded',
        actorName: actorName(),
        entityType: 'trefoil_guild_member',
        summary: `${paidByName} paid ₱${(memberTotal + flatTotal).toFixed(2)} for Trefoil Guild "${guild?.name ?? trefoilGuildId}" (${validMemberLines.length} per-member line(s) × ${memberIds.length} member(s), ${validFlatLines.length} flat fee line(s)).`
      })
    }

    return { bulkPaymentId, flatPayments }
  },

  updatePaymentGroup: ({ trefoilGuildId, bulkKey, date, paidByName }) => {
    const flatPayments: FlatFeePayment[] = []

    set((s) => ({
      guilds: s.guilds.map((g) => {
        if (g.id !== trefoilGuildId) return g
        const updatedFlatFeePayments = (g.flatFeePayments ?? []).map((p) => {
          if ((p.bulkPaymentId ?? p.id) !== bulkKey) return p
          const updated = { ...p, date, paidByName }
          flatPayments.push(updated)
          return updated
        })
        return { ...g, flatFeePayments: updatedFlatFeePayments }
      })
    }))
    const guild = get().guilds.find((g) => g.id === trefoilGuildId)
    if (guild) persist('trefoilGuilds', trefoilGuildId, guild)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.trefoilGuildId === trefoilGuildId &&
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
      for (const member of updatedMembers) persist('trefoilGuildMembers', member.id, member)
    }

    appendAuditLog({
      action: 'trefoil_guild_bulk_payment_updated',
      actorName: actorName(),
      entityType: 'trefoil_guild_member',
      summary: `Payment for Trefoil Guild "${guild?.name ?? trefoilGuildId}" updated — date ${date}, paid by ${paidByName}.`
    })

    return { flatPayments }
  },

  deletePaymentGroup: ({ trefoilGuildId, bulkKey }) => {
    const removedFlatPayments: FlatFeePayment[] = []

    set((s) => ({
      guilds: s.guilds.map((g) => {
        if (g.id !== trefoilGuildId) return g
        const kept: FlatFeePayment[] = []
        for (const p of g.flatFeePayments ?? []) {
          if ((p.bulkPaymentId ?? p.id) === bulkKey) {
            removedFlatPayments.push(p)
          } else {
            kept.push(p)
          }
        }
        return { ...g, flatFeePayments: kept }
      })
    }))
    const guild = get().guilds.find((g) => g.id === trefoilGuildId)
    if (guild) persist('trefoilGuilds', trefoilGuildId, guild)

    const affectedIds = new Set(
      get()
        .members.filter(
          (m) =>
            m.trefoilGuildId === trefoilGuildId &&
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
      for (const member of updatedMembers) persist('trefoilGuildMembers', member.id, member)
    }

    appendAuditLog({
      action: 'trefoil_guild_bulk_payment_deleted',
      actorName: actorName(),
      entityType: 'trefoil_guild_member',
      summary: `Payment for Trefoil Guild "${guild?.name ?? trefoilGuildId}" deleted.`
    })

    return { removedFlatPayments }
  }
}))
