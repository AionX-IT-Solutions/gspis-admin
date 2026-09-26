import { toInputDate } from '@/shared/lib/utils'
import type { Troop, ScoutMember } from '@/features/troops/types/troop.types'
import type { TroopRegistration } from '@/features/troopRegistration/types/troopRegistration.types'
import type {
  DistrictCommittee,
  DistrictCommitteeMember
} from '@/features/districtCommittee/types/districtCommittee.types'
import type {
  BarangayCommittee,
  BarangayCommitteeMember
} from '@/features/barangayCommittee/types/barangayCommittee.types'
import type {
  TrefoilGuild,
  TrefoilGuildMember
} from '@/features/trefoilGuild/types/trefoilGuild.types'
import type { IccgMember } from '@/features/iccgRegistration/types/iccgMember.types'
import type { OavfRegistration } from '@/features/oavf/types/oavf.types'
import type { OavfMember } from '@/features/oavf/types/oavfMember.types'
import type { HonoraryMemberRegistration } from '@/features/honoraryMember/types/honoraryMemberRegistration.types'
import type { HonoraryMember } from '@/features/honoraryMember/types/honoraryMember.types'
import type { AssociateMemberRegistration } from '@/features/associateMember/types/associateMemberRegistration.types'
import type { AssociateMember } from '@/features/associateMember/types/associateMember.types'
import type { MembershipCollectionRow, PersonTag } from '../types/membershipDailyCollection.types'

/**
 * Builds the Troops & Membership "Daily Cash Collection Report"'s auto-generated rows —
 * mirrors features/scrd/lib/registrationCashReceipts.ts's "walk every registration module,
 * emit one row per collection event" structure, but deliberately diverges from it on two
 * points the accounting report and this one disagree on:
 *
 * 1. Amount is always the ORIGINAL/gross fee actually collected from the payor, never the
 *    council-retained share (registrationCashReceipts.ts's `*CouncilShare` figures) — this
 *    report exists precisely to show the full amount field staff collected, independent of
 *    how much of it the Council keeps versus forwards to National HQ.
 * 2. A row is dated by when the cash was actually receipted to the payor (a payment's own
 *    `date`, or the first member-facing receipt's `date` for the single-applicant modules),
 *    never gated behind a second, internal "Council Share Receipt" the way
 *    `findReceiptedCouncilShare`/`fromOavfRegistrations` etc. gate accounting recognition.
 */
export interface MembershipCollectionSources {
  troops: Troop[]
  scoutMembers: ScoutMember[]
  troopRegistrations: TroopRegistration[]
  districtCommittees: DistrictCommittee[]
  districtCommitteeMembers: DistrictCommitteeMember[]
  barangayCommittees: BarangayCommittee[]
  barangayCommitteeMembers: BarangayCommitteeMember[]
  trefoilGuilds: TrefoilGuild[]
  trefoilGuildMembers: TrefoilGuildMember[]
  iccgMembers: IccgMember[]
  oavfRegistrations: OavfRegistration[]
  oavfMembers: OavfMember[]
  honoraryMemberRegistrations: HonoraryMemberRegistration[]
  honoraryMembers: HonoraryMember[]
  associateMemberRegistrations: AssociateMemberRegistration[]
  associateMembers: AssociateMember[]
}

// Same taxonomy/order as features/troops/types/troop.types.ts's TROOP_LEVELS.
const LEVEL_TO_GIRL_TAG: Record<string, PersonTag> = {
  Twinkler: 'TW',
  Star: 'ST',
  Junior: 'JR',
  Senior: 'SR',
  Cadet: 'CDT'
}

function addCount(counts: Partial<Record<PersonTag, number>>, tag: PersonTag, n = 1): void {
  counts[tag] = (counts[tag] ?? 0) + n
}

// ───────────────────────── Troops ─────────────────────────

