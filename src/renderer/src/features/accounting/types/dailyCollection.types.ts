/** One receipt line the staff entered by hand — for cash collected in person that hasn't
 *  (yet) been recorded through an automated source (a POS sale, a rental, a troop/committee
 *  registration or bulk payment). BC Fee, DC Fee, TG Fee, ICCG, and Troop Fee/Thinking Day Fee
 *  do also have an automated source now — the same merged Cash Receipts source SCRD/Council
 *  Budget/Income Statement already pull from (see useDailyCollectionsTab.ts's
 *  rawAutoReceiptRows) — which lands in these same columns automatically; this manual line is
 *  only for topping up same-day cash that hasn't gone through that flow yet. Mirrors the
 *  Council's real "Daily Cash Collection Report" columns exactly. */
export interface ManualReceiptLine {
  id: string
  siNo: string
  receivedFrom: string
  nes: number
  bcFee: number
  dcFee: number
  tgFee: number
  csf: number
  iccg: number
  memReg: number
  rentals: number
  refundOfCa: number
  troopFee: number
  thinkingDay: number
  oavfFee: number
  honoraryFee: number
  associateMemberFee: number
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
