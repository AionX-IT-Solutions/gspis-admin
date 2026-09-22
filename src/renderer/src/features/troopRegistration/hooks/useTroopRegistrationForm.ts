import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { useTrainingProfilesStore } from '@/features/trainingProfiles/store/trainingProfiles.store'
import type { TrainingProfile } from '@/features/trainingProfiles/types/trainingProfiles.types'
import { todayLocalIso } from '@/shared/lib/utils'
import { useTroopRegistrationStore } from '../store/troopRegistration.store'
import { syncRemittanceVoucher } from '../lib/remittanceVoucher'
import {
  emptyRemittance,
  councilRetainedMembershipShare,
  type RegistrationAgeLevel,
  type RegistrationLeader,
  type RegistrationMember,
  type RegistrationRemittance,
  type TroopRegistration
} from '../types/troopRegistration.types'

export interface LeaderFormRow extends RegistrationLeader {
  rowId: string
}
export interface MemberFormRow extends RegistrationMember {
  rowId: string
}

// Best-effort guess only — the paper form's age-level checkboxes (Twinkler/Star/Junior/
// Senior/Cadet) are a different taxonomy than TROOP_LEVELS (Star/Junior/Cadet/Senior/
// Ambassador Scout) and don't map 1:1. Always independently editable afterward.
function guessAgeLevel(troopLevel: string): RegistrationAgeLevel {
  const l = troopLevel.toLowerCase()
  if (l.includes('star')) return 'Star'
  if (l.includes('junior')) return 'Junior'
  if (l.includes('cadet')) return 'Senior'
  if (l.includes('senior')) return 'Senior'
  if (l.includes('ambassador')) return 'Cadet'
  return 'Junior'
}

// Reverse lookup — Training Profile is the one that picks a Troop (see
// TrainingProfileFormModal's "Which Troop" field), not the other way around, so finding
// "who leads this troop" means searching Training Profiles for whoever claims it, not
// following a link stored on the Troop itself.
function findLinkedProfile(
  profiles: TrainingProfile[],
  troopId: string,
  role: 'leader' | 'assistant_leader'
): TrainingProfile | undefined {
  return profiles.find((p) => p.troopId === troopId && p.troopRole === role)
}

// "Trained" mirrors the paper form's coarse T/NT column — true once the linked Training
// Profile shows at least one completed training. Training Profile is the registry that
// actually tracks birthdate and completed trainings for a person (see
// features/trainingProfiles/types/trainingProfiles.types.ts), so both are pulled from
// there rather than duplicated as separate Troop fields. A leader with no linked profile
// just starts blank/untrained; both stay directly editable on this form either way.
function isTrained(profile: TrainingProfile | undefined): boolean {
  return (profile?.completedTrainings.length ?? 0) > 0
}

function leadersFromTroop(
  troop: ReturnType<typeof useTroopsStore.getState>['troops'][number],
  profiles: TrainingProfile[]
) {
  const leaderProfile = findLinkedProfile(profiles, troop.id, 'leader')
  const rows: LeaderFormRow[] = [
    {
      rowId: crypto.randomUUID(),
      position: 'Troop Leader',
      name: troop.leaderName,
      trained: isTrained(leaderProfile),
      rboStatus: troop.leaderRboStatus ?? 'old',
      birthdate: leaderProfile?.birthday,
      beneficiary: troop.leaderBeneficiary
    }
  ]
  if (troop.assistantLeaderName) {
    const assistantLeaderProfile = findLinkedProfile(profiles, troop.id, 'assistant_leader')
    rows.push({
      rowId: crypto.randomUUID(),
      position: 'Co-Leader',
      name: troop.assistantLeaderName,
      trained: isTrained(assistantLeaderProfile),
      rboStatus: troop.assistantLeaderRboStatus ?? 'old',
      birthdate: assistantLeaderProfile?.birthday,
      beneficiary: troop.assistantLeaderBeneficiary
    })
  }
  return rows
}

function emptyMemberRow(patrol: string): MemberFormRow {
  return {
    rowId: crypto.randomUUID(),
    patrol,
    fullName: '',
    birthdate: '',
    gradeYear: '',
    regStatus: 'new',
    beneficiary: ''
  }
}