// One row per bulk-payment remittance (falling back to the payment's own id when it predates
// bulkPaymentId) — grouped across every covered member so a single Troop Leader hand-over on
// one date becomes one row, ticking every age level actually covered (a bulk payment can span
// more than one level at once).
function fromTroopMembershipPayments(
  scoutMembers: ScoutMember[],
  troops: Troop[]
): MembershipCollectionRow[] {
  interface Group {
    date: string
    amount: number
    paidByName?: string
    troopId: string
    counts: Partial<Record<PersonTag, number>>
    receiptNumber?: string
  }
  const groups = new Map<string, Group>()
  for (const m of scoutMembers) {
    for (const payment of m.payments ?? []) {
      if (payment.category !== 'membership' || payment.amount <= 0) continue
      const key = payment.bulkPaymentId ?? `single-${payment.id}`
      let g = groups.get(key)
      if (!g) {
        g = {
          date: payment.date,
          amount: 0,
          paidByName: payment.paidByName,
          troopId: m.troopId,
          counts: {},
          receiptNumber: payment.receipt?.receiptNumber
        }
        groups.set(key, g)
      }
      g.amount += payment.amount
      const tag = m.level ? LEVEL_TO_GIRL_TAG[m.level] : undefined
      if (tag) addCount(g.counts, tag)
    }
  }
  const rows: MembershipCollectionRow[] = []
  for (const [key, g] of groups) {
    const troop = troops.find((t) => t.id === g.troopId)
    rows.push({
      id: `troop-membership-${key}`,
      date: g.date,
      payor: g.paidByName || troop?.leaderName || '',
      troopNo: troop?.troopNumber,
      district: troop?.district,
      amount: g.amount,
      personCounts: g.counts,
      referenceNumber: g.receiptNumber
    })
  }
  return rows
}

// Troop Fee/Thinking Day Fee — flat per-troop, no age-level breakdown (not a "person
// registering" at all), same amount-only treatment Accounting's own report gives these.
function fromTroopFlatFeePayments(troops: Troop[]): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const troop of troops) {
    for (const payment of troop.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `troop-flat-${payment.id}`,
        date: payment.date,
        payor: payment.paidByName || troop.leaderName,
        troopNo: troop.troopNumber,
        district: troop.district,
        amount: payment.amount,
        referenceNumber: payment.receipt?.receiptNumber
      })
    }
  }
  return rows
}

// The Leader/Co-Leader fee lines are typed once at filing time (RegistrationRemittance), not
// collected through an ongoing per-member ledger the way girl members' fees are above — there's
// no "payment date" to key off, so this uses the filing's own R.O.R. date (falling back to the
// date filed) as the closest thing to when that cash was turned over.
function fromTroopLeaderFees(
  registrations: TroopRegistration[],
  troops: Troop[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const reg of registrations) {
    const r = reg.remittance
    const amount =
      r.membershipFeeLeaderReReg +
      r.membershipFeeLeaderNew +
      r.membershipFeeCoLeaderReReg +
      r.membershipFeeCoLeaderNew
    if (amount <= 0) continue
    const troop = troops.find((t) => t.id === reg.troopId)
    const counts: Partial<Record<PersonTag, number>> = {}
    for (const leader of reg.leaders) {
      addCount(counts, leader.position.toLowerCase().includes('co-leader') ? 'CL' : 'TL')
    }
    rows.push({
      id: `troop-leader-fee-${reg.id}`,
      date: reg.rorDate || reg.dateApplied,
      payor: reg.submittedByName || troop?.leaderName || '',
      troopNo: troop?.troopNumber,
      district: troop?.district,
      rorNo: reg.rorNo,
      rorDate: reg.rorDate,
      amount,
      personCounts: counts
    })
  }
  return rows
}

// ────────────── District / Barangay / Trefoil Committee ──────────────
// All three share the exact same shape (a per-member fee that's a pure pass-through, plus a
// flat, fully council-retained Group Fee) — three near-identical function pairs rather than one
// generic helper, mirroring registrationCashReceipts.ts's own reasoning for staying duplicated
// (the entity id field name differs per module).

