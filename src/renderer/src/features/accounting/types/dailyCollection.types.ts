import type { ReceiptRecord } from '@/shared/types/receipt.types'

/** One receipt line the staff entered by hand — for cash collected in person that hasn't
 *  (yet) been recorded through an automated source (a POS sale, a rental, a troop/committee
 *  registration or bulk payment). BC Fee and ICCG do also have an automated source now (an
 *  approved Barangay Committee/ICCG Registration voucher — see useDailyCollectionsTab.ts's
 *  rawAutoReceiptRows), which lands in these same columns automatically; this manual line is
 *  only for topping up same-day cash that hasn't gone through that flow yet. Mirrors the
 *  Council's real "Daily Cash Collection Report" columns exactly. */
export interface ManualReceiptLine {
  id: string
  siNo: string
  receivedFrom: string
  nes: number
  bcFee: number
  csf: number
  iccg: number
  memReg: number
  rentals: number
  refundOfCa: number
  others: number
}

export interface CashDepositLine {
  id: string
  bankId: string
  /** Denormalized so the deposit line still reads correctly if the bank is later renamed. */
  bankName: string
  saNo: string
  purpose: string
  amount: number
  /** Date range of collections this deposit actually represents — defaults to the report's
   *  own date (a same-day deposit), but can be widened when the deposit is a lump sum
   *  sweeping up several days of accumulated undeposited cash. Documentation only: it does
   *  not change the beginning-balance/undeposited math, which already carries forward
   *  correctly regardless of how a deposit is dated. */
  coverageFrom?: string
  coverageTo?: string
  /** The internal-transmittal receipt printed for handing this cash over for deposit (see
   *  PrintDepositReceiptModal) — deliberately NOT backed by a Journal Voucher, since the
   *  income it represents was already recorded once when the underlying sale/booking/
   *  payment happened; this is proof of custody transfer only, not a new receipt of income.
   *  Unset until printed. */
  receipt?: ReceiptRecord
}

export interface DailyCollectionAttachment {
  id: string
  name: string
  url: string
  /** Storage path, kept so the file can be deleted alongside its metadata entry. */
  storagePath: string
  uploadedAt: string
  uploadedBy: string
}

/** One per calendar date — matches the paper form's "one report per day" convention.
 *  The receipts table shown to the user is this doc's `manualReceipts` merged with
 *  auto-generated rows computed live from that date's POS sales, rental bookings, and
 *  troop membership registrations (see useDailyCollectionsTab) — only the manual rows,
 *  beginning balance, deposits, and attachments are actually persisted here. */
export interface DailyCollectionReport {
  id: string
  date: string
  beginningBalance: number
  manualReceipts: ManualReceiptLine[]
  deposits: CashDepositLine[]
  preparedBy: string
  attachments: DailyCollectionAttachment[]
  createdAt: string
  updatedAt: string
}
