import { RECEIPT_KIND_LABELS } from '@/shared/types/receipt.types'
import type { TroopRegistration } from '@/features/troopRegistration/types/troopRegistration.types'
import { findReceiptedCouncilShare } from '@/features/troopRegistration/lib/registrationPaymentStatus'
import type {
  FlatFeeCategory as TroopFlatFeeCategory,
  ScoutMember,
  Troop
} from '@/features/troops/types/troop.types'
import type { BarangayCommittee } from '@/features/barangayCommittee/types/barangayCommittee.types'
import type { DistrictCommittee } from '@/features/districtCommittee/types/districtCommittee.types'
import type { TrefoilGuild } from '@/features/trefoilGuild/types/trefoilGuild.types'
import type { OavfMember } from '@/features/oavf/types/oavfMember.types'
import type { OavfRegistration } from '@/features/oavf/types/oavf.types'
import type { IccgMember } from '@/features/iccgRegistration/types/iccgMember.types'
import type { HonoraryMember } from '@/features/honoraryMember/types/honoraryMember.types'
import type { HonoraryMemberRegistration } from '@/features/honoraryMember/types/honoraryMemberRegistration.types'
import type { AssociateMember } from '@/features/associateMember/types/associateMember.types'
import type { AssociateMemberRegistration } from '@/features/associateMember/types/associateMemberRegistration.types'
import type { CashReceipt } from '../types/cashReceipts.types'

/**
 * Category strings these 9 modules used to post to an auto-created Journal Voucher's credit
 * line before this file existed (see each module's now-deleted lib/*Voucher.ts) — a voucher
 * still carrying one of these on its credit line is stale/pre-migration data (see Vouchers page
 * history), and must be excluded from `getReceiptRowsFromVouchers`'s contribution to Cash
 * Receipts so it isn't double-counted against the direct-read rows this file now produces from
 * the same underlying registration/payment records.
 */
export const RESERVED_AUTO_CATEGORIES = [
  'Troop Fees',
  'Thinking Day Fund',
  'BC Group Fee',
  'DC Group Fee',
  'TG Group Fee',
  'OAVF/Career Woman Membership Fee',
  'ICCG Registration Fee',
  'Honorary Member Fee',
  'Associate Member Fee'
]

export interface RegistrationCashReceiptSources {
  troopRegistrations: TroopRegistration[]
  troops: Troop[]
  scoutMembers: ScoutMember[]
  barangayCommittees: BarangayCommittee[]
  districtCommittees: DistrictCommittee[]
  trefoilGuilds: TrefoilGuild[]
  oavfRegistrations: OavfRegistration[]
  oavfMembers: OavfMember[]
  iccgMembers: IccgMember[]
  honoraryMemberRegistrations: HonoraryMemberRegistration[]
  honoraryMembers: HonoraryMember[]
  associateMemberRegistrations: AssociateMemberRegistration[]
  associateMembers: AssociateMember[]
}

// A filed Troop Registration's own council-retained share of the GSP Membership Fee — credited
// only once its second, internal "Council Share Receipt" has been printed from the Payments tab
// (see PrintCouncilShareReceiptModal/findReceiptedCouncilShare), NOT as soon as the Payment
// tab's "Record Bulk Payment" flow collects a 'membership' payment toward this filing — that
// member-facing AR/SI only covers the gross amount collected, not the Council's own cut, and in
// real life the Council's share gets receipted a second time before it's recognized as Council
// income. Only for the share of what's actually been receipted so far, never the filing's full
// typed total and never straight from the registration form's own save. Categorized as
// 'Membership' — matching the label used everywhere else this money is shown (the Payment tab's
// own "Membership" checkbox, Council Budget's "Membership" Source category) — even though it
// still funds the Council Budget's "1. Council Support Fund" income line (startingBudget.ts);
// that's the line's real accounting name, distinct from "2. Troop, BC/DC Fees" (the troop's own
// flat annual fee, a completely different source of money). The flat Troop Fee and Thinking Day
// Fee used to be credited here too, but those are already correctly covered by
// fromTroopFlatFeePayments below (populated by the same Payment tab, same 'Troop Fees'/
// 'Thinking Day Fund' categories) — crediting them here too was a duplicate, not a distinct
// source of money.
function fromTroopRegistrations(
  registrations: TroopRegistration[],
  troops: Troop[],
  scoutMembers: ScoutMember[]
): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const reg of registrations) {
    const payment = findReceiptedCouncilShare(reg, registrations, scoutMembers)
    if (!payment || payment.amount <= 0) continue
    const troop = troops.find((t) => t.id === reg.troopId)
    const label = troop?.troopNumber ?? reg.troopId
    rows.push({
      id: `${reg.id}-troop-fees`,
      date: payment.date,
      payor: troop?.leaderName || reg.submittedByName,
      particulars: `Council Action Remittance — Troop ${label} (${reg.schoolYear})`,
      referenceNumber: payment.receipt?.receiptNumber,
      category: 'Membership',
      bankAccount: 'Cash on Hand',
      amount: payment.amount,
      receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
    })
  }
  return rows
}