function fromDistrictCommitteeMemberPayments(
  members: DistrictCommitteeMember[],
  committees: DistrictCommittee[]
): MembershipCollectionRow[] {
  interface Group {
    date: string
    amount: number
    paidByName?: string
    committeeId: string
    count: number
    receiptNumber?: string
  }
  const groups = new Map<string, Group>()
  for (const m of members) {
    for (const payment of m.payments ?? []) {
      if (payment.amount <= 0) continue
      const key = payment.bulkPaymentId ?? `single-${payment.id}`
      let g = groups.get(key)
      if (!g) {
        g = {
          date: payment.date,
          amount: 0,
          paidByName: payment.paidByName,
          committeeId: m.districtCommitteeId,
          count: 0,
          receiptNumber: payment.receipt?.receiptNumber
        }
        groups.set(key, g)
      }
      g.amount += payment.amount
      g.count += 1
    }
  }
  const rows: MembershipCollectionRow[] = []
  for (const [key, g] of groups) {
    const committee = committees.find((c) => c.id === g.committeeId)
    rows.push({
      id: `dc-member-${key}`,
      date: g.date,
      payor: g.paidByName || committee?.name || '',
      district: committee?.district,
      amount: g.amount,
      personCounts: { DC: g.count },
      referenceNumber: g.receiptNumber
    })
  }
  return rows
}

function fromDistrictCommitteeFlatFeePayments(
  committees: DistrictCommittee[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const committee of committees) {
    for (const payment of committee.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `dc-flat-${payment.id}`,
        date: payment.date,
        payor: payment.paidByName || committee.name,
        district: committee.district,
        amount: payment.amount,
        referenceNumber: payment.receipt?.receiptNumber
      })
    }
  }
  return rows
}

function fromBarangayCommitteeMemberPayments(
  members: BarangayCommitteeMember[],
  committees: BarangayCommittee[]
): MembershipCollectionRow[] {
  interface Group {
    date: string
    amount: number
    paidByName?: string
    committeeId: string
    count: number
    receiptNumber?: string
  }
  const groups = new Map<string, Group>()
  for (const m of members) {
    for (const payment of m.payments ?? []) {
      if (payment.amount <= 0) continue
      const key = payment.bulkPaymentId ?? `single-${payment.id}`
      let g = groups.get(key)
      if (!g) {
        g = {
          date: payment.date,
          amount: 0,
          paidByName: payment.paidByName,
          committeeId: m.barangayCommitteeId,
          count: 0,
          receiptNumber: payment.receipt?.receiptNumber
        }
        groups.set(key, g)
      }
      g.amount += payment.amount
      g.count += 1
    }
  }
  const rows: MembershipCollectionRow[] = []
  for (const [key, g] of groups) {
    const committee = committees.find((c) => c.id === g.committeeId)
    rows.push({
      id: `bc-member-${key}`,
      date: g.date,
      payor: g.paidByName || committee?.name || '',
      district: committee?.district,
      amount: g.amount,
      personCounts: { BC: g.count },
      referenceNumber: g.receiptNumber
    })
  }
  return rows
}

function fromBarangayCommitteeFlatFeePayments(
  committees: BarangayCommittee[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const committee of committees) {
    for (const payment of committee.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `bc-flat-${payment.id}`,
        date: payment.date,
        payor: payment.paidByName || committee.name,
        district: committee.district,
        amount: payment.amount,
        referenceNumber: payment.receipt?.receiptNumber
      })
    }
  }
  return rows
}

function fromTrefoilGuildMemberPayments(
  members: TrefoilGuildMember[],
  guilds: TrefoilGuild[]
): MembershipCollectionRow[] {
  interface Group {
    date: string
    amount: number
    paidByName?: string
    guildId: string
    count: number
    receiptNumber?: string
  }
  const groups = new Map<string, Group>()
  for (const m of members) {
    for (const payment of m.payments ?? []) {
      if (payment.amount <= 0) continue
      const key = payment.bulkPaymentId ?? `single-${payment.id}`
      let g = groups.get(key)
      if (!g) {
        g = {
          date: payment.date,
          amount: 0,
          paidByName: payment.paidByName,
          guildId: m.trefoilGuildId,
          count: 0,
          receiptNumber: payment.receipt?.receiptNumber
        }
        groups.set(key, g)
      }
      g.amount += payment.amount
      g.count += 1
    }
  }
  const rows: MembershipCollectionRow[] = []
  for (const [key, g] of groups) {
    const guild = guilds.find((gld) => gld.id === g.guildId)
    rows.push({
      id: `tg-member-${key}`,
      date: g.date,
      payor: g.paidByName || guild?.name || '',
      district: guild?.district,
      amount: g.amount,
      personCounts: { TG: g.count },
      referenceNumber: g.receiptNumber
    })
  }
  return rows
}

