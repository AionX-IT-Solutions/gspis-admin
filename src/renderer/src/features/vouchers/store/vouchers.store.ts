import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { useExpenseSummaryStore } from '@/features/expenseSummary/store/expenseSummary.store'
import type { Voucher, VoucherStatus } from '../types/vouchers.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface VouchersState {
  vouchers: Voucher[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addVoucher: (
    voucher: Omit<Voucher, 'id' | 'status' | 'createdAt' | 'createdBy'>,
    options?: { autoApprove?: boolean }
  ) => void
  updateVoucher: (id: string, patch: Partial<Voucher>) => void
  deleteVoucher: (id: string) => void
  decideVoucher: (id: string, status: VoucherStatus) => void
}

export const useVouchersStore = create<VouchersState>()((set, get) => ({
  vouchers: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const vouchers = await hydrateCollection<Voucher>('vouchers')
      set({ vouchers, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[vouchers.store] Failed to hydrate', err)
    }
  },

  addVoucher: (voucher, options) => {
    const autoApprove = options?.autoApprove ?? false
    const created: Voucher = {
      ...voucher,
      id: crypto.randomUUID(),
      status: autoApprove ? 'approved' : 'pending',
      approvedBy: autoApprove ? actorName() : undefined,
      createdBy: actorName(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ vouchers: [created, ...s.vouchers] }))
    persistDoc('vouchers', created.id, created)
    appendAuditLog({
      action: 'voucher_created',
      actorName: actorName(),
      entityType: 'voucher',
      summary: `${created.voucherNumber} created for ${created.payee}.`
    })
  },

  updateVoucher: (id, patch) => {
    set((s) => ({
      vouchers: s.vouchers.map((v) => (v.id === id ? { ...v, ...patch } : v))
    }))
    const voucher = get().vouchers.find((v) => v.id === id)
    if (voucher) persistDoc('vouchers', id, voucher)
    appendAuditLog({
      action: 'voucher_updated',
      actorName: actorName(),
      entityType: 'voucher',
      summary: `${voucher?.voucherNumber ?? id} updated.`
    })
  },

  deleteVoucher: (id) => {
    const voucher = get().vouchers.find((v) => v.id === id)
    set((s) => ({ vouchers: s.vouchers.filter((v) => v.id !== id) }))
    deleteDocById('vouchers', id)
    // Expense Summary is a 1:1 itemized backup of this voucher's own cash-advance
    // liquidation (id === voucherId, see firestore.rules) — never meaningful without the
    // voucher it backs, so it's always cleaned up alongside it. A voucher with no summary
    // simply has nothing to delete here.
    useExpenseSummaryStore.getState().deleteSummary(id)
    appendAuditLog({
      action: 'voucher_deleted',
      actorName: actorName(),
      entityType: 'voucher',
      summary: `${voucher?.voucherNumber ?? id} deleted.`
    })
  },

  decideVoucher: (id, status) => {
    set((s) => ({
      vouchers: s.vouchers.map((v) =>
        v.id === id
          ? {
              ...v,
              status,
              approvedBy: status === 'approved' ? actorName() : v.approvedBy
            }
          : v
      )
    }))
    const voucher = get().vouchers.find((v) => v.id === id)
    if (voucher) persistDoc('vouchers', id, voucher)
    appendAuditLog({
      action: 'voucher_status_updated',
      actorName: actorName(),
      entityType: 'voucher',
      summary: `${voucher?.voucherNumber ?? id} marked as ${status}.`
    })
  }
}))
