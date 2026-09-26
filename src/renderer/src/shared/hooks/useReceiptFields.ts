import { useEffect, useState } from 'react'
import type { ModeOfPayment } from '@/features/vouchers/types/vouchers.types'
import type { ReceiptBreakdownLine, ReceiptKind } from '@/shared/types/receipt.types'
import { MEMBERSHIP_FEE_CATEGORIES } from '@/shared/lib/receiptCategories'

export interface ReceiptFieldsSeed {
  address?: string
  businessStyle?: string
}

/** Shared state for the "which receipt, what breakdown" part of a payment-collection form —
 *  used by both Invoices' Record Payment and Troops & Membership's Record Bulk Payment, so
 *  the two receipt templates (Service Invoice / Acknowledgment Receipt) stay in one place.
 *  Deliberately does NOT own payor name or date — callers already have their own (invoice
 *  customer name / bulk payment's paid-by name and date), so this only covers the fields
 *  unique to printing a receipt. Resets whenever `resetKey` changes (e.g. a different invoice
 *  opened, or the modal re-opening) — `initialReceiptType` seeds which tab that reset lands
 *  on, e.g. from ReceiptTypePickerModal's up-front choice, so the full form opens already on
 *  the type the user just picked instead of always defaulting to Service Invoice. */
export function useReceiptFields(
  seed: ReceiptFieldsSeed,
  resetKey: unknown,
  initialReceiptType?: ReceiptKind
) {
  const [receiptType, setReceiptType] = useState<ReceiptKind>(
    initialReceiptType ?? 'service_invoice'
  )
  const [receiptNumber, setReceiptNumber] = useState('')
  const [tin, setTin] = useState('')
  const [address, setAddress] = useState(seed.address ?? '')
  const [businessStyle, setBusinessStyle] = useState(seed.businessStyle ?? '')
  const [modeOfPayment, setModeOfPayment] = useState<ModeOfPayment>('cash')
  const [checkNumber, setCheckNumber] = useState('')
  const [breakdown, setBreakdown] = useState<Record<string, number>>({})
  const [othersLabel, setOthersLabel] = useState('')
  const [othersAmount, setOthersAmount] = useState(0)
  // Once the cashier hand-edits any Acknowledgment Receipt field, autoFillBreakdown below
  // stops overwriting it — a manual correction should never be silently clobbered by the
  // next amount recalculation.
  const [breakdownTouched, setBreakdownTouched] = useState(false)

  useEffect(() => {
    setReceiptType(initialReceiptType ?? 'service_invoice')
    setReceiptNumber('')
    setTin('')
    setAddress(seed.address ?? '')
    setBusinessStyle(seed.businessStyle ?? '')
    setModeOfPayment('cash')
    setCheckNumber('')
    setBreakdown({})
    setOthersLabel('')
    setOthersAmount(0)
    setBreakdownTouched(false)
    // Only reseed on resetKey — re-running this on every `seed` change would clobber
    // whatever the user already typed as they keep editing the surrounding form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  function setBreakdownAmount(category: string, amount: number) {
    setBreakdownTouched(true)
    setBreakdown((b) => ({ ...b, [category]: amount }))
  }

  function setOthersLabelTouched(value: string) {
    setBreakdownTouched(true)
    setOthersLabel(value)
  }

  function setOthersAmountTouched(value: number) {
    setBreakdownTouched(true)
    setOthersAmount(value)
  }

  /** Mirrors the Service Invoice tab's itemized amounts onto the Acknowledgment Receipt tab's
   *  per-category fields, so it opens pre-filled and ready to print instead of a blank form
   *  the cashier has to reconstruct by hand from the same numbers shown just above it. Callers
   *  re-call this whenever their underlying amounts change; it's a no-op once the cashier has
   *  actually typed into the breakdown themselves (see breakdownTouched above). */
  function autoFillBreakdown(
    entries: Record<string, number>,
    others: { label: string; amount: number }
  ) {
    if (breakdownTouched) return
    setBreakdown(entries)
    setOthersLabel(others.label)
    setOthersAmount(others.amount)
  }

  const acknowledgmentTotal =
    MEMBERSHIP_FEE_CATEGORIES.reduce((sum, cat) => sum + (breakdown[cat] || 0), 0) + othersAmount

  function buildAcknowledgmentLines(): ReceiptBreakdownLine[] {
    return [
      ...MEMBERSHIP_FEE_CATEGORIES.filter((c) => (breakdown[c] || 0) > 0).map((c) => ({
        label: c,
        amount: breakdown[c]
      })),
      ...(othersAmount > 0 ? [{ label: othersLabel.trim() || 'Others', amount: othersAmount }] : [])
    ]
  }

  return {
    receiptType,
    setReceiptType,
    receiptNumber,
    setReceiptNumber,
    tin,
    setTin,
    address,
    setAddress,
    businessStyle,
    setBusinessStyle,
    modeOfPayment,
    setModeOfPayment,
    checkNumber,
    setCheckNumber,
    breakdown,
    setBreakdownAmount,
    othersLabel,
    setOthersLabel: setOthersLabelTouched,
    othersAmount,
    setOthersAmount: setOthersAmountTouched,
    acknowledgmentTotal,
    buildAcknowledgmentLines,
    autoFillBreakdown
  }
}
