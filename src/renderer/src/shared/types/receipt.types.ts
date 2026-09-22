// The two pre-printed, BIR-registered receipt booklets the Council actually issues at the
// counter — used wherever a module collects a cash/check payment and needs to print one
// (Invoices' Record Payment, Troops & Membership's Record Bulk Payment). A cashier picks
// whichever one they physically wrote for this collection: "service_invoice" mirrors the
// itemized Service Invoice booklet (free-text billing lines) — a Service Invoice is its own
// distinct BIR document, NOT an Official Receipt, so it must never be labeled as one anywhere
// this prints or displays it. "acknowledgment_receipt" mirrors the Acknowledgment Receipt
// booklet used for registration-fee collections (fixed Girl/Leader/Committee member-type
// breakdown).
import type { ModeOfPayment } from '@/features/vouchers/types/vouchers.types'

export type ReceiptKind = 'service_invoice' | 'acknowledgment_receipt'

/** Display label for each kind — what a voucher's own `receiptType` field stores (see
 *  Voucher.receiptType in vouchers.types.ts) and what SCRD's Cash Receipts Journal shows in
 *  its "Receipt Used" column. */
export const RECEIPT_KIND_LABELS: Record<ReceiptKind, string> = {
  service_invoice: 'Service Invoice',
  acknowledgment_receipt: 'Acknowledgment Receipt'
}

export interface ReceiptBreakdownLine {
  label: string
  amount: number
}

/** A fully self-contained snapshot of one printed receipt — everything printReceipt() needs,
 *  so a caller that stores this on its own record (Invoice.payment, a troop/committee bulk
 *  payment's shared receipt) can reprint it later with nothing but `printReceipt(record)`. */
export interface ReceiptRecord {
  receiptType: ReceiptKind
  receiptNumber: string
  date: string
  /** Free-text shown on the "In payment for" line (Service Invoice only) — an invoice
   *  number, a troop's remittance description, etc. Omitted entirely when not given. */
  referenceNote?: string
  payorName: string
  tin?: string
  address?: string
  businessStyle?: string
  modeOfPayment: ModeOfPayment
  lines: ReceiptBreakdownLine[]
  /** Whoever actually issued the receipt — kept on the record itself so a later reprint
   *  still shows the original cashier's name, not whoever happens to click Reprint. */
  cashierName: string
}