const TROOP_FLAT_FEE_CATEGORY: Record<TroopFlatFeeCategory, string> = {
  troop_fee: 'Troop Fees',
  thinking_day: 'Thinking Day Fund'
}

// Troop-level bulk flat-fee payments (Payment tab) — mirrors the now-deleted
// troops/lib/flatFeeVoucher.ts's buildAccountLines, one row per FlatFeePayment record (that's
// also what the old voucher produced: one credit line per record, and getReceiptRowsFromVouchers
// turned each credit line into its own CashReceipt row).
function fromTroopFlatFeePayments(troops: Troop[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const troop of troops) {
    for (const payment of troop.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `${payment.id}-flat`,
        date: payment.date,
        payor: payment.paidByName || troop.leaderName,
        particulars: `Troop Payment — ${troop.troopNumber}`,
        referenceNumber: payment.receipt?.receiptNumber,
        category: TROOP_FLAT_FEE_CATEGORY[payment.category],
        bankAccount: 'Cash on Hand',
        amount: payment.amount,
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      })
    }
  }
  return rows
}

const TROOP_MEMBER_FEE_CATEGORY: Record<'training' | 'camping', string> = {
  training: 'Training Fees',
  camping: 'Camping Fees'
}

// Training/Camping Fees are pure Council income with no National HQ pass-through split (unlike
// the GSP Membership Fee's council-share above, which needs its own second Council Share
// Receipt before being recognized) — collected via the same Payment tab ScoutMember.payments
// ledger, credited here at face value as soon as recorded, same as fromTroopFlatFeePayments'
// Troop Fee/Thinking Day Fund just above. Exists so these two categories are available to
// Council Budget's Source rules the same way every other module's fee already is (see
// CASH_RECEIPT_CATEGORIES) — previously the only way to link them was the now-removed
// 'troopPayment' Source type reading straight from ScoutMember.payments; this is the one shared
// path every fee category goes through now. 'membership' category payments are deliberately
// excluded — their Council-retained share is handled entirely by fromTroopRegistrations above;
// crediting the full gross amount here too would double-count against that.
function fromTroopMemberFeePayments(scoutMembers: ScoutMember[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const member of scoutMembers) {
    for (const payment of member.payments ?? []) {
      if (payment.category === 'membership' || payment.amount <= 0) continue
      rows.push({
        id: `${payment.id}-member-fee`,
        date: payment.date,
        payor: payment.paidByName || member.fullName,
        particulars: `${TROOP_MEMBER_FEE_CATEGORY[payment.category]} — ${member.fullName}`,
        referenceNumber: payment.receipt?.receiptNumber,
        category: TROOP_MEMBER_FEE_CATEGORY[payment.category],
        bankAccount: 'Cash on Hand',
        amount: payment.amount,
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      })
    }
  }
  return rows
}

// Barangay/District Committee/Trefoil Guild all share the exact same "flat Group Fee, both a
// one-shot Registration field and a separate Payment-tab bulk flow" shape — three near-identical
// functions below (one per module) rather than one generic, since the entity id field name
// differs per module (barangayCommitteeId/districtCommitteeId/trefoilGuildId) and a shared
// generic would need more indirection than the duplication it'd save.

