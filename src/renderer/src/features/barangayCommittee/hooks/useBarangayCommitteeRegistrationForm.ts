import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import { todayLocalIso } from '@/shared/lib/utils'
import { useBarangayCommitteeStore } from '../store/barangayCommittee.store'
import { useBarangayCommitteeRegistrationStore } from '../store/barangayCommitteeRegistration.store'
import { syncRegistrationRemittanceVoucher } from '../lib/bcVoucher'
import {
  emptyRemittance,
  type RegistrationMember,
  type RegistrationRemittance,
  type BarangayCommitteeRegistration
} from '../types/barangayCommitteeRegistration.types'

export interface MemberFormRow extends RegistrationMember {
  rowId: string
}

function emptyMemberRow(): MemberFormRow {
  return {
    rowId: crypto.randomUUID(),
    position: 'Member',
    fullName: '',
    birthdate: '',
    groupRepresented: '',
    regStatus: 'new',
    beneficiary: ''
  }
}

export function useBarangayCommitteeRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:barangayCommittee')

  const isNew = id === 'new'
  // Select the raw, referentially-stable array once and derive with useMemo below — see
  // useTroopRegistrationForm.ts's identical comment for why (Zustand selector infinite-loop
  // pitfall).
  const registrations = useBarangayCommitteeRegistrationStore((s) => s.registrations)
  const existing = useMemo(() => registrations.find((r) => r.id === id), [registrations, id])
  const addRegistration = useBarangayCommitteeRegistrationStore((s) => s.addRegistration)
  const updateRegistration = useBarangayCommitteeRegistrationStore((s) => s.updateRegistration)
  const addMember = useBarangayCommitteeStore((s) => s.addMember)
  const members = useBarangayCommitteeStore((s) => s.members)
  const startMonth = useOrgSettingsStore((s) => s.membershipYearStartMonth)
  const committees = useBarangayCommitteeStore((s) => s.committees)

  const committeeIdParam = searchParams.get('barangayCommitteeId') ?? ''
  const barangayCommitteeId = isNew ? committeeIdParam : (existing?.barangayCommitteeId ?? '')
  const committee = useMemo(
    () => committees.find((c) => c.id === barangayCommitteeId),
    [committees, barangayCommitteeId]
  )
  const priorRegistrationsForCommittee = useMemo(
    () => (isNew ? registrations.filter((r) => r.barangayCommitteeId === barangayCommitteeId) : []),
    [registrations, isNew, barangayCommitteeId]
  )

  const [seeded, setSeeded] = useState(false)
  const [schoolYear, setSchoolYear] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState<'new' | 're-registered'>('new')
  const [memberRows, setMemberRows] = useState<MemberFormRow[]>([])
  const [submittedByName, setSubmittedByName] = useState('')
  const [submittedByDate, setSubmittedByDate] = useState('')
  const [remittance, setRemittance] = useState<RegistrationRemittance>(emptyRemittance())
  const [bcGroupFee, setBcGroupFee] = useState('15.00')
  const [rorNo, setRorNo] = useState('')
  const [rorDate, setRorDate] = useState('')
  const [dccrNo, setDccrNo] = useState('')
  const [dateOfDeposit, setDateOfDeposit] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [adultsFrom, setAdultsFrom] = useState('')
  const [adultsTo, setAdultsTo] = useState('')
  const [processedByName, setProcessedByName] = useState('')
  const [approvedByName, setApprovedByName] = useState('')

  // Seeds once data is actually available — from the frozen record when editing, or from the
  // committee's current active roster when starting fresh. Guarded by `seeded` so it never
  // re-runs and clobbers in-progress edits once the form is live.
  useEffect(() => {
    if (seeded) return
    if (!isNew && existing) {
      setSchoolYear(existing.schoolYear)
      setDateApplied(existing.dateApplied)
      setRegistrationStatus(existing.registrationStatus)
      setMemberRows(existing.members.map((m) => ({ ...m, rowId: crypto.randomUUID() })))
      setSubmittedByName(existing.submittedByName)
      setSubmittedByDate(existing.submittedByDate ?? '')
      setRemittance(existing.remittance)
      setBcGroupFee(existing.bcGroupFee != null ? String(existing.bcGroupFee) : '15.00')
      setRorNo(existing.rorNo ?? '')
      setRorDate(existing.rorDate ?? '')
      setDccrNo(existing.dccrNo ?? '')
      setDateOfDeposit(existing.dateOfDeposit ?? '')
      setBranchCode(existing.branchCode ?? '')
      setAdultsFrom(existing.cardsIssued.adultsFrom ?? '')
      setAdultsTo(existing.cardsIssued.adultsTo ?? '')
      setProcessedByName(existing.processedByName ?? '')
      setApprovedByName(existing.approvedByName ?? '')
      setSeeded(true)
    } else if (isNew && committee) {
      setSchoolYear(getMembershipYearLabel(startMonth))
      setDateApplied(todayLocalIso())
      setRegistrationStatus(priorRegistrationsForCommittee.length > 0 ? 're-registered' : 'new')
      const roster = members.filter((m) => m.barangayCommitteeId === committee.id && m.isActive)
      setMemberRows(
        roster.length > 0
          ? roster.map((m) => ({
              rowId: crypto.randomUUID(),
              memberId: m.id,
              position: m.position,
              fullName: m.fullName,
              birthdate: m.birthdate,
              groupRepresented: m.groupRepresented,
              regStatus: m.lastRegistrationStatus ?? 'new',
              beneficiary: m.beneficiary
            }))
          : [emptyMemberRow()]
      )
      setSeeded(true)
    }
  }, [
    seeded,
    isNew,
    existing,
    committee,
    priorRegistrationsForCommittee.length,
    members,
    startMonth
  ])

  function addMemberRow() {
    setMemberRows((prev) => [...prev, emptyMemberRow()])
  }
  function removeMemberRow(rowId: string) {
    setMemberRows((prev) => prev.filter((m) => m.rowId !== rowId))
  }
  function updateMemberRow(rowId: string, patch: Partial<MemberFormRow>) {
    setMemberRows((prev) => prev.map((m) => (m.rowId === rowId ? { ...m, ...patch } : m)))
  }

  // Re-Reg/New headcounts for the "Members" remittance line — the printed form's own blanks
  // for these are just for hand-counting off the roster above; here they're always derived
  // live from memberRows rather than tracked as separate stored fields, so they can never
  // drift out of sync with who's actually on the filing.
  const memberCounts = useMemo(() => {
    let reReg = 0
    let newCount = 0
    for (const m of memberRows) {
      if (!m.fullName.trim()) continue
      if (m.regStatus === 're-reg') reReg++
      else newCount++
    }
    return { reReg, new: newCount }
  }, [memberRows])

  // "Total Remittance" is A (Members fee) + B (Program Development Fund) + C (Mutual
  // Assistance Fund) only, matching the printed form — the B.C. Group Fee is a separate,
  // council-retained figure tracked in its own field (bcGroupFee), not folded in here.
  function updateRemittance(patch: Partial<RegistrationRemittance>) {
    setRemittance((prev) => {
      const next = { ...prev, ...patch }
      const total =
        next.memberFeeTotal + next.programDevelopmentFund + next.mutualAssistanceFundContribution
      return { ...next, totalRemittance: total }
    })
  }

  function handleSave() {
    if (!canManage || !committee) return
    if (!isNew && !existing) return
    if (!schoolYear.trim()) {
      toast.error(t('barangayCommitteeRegistration.toast.validationRequired'))
      return
    }

    // Any member row typed in fresh (no memberId) becomes a real roster entry too — filing a
    // registration is how membership actually gets recorded, so the roster and this filing
    // never drift apart. Existing links are left untouched.
    const resolvedMembers: RegistrationMember[] = memberRows
      .filter((m) => m.fullName.trim())
      .map((m) => {
        if (m.memberId) {
          const { rowId: _rowId, ...rest } = m
          return rest
        }
        const newMemberId = crypto.randomUUID()
        addMember({
          id: newMemberId,
          barangayCommitteeId: committee.id,
          position: m.position,
          fullName: m.fullName.trim(),
          birthdate: m.birthdate,
          groupRepresented: m.groupRepresented,
          beneficiary: m.beneficiary,
          lastRegistrationStatus: m.regStatus,
          payments: [],
          isActive: true
        })
        return {
          memberId: newMemberId,
          position: m.position,
          fullName: m.fullName.trim(),
          birthdate: m.birthdate,
          groupRepresented: m.groupRepresented,
          regStatus: m.regStatus,
          beneficiary: m.beneficiary
        }
      })

    const payload: Omit<BarangayCommitteeRegistration, 'id' | 'createdAt' | 'updatedAt'> = {
      barangayCommitteeId: committee.id,
      schoolYear: schoolYear.trim(),
      dateApplied,
      registrationStatus,
      members: resolvedMembers,
      submittedByName: submittedByName.trim(),
      submittedByDate: submittedByDate || undefined,
      remittance,
      bcGroupFee: bcGroupFee.trim() ? parseFloat(bcGroupFee) : undefined,
      rorNo: rorNo.trim() || undefined,
      rorDate: rorDate || undefined,
      dccrNo: dccrNo.trim() || undefined,
      dateOfDeposit: dateOfDeposit || undefined,
      branchCode: branchCode.trim() || undefined,
      cardsIssued: {
        adultsFrom: adultsFrom.trim() || undefined,
        adultsTo: adultsTo.trim() || undefined
      },
      processedByName: processedByName.trim() || undefined,
      approvedByName: approvedByName.trim() || undefined
    }

    const now = new Date().toISOString()
    const registrationId = isNew ? crypto.randomUUID() : (existing?.id ?? crypto.randomUUID())
    const fullRegistration: BarangayCommitteeRegistration = {
      id: registrationId,
      ...payload,
      linkedVoucherId: existing?.linkedVoucherId,
      createdAt: isNew ? now : (existing?.createdAt ?? now),
      updatedAt: now
    }

    if (isNew) {
      addRegistration(fullRegistration)
      toast.success(t('barangayCommitteeRegistration.toast.created'))
    } else {
      updateRegistration(registrationId, fullRegistration)
      toast.success(t('barangayCommitteeRegistration.toast.updated'))
    }

    // Keeps the Council-retained-income Journal Voucher (B.C. Group Fee only) in sync with
    // this filing. Firestore only lets super_admin/admin/accountant/manager write `vouchers`
    // — hr can file a registration but not this — so this is skipped entirely rather than
    // attempted-and-denied when the signed-in user lacks 'manage:vouchers'.
    if (hasPermission('manage:vouchers')) {
      const linkedVoucherId = syncRegistrationRemittanceVoucher(fullRegistration, committee)
      if (linkedVoucherId !== fullRegistration.linkedVoucherId) {
        updateRegistration(registrationId, { linkedVoucherId })
      }
    }

    // Registrations live as a tab on the Barangay Committee page, not a standalone route —
    // send the user back to that tab specifically.
    navigate('/barangay-committee?tab=registrations')
  }

  return {
    canManage,
    isNew,
    committee,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    registrationStatus,
    setRegistrationStatus,
    memberRows,
    addMemberRow,
    removeMemberRow,
    updateMemberRow,
    submittedByName,
    setSubmittedByName,
    submittedByDate,
    setSubmittedByDate,
    remittance,
    updateRemittance,
    memberCounts,
    bcGroupFee,
    setBcGroupFee,
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
    adultsFrom,
    setAdultsFrom,
    adultsTo,
    setAdultsTo,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    handleSave
  }
}
