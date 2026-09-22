export type VoucherType = 'check_voucher' | 'journal_voucher'
// No separate "posted" step — the Council's real DV/JV forms have no such concept.
// Once the President signs (Approved By), the voucher is in effect; there's nothing
// further to advance it to.
export type VoucherStatus = 'pending' | 'approved' | 'cancelled'
export type ModeOfPayment = 'cash' | 'check'

export interface VoucherAccountLine {
  account: string
  // Shown on export as "Account - Description", e.g. "Salary - March 16-31, 2026"
  description?: string
  debit: number
  credit: number
}

export interface Voucher {
  id: string
  voucherNumber: string
  voucherType: VoucherType
  date: string
  modeOfPayment: ModeOfPayment
  checkNumber?: string
  payee: string
  payeeAddress?: string
  bankAccountRef?: string
  particulars: string
  amount: number
  accountLines: VoucherAccountLine[]
  status: VoucherStatus
  createdBy: string
  approvedBy?: string
  createdAt: string
  // Set on a plain receipt-direction Journal Voucher created via Invoices' Record Payment or
  // a Troop/District Committee bulk payment — the physical Service Invoice/Acknowledgment
  // Receipt booklet number (see shared/types/receipt.types.ts's ReceiptRecord.receiptNumber),
  // distinct from `voucherNumber` (the JV's own accounting sequence). Not used by cash-advance
  // liquidation JVs, which have their own refundOrNumber below.
  orNumber?: string
  // Which of the Council's receipt booklets orNumber actually came from — "Service Invoice"
  // or "Acknowledgment Receipt" (see shared/types/receipt.types.ts's ReceiptKind). Shown as
  // its own column in SCRD's Cash Receipts Journal (see useScrdComputations.ts) so it's clear
  // at a glance which physical receipt backs a given entry. Unset for a voucher recorded
  // without ever printing/choosing a receipt for it.
  receiptType?: string
  // Journal Voucher only — cash advance liquidation fields
  // The Check Voucher (id) that disbursed the cash advance this JV liquidates — the
  // Council's real forms cross-reference it (JV's "DV No." field, and "(CV #___)" on the
  // Summary of Expenses), which needs a real link back to that voucher, not free text.
  relatedVoucherId?: string
  cashAdvanceAmount?: number
  cashAdvanceDate?: string
  amountRefunded?: number
  refundOrNumber?: string
  refundDate?: string
  // Sum of the actual liquidated expense lines — distinct from `amount` (the JV's own
  // balanced debit/credit total, which equals cashAdvanceAmount whenever the advance is
  // fully accounted for in one JV) and from amountRefunded (unspent cash returned).
  totalAmountSpent?: number
}
