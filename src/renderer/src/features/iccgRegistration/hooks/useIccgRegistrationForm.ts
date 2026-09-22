import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { todayLocalIso } from '@/shared/lib/utils'
import { useIccgRegistrationStore } from '../store/iccgRegistration.store'
import { useIccgMemberStore } from '../store/iccgMember.store'
import { syncIccgRegistrationVoucher } from '../lib/iccgVoucher'
import {
  councilRetainedIccgFeeShare,
  emptyFee,
  type IccgAdultMember,
  type IccgFee,
  type IccgGirlMember,
  type IccgRegistration
} from '../types/iccgRegistration.types'

export interface GirlFormRow extends IccgGirlMember {
  rowId: string
}
export interface AdultFormRow extends IccgAdultMember {
  rowId: string
}

function emptyGirlRow(): GirlFormRow {
  return { rowId: crypto.randomUUID(), fullName: '', gradeYear: '', email: '' }
}
function emptyAdultRow(): AdultFormRow {
  return { rowId: crypto.randomUUID(), fullName: '', email: '' }
}

export function useIccgRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:iccgRegistration')

  const isNew = id === 'new'
  // Select the raw, referentially-stable array once and derive with useMemo below — a
  // selector that builds a new array inline returns a different reference on every call,
  // which makes useSyncExternalStore see a "changed" snapshot every render and loops
  // forever. Same pitfall useTroopRegistrationForm.ts avoids.
  const registrations = useIccgRegistrationStore((s) => s.registrations)
  const existing = useMemo(() => registrations.find((r) => r.id === id), [registrations, id])
  const addRegistration = useIccgRegistrationStore((s) => s.addRegistration)
  const updateRegistration = useIccgRegistrationStore((s) => s.updateRegistration)
  const addMember = useIccgMemberStore((s) => s.addMember)
  const iccgMembers = useIccgMemberStore((s) => s.members)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const troops = useTroopsStore((s) => s.troops)

  const troopIdParam = searchParams.get('troopId') ?? ''
  const troopId = isNew ? troopIdParam : (existing?.troopId ?? '')
  const troop = useMemo(() => troops.find((tr) => tr.id === troopId), [troops, troopId])

  const [seeded, setSeeded] = useState(false)
  const [school, setSchool] = useState('')
  const [ageLevel, setAgeLevel] = useState('')
  const [schoolYear, setSchoolYear] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [formNo, setFormNo] = useState('')
  const [seriesYear, setSeriesYear] = useState('')
  const [girls, setGirls] = useState<GirlFormRow[]>([])
  const [adults, setAdults] = useState<AdultFormRow[]>([])
  const [submittedByName, setSubmittedByName] = useState('')
  const [submittedByDate, setSubmittedByDate] = useState('')
  const [notedByName, setNotedByName] = useState('')
  const [notedByDate, setNotedByDate] = useState('')
  const [processedByName, setProcessedByName] = useState('')
  const [approvedByName, setApprovedByName] = useState('')
  const [fee, setFee] = useState<IccgFee>(emptyFee())

  // Seeds once data is actually available — from the frozen record when editing, or from the
  // Troop when starting fresh. Guarded by `seeded` so it never re-runs and clobbers
  // in-progress edits once the form is live.
  useEffect(() => {
    if (seeded) return
    if (!isNew && existing) {
      setSchool(existing.school)
      setAgeLevel(existing.ageLevel ?? '')
      setSchoolYear(existing.schoolYear)
      setDateApplied(existing.dateApplied)
      setFormNo(existing.formNo ?? '')
      setSeriesYear(existing.seriesYear ?? '')
      setGirls(existing.girls.map((g) => ({ ...g, rowId: crypto.randomUUID() })))
      setAdults(existing.adults.map((a) => ({ ...a, rowId: crypto.randomUUID() })))
      setSubmittedByName(existing.submittedByName)
      setSubmittedByDate(existing.submittedByDate ?? '')
      setNotedByName(existing.notedByName ?? '')
      setNotedByDate(existing.notedByDate ?? '')
      setProcessedByName(existing.processedByName ?? '')
      setApprovedByName(existing.approvedByName ?? '')
      setFee(existing.fee)
      setSeeded(true)
    } else if (isNew && troop) {
      setSchool(troop.sponsoringGroup ?? '')
      setSchoolYear(getMembershipYearLabel(startMonth))
      setDateApplied(todayLocalIso())
      const roster = iccgMembers.filter((m) => m.troopId === troop.id && m.isActive)
      const girlRoster = roster.filter((m) => m.role === 'girl')
      const adultRoster = roster.filter((m) => m.role === 'adult')
      setGirls(
        girlRoster.length > 0
          ? girlRoster.map((m) => ({
              rowId: crypto.randomUUID(),
              memberId: m.id,
              fullName: m.fullName,
              gradeYear: m.gradeYear,
              email: m.email
            }))
          : [emptyGirlRow()]
      )
      setAdults(
        adultRoster.length > 0
          ? adultRoster.map((m) => ({
              rowId: crypto.randomUUID(),
              memberId: m.id,
              fullName: m.fullName,
              email: m.email
            }))
          : [emptyAdultRow(), emptyAdultRow()]
      )
      setSubmittedByName(troop.leaderName)
      setSeeded(true)
    }
  }, [seeded, isNew, existing, troop, startMonth, iccgMembers])

  // ── Girls ──
  function addGirlRow() {
    setGirls((prev) => [...prev, emptyGirlRow()])
  }
  function removeGirlRow(rowId: string) {
    setGirls((prev) => prev.filter((g) => g.rowId !== rowId))
  }
  function updateGirlRow(rowId: string, patch: Partial<GirlFormRow>) {
    setGirls((prev) => prev.map((g) => (g.rowId === rowId ? { ...g, ...patch } : g)))
  }

  // ── Adults ──
  function addAdultRow() {
    setAdults((prev) => [...prev, emptyAdultRow()])
  }
  function removeAdultRow(rowId: string) {
    setAdults((prev) => prev.filter((a) => a.rowId !== rowId))
  }
  function updateAdultRow(rowId: string, patch: Partial<AdultFormRow>) {
    setAdults((prev) => prev.map((a) => (a.rowId === rowId ? { ...a, ...patch } : a)))
  }

  // ── Fee ──
  function updateFee(patch: Partial<IccgFee>) {
    setFee((prev) => {
      const next = { ...prev, ...patch }
      return { ...next, total: next.amountGirls + next.amountAdults }
    })
  }

  const girlsCount = useMemo(() => girls.filter((g) => g.fullName.trim()).length, [girls])
  const adultsCount = useMemo(() => adults.filter((a) => a.fullName.trim()).length, [adults])
  const councilShare = councilRetainedIccgFeeShare(fee)

  function handleSave() {
    if (!canManage || !troop) return
    if (!isNew && !existing) return
    if (!school.trim()) {
      toast.error(t('iccgRegistration.toast.validationRequired'))
      return
    }

    // Any girl/adult row typed in fresh (no memberId) becomes a real ICCG roster entry too —
    // filing a registration is how membership actually gets recorded, so the persistent
    // roster (and its Payment tab ledger) never drifts apart from the filing. Existing links
    // are left untouched, same "resolve or create" pattern as useTroopRegistrationForm.ts.
    const resolvedGirls: IccgGirlMember[] = girls
      .filter((g) => g.fullName.trim())
      .map((g) => {
        if (g.memberId) {
          const { rowId: _rowId, ...rest } = g
          return rest
        }
        const newMemberId = crypto.randomUUID()
        addMember({
          id: newMemberId,
          troopId: troop.id,
          role: 'girl',
          fullName: g.fullName.trim(),
          gradeYear: g.gradeYear || undefined,
          email: g.email || undefined,
          isActive: true
        })
        return {
          memberId: newMemberId,
          fullName: g.fullName.trim(),
          gradeYear: g.gradeYear || undefined,
          email: g.email || undefined
        }
      })
    const resolvedAdults: IccgAdultMember[] = adults
      .filter((a) => a.fullName.trim())
      .map((a) => {
        if (a.memberId) {
          const { rowId: _rowId, ...rest } = a
          return rest
        }
        const newMemberId = crypto.randomUUID()
        addMember({
          id: newMemberId,
          troopId: troop.id,
          role: 'adult',
          fullName: a.fullName.trim(),
          email: a.email || undefined,
          isActive: true
        })
        return { memberId: newMemberId, fullName: a.fullName.trim(), email: a.email || undefined }
      })

    const payload: Omit<IccgRegistration, 'id' | 'createdAt' | 'updatedAt'> = {
      troopId: troop.id,
      school: school.trim(),
      ageLevel: ageLevel.trim() || undefined,
      schoolYear: schoolYear.trim(),
      dateApplied,
      formNo: formNo.trim() || undefined,
      seriesYear: seriesYear.trim() || undefined,
      girls: resolvedGirls,
      adults: resolvedAdults,
      submittedByName: submittedByName.trim(),
      submittedByDate: submittedByDate || undefined,
      notedByName: notedByName.trim() || undefined,
      notedByDate: notedByDate || undefined,
      processedByName: processedByName.trim() || undefined,
      approvedByName: approvedByName.trim() || undefined,
      fee
    }

    const now = new Date().toISOString()
    const registrationId = isNew ? crypto.randomUUID() : (existing?.id ?? crypto.randomUUID())
    const fullRegistration: IccgRegistration = {
      id: registrationId,
      ...payload,
      linkedVoucherId: existing?.linkedVoucherId,
      createdAt: isNew ? now : (existing?.createdAt ?? now),
      updatedAt: now
    }

    if (isNew) {
      addRegistration(fullRegistration)
      toast.success(t('iccgRegistration.toast.created'))
    } else {
      updateRegistration(registrationId, fullRegistration)
      toast.success(t('iccgRegistration.toast.updated'))
    }

    // Firestore only lets super_admin/admin/accountant/manager write `vouchers` — hr can
    // file a registration but not this — so this is skipped entirely rather than
    // attempted-and-denied when the signed-in user lacks 'manage:vouchers'; an
    // accountant/manager opening and re-saving the same filing later completes the link.
    if (hasPermission('manage:vouchers')) {
      const linkedVoucherId = syncIccgRegistrationVoucher(fullRegistration, troop)
      if (linkedVoucherId !== fullRegistration.linkedVoucherId) {
        updateRegistration(registrationId, { linkedVoucherId })
      }
    }

    navigate('/iccg-registrations?tab=registrations')
  }

  return {
    canManage,
    isNew,
    troop,
    school,
    setSchool,
    ageLevel,
    setAgeLevel,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    formNo,
    setFormNo,
    seriesYear,
    setSeriesYear,
    girls,
    addGirlRow,
    removeGirlRow,
    updateGirlRow,
    adults,
    addAdultRow,
    removeAdultRow,
    updateAdultRow,
    girlsCount,
    adultsCount,
    submittedByName,
    setSubmittedByName,
    submittedByDate,
    setSubmittedByDate,
    notedByName,
    setNotedByName,
    notedByDate,
    setNotedByDate,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    fee,
    updateFee,
    councilShare,
    handleSave
  }
}
