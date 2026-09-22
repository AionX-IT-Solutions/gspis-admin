import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { Bank } from '../types/bank.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Real seed data (per the Council's actual March 31, 2026 "ACCOUNTED FOR AS
// FOLLOWS" breakdown) — written once, only if the `banks` collection is
// still empty, so the SCRD ledger keeps working with the same accounts and
// balances it already used when this was a hardcoded constant.
const SEED_BANKS: Array<Pick<Bank, 'name' | 'accountNumber' | 'openingBalance'>> = [
  { name: 'Cash on Hand', accountNumber: undefined, openingBalance: 5110 },
  { name: 'Maybank', accountNumber: '01-017-00-0197-9', openingBalance: 301883.1 },
  { name: 'DBP', accountNumber: '00-500128590-5', openingBalance: 438440.53 },
  { name: 'DBP', accountNumber: '0-50141-590-7', openingBalance: 414021.86 },
  { name: 'PNB', accountNumber: '223510036978', openingBalance: 630244.33 },
  { name: 'Cordillera Bank', accountNumber: '8104', openingBalance: 298466.55 }
]

/** Matches the pre-migration display strings (e.g. "Maybank #01-017-00-0197-9")
 *  that existing cashReceipts/vouchers records already have stored in their
 *  free-text `bankAccount`/`bankAccountRef` fields, so old records keep
 *  matching their bank after the switch to structured Bank docs. */
export function bankDisplayName(bank: Pick<Bank, 'name' | 'accountNumber'>): string {
  return bank.accountNumber ? `${bank.name} #${bank.accountNumber}` : bank.name
}

interface BanksState {
  banks: Bank[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addBank: (input: { name: string; accountNumber?: string; openingBalance: number }) => void
  updateBank: (
    id: string,
    patch: Partial<Pick<Bank, 'name' | 'accountNumber' | 'openingBalance' | 'isActive'>>
  ) => void
  deleteBank: (id: string) => void
  restoreBank: (bank: Bank) => void
  /** System-computed, not a user edit — no audit log entry. */
  setCurrentBalance: (id: string, currentBalance: number) => void
}

// Guards the seed-if-empty check below against firing twice from within this same app
// instance — e.g. two components both calling hydrate() on mount before either finishes,
// or a force refresh landing while the initial hydrate is still in flight. Without this,
// both callers can independently observe an empty collection and each write a full set of
// SEED_BANKS, doubling every account (see the incident this fixed: 6 accounts became 12).
// This does NOT protect against two separate app instances/processes racing on a truly
// empty collection — that window only exists once, at the very first launch ever against a
// fresh project, and closes permanently the moment any bank doc exists.
let hydratePromise: Promise<void> | null = null

export const useBanksStore = create<BanksState>()((set, get) => ({
  banks: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      try {
        const banks = await hydrateCollection<Bank>('banks')
        if (banks.length === 0) {
          const now = new Date().toISOString()
          const seeded: Bank[] = SEED_BANKS.map((b) => ({
            id: crypto.randomUUID(),
            ...b,
            currentBalance: b.openingBalance,
            isActive: true,
            createdAt: now,
            updatedAt: now
          }))
          seeded.forEach((bank) => persistDoc('banks', bank.id, bank))
          set({ banks: seeded, hydrated: true })
          return
        }
        // "Cash on Hand" was added to SEED_BANKS after some installs' `banks` collection was
        // already populated, so the empty-collection seed above never ran for them — every
        // receipt/disbursement with no bank chosen still falls back to that exact account name
        // (see receiptVouchers.ts/useBankBalances.ts), so without a real doc for it here, that
        // cash has nowhere to show an opening balance or a persisted closing one. Patch it in
        // once so every install ends up with the same account SCRD/Reports already assume.
        if (!banks.some((b) => bankDisplayName(b) === 'Cash on Hand')) {
          const seed = SEED_BANKS.find((b) => b.name === 'Cash on Hand')
          if (seed) {
            const now = new Date().toISOString()
            const cashOnHand: Bank = {
              id: crypto.randomUUID(),
              ...seed,
              currentBalance: seed.openingBalance,
              isActive: true,
              createdAt: now,
              updatedAt: now
            }
            persistDoc('banks', cashOnHand.id, cashOnHand)
            banks.unshift(cashOnHand)
          }
        }
        set({ banks, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[banks.store] Failed to hydrate', err)
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  },

  addBank: (input) => {
    const now = new Date().toISOString()
    const bank: Bank = {
      id: crypto.randomUUID(),
      name: input.name,
      accountNumber: input.accountNumber,
      openingBalance: input.openingBalance,
      currentBalance: input.openingBalance,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
    set((s) => ({ banks: [...s.banks, bank] }))
    persistDoc('banks', bank.id, bank)
    appendAuditLog({
      action: 'bank_created',
      actorName: actorName(),
      entityType: 'bank',
      summary: `Bank account "${bankDisplayName(bank)}" added.`
    })
  },

  updateBank: (id, patch) => {
    let updated: Bank | undefined
    set((s) => ({
      banks: s.banks.map((b) => {
        if (b.id !== id) return b
        updated = { ...b, ...patch, updatedAt: new Date().toISOString() }
        return updated
      })
    }))
    if (updated) {
      persistDoc('banks', id, updated)
      appendAuditLog({
        action: 'bank_updated',
        actorName: actorName(),
        entityType: 'bank',
        summary: `Bank account "${bankDisplayName(updated)}" updated.`
      })
    }
  },

  deleteBank: (id) => {
    const bank = get().banks.find((b) => b.id === id)
    set((s) => ({ banks: s.banks.filter((b) => b.id !== id) }))
    deleteDocById('banks', id)
    appendAuditLog({
      action: 'bank_deleted',
      actorName: actorName(),
      entityType: 'bank',
      summary: `Bank account "${bank ? bankDisplayName(bank) : id}" removed.`
    })
  },

  restoreBank: (bank) => {
    set((s) => ({ banks: [...s.banks, bank] }))
    persistDoc('banks', bank.id, bank)
  },

  setCurrentBalance: (id, currentBalance) => {
    const existing = get().banks.find((b) => b.id === id)
    if (!existing || existing.currentBalance === currentBalance) return
    const updated: Bank = { ...existing, currentBalance, updatedAt: new Date().toISOString() }
    set((s) => ({ banks: s.banks.map((b) => (b.id === id ? updated : b)) }))
    persistDoc('banks', id, updated)
  }
}))
