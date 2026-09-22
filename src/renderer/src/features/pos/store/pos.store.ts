import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import type { CartLine, Member, PaymentMethod, Product, Purchase, Sale } from '../types/pos.types'

interface POSState {
  products: Product[]
  members: Member[]
  sales: Sale[]
  purchases: Purchase[]
  cart: CartLine[]
  selectedMemberId: string | null
  /** Free-text name typed in the member picker when it doesn't match a registered Member
   *  (a walk-in customer) — printed on the receipt same as a real member's name, just with
   *  no loyalty discount applied. Cleared whenever a real member gets selected instead. */
  manualMemberName: string
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addProduct: (product: Product) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addMember: (member: Member) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  deleteMember: (id: string) => void
  restockProduct: (productId: string, quantity: number, unitCost: number) => void

  addToCart: (product: Product, quantity?: number) => { ok: boolean; message: string }
  removeFromCart: (productId: string) => void
  setCartQuantity: (productId: string, quantity: number) => void
  setSelectedMember: (memberId: string | null) => void
  setManualMemberName: (name: string) => void
  clearCart: () => void
  checkout: (cashierName: string, paymentMethod: PaymentMethod) => Sale | null
  voidSale: (saleId: string, actorName: string, reason: string) => void
  deleteSale: (saleId: string, actorName: string) => void
}

// Matches the Sales Invoice booklet's own plain 5-digit control number (e.g. "00001"),
// not an internal id — see features/pos/lib/receipt.ts.
let saleCounter = 1

function formatSaleNumber(n: number): string {
  return String(n).padStart(5, '0')
}