export function useTroopRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:troopRegistration')

  const isNew = id === 'new'
  // Select the raw, referentially-stable array once and derive with useMemo below — a
  // selector that builds a new array inline (`.filter()`) returns a different reference on
  // every call even when nothing changed, which makes useSyncExternalStore see a "changed"
  // snapshot on every render and loops forever ("Maximum update depth exceeded"). Same
  // pitfall as useTroops.ts's rosterStats/useEmployees.ts's useActiveEmployees avoid.
  const registrations = useTroopRegistrationStore((s) => s.registrations)
  const existing = useMemo(() => registrations.find((r) => r.id === id), [registrations, id])
  const addRegistration = useTroopRegistrationStore((s) => s.addRegistration)
  const updateRegistration = useTroopRegistrationStore((s) => s.updateRegistration)
  const addScoutMember = useTroopsStore((s) => s.addScoutMember)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const troops = useTroopsStore((s) => s.troops)
  const trainingProfiles = useTrainingProfilesStore((s) => s.profiles)

  const troopIdParam = searchParams.get('troopId') ?? ''
  const troopId = isNew ? troopIdParam : (existing?.troopId ?? '')
  const troop = useMemo(() => troops.find((tr) => tr.id === troopId), [troops, troopId])
  const otherRegistrationsForTroop = useMemo(
    () =>
      existing
        ? registrations.filter((r) => r.troopId === existing.troopId && r.id !== existing.id)
        : [],
    [registrations, existing]
  )
  const priorRegistrationsForTroop = useMemo(
    () => (isNew ? registrations.filter((r) => r.troopId === troopId) : []),
    [registrations, isNew, troopId]
  )

  const [seeded, setSeeded] = useState(false)
  const [schoolYear, setSchoolYear] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [troopStatus, setTroopStatus] = useState<'new' | 're-registered'>('new')
  const [ageLevel, setAgeLevel] = useState<RegistrationAgeLevel>('Junior')
  const [leaders, setLeaders] = useState<LeaderFormRow[]>([])
  const [members, setMembers] = useState<MemberFormRow[]>([])
  const [submittedByName, setSubmittedByName] = useState('')
  const [submittedByDate, setSubmittedByDate] = useState('')
  const [notedByName, setNotedByName] = useState('')
  const [notedByDate, setNotedByDate] = useState('')
  const [remittance, setRemittance] = useState<RegistrationRemittance>(emptyRemittance())
  const [troopNo, setTroopNo] = useState('')
  const [cardsIssued, setCardsIssued] = useState<TroopRegistration['cardsIssued']>({})
  const [girlsIdCardSeriesYear, setGirlsIdCardSeriesYear] = useState('')
  const [adultsIdCardSeriesYear, setAdultsIdCardSeriesYear] = useState('')
  const [troopFee, setTroopFee] = useState('')
  const [rorNo, setRorNo] = useState('')
  const [rorDate, setRorDate] = useState('')
  const [dccrNo, setDccrNo] = useState('')
  const [dateOfDeposit, setDateOfDeposit] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [processedByName, setProcessedByName] = useState('')
  const [approvedByName, setApprovedByName] = useState('')

  // Seeds once data is actually available — from the frozen record when editing, or from
  // the Troop + its current active roster (grouped by patrol) when starting fresh. Guarded
  // by `seeded` so it never re-runs and clobbers in-progress edits once the form is live.
  useEffect(() => {
    if (seeded) return
    if (!isNew && existing) {
      setSchoolYear(existing.schoolYear)
      setDateApplied(existing.dateApplied)
      setTroopStatus(existing.troopStatus)
      setAgeLevel(existing.ageLevel)
      setLeaders(existing.leaders.map((l) => ({ ...l, rowId: crypto.randomUUID() })))
      setMembers(existing.members.map((m) => ({ ...m, rowId: crypto.randomUUID() })))
      setSubmittedByName(existing.submittedByName)
      setSubmittedByDate(existing.submittedByDate ?? '')
      setNotedByName(existing.notedByName ?? '')
      setNotedByDate(existing.notedByDate ?? '')
      setRemittance(existing.remittance)
      setTroopNo(existing.troopNo ?? '')
      setCardsIssued(existing.cardsIssued)
      setGirlsIdCardSeriesYear(existing.girlsIdCardSeriesYear ?? '')
      setAdultsIdCardSeriesYear(existing.adultsIdCardSeriesYear ?? '')
      setTroopFee(existing.troopFee != null ? String(existing.troopFee) : '')
      setRorNo(existing.rorNo ?? '')
      setRorDate(existing.rorDate ?? '')
      setDccrNo(existing.dccrNo ?? '')
      setDateOfDeposit(existing.dateOfDeposit ?? '')
      setBranchCode(existing.branchCode ?? '')
      setProcessedByName(existing.processedByName ?? '')
      setApprovedByName(existing.approvedByName ?? '')
      setSeeded(true)
    } else if (isNew && troop) {
      setSchoolYear(getMembershipYearLabel(startMonth))
      setDateApplied(todayLocalIso())
      setTroopStatus(priorRegistrationsForTroop.length > 0 ? 're-registered' : 'new')
      setAgeLevel(guessAgeLevel(troop.level))
      setLeaders(leadersFromTroop(troop, trainingProfiles))
      const roster = scoutMembers.filter((m) => m.troopId === troop.id && m.isActive)
      setMembers(
        roster.length > 0
          ? roster.map((m) => ({
              rowId: crypto.randomUUID(),
              scoutMemberId: m.id,
              patrol: m.patrol || 'Patrol 1',
              fullName: m.fullName,
              birthdate: m.birthdate,
              gradeYear: m.gradeYear,
              regStatus: m.lastRegistrationStatus ?? 'new',
              beneficiary: m.beneficiary
            }))
          : [emptyMemberRow('Patrol 1')]
      )
      setSubmittedByName(troop.leaderName)
      // Council's own standard flat rates — always editable afterward, same as
      // emptyRemittance()'s thinkingDayFee default.
      setTroopFee('7.50')
      setSeeded(true)
    }
  }, [
    seeded,
    isNew,
    existing,
    troop,
    priorRegistrationsForTroop.length,
    scoutMembers,
    startMonth,
    trainingProfiles
  ])

  // ── Leaders ──
  function addLeaderRow() {
    setLeaders((prev) => [
      ...prev,
      {
        rowId: crypto.randomUUID(),
        position: '',
        name: '',
        trained: false,
        rboStatus: 'new',
        birthdate: '',
        beneficiary: ''
      }
    ])
  }
  function removeLeaderRow(rowId: string) {
    setLeaders((prev) => prev.filter((l) => l.rowId !== rowId))
  }
  function updateLeaderRow(rowId: string, patch: Partial<LeaderFormRow>) {
    setLeaders((prev) => prev.map((l) => (l.rowId === rowId ? { ...l, ...patch } : l)))
  }

  // ── Members / patrols ──
  const patrolGroups = useMemo(() => {
    const groups = new Map<string, MemberFormRow[]>()
    for (const member of members) {
      const list = groups.get(member.patrol) ?? []
      list.push(member)
      groups.set(member.patrol, list)
    }
    return [...groups.entries()]
  }, [members])

  function addPatrolGroup() {
    const n = patrolGroups.length + 1
    setMembers((prev) => [...prev, emptyMemberRow(`Patrol ${n}`)])
  }
  function removePatrolGroup(patrol: string) {
    setMembers((prev) => prev.filter((m) => m.patrol !== patrol))
  }
  function renamePatrol(oldName: string, newName: string) {
    setMembers((prev) => prev.map((m) => (m.patrol === oldName ? { ...m, patrol: newName } : m)))
  }
  function addMemberToPatrol(patrol: string) {
    setMembers((prev) => [...prev, emptyMemberRow(patrol)])
  }
  function removeMemberRow(rowId: string) {
    setMembers((prev) => prev.filter((m) => m.rowId !== rowId))
  }
  function updateMemberRow(rowId: string, patch: Partial<MemberFormRow>) {
    setMembers((prev) => prev.map((m) => (m.rowId === rowId ? { ...m, ...patch } : m)))
  }

  // ── Remittance ──
  // "Total Remittance" on the paper form is the sum of its own lettered A–D lines only.
  // Thinking Day Fee isn't one of them — like Troop Fee, it's a flat per-troop amount fully
  // retained by the Council, printed in its own box rather than folded into this total (see
  // troopRegistrationExport.ts).
  function updateRemittance(patch: Partial<RegistrationRemittance>) {
    setRemittance((prev) => {
      const next = { ...prev, ...patch }
      const total =
        next.membershipFeeGirlsReReg +
        next.membershipFeeGirlsNew +
        next.membershipFeeLeaderReReg +
        next.membershipFeeLeaderNew +
        next.membershipFeeCoLeaderReReg +
        next.membershipFeeCoLeaderNew +
        next.programDevelopmentFund +
        next.mutualAssistanceFundContribution +
        next.magazineSubscriptionFee
      return { ...next, totalRemittance: total }
    })
  }

  const councilShare = councilRetainedMembershipShare(remittance)

  function handleSave() {
    if (!canManage || !troop) return
    if (!isNew && !existing) return
    if (!schoolYear.trim()) {
      toast.error(t('troopRegistration.toast.validationRequired'))
      return
    }

    // Any member row typed in fresh (no scoutMemberId) becomes a real roster entry too —
    // filing a registration is how membership actually gets recorded, so the roster and
    // this filing never drift apart. Existing links are left untouched.
    const resolvedMembers: RegistrationMember[] = members
      .filter((m) => m.fullName.trim())
      .map((m) => {
        if (m.scoutMemberId) {
          const { rowId: _rowId, ...rest } = m
          return rest
        }
        const newMemberId = crypto.randomUUID()
        addScoutMember({
          id: newMemberId,
          troopId: troop.id,
          fullName: m.fullName.trim(),
          birthdate: m.birthdate,
          patrol: m.patrol,
          gradeYear: m.gradeYear || undefined,
          beneficiary: m.beneficiary || undefined,
          lastRegistrationStatus: m.regStatus,
          membershipYear: schoolYear,
          renewedAt: todayLocalIso(),
          payments: [],
          isActive: true
        })
        return {
          scoutMemberId: newMemberId,
          patrol: m.patrol,
          fullName: m.fullName.trim(),
          birthdate: m.birthdate,
          gradeYear: m.gradeYear || undefined,
          regStatus: m.regStatus,
          beneficiary: m.beneficiary || undefined
        }
      })

    const payload: Omit<TroopRegistration, 'id' | 'createdAt' | 'updatedAt'> = {
      troopId: troop.id,
      schoolYear: schoolYear.trim(),
      dateApplied,
      troopStatus,
      ageLevel,
      leaders: leaders.filter((l) => l.name.trim()).map(({ rowId: _rowId, ...rest }) => rest),
      members: resolvedMembers,
      submittedByName: submittedByName.trim(),
      submittedByDate: submittedByDate || undefined,
      notedByName: notedByName.trim() || undefined,
      notedByDate: notedByDate || undefined,
      remittance,
      troopNo: troopNo.trim() || undefined,
      cardsIssued,
      girlsIdCardSeriesYear: girlsIdCardSeriesYear.trim() || undefined,
      adultsIdCardSeriesYear: adultsIdCardSeriesYear.trim() || undefined,
      troopFee: troopFee.trim() ? parseFloat(troopFee) : undefined,
      rorNo: rorNo.trim() || undefined,
      rorDate: rorDate || undefined,
      dccrNo: dccrNo.trim() || undefined,
      dateOfDeposit: dateOfDeposit || undefined,
      branchCode: branchCode.trim() || undefined,
      processedByName: processedByName.trim() || undefined,
      approvedByName: approvedByName.trim() || undefined
    }

    const now = new Date().toISOString()
    const registrationId = isNew ? crypto.randomUUID() : (existing?.id ?? crypto.randomUUID())
    const fullRegistration: TroopRegistration = {
      id: registrationId,
      ...payload,
      linkedVoucherId: existing?.linkedVoucherId,
      createdAt: isNew ? now : (existing?.createdAt ?? now),
      updatedAt: now
    }

    if (isNew) {
      addRegistration(fullRegistration)
      toast.success(t('troopRegistration.toast.created'))
    } else {
      updateRegistration(registrationId, fullRegistration)
      toast.success(t('troopRegistration.toast.updated'))
    }

    // Keeps the Council-retained-income Journal Voucher (SCRD Cash Receipts / Council
    // Budget auto-actuals both read from approved vouchers, not a standalone record) in
    // sync with this filing. Firestore only lets super_admin/admin/accountant/manager
    // write `vouchers` — hr can file a registration but not this — so this is skipped
    // entirely rather than attempted-and-denied when the signed-in user lacks
    // 'manage:vouchers'; an accountant/manager opening and re-saving the same filing
    // later completes the link.
    if (hasPermission('manage:vouchers')) {
      const linkedVoucherId = syncRemittanceVoucher(fullRegistration, troop)
      if (linkedVoucherId !== fullRegistration.linkedVoucherId) {
        updateRegistration(registrationId, { linkedVoucherId })
      }
    }

    // Registrations live as a tab on the Troops page (features/troops/pages/Troops.tsx),
    // not a standalone route — send the user back to that tab specifically.
    navigate('/troops?tab=registrations')
  }

  return {
    canManage,
    isNew,
    troop,
    otherRegistrationsForTroop,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    troopStatus,
    setTroopStatus,
    ageLevel,
    setAgeLevel,
    leaders,
    addLeaderRow,
    removeLeaderRow,
    updateLeaderRow,
    members,
    patrolGroups,
    addPatrolGroup,
    removePatrolGroup,
    renamePatrol,
    addMemberToPatrol,
    removeMemberRow,
    updateMemberRow,
    submittedByName,
    setSubmittedByName,
    submittedByDate,
    setSubmittedByDate,
    notedByName,
    setNotedByName,
    notedByDate,
    setNotedByDate,
    remittance,
    updateRemittance,
    troopNo,
    setTroopNo,
    cardsIssued,
    setCardsIssued,
    girlsIdCardSeriesYear,
    setGirlsIdCardSeriesYear,
    adultsIdCardSeriesYear,
    setAdultsIdCardSeriesYear,
    troopFee,
    setTroopFee,
    rorNo,
    setRorNo,
    rorDate,
    setRorDate,
    dccrNo,
    setDccrNo,
    dateOfDeposit,
    setDateOfDeposit,
    branchCode,
    setBranchCode,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    councilShare,
    handleSave
  }
}
