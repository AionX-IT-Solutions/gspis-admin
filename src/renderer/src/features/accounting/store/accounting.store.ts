import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import type { Account, Vendor } from '../types/accounting.types'

interface AccountingState {
  vendors: Vendor[]
  accounts: Account[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addVendor: (vendor: Vendor) => void
  updateVendor: (id: string, patch: Partial<Vendor>) => void
  deleteVendor: (id: string) => void
}

export const useAccountingStore = create<AccountingState>()((set, get) => ({
  vendors: [],
  accounts: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [vendors, accounts] = await Promise.all([
        hydrateCollection<Vendor>('vendors'),
        hydrateCollection<Account>('accounts')
      ])
      set({ vendors, accounts, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[accounting.store] Failed to hydrate', err)
    }
  },

  addVendor: (vendor) => {
    set((s) => ({ vendors: [vendor, ...s.vendors] }))
    persistDoc('vendors', vendor.id, vendor)
  },
  updateVendor: (id, patch) => {
    set((s) => ({ vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) }))
    const vendor = get().vendors.find((v) => v.id === id)
    if (vendor) persistDoc('vendors', id, vendor)
  },
  deleteVendor: (id) => {
    set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }))
    deleteDocById('vendors', id)
  }
}))
