import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { suggestVoucherNumber } from '@/features/vouchers/lib/voucherNumber'
import type { VoucherAccountLine } from '@/features/vouchers/types/vouchers.types'
import type { Troop } from '@/features/troops/types/troop.types'
import {
  councilRetainedMembershipShare,
  type TroopRegistration
} from '../types/troopRegistration.types'

function buildRemittanceLines(
  registration: TroopRegistration,
  troop: Troop
): { accountLines: VoucherAccountLine[]; amount: number } | null {
  const label = `${troop.troopNumber} (${registration.schoolYear})`
  const councilShare = councilRetainedMembershipShare(registration.remittance)
  const troopFee = registration.troopFee ?? 0
  const thinkingDay = registration.remittance.thinkingDayFee ?? 0

  const credits: VoucherAccountLine[] = []
  if (councilShare > 0) {
    credits.push({
      account: 'Troop Fees',
      description: `Council share of GSP Membership Fee — ${label}`,
      debit: 0,
      credit: councilShare
    })
  }
  if (troopFee > 0) {
    credits.push({
      account: 'Troop Fees',
      description: `Troop Fee — ${label}`,
      debit: 0,
      credit: troopFee
    })
  }
  if (thinkingDay > 0) {
    credits.push({
      account: 'Thinking Day Fund',
      description: `Thinking Day Fee — ${label}`,
      debit: 0,
      credit: thinkingDay
    })
  }

  const amount = credits.reduce((sum, l) => sum + l.credit, 0)
  if (amount <= 0) return null

  return {
    accountLines: [{ account: 'Cash on Hand', debit: amount, credit: 0 }, ...credits],
    amount
  }
}

/**
 * Keeps one approved Journal Voucher in sync with a filed Troop Registration's actual
 * Council-retained income (the membership fee's council share, Troop Fee, Thinking Day
 * Fee — NOT the full amount remitted, most of which is forwarded to National HQ) — this
 * is what makes it show up in SCRD's Cash Receipts journal and the Council Budget's income
 * auto-actuals, the same way every other real income source in this app does (see
 * getReceiptRowsFromVouchers / budgetAutoActuals.ts's CASH_RECEIPT_CATEGORIES_BY_BUDGET_LINE
 * — both read from approved vouchers, not a standalone "cash receipt" record).
 *
 * Firestore's `vouchers` collection only allows super_admin/admin/accountant/manager to
 * write (not hr, even though hr can file registrations) — callers must check
 * `hasPermission('manage:vouchers')` before calling this, and just skip the sync
 * otherwise; a registration filed by someone without that permission simply has no
 * `linkedVoucherId` until an accountant/manager opens and re-saves it.
 *
 * Returns the linked voucher id to store back on the registration (unchanged if nothing
 * needed remitting this time, so a previously-created voucher is never retroactively
 * deleted just because this save's figures dropped to zero).
 */
export function syncRemittanceVoucher(
  registration: TroopRegistration,
  troop: Troop
): string | undefined {
  const built = buildRemittanceLines(registration, troop)
  const { vouchers, addVoucher, updateVoucher, decideVoucher } = useVouchersStore.getState()
  const particulars = `Council Action Remittance — Troop ${troop.troopNumber} (${registration.schoolYear})`

  if (!built) return registration.linkedVoucherId

  const existing = registration.linkedVoucherId
    ? vouchers.find((v) => v.id === registration.linkedVoucherId)
    : undefined
  if (existing) {
    updateVoucher(existing.id, {
      date: registration.dateApplied,
      particulars,
      amount: built.amount,
      accountLines: built.accountLines
    })
    return existing.id
  }

  const voucherNumber = suggestVoucherNumber(vouchers, 'journal_voucher')
  addVoucher({
    voucherNumber,
    voucherType: 'journal_voucher',
    date: registration.dateApplied,
    modeOfPayment: 'cash',
    payee: troop.leaderName,
    particulars,
    amount: built.amount,
    accountLines: built.accountLines
  })
  const created = useVouchersStore
    .getState()
    .vouchers.find((v) => v.voucherNumber === voucherNumber && v.voucherType === 'journal_voucher')
  if (!created) return undefined
  decideVoucher(created.id, 'approved')
  return created.id
}
