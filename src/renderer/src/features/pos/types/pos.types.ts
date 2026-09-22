export interface Product {
  id: string
  sku: string
  /** Also written as gspi-app's `barcode` field — desktop has one combined
   * SKU/barcode field, so the same value is persisted to both. */
  barcode: string
  name: string
  description: string
  /** References a doc in the shared, read-only `categories` collection —
   * gspi-app's Product.categoryId. Desktop has no category-management UI;
   * the picker in ProductFormModal just lists whatever that collection has. */
  categoryId: string
  /** Denormalized from the selected category's color, matching gspi-app's
   * Product.color (used there for category-tinted UI chips). */
  color: string
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  reorderLevel: number
  /** gspi-app's ProductUnit — desktop offers a fixed picker (see
   * lib/productUnits.ts) rather than gspi-app's per-business-type list,
   * since desktop has no business-category concept. */
  unit: string
  isActive: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  code: string
  name: string
  email?: string
  discountRate: number
}

export interface CartLine {
  productId: string
  sku: string
  name: string
  /** Denormalized from the product at add-to-cart time (see addToCart) — the Sales Invoice's
   *  "Unit" column (pc, box, etc.) needs it printed per line. */
  unit: string
  unitPrice: number
  quantity: number
}

export type PaymentMethod = 'cash' | 'card' | 'e-wallet'

export interface SaleItem {
  productId: string
  sku: string
  name: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  saleNumber: string
  cashierName: string
  items: SaleItem[]
  memberId?: string
  memberName?: string
  discountAmount: number
  subtotal: number
  totalAmount: number
  paymentMethod: PaymentMethod
  createdAt: string
  voided?: boolean
  voidedAt?: string
  voidReason?: string
}

export interface Purchase {
  id: string
  productId: string
  quantity: number
  unitCost: number
  amount: number
  date: string
}