function fromBarangayCommitteeFlatFeePayments(committees: BarangayCommittee[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const committee of committees) {
    for (const payment of committee.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `${payment.id}-flat`,
        date: payment.date,
        payor: payment.paidByName || committee.name,
        particulars: `Barangay Committee Payment — ${committee.name}`,
        referenceNumber: payment.receipt?.receiptNumber,
        category: 'BC Group Fee',
        bankAccount: 'Cash on Hand',
        amount: payment.amount,
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      })
    }
  }
  return rows
}

function fromDistrictCommitteeFlatFeePayments(committees: DistrictCommittee[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const committee of committees) {
    for (const payment of committee.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `${payment.id}-flat`,
        date: payment.date,
        payor: payment.paidByName || committee.name,
        particulars: `District Committee Payment — ${committee.name}`,
        referenceNumber: payment.receipt?.receiptNumber,
        category: 'DC Group Fee',
        bankAccount: 'Cash on Hand',
        amount: payment.amount,
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      })
    }
  }
  return rows
}

function fromTrefoilGuildFlatFeePayments(guilds: TrefoilGuild[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const guild of guilds) {
    for (const payment of guild.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `${payment.id}-flat`,
        date: payment.date,
        payor: payment.paidByName || guild.name,
        particulars: `Trefoil Guild Payment — ${guild.name}`,
        referenceNumber: payment.receipt?.receiptNumber,
        category: 'TG Group Fee',
        bankAccount: 'Cash on Hand',
        amount: payment.amount,
        receiptType: payment.receipt ? RECEIPT_KIND_LABELS[payment.receipt.receiptType] : undefined
      })
    }
  }
  return rows
}

// ICCG's Council-retained fee share is entirely covered by its persistent per-member
// Payment-tab ledger below (IccgMember.payments, written by the same "Record Bulk Payment"
// flow every other module uses) — unlike Troops, there's no separate slice of money here that
// ledger doesn't already account for, so (mirroring Barangay/District Committee/Trefoil Guild)
// there's no fromIccgRegistrations: crediting the registration's own `fee` box directly would
// just be a duplicate of what this function already credits once actually paid. As with Troops/
// OAVF/Honorary Member/Associate Member, the council-retained portion is only recognized once
// its own second, internal Council Share Receipt has been printed (see
// PrintCouncilShareReceiptModal/setCouncilShareReceipt) — the member-facing AR/SI stamped on
// `receipt` already covers the full amount collected.
function fromIccgMemberPayments(members: IccgMember[]): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const member of members) {
    for (const payment of member.payments ?? []) {
      if (payment.councilShareAmount <= 0 || !payment.councilShareReceipt) continue
      rows.push({
        id: `${payment.id}-iccg`,
        date: payment.councilShareReceipt.date,
        payor: payment.paidByName || '',
        particulars: 'ICCG Registration Fee (Council share)',
        referenceNumber: payment.councilShareReceipt.receiptNumber,
        category: 'ICCG Registration Fee',
        bankAccount: 'Cash on Hand',
        amount: payment.councilShareAmount,
        receiptType: RECEIPT_KIND_LABELS[payment.councilShareReceipt.receiptType]
      })
    }
  }
  return rows
}

// OAVF, Honorary Member and Associate Member each post their Council-retained share only once
// its own second, internal Council Share Receipt has been printed from the Payments tab (see
// PrintCouncilShareReceiptModal) — same "the applicant-facing AR/SI already covers the gross
// amount, Council's own cut still needs its own receipt before it's recognized as Council
// income" reasoning as Troops (registrationPaymentStatus.ts's findReceiptedCouncilShare). Unlike
// Troops, there's no separate per-member ledger to gate — the whole fee is one single-applicant
// "Record Payment" event, so the gate lives directly on councilShareReceipt here.