function fromTrefoilGuildFlatFeePayments(guilds: TrefoilGuild[]): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const guild of guilds) {
    for (const payment of guild.flatFeePayments ?? []) {
      if (payment.amount <= 0) continue
      rows.push({
        id: `tg-flat-${payment.id}`,
        date: payment.date,
        payor: payment.paidByName || guild.name,
        district: guild.district,
        amount: payment.amount,
        referenceNumber: payment.receipt?.receiptNumber
      })
    }
  }
  return rows
}

// ───────────────────────── ICCG ─────────────────────────
// No dedicated column on this paper form for ICCG (unlike Accounting's own report) — amount
// only, same "doesn't fit a fixed column" treatment as the flat fees above.
function fromIccgMemberPayments(members: IccgMember[], troops: Troop[]): MembershipCollectionRow[] {
  interface Group {
    date: string
    amount: number
    paidByName?: string
    troopId: string
  }
  const groups = new Map<string, Group>()
  for (const m of members) {
    for (const payment of m.payments ?? []) {
      if (payment.amount <= 0) continue
      const key = payment.bulkPaymentId ?? `single-${payment.id}`
      let g = groups.get(key)
      if (!g) {
        g = { date: payment.date, amount: 0, paidByName: payment.paidByName, troopId: m.troopId }
        groups.set(key, g)
      }
      g.amount += payment.amount
    }
  }
  const rows: MembershipCollectionRow[] = []
  for (const [key, g] of groups) {
    const troop = troops.find((t) => t.id === g.troopId)
    rows.push({
      id: `iccg-${key}`,
      date: g.date,
      payor: g.paidByName || troop?.leaderName || '',
      troopNo: troop?.troopNumber,
      district: troop?.district,
      amount: g.amount
    })
  }
  return rows
}

// ────────── OAVF / Honorary Member / Associate Member ──────────
// Single-applicant registrations, no dedicated headcount column on this paper form (amount
// only). Gated on the applicant-facing receipt (Record Payment's own AR/SI) rather than the
// second, internal Council Share Receipt accounting waits for — see this file's header comment.

