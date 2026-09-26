// The Council's paper "Daily Cash Collection Report" (Troops & Membership side) — same
// physical form Accounting's own Reports > Daily Collections tab digitizes
// (features/accounting/types/dailyCollection.types.ts), but a deliberately separate,
// parallel report: this one shows the ORIGINAL/gross fee collected from each payor (Troop
// No./District/R.O.R. No.-Date/Amount/headcount by age-level or committee type), not the
// council-retained share Accounting recognizes once a second internal receipt is printed —
// see lib/membershipCollectionRows.ts's header comment for the full reasoning.

/** Which single column on the paper form's "Number of Persons Registering" block a row's
 *  headcount belongs to — Adult Members (Council Board/District Committee/Barangay
 *  Committee/Troop Leader/Co-Leader/Trefoil Guild) or Young Girl Scouts (by age level). A row
 *  whose fee doesn't correspond to any of these (ICCG, OAVF/Career Woman, Honorary Member,
 *  Associate Member, Troop/Committee flat Group Fees) has no `personTag` at all — it still
 *  counts toward the row's own Amount and the report's Total Cash Collection, same as
 *  Accounting's own "doesn't fit a fixed column" categories (see useDailyCollectionsTab.ts). */
export type PersonTag = 'CB' | 'DC' | 'BC' | 'TL' | 'CL' | 'TG' | 'TW' | 'ST' | 'JR' | 'SR' | 'CDT'

/** One auto-generated row — a single payment/remittance event read live from a registration
 *  module's own records (never persisted itself; only the manual rows and per-row overrides
 *  below are saved). See lib/membershipCollectionRows.ts for how each module produces these.
 *  `personCounts` is a partial tally (not a single tag) since one remittance can cover several
 *  age levels/roles at once — e.g. a Troop's bulk payment spanning both Junior and Senior
 *  members ticks both JR and SR the same row, matching the paper form's own layout (every
 *  count column lives on every row, just usually blank). */
export interface MembershipCollectionRow {
  /** Stable across renders (not a random id) so a saved `RowOverride` keeps pointing at the
   *  same auto-row after a reload — built from the source record's own id(s), e.g.
   *  `troop-membership-${bulkPaymentId}`, or `ref-${referenceNumber}` once rows sharing the
   *  same reference number have been merged (see lib/membershipCollectionRows.ts's
   *  mergeRowsByReference). */
  id: string
  date: string
  payor: string
  troopNo?: string
  district?: string
  regFormNo?: string
  rorNo?: string
  rorDate?: string
  amount: number
  personCounts?: Partial<Record<PersonTag, number>>
  /** The physical receipt number this collection event was issued under (a bulk payment's
   *  `receipt.receiptNumber`, or a single-applicant registration's own AR/receipt number) —
   *  rows sharing the same non-empty reference are the same remittance handed over together
   *  (e.g. a Troop Leader paying Membership Fee and Troop Fee in one go) and get merged into
   *  one line, "isang resibo, isang entry" — same rule SCRD's own Cash Receipts Journal
   *  applies (see JournalTab.tsx's groupedRows). */
  referenceNumber?: string
}

/** A hand-added line for cash collected that hasn't (yet) gone through any automated
 *  registration/payment flow — mirrors accounting/types/dailyCollection.types.ts's
 *  ManualReceiptLine, adapted to this form's own columns. */
export interface ManualMembershipReceiptLine {
  id: string
  payor: string
  troopNo: string
  district: string
  regFormNo: string
  rorNo: string
  rorDate: string
  amount: number
  /** A hand-added line only ever needs one column ticked (unlike an auto row, which can
   *  span several) — kept as a single optional tag+count for a simpler entry form. */
  personTag?: PersonTag
  personCount: number
  /** Fully editable already (unlike an auto row), so deposit/remarks live directly on the
   *  line itself instead of a separate RowOverride. */
  depositedAmount: number
  dateDeposited: string
  remarks: string
}

/** Per-row, hand-entered deposit/remarks annotation layered on top of an auto-generated row —
 *  keyed by that row's own stable `id` in MembershipDailyCollectionReport.rowOverrides. Kept
 *  separate from the row itself since the row is computed live, never stored. */
export interface RowOverride {
  depositedAmount?: number
  dateDeposited?: string
  remarks?: string
}

/** A scanned/photographed copy of the physical Daily Cash Collection Report, or any supporting
 *  document for it — mirrors accounting/types/dailyCollection.types.ts's
 *  DailyCollectionAttachment exactly (same Storage-backed upload/delete flow). */
export interface MembershipReportAttachment {
  id: string
  name: string
  url: string
  /** Storage path, kept so the file can be deleted alongside its metadata entry. */
  storagePath: string
  uploadedAt: string
  uploadedBy: string
}

/** One per calendar date — matches the paper form's "one report per day" convention, same as
 *  Accounting's DailyCollectionReport. */
export interface MembershipDailyCollectionReport {
  id: string
  date: string
  manualRows: ManualMembershipReceiptLine[]
  rowOverrides: Record<string, RowOverride>
  bankBranchCode?: string
  remarks?: string
  preparedBy: string
  attachments: MembershipReportAttachment[]
  createdAt: string
  updatedAt: string
}

export const PERSON_TAG_COLUMNS: { key: PersonTag; label: string; group: 'adult' | 'girl' }[] = [
  { key: 'CB', label: 'CB', group: 'adult' },
  { key: 'DC', label: 'DC', group: 'adult' },
  { key: 'BC', label: 'BC', group: 'adult' },
  { key: 'TL', label: 'TL', group: 'adult' },
  { key: 'CL', label: 'CL', group: 'adult' },
  { key: 'TG', label: 'TG', group: 'adult' },
  { key: 'TW', label: 'TW', group: 'girl' },
  { key: 'ST', label: 'ST', group: 'girl' },
  { key: 'JR', label: 'JR', group: 'girl' },
  { key: 'SR', label: 'SR', group: 'girl' },
  { key: 'CDT', label: 'CDT', group: 'girl' }
]
