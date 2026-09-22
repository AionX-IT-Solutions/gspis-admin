import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { nextFiscalYearLabel } from '@/shared/lib/fiscalYear'
import { ILOCOS_SUR_DISTRICTS } from '@/shared/data/districts.data'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useDistrictCommitteeStore } from '@/features/districtCommittee/store/districtCommittee.store'
import { useDistrictCommitteeRegistrationStore } from '@/features/districtCommittee/store/districtCommitteeRegistration.store'
import { useBarangayCommitteeStore } from '@/features/barangayCommittee/store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '@/features/barangayCommittee/store/barangayCommitteeRegistration.store'
import { useTrefoilGuildStore } from '@/features/trefoilGuild/store/trefoilGuild.store'
import { useTrefoilGuildRegistrationStore } from '@/features/trefoilGuild/store/trefoilGuildRegistration.store'
import { useOavfStore } from '@/features/oavf/store/oavf.store'
import { useOavfMemberStore } from '@/features/oavf/store/oavfMember.store'
import { useHonoraryMemberStore } from '@/features/honoraryMember/store/honoraryMember.store'
import { useHonoraryMemberRegistrationStore } from '@/features/honoraryMember/store/honoraryMemberRegistration.store'
import { useAssociateMemberStore } from '@/features/associateMember/store/associateMember.store'
import { useAssociateMemberRegistrationStore } from '@/features/associateMember/store/associateMemberRegistration.store'
import { useIccgRegistrationStore } from '@/features/iccgRegistration/store/iccgRegistration.store'
import {
  useMembershipGoalsStore,
  DEFAULT_MEMBERSHIP_GOALS,
  type MembershipGoals
} from '../store/membershipGoals.store'
import { REGISTRATION_AGE_LEVELS } from '@/features/troopRegistration/types/troopRegistration.types'

// Matches the Council's own "NO. OF TROOPS & UNITS" / "NO. OF GIRLS & ADULTS" column pairs —
// same 5 age-level keys used in both blocks, plus BC/DC/AM/HM/TG/CW/ICCG (units block) and
// TG/ICCG/BC/TL/DC/AM/HM/CW (people block), matching that photo's exact column order.
export interface DistrictUnitCounts {
  tw: number
  st: number
  jr: number
  sr: number
  cdt: number
  bc: number
  dc: number
  am: number
  hm: number
  tg: number
  cw: number
  iccg: number
}

export interface DistrictPeopleCounts {
  tw: number
  st: number
  jr: number
  sr: number
  cdt: number
  tg: number
  iccg: number
  bc: number
  tl: number
  dc: number
  am: number
  hm: number
  cw: number
}

export interface DistrictRow {
  district: string
  units: DistrictUnitCounts
  people: DistrictPeopleCounts
  totalGirls: number
  totalAdults: number
}

export interface GoalRow {
  key: keyof MembershipGoals
  label: string
  goal: number
  achieved: number
}

function emptyUnits(): DistrictUnitCounts {
  return { tw: 0, st: 0, jr: 0, sr: 0, cdt: 0, bc: 0, dc: 0, am: 0, hm: 0, tg: 0, cw: 0, iccg: 0 }
}
function emptyPeople(): DistrictPeopleCounts {
  return {
    tw: 0,
    st: 0,
    jr: 0,
    sr: 0,
    cdt: 0,
    tg: 0,
    iccg: 0,
    bc: 0,
    tl: 0,
    dc: 0,
    am: 0,
    hm: 0,
    cw: 0
  }
}

const AGE_LEVEL_KEY: Record<string, 'tw' | 'st' | 'jr' | 'sr' | 'cdt'> = {
  Twinkler: 'tw',
  Star: 'st',
  Junior: 'jr',
  Senior: 'sr',
  Cadet: 'cdt'
}