function fromOavfRegistrations(
  registrations: OavfRegistration[],
  members: OavfMember[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const reg of registrations) {
    if (reg.membershipFeeTotal <= 0 || !reg.receipt) continue
    const member = members.find((m) => m.id === reg.oavfMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.oavfMemberId
    rows.push({
      id: `oavf-${reg.id}`,
      date: toInputDate(reg.receipt.date),
      payor: name,
      district: member?.district,
      rorNo: reg.arNumber || reg.receipt.receiptNumber,
      amount: reg.membershipFeeTotal
    })
  }
  return rows
}

function fromHonoraryMemberRegistrations(
  registrations: HonoraryMemberRegistration[],
  members: HonoraryMember[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const reg of registrations) {
    if (reg.membershipFeeTotal <= 0 || !reg.receipt) continue
    const member = members.find((m) => m.id === reg.honoraryMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.honoraryMemberId
    rows.push({
      id: `honorary-${reg.id}`,
      date: toInputDate(reg.receipt.date),
      payor: name,
      district: member?.district,
      rorNo: reg.arNumber || reg.receipt.receiptNumber,
      amount: reg.membershipFeeTotal
    })
  }
  return rows
}

function fromAssociateMemberRegistrations(
  registrations: AssociateMemberRegistration[],
  members: AssociateMember[]
): MembershipCollectionRow[] {
  const rows: MembershipCollectionRow[] = []
  for (const reg of registrations) {
    if (reg.membershipFeeTotal <= 0 || !reg.receipt) continue
    const member = members.find((m) => m.id === reg.associateMemberId)
    const name = member ? `${member.firstName} ${member.lastName}`.trim() : reg.associateMemberId
    rows.push({
      id: `associate-${reg.id}`,
      date: toInputDate(reg.receipt.date),
      payor: name,
      district: member?.district,
      regFormNo: reg.amfNumber,
      rorNo: reg.arNumber || reg.receipt.receiptNumber,
      amount: reg.membershipFeeTotal
    })
  }
  return rows
}

function mergeCounts(
  a: Partial<Record<PersonTag, number>> | undefined,
  b: Partial<Record<PersonTag, number>> | undefined
): Partial<Record<PersonTag, number>> | undefined {
  if (!a && !b) return undefined
  const merged: Partial<Record<PersonTag, number>> = { ...a }
  for (const [tag, count] of Object.entries(b ?? {}) as [PersonTag, number][]) {
    merged[tag] = (merged[tag] ?? 0) + count
  }
  return merged
}

/**
 * "Isang resibo, isang entry" (one receipt, one line) — rows sharing the same non-empty
 * `referenceNumber` are the same physical remittance handed over together (e.g. a Troop
 * Leader paying Membership Fee and Troop Fee in one bulk payment, or a District Committee
 * paying its per-member fee and D.C. Group Fee together) and collapse into one row, summing
 * amounts and person counts. Same rule SCRD's own Cash Receipts Journal applies for display
 * (see JournalTab.tsx's groupedRows) — mirrored here since, unlike that Journal, this report
 * has no other consumer that needs the per-category rows kept separate.
 */
function mergeRowsByReference(rows: MembershipCollectionRow[]): MembershipCollectionRow[] {
  const groups = new Map<string, MembershipCollectionRow>()
  for (const r of rows) {
    const key = r.referenceNumber || r.id
    const existing = groups.get(key)
    if (existing) {
      existing.amount += r.amount
      existing.personCounts = mergeCounts(existing.personCounts, r.personCounts)
      existing.troopNo ??= r.troopNo
      existing.district ??= r.district
      existing.regFormNo ??= r.regFormNo
      existing.rorNo ??= r.rorNo
      existing.rorDate ??= r.rorDate
    } else {
      groups.set(key, { ...r, id: r.referenceNumber ? `ref-${r.referenceNumber}` : r.id })
    }
  }
  return [...groups.values()]
}

export function buildMembershipCollectionRows(
  sources: MembershipCollectionSources
): MembershipCollectionRow[] {
  return mergeRowsByReference([
    ...fromTroopMembershipPayments(sources.scoutMembers, sources.troops),
    ...fromTroopFlatFeePayments(sources.troops),
    ...fromTroopLeaderFees(sources.troopRegistrations, sources.troops),
    ...fromDistrictCommitteeMemberPayments(
      sources.districtCommitteeMembers,
      sources.districtCommittees
    ),
    ...fromDistrictCommitteeFlatFeePayments(sources.districtCommittees),
    ...fromBarangayCommitteeMemberPayments(
      sources.barangayCommitteeMembers,
      sources.barangayCommittees
    ),
    ...fromBarangayCommitteeFlatFeePayments(sources.barangayCommittees),
    ...fromTrefoilGuildMemberPayments(sources.trefoilGuildMembers, sources.trefoilGuilds),
    ...fromTrefoilGuildFlatFeePayments(sources.trefoilGuilds),
    ...fromIccgMemberPayments(sources.iccgMembers, sources.troops),
    ...fromOavfRegistrations(sources.oavfRegistrations, sources.oavfMembers),
    ...fromHonoraryMemberRegistrations(
      sources.honoraryMemberRegistrations,
      sources.honoraryMembers
    ),
    ...fromAssociateMemberRegistrations(
      sources.associateMemberRegistrations,
      sources.associateMembers
    )
  ])
}
