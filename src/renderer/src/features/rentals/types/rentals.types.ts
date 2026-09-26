import type { ReceiptRecord } from '@/shared/types/receipt.types'

/** Which Council Budget rental-income line a space's bookings roll up into (see
 *  budgetAutoActuals.ts) — separate from SCRD, which always sums every category's rental
 *  income together into one flat "Rental Income" figure regardless of this field. */
export type RentalSpaceCategory = 'room' | 'hall' | 'space'

export interface RentalSpace {
  id: string
  name: string
  description: string
  ratePerDay: number
  capacity: number
  imageUrl?: string
  /** Absent on spaces created before this field existed — budgetAutoActuals.ts falls back to
   *  guessing from `name` for those, same as it always has. */
  category?: RentalSpaceCategory
  /** Hours `ratePerDay` already covers before excessHourlyRate kicks in. Absent (or 0) means
   *  no automatic excess computation — a booking's price is just the flat ratePerDay, same as
   *  before this field existed. */
  baseHours?: number
  /** Rate charged per hour beyond baseHours. */
  excessHourlyRate?: number
}

export type BookingStatus = 'reserved' | 'confirmed' | 'completed' | 'cancelled'

/** 'pwd_senior' is a flat 20% off (RA 9994 / RA 10754 discount policy), applied to `subtotal`. */
export type BookingDiscountType = 'none' | 'pwd_senior'

export interface RentalBooking {
  id: string
  rentalSpaceId: string
  bookingDate: string
  startTime?: string
  endTime?: string
  renterName: string
  notes?: string
  /** Space's ratePerDay snapshot at booking time, before discount. */
  subtotal?: number
  /** Hours booked beyond the space's baseHours at booking time — 0/absent whenever the space
   *  had no baseHours/excessHourlyRate configured, or no start/end time was given. Stored (not
   *  just computed live) so the breakdown stays visible/checkable after saving, and stays
   *  correct even if the space's rate is edited later. */
  excessHours?: number
  excessAmount?: number
  discountType?: BookingDiscountType
  discountAmount?: number
  /** Net amount due — subtotal minus discountAmount. */
  totalAmount: number
  /** Actual amount collected so far — compared against totalAmount (and the
   * policy-required 50% down payment) to derive payment status; see
   * paymentStatusOf in useRentals.ts. */
  amountPaid?: number
  status: BookingStatus
  /** The official receipt printed for this booking's payment — kept on the booking itself so
   *  a later reprint (see PrintBookingReceiptModal) still shows the original cashier's name
   *  and receipt number, not whoever happens to click Reprint. */
  receipt?: ReceiptRecord
}