export const usePOSStore = create<POSState>()((set, get) => ({
  products: [],
  members: [],
  sales: [],
  purchases: [],
  cart: [],
  selectedMemberId: null,
  manualMemberName: '',
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [products, members, sales, purchases] = await Promise.all([
        hydrateCollection<Product>('products'),
        hydrateCollection<Member>('members'),
        hydrateCollection<Sale>('sales'),
        hydrateCollection<Purchase>('purchases')
      ])
      // Resume from the highest known number (across both the old "SALE-1000" and current
      // "00001" formats) to avoid collisions.
      saleCounter =
        sales.reduce((max, s) => {
          const n = Number(s.saleNumber?.replace('SALE-', ''))
          return Number.isFinite(n) ? Math.max(max, n) : max
        }, 0) + 1
      set({ products, members, sales, purchases, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[pos.store] Failed to hydrate', err)
    }
  },

  addProduct: (product) => {
    set((s) => ({ products: [product, ...s.products] }))
    persistDoc('products', product.id, product)
    appendAuditLog({
      action: 'product_created',
      actorName: 'System',
      entityType: 'product',
      summary: `Product "${product.name}" (${product.sku}) added to inventory.`
    })
  },
  updateProduct: (id, patch) => {
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    const product = get().products.find((p) => p.id === id)
    if (product) {
      persistDoc('products', id, product)
      appendAuditLog({
        action: 'product_updated',
        actorName: 'System',
        entityType: 'product',
        summary: `Product "${product.name}" (${product.sku}) updated.`
      })
    }
  },
  deleteProduct: (id) => {
    const product = get().products.find((p) => p.id === id)
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
    deleteDocById('products', id)
    appendAuditLog({
      action: 'product_deleted',
      actorName: 'System',
      entityType: 'product',
      summary: `Product "${product?.name ?? id}" removed from inventory.`
    })
  },
  addMember: (member) => {
    set((s) => ({ members: [member, ...s.members] }))
    persistDoc('members', member.id, member)
    appendAuditLog({
      action: 'member_created',
      actorName: 'System',
      entityType: 'member',
      summary: `Member "${member.name}" (${member.code}) added.`
    })
  },
  updateMember: (id, patch) => {
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
    const member = get().members.find((m) => m.id === id)
    if (member) persistDoc('members', id, member)
    appendAuditLog({
      action: 'member_updated',
      actorName: 'System',
      entityType: 'member',
      summary: `Member "${member?.name ?? id}" updated.`
    })
  },
  deleteMember: (id) => {
    const member = get().members.find((m) => m.id === id)
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('members', id)
    appendAuditLog({
      action: 'member_deleted',
      actorName: 'System',
      entityType: 'member',
      summary: `Member "${member?.name ?? id}" removed.`
    })
  },

  restockProduct: (productId, quantity, unitCost) => {
    const product = get().products.find((p) => p.id === productId)
    if (!product || quantity <= 0) return
    const purchase: Purchase = {
      id: crypto.randomUUID(),
      productId,
      quantity,
      unitCost,
      amount: quantity * unitCost,
      date: new Date().toISOString()
    }
    const updatedProduct = {
      ...product,
      stockQuantity: product.stockQuantity + quantity,
      costPrice: unitCost,
      updatedAt: new Date().toISOString()
    }
    set((s) => ({
      purchases: [purchase, ...s.purchases],
      products: s.products.map((p) => (p.id === productId ? updatedProduct : p))
    }))
    persistDoc('purchases', purchase.id, purchase)
    persistDoc('products', productId, updatedProduct)
    appendAuditLog({
      action: 'product_restocked',
      actorName: 'System',
      entityType: 'product',
      summary: `Restocked ${quantity} unit(s) of "${product.name}" at ${unitCost} each.`
    })
  },

  addToCart: (product, quantity = 1) => {
    if (!product.isActive) return { ok: false, message: `${product.name} is inactive` }
    const state = get()
    const existing = state.cart.find((l) => l.productId === product.id)
    const currentQty = existing?.quantity ?? 0
    if (currentQty + quantity > product.stockQuantity) {
      return {
        ok: false,
        message: `Not enough stock for ${product.name} (only ${product.stockQuantity} left)`
      }
    }
    set((s) => ({
      cart: existing
        ? s.cart.map((l) =>
            l.productId === product.id ? { ...l, quantity: l.quantity + quantity } : l
          )
        : [
            ...s.cart,
            {
              productId: product.id,
              sku: product.sku,
              name: product.name,
              unit: product.unit,
              unitPrice: product.sellingPrice,
              quantity
            }
          ]
    }))
    return { ok: true, message: `${product.name} added to cart` }
  },

  // Cart/selectedMemberId are ephemeral checkout-in-progress state — intentionally local only.
  removeFromCart: (productId) =>
    set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),
  setCartQuantity: (productId, quantity) =>
    set((s) => ({
      cart:
        quantity <= 0
          ? s.cart.filter((l) => l.productId !== productId)
          : s.cart.map((l) => (l.productId === productId ? { ...l, quantity } : l))
    })),
  setSelectedMember: (memberId) => set({ selectedMemberId: memberId, manualMemberName: '' }),
  setManualMemberName: (name) => set({ manualMemberName: name, selectedMemberId: null }),
  clearCart: () => set({ cart: [], selectedMemberId: null, manualMemberName: '' }),

  checkout: (cashierName, paymentMethod) => {
    const state = get()
    if (state.cart.length === 0) return null

    const member = state.members.find((m) => m.id === state.selectedMemberId)
    const subtotal = state.cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
    const discountAmount = member ? Math.round(subtotal * member.discountRate * 100) / 100 : 0
    const totalAmount = subtotal - discountAmount

    const sale: Sale = {
      id: crypto.randomUUID(),
      saleNumber: formatSaleNumber(saleCounter++),
      cashierName,
      items: state.cart.map((l) => ({
        productId: l.productId,
        sku: l.sku,
        name: l.name,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal: l.unitPrice * l.quantity
      })),
      memberId: member?.id,
      memberName: member?.name ?? (state.manualMemberName.trim() || undefined),
      discountAmount,
      subtotal,
      totalAmount,
      paymentMethod,
      createdAt: new Date().toISOString()
    }

    const updatedProducts = state.products.map((p) => {
      const line = state.cart.find((l) => l.productId === p.id)
      return line
        ? {
            ...p,
            stockQuantity: p.stockQuantity - line.quantity,
            updatedAt: new Date().toISOString()
          }
        : p
    })

    set(() => ({
      sales: [sale, ...state.sales],
      products: updatedProducts,
      cart: [],
      selectedMemberId: null,
      manualMemberName: ''
    }))

    persistDoc('sales', sale.id, sale)
    for (const line of state.cart) {
      const updated = updatedProducts.find((p) => p.id === line.productId)
      if (updated) persistDoc('products', updated.id, updated)
    }

    appendAuditLog({
      action: 'sale_created',
      actorName: cashierName,
      entityType: 'sale',
      summary: `Sale ${sale.saleNumber} completed — ${sale.items.length} item(s), total collected.`
    })

    return sale
  },

  // Reverts a mistakenly completed sale: restores the sold quantities back
  // onto each product's stock and flags the sale as voided (kept, not
  // deleted, so it stays out of bank-balance/reports totals — see
  // useBankBalances — while remaining visible in the audit trail).
  voidSale: (saleId, actorName, reason) => {
    const state = get()
    const sale = state.sales.find((s) => s.id === saleId)
    if (!sale || sale.voided) return

    const voidedSale: Sale = {
      ...sale,
      voided: true,
      voidedAt: new Date().toISOString(),
      voidReason: reason
    }
    const updatedProducts = state.products.map((p) => {
      const item = sale.items.find((i) => i.productId === p.id)
      return item
        ? {
            ...p,
            stockQuantity: p.stockQuantity + item.quantity,
            updatedAt: new Date().toISOString()
          }
        : p
    })

    set(() => ({
      sales: state.sales.map((s) => (s.id === saleId ? voidedSale : s)),
      products: updatedProducts
    }))

    persistDoc('sales', voidedSale.id, voidedSale)
    for (const item of sale.items) {
      const updated = updatedProducts.find((p) => p.id === item.productId)
      if (updated) persistDoc('products', updated.id, updated)
    }

    appendAuditLog({
      action: 'sale_voided',
      actorName,
      entityType: 'sale',
      summary: `Sale ${sale.saleNumber} voided — stock restored. Reason: ${reason}`
    })
  },

  // Permanently removes a sale record — unlike voidSale (which keeps it, flagged, for the
  // audit trail), this actually deletes it, e.g. to clean up test/junk entries. A voided
  // sale's stock was already restored when it was voided, so only an un-voided one gets its
  // stock given back here.
  deleteSale: (saleId, actorName) => {
    const state = get()
    const sale = state.sales.find((s) => s.id === saleId)
    if (!sale) return

    const updatedProducts = sale.voided
      ? state.products
      : state.products.map((p) => {
          const item = sale.items.find((i) => i.productId === p.id)
          return item
            ? {
                ...p,
                stockQuantity: p.stockQuantity + item.quantity,
                updatedAt: new Date().toISOString()
              }
            : p
        })

    set(() => ({
      sales: state.sales.filter((s) => s.id !== saleId),
      products: updatedProducts
    }))

    deleteDocById('sales', saleId)
    if (!sale.voided) {
      for (const item of sale.items) {
        const updated = updatedProducts.find((p) => p.id === item.productId)
        if (updated) persistDoc('products', updated.id, updated)
      }
    }

    appendAuditLog({
      action: 'sale_deleted',
      actorName,
      entityType: 'sale',
      summary: `Sale ${sale.saleNumber} deleted.`
    })
  }
}))
