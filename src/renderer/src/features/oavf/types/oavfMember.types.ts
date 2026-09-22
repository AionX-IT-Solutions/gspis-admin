// OAVF (Other Adult Volunteer)/Career Woman Member — the persistent person profile, separate
// from OavfRegistration (types/oavf.types.ts), which is a frozen-at-save-time filing record
// (one per school year). Mirrors the Troop/DistrictCommittee/BarangayCommittee/TrefoilGuild
// split of "the ongoing entity" vs "this year's registration form" — adapted here for a module
// with no roster, where the "entity" is simply the one applicant.

export type OavfCivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated'
export type OavfSex = 'Male' | 'Female'

export interface OavfMember {
  id: string
  lastName: string
  firstName: string
  middleInitial: string
  civilStatus: OavfCivilStatus | ''
  sex: OavfSex | ''
  birthdate: string
  mobileNo: string
  email: string
  homeAddress: string
  religion: string
  educationalAttainment: string
  profession: string
  occupation: string
  interests: string
  otherOrgAffiliated: string
  beneficiary: string
  beneficiaryContactNo: string
  council: string
  region: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this applicant
   *  belongs to — lets the Membership Status Report group this record into the right row. */
  district?: string
  isActive: boolean
}
