import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useTrainingProfilesStore } from '../store/trainingProfiles.store'
import type {
  AgeLevelSpecialization,
  CompletedCertificate,
  CompletedTraining,
  CouncilRole,
  EducationLevel,
  TrainingProfile,
  TroopLeaderRole
} from '../types/trainingProfiles.types'

export type TrainingProfileFormState = ReturnType<typeof emptyForm>

function emptyForm() {
  return {
    name: '',
    birthday: '',
    school: '',
    district: '',
    level: 'elementary' as EducationLevel,
    contactNumber: '',
    email: '',
    homeAddress: '',
    roles: [] as CouncilRole[],
    troopId: '',
    troopRole: 'leader' as TroopLeaderRole,
    completedTrainings: [] as CompletedTraining[],
    otherCompletedTraining: '',
    ageLevelSpecialization: '' as AgeLevelSpecialization | '',
    completedCertificates: [] as CompletedCertificate[],
    firstRegistrationDate: ''
  }
}

function formFromProfile(profile: TrainingProfile) {
  return {
    name: profile.name,
    birthday: profile.birthday,
    school: profile.school,
    district: profile.district,
    level: profile.level,
    contactNumber: profile.contactNumber,
    email: profile.email,
    homeAddress: profile.homeAddress,
    roles: profile.roles,
    troopId: profile.troopId ?? '',
    troopRole: profile.troopRole ?? ('leader' as TroopLeaderRole),
    completedTrainings: profile.completedTrainings,
    otherCompletedTraining: profile.otherCompletedTraining ?? '',
    ageLevelSpecialization: profile.ageLevelSpecialization ?? ('' as const),
    completedCertificates: profile.completedCertificates,
    firstRegistrationDate: profile.firstRegistrationDate ?? ''
  }
}

// Whole years elapsed since `dateStr` (an ISO "YYYY-MM-DD" from the First Registration Date
// field) up to today — the same "hasn't had this year's anniversary yet" adjustment an age
// calculation uses, just measuring scouting tenure instead of age. Blank/unparseable input
// (a profile predating this field, or one still being typed in) reads as 0 rather than
// throwing.
function yearsSince(dateStr: string): number {
  if (!dateStr) return 0
  const start = new Date(dateStr)
  if (Number.isNaN(start.getTime())) return 0
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const hadAnniversaryThisYear =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate())
  if (!hadAnniversaryThisYear) years -= 1
  return Math.max(0, years)
}

export function useTrainingProfileFormModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget?: TrainingProfile | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trainingProfiles')
  const addProfile = useTrainingProfilesStore((s) => s.addProfile)
  const updateProfile = useTrainingProfilesStore((s) => s.updateProfile)
  const updateTroop = useTroopsStore((s) => s.updateTroop)
  const [form, setForm] = useState(emptyForm())

  // Re-seeds every time the modal opens (not merely mounts) — `editTarget` can point
  // at a different record from one "Edit" click to the next without this component
  // ever unmounting, so a one-time `useState` initializer alone would go stale.
  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromProfile(editTarget) : emptyForm())
  }, [open, editTarget])

  // Auto-calculated from First Registration Date rather than typed in — recomputes live as
  // that date changes, so it's always consistent instead of drifting from a manually-entered
  // figure.
  const totalYearsInScouting = useMemo(
    () => yearsSince(form.firstRegistrationDate),
    [form.firstRegistrationDate]
  )

  function toggleRole(role: CouncilRole) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role]
    }))
  }

  function toggleTraining(training: CompletedTraining) {
    setForm((f) => ({
      ...f,
      completedTrainings: f.completedTrainings.includes(training)
        ? f.completedTrainings.filter((tr) => tr !== training)
        : [...f.completedTrainings, training]
    }))
  }

  function toggleCertificate(certificate: CompletedCertificate) {
    setForm((f) => ({
      ...f,
      completedCertificates: f.completedCertificates.includes(certificate)
        ? f.completedCertificates.filter((c) => c !== certificate)
        : [...f.completedCertificates, certificate]
    }))
  }

  function handleSubmit() {
    if (!hasPermission('manage:trainingProfiles')) return
    if (!form.name.trim() || !form.school.trim() || !form.district.trim()) {
      toast.error(t('trainingProfiles.toast.missingFields'))
      return
    }
    // "Which Troop" only makes sense once 'troop_leader' is actually checked below —
    // dropping the role clears any troop pick along with it rather than leaving a stale,
    // now-hidden link behind.
    const isTroopLeader = form.roles.includes('troop_leader')
    const troopId = isTroopLeader ? form.troopId || undefined : undefined
    const troopRole = isTroopLeader ? form.troopRole : undefined

    const payload = {
      name: form.name.trim(),
      birthday: form.birthday,
      school: form.school.trim(),
      district: form.district.trim(),
      level: form.level,
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim(),
      homeAddress: form.homeAddress.trim(),
      roles: form.roles,
      troopId,
      troopRole,
      completedTrainings: form.completedTrainings,
      otherCompletedTraining: form.otherCompletedTraining.trim() || undefined,
      ageLevelSpecialization: form.ageLevelSpecialization || undefined,
      completedCertificates: form.completedCertificates,
      firstRegistrationDate: form.firstRegistrationDate || undefined,
      totalYearsInScouting: form.firstRegistrationDate ? String(totalYearsInScouting) : undefined
    }

    if (editTarget) {
      updateProfile(editTarget.id, payload)
      toast.success(t('trainingProfiles.toast.updated'))
    } else {
      addProfile(payload)
      toast.success(t('trainingProfiles.toast.created'))
    }

    // Training Profile is the side that picks a Troop (see the type's own comment) — write
    // this profile's name into that Troop's leaderName/assistantLeaderName so the Troop
    // page, exports, and the Registration form's prefill all still just read a plain name
    // off Troop like before. Best-effort: a Troop deleted out from under a stale pick is
    // simply skipped rather than thrown. Doesn't touch a *previous* pick this edit moved
    // away from — Troop.leaderName is required and plain text, so it's left as whatever
    // was last written rather than blanked out.
    if (troopId) {
      const field = troopRole === 'assistant_leader' ? 'assistantLeaderName' : 'leaderName'
      updateTroop(troopId, { [field]: payload.name })
    }
    onOpenChange(false)
  }

  return {
    form,
    setForm,
    canManage,
    toggleRole,
    toggleTraining,
    toggleCertificate,
    totalYearsInScouting,
    handleSubmit
  }
}
