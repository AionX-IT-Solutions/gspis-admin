// Recognized/suggested receipt categories — the Account Title suggestions offered on a
// credit-direction Journal Voucher (see NewVoucherModal), and the complete, closed set of
// checkboxes a Council Budget income line's "Source" rule (EditBudgetCategoryModal) can link
// against. A receipt's `category` is always one of these exact strings verbatim — either an
// approved Journal Voucher's own credit account line text (see getReceiptRowsFromVouchers in
// vouchers/lib/receiptVouchers.ts), or one of the 9 registration modules' own direct-read Cash
// Receipt rows (see scrd/lib/registrationCashReceipts.ts — BC/DC/TG Group Fee, ICCG/OAVF/
// Honorary/Associate Member Fee, Troop's own Membership/Troop Fees/Thinking Day Fund). A manual
// Journal Voucher can still be entered under any other free-text category — one outside this
// list just falls into SCRD's general "Other Operations" bucket instead of a named section,
// and won't feed a specific Budget income line's auto-actuals.
export type CashReceiptCategory =
  | 'Membership'
  | 'Council Support Fund'
  | 'Troop Fees'
  | 'Thinking Day Fund'
  | 'BC Group Fee'
  | 'TG Group Fee'
  | 'DC Group Fee'
  | 'ICCG Registration Fee'
  | 'OAVF/Career Woman Membership Fee'
  | 'Honorary Member Fee'
  | 'Associate Member Fee'
  | 'Training Fees'
  | 'Camping Fees'
  | 'Interest Income'
  | 'Other Operations'

/** Runtime companion to CashReceiptCategory above, for suggestion lists (a receipt-direction
 *  Journal Voucher's Account Title in NewVoucherModal) and the checkbox list a Council Budget
 *  income line's Voucher/Cash Receipts source rule offers (EditBudgetCategoryModal) — kept in
 *  one place so both stay in sync with the type. */
export const CASH_RECEIPT_CATEGORIES: CashReceiptCategory[] = [
  'Membership',
  'Council Support Fund',
  'Troop Fees',
  'Thinking Day Fund',
  'BC Group Fee',
  'TG Group Fee',
  'DC Group Fee',
  'ICCG Registration Fee',
  'OAVF/Career Woman Membership Fee',
  'Honorary Member Fee',
  'Associate Member Fee',
  'Training Fees',
  'Camping Fees',
  'Interest Income',
  'Other Operations'
]

// A receipt row, sourced from an approved Journal Voucher's credit line (see
// receiptVouchers.ts) — GSPIS records incoming cash the same way it records outgoing cash
// (Vouchers), rather than through a separate, disconnected entry screen.
export interface CashReceipt {
  id: string
  date: string
  payor: string
  particulars: string
  referenceNumber?: string
  category: string
  bankAccount: string
  amount: number
  /** Which of the Council's receipt booklets was used for this entry — "Service Invoice",
   *  "Acknowledgment Receipt", "Sales Invoice" (POS), or unset when none applies (a rental
   *  booking, a cash-advance reimbursement, or a voucher recorded without ever printing/
   *  choosing a receipt for it). */
  receiptType?: string
}