/**
 * Computes the Council's Membership Status Report exactly as laid out on its own paper form —
 * one row per district, split into "No. of Troops & Units" (organizational unit/registration
 * counts) and "No. of Girls & Adults" (people headcounts), plus a Grand Total row and a
 * Goal/Achieved/Balance summary underneath. Everything (except the ICCG column — see below) is
 * derived live from each module's own filed records for one membership year — nothing is
 * stored separately, so the report can never drift from the actual filings.
 *
 * Single-person modules (Associate Member, Honorary Member, OAVF/Career Woman) have no
 * roster — their "unit count" and "people headcount" are identical (one registration IS one
 * person), matching the paper form's own repeated figures for those columns. Group modules
 * (Troop, District/Barangay Committee, Trefoil Guild, ICCG) differ: the units block counts
 * registrations/troops, the people block counts their roster's actual headcount — for ICCG
 * that's girls.length + adults.length off each filed features/iccgRegistration record.
 *
 * A record with no `district` set yet (an older filing, or one not assigned during a quick
 * edit) doesn't appear in any specific district row, but IS still counted in the Grand Total
 * and Goal/Achieved figures below — so those totals stay accurate even before every record has
 * been assigned a district.
 */
export function useMembershipStatusReport() {
  const { t } = useTranslation()
  const toast = useToast()
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const troops = useTroopsStore((s) => s.troops)
  const troopRegistrations = useTroopRegistrationStore((s) => s.registrations)
  const dcCommittees = useDistrictCommitteeStore((s) => s.committees)
  const dcRegistrations = useDistrictCommitteeRegistrationStore((s) => s.registrations)
  const bcCommittees = useBarangayCommitteeStore((s) => s.committees)
  const bcRegistrations = useBarangayCommitteeRegistrationStore((s) => s.registrations)
  const tgGuilds = useTrefoilGuildStore((s) => s.guilds)
  const tgRegistrations = useTrefoilGuildRegistrationStore((s) => s.registrations)
  const oavfMembers = useOavfMemberStore((s) => s.members)
  const oavfRegistrations = useOavfStore((s) => s.registrations)
  const honoraryMembers = useHonoraryMemberStore((s) => s.members)
  const honoraryRegistrations = useHonoraryMemberRegistrationStore((s) => s.registrations)
  const associateMembers = useAssociateMemberStore((s) => s.members)
  const associateRegistrations = useAssociateMemberRegistrationStore((s) => s.registrations)
  const iccgRegistrations = useIccgRegistrationStore((s) => s.registrations)
  const goalsByYear = useMembershipGoalsStore((s) => s.goalsByYear)
  const setGoals = useMembershipGoalsStore((s) => s.setGoals)

  const currentYearLabel = getMembershipYearLabel(startMonth)

  const availableYears = useMemo(() => {
    const years = new Set<string>([currentYearLabel])
    for (const r of troopRegistrations) years.add(r.schoolYear)
    for (const r of dcRegistrations) years.add(r.schoolYear)
    for (const r of bcRegistrations) years.add(r.schoolYear)
    for (const r of tgRegistrations) years.add(r.schoolYear)
    for (const r of oavfRegistrations) years.add(r.schoolYear)
    for (const r of honoraryRegistrations) years.add(r.schoolYear)
    for (const r of associateRegistrations) years.add(r.schoolYear)
    for (const r of iccgRegistrations) years.add(r.schoolYear)
    // A year created via "New Membership Year" has no registrations of its own yet — it only
    // exists as a saved Goals doc (see handleCreateMembershipYear below) — so it still needs
    // to be counted here or it would vanish from the dropdown the moment it's created.
    for (const y of Object.keys(goalsByYear)) years.add(y)
    return Array.from(years).sort().reverse()
  }, [
    currentYearLabel,
    troopRegistrations,
    dcRegistrations,
    bcRegistrations,
    tgRegistrations,
    oavfRegistrations,
    honoraryRegistrations,
    associateRegistrations,
    iccgRegistrations,
    goalsByYear
  ])

  const oavfMemberById = useMemo(() => new Map(oavfMembers.map((m) => [m.id, m])), [oavfMembers])
  const honoraryMemberById = useMemo(
    () => new Map(honoraryMembers.map((m) => [m.id, m])),
    [honoraryMembers]
  )
  const associateMemberById = useMemo(
    () => new Map(associateMembers.map((m) => [m.id, m])),
    [associateMembers]
  )

  const [schoolYear, setSchoolYear] = useState(currentYearLabel)

  const { districtRows, grandTotal, goalRows } = useMemo(() => {
    const byDistrict = new Map<
      string,
      { units: DistrictUnitCounts; people: DistrictPeopleCounts }
    >()
    for (const d of ILOCOS_SUR_DISTRICTS)
      byDistrict.set(d, { units: emptyUnits(), people: emptyPeople() })
    const grand = { units: emptyUnits(), people: emptyPeople() }

    function bump(
      district: string | undefined,
      apply: (units: DistrictUnitCounts, people: DistrictPeopleCounts) => void
    ) {
      apply(grand.units, grand.people)
      if (!district) return
      const bucket = byDistrict.get(district)
      if (bucket) apply(bucket.units, bucket.people)
    }

    const dcById = new Map(dcCommittees.map((c) => [c.id, c]))
    const bcById = new Map(bcCommittees.map((c) => [c.id, c]))
    const tgById = new Map(tgGuilds.map((g) => [g.id, g]))
    const troopById = new Map(troops.map((t) => [t.id, t]))

    for (const reg of troopRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const levelKey = AGE_LEVEL_KEY[reg.ageLevel]
      const parentTroop = troopById.get(reg.troopId)
      bump(parentTroop?.district, (units, people) => {
        if (levelKey) {
          units[levelKey] += 1
          people[levelKey] += reg.members.length
        }
        people.tl += reg.leaders.length
      })
    }

    for (const reg of dcRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = dcById.get(reg.districtCommitteeId)
      bump(parent?.district, (units, people) => {
        units.dc += 1
        people.dc += reg.members.length
      })
    }

    for (const reg of bcRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = bcById.get(reg.barangayCommitteeId)
      bump(parent?.district, (units, people) => {
        units.bc += 1
        people.bc += reg.members.length
      })
    }

    for (const reg of tgRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = tgById.get(reg.trefoilGuildId)
      bump(parent?.district, (units, people) => {
        units.tg += 1
        people.tg += reg.members.length
      })
    }

    for (const reg of oavfRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = oavfMemberById.get(reg.oavfMemberId)
      bump(parent?.district, (units, people) => {
        units.cw += 1
        people.cw += 1
      })
    }

    for (const reg of honoraryRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = honoraryMemberById.get(reg.honoraryMemberId)
      bump(parent?.district, (units, people) => {
        units.hm += 1
        people.hm += 1
      })
    }

    for (const reg of associateRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parent = associateMemberById.get(reg.associateMemberId)
      bump(parent?.district, (units, people) => {
        units.am += 1
        people.am += 1
      })
    }

    for (const reg of iccgRegistrations) {
      if (reg.schoolYear !== schoolYear) continue
      const parentTroop = troopById.get(reg.troopId)
      bump(parentTroop?.district, (units, people) => {
        units.iccg += 1
        people.iccg += reg.girls.length + reg.adults.length
      })
    }

    function totalsFor(people: DistrictPeopleCounts) {
      const totalGirls = REGISTRATION_AGE_LEVELS.reduce(
        (sum, level) => sum + people[AGE_LEVEL_KEY[level]],
        0
      )
      const totalAdults =
        people.tg +
        people.iccg +
        people.bc +
        people.tl +
        people.dc +
        people.am +
        people.hm +
        people.cw
      return { totalGirls, totalAdults }
    }

    const rows: DistrictRow[] = ILOCOS_SUR_DISTRICTS.map((district) => {
      const bucket = byDistrict.get(district) ?? { units: emptyUnits(), people: emptyPeople() }
      return { district, ...bucket, ...totalsFor(bucket.people) }
    })

    const grandTotals = totalsFor(grand.people)
    const grandRow: DistrictRow = {
      district: 'TOTAL',
      units: grand.units,
      people: grand.people,
      ...grandTotals
    }

    const goals = goalsByYear[schoolYear] ?? undefined
    const g = goals ?? {
      membershipPotential: 0,
      barangayCommittee: 0,
      districtCommittee: 0,
      associateMember: 0,
      honoraryMember: 0,
      trefoilGuild: 0,
      careerWoman: 0,
      iccg: 0
    }
    const goalRowsComputed: GoalRow[] = [
      {
        key: 'membershipPotential',
        label: 'Membership potential registered',
        goal: g.membershipPotential,
        achieved: grandTotals.totalGirls + grandTotals.totalAdults
      },
      {
        key: 'barangayCommittee',
        label: 'Barangay Committee registered',
        goal: g.barangayCommittee,
        achieved: grand.units.bc
      },
      {
        key: 'districtCommittee',
        label: 'District Committee registered',
        goal: g.districtCommittee,
        achieved: grand.units.dc
      },
      {
        key: 'associateMember',
        label: 'Associate Member registered',
        goal: g.associateMember,
        achieved: grand.units.am
      },
      {
        key: 'honoraryMember',
        label: 'Honorary Member',
        goal: g.honoraryMember,
        achieved: grand.units.hm
      },
      {
        key: 'trefoilGuild',
        label: 'Trefoil Guild',
        goal: g.trefoilGuild,
        achieved: grand.units.tg
      },
      { key: 'careerWoman', label: 'Career Woman', goal: g.careerWoman, achieved: grand.units.cw },
      { key: 'iccg', label: 'ICCG', goal: g.iccg, achieved: grand.units.iccg }
    ]

    return { districtRows: [...rows, grandRow], grandTotal: grandRow, goalRows: goalRowsComputed }
  }, [
    schoolYear,
    troops,
    troopRegistrations,
    dcCommittees,
    dcRegistrations,
    bcCommittees,
    bcRegistrations,
    tgGuilds,
    tgRegistrations,
    oavfMemberById,
    oavfRegistrations,
    honoraryMemberById,
    honoraryRegistrations,
    associateMemberById,
    associateRegistrations,
    iccgRegistrations,
    goalsByYear
  ])

  function updateGoals(goals: MembershipGoals) {
    setGoals(schoolYear, goals)
  }

  const suggestedNextYear = nextFiscalYearLabel(availableYears[0] ?? currentYearLabel)

  // Like Budget's "New Fiscal Year": a membership year the admin can plan ahead for — e.g. to
  // set next year's Goals — before any registration has been filed under it yet. There's no
  // per-year "line items" to clone here (the report itself is entirely live-computed), so
  // "creating" a year is just seeding it a Goals doc (carried over from the current year, same
  // as Budget carries over its line-item structure) so it has something to show and stays in
  // availableYears afterward.
  function handleCreateMembershipYear(newYear: string) {
    const trimmed = newYear.trim()
    if (!trimmed) {
      toast.error(t('membershipStatusReport.toast.yearRequired'))
      return
    }
    if (availableYears.includes(trimmed)) {
      toast.error(t('membershipStatusReport.toast.yearExists'))
      return
    }
    setGoals(trimmed, goalsByYear[schoolYear] ?? DEFAULT_MEMBERSHIP_GOALS)
    setSchoolYear(trimmed)
    toast.success(t('membershipStatusReport.toast.yearCreated', { year: trimmed }))
  }

  return {
    schoolYear,
    setSchoolYear,
    availableYears,
    suggestedNextYear,
    handleCreateMembershipYear,
    districtRows,
    grandTotal,
    goalRows,
    currentGoals: goalsByYear[schoolYear],
    updateGoals
  }
}