function fromOavfRegistrations(
  registrations: OavfRegistration[],
  members: OavfMember[]
): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const reg of registrations) {
    const amount = reg.membershipFeeCouncilShare ?? 0
    if (amount <= 0 || !reg.councilShareReceipt) continue
    const member = members.find((m) => m.id === reg.oavfMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.oavfMemberId
    rows.push({
      id: `${reg.id}-oavf-fee`,
      date: reg.councilShareReceipt.date,
      payor: name,
      particulars: `OAVF/Career Woman Registration — ${name} (${reg.schoolYear})`,
      referenceNumber: reg.councilShareReceipt.receiptNumber,
      category: 'OAVF/Career Woman Membership Fee',
      bankAccount: 'Cash on Hand',
      amount,
      receiptType: RECEIPT_KIND_LABELS[reg.councilShareReceipt.receiptType]
    })
  }
  return rows
}

function fromHonoraryMemberRegistrations(
  registrations: HonoraryMemberRegistration[],
  members: HonoraryMember[]
): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const reg of registrations) {
    const amount = reg.membershipFeeCouncilShare ?? 0
    if (amount <= 0 || !reg.councilShareReceipt) continue
    const member = members.find((m) => m.id === reg.honoraryMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.honoraryMemberId
    rows.push({
      id: `${reg.id}-honorary-fee`,
      date: reg.councilShareReceipt.date,
      payor: name,
      particulars: `Honorary Member Registration — ${name} (${reg.schoolYear})`,
      referenceNumber: reg.councilShareReceipt.receiptNumber,
      category: 'Honorary Member Fee',
      bankAccount: 'Cash on Hand',
      amount,
      receiptType: RECEIPT_KIND_LABELS[reg.councilShareReceipt.receiptType]
    })
  }
  return rows
}

function fromAssociateMemberRegistrations(
  registrations: AssociateMemberRegistration[],
  members: AssociateMember[]
): CashReceipt[] {
  const rows: CashReceipt[] = []
  for (const reg of registrations) {
    const amount = reg.membershipFeeCouncilShare ?? 0
    if (amount <= 0 || !reg.councilShareReceipt) continue
    const member = members.find((m) => m.id === reg.associateMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.associateMemberId
    rows.push({
      id: `${reg.id}-associate-fee`,
      date: reg.councilShareReceipt.date,
      payor: name,
      particulars: `Associate Member Registration — ${name} (${reg.schoolYear})`,
      referenceNumber: reg.councilShareReceipt.receiptNumber,
      category: 'Associate Member Fee',
      bankAccount: 'Cash on Hand',
      amount,
      receiptType: RECEIPT_KIND_LABELS[reg.councilShareReceipt.receiptType]
    })
  }
  return rows
}

/** Every Cash Receipt row sourced directly from a registration/payment record instead of from
 *  an approved Journal Voucher — see RESERVED_AUTO_CATEGORIES above for why vouchers no longer
 *  carry these categories. Consumed by both SCRD's Cash Receipts Journal
 *  (features/scrd/hooks/useScrdComputations.ts) and Council Budget's income auto-actuals
 *  (features/budget/hooks/useBudget.ts), so both always agree on these totals. */
export function buildRegistrationCashReceipts(
  sources: RegistrationCashReceiptSources
): CashReceipt[] {
  return [
    ...fromTroopRegistrations(sources.troopRegistrations, sources.troops, sources.scoutMembers),
    ...fromTroopFlatFeePayments(sources.troops),
    ...fromTroopMemberFeePayments(sources.scoutMembers),
    ...fromBarangayCommitteeFlatFeePayments(sources.barangayCommittees),
    ...fromDistrictCommitteeFlatFeePayments(sources.districtCommittees),
    ...fromTrefoilGuildFlatFeePayments(sources.trefoilGuilds),
    ...fromIccgMemberPayments(sources.iccgMembers),
    ...fromOavfRegistrations(sources.oavfRegistrations, sources.oavfMembers),
    ...fromHonoraryMemberRegistrations(
      sources.honoraryMemberRegistrations,
      sources.honoraryMembers
    ),
    ...fromAssociateMemberRegistrations(
      sources.associateMemberRegistrations,
      sources.associateMembers
    )
  ]
}
