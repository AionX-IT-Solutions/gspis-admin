// Recognized/suggested receipt categories — the Account Title suggestions offered on a
// credit-direction Journal Voucher (see NewVoucherModal), and the values a Council Budget
// income line's "Source" rule (EditBudgetCategoryModal) can be linked against. A receipt's
// `category` is always the posting voucher's own credit account line text verbatim (see
// getReceiptRowsFromVouchers in vouchers/lib/receiptVouchers.ts) — so every entry here MUST
// match one of those modules' own *_ACCOUNT constants exactly, or a Source rule built from it
// will silently match nothing. A receipt can still be entered under any free-text category
// (same as an expense voucher's GL account) — one outside this list just falls into SCRD's
// general "Other Operations" bucket instead of a named section, and won't feed a specific
// Budget income line's auto-actuals.
export type CashReceiptCategory =
  | 'Council Support Fund'
  | 'Troop Fees'
  | 'Thinking Day Fund'
  | 'BC Group Fee' // barangayCommittee/lib/bcVoucher.ts's BC_GROUP_FEE_ACCOUNT
  | 'TG Group Fee' // trefoilGuild/lib/tgVoucher.ts's TG_GROUP_FEE_ACCOUNT
  | 'DC Group Fee' // districtCommittee/lib/dcVoucher.ts's DC_GROUP_FEE_ACCOUNT
  | 'ICCG Registration Fee' // iccgRegistration/lib/iccgVoucher.ts's ICCG_FEE_ACCOUNT
  | 'OAVF/Career Woman Membership Fee' // oavf/lib/oavfVoucher.ts's OAVF_FEE_ACCOUNT
  | 'Honorary Member Fee' // honoraryMember/lib/honoraryMemberVoucher.ts's HONORARY_MEMBER_FEE_ACCOUNT
  | 'Associate Member Fee' // associateMember/lib/associateMemberVoucher.ts's ASSOCIATE_MEMBER_FEE_ACCOUNT
  | 'Training Fees'
  | 'Camping Fees'
  | 'Interest Income'
  | 'Other Operations'

/** Runtime companion to CashReceiptCategory above, for suggestion lists (a receipt-direction
 *  Journal Voucher's Account Title in NewVoucherModal, a Council Budget income line's
 *  configured Voucher source category in EditBudgetCategoryModal) — kept in one place so both
 *  stay in sync with the type. */
export const CASH_RECEIPT_CATEGORIES: CashReceiptCategory[] = [
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
