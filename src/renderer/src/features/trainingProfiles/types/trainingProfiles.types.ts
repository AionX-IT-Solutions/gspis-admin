// A per-person credential registry for the Council's Troop Leaders, Field Advisers, and
// Trainers — distinct from features/trainingReports, which records training EVENTS held
// (one report per session, with a lightweight participant snapshot). This is the other
// direction: one record per person, tracking who they are and what they've completed,
// matching the Council's own "Profile and Training Information Form".

export const EDUCATION_LEVELS = ['elementary', 'high_school'] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

export const COUNCIL_ROLES = [
  'troop_leader',
  'district_field_adviser',
  'field_adviser',
  'assisting_trainer',
  'credentialed_trainer',
  'diplomad'
] as const
export type CouncilRole = (typeof COUNCIL_ROLES)[number]

export const COMPLETED_TRAININGS = [
  'basic_leadership_course',
  'age_level_specialization_course',
  'outdoor_leadership_course',
  'campers_permit_course',
  'quarter_master_course',
  'training_for_trainers'
] as const
export type CompletedTraining = (typeof COMPLETED_TRAININGS)[number]

// Only meaningful once "age_level_specialization_course" is among completedTrainings.
export const AGE_LEVEL_SPECIALIZATIONS = ['star', 'twinkler', 'junior', 'senior'] as const
export type AgeLevelSpecialization = (typeof AGE_LEVEL_SPECIALIZATIONS)[number]

export const COMPLETED_CERTIFICATES = [
  'camp_craft_certificate',
  'campers_permit_certificate'
] as const
export type CompletedCertificate = (typeof COMPLETED_CERTIFICATES)[number]

// Only meaningful when `roles` includes 'troop_leader'. Which Troop (features/troops) this
// person leads, and in what capacity — this profile is the one that picks a Troop, not the
// other way around, since Training Profile is the registry of people. Selecting one writes
// this profile's `name` into that Troop's `leaderName`/`assistantLeaderName` (see
// useTrainingProfileFormModal.ts); TroopProfile.tsx and the Troop Registration form do the
// reverse lookup (by `troopId`) to pull this profile's birthday/completedTrainings back in.
export type TroopLeaderRole = 'leader' | 'assistant_leader'

export interface TrainingProfile {
  id: string
  name: string
  birthday: string
  school: string
  district: string
  level: EducationLevel
  contactNumber: string
  email: string
  homeAddress: string
  roles: CouncilRole[]
  troopId?: string
  troopRole?: TroopLeaderRole
  completedTrainings: CompletedTraining[]
  // The form's "Completed Training" question carries an "Others, please specify" option —
  // free text alongside the fixed checkbox list, for a training not covered by COMPLETED_TRAININGS.
  otherCompletedTraining?: string
  ageLevelSpecialization?: AgeLevelSpecialization
  completedCertificates: CompletedCertificate[]
  // ISO "YYYY-MM-DD", same as `birthday` above (a native date picker, not free text) — a
  // profile saved before this field became a real date just shows blank here until
  // re-entered, same trade-off `birthday` already accepted.
  firstRegistrationDate?: string
  // Auto-calculated from `firstRegistrationDate` (whole years elapsed to today) rather than
  // typed in — see yearsSince() in useTrainingProfileFormModal.ts. Still stored as its own
  // field (not derived on read) so the roster table and exports don't need `firstRegistrationDate`
  // recomputed through just to display it.
  totalYearsInScouting?: string
  createdAt: string
  createdBy: string
}
