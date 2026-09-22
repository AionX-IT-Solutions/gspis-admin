// Associate Member — the persistent person profile, separate from AssociateMemberRegistration
// (types/associateMemberRegistration.types.ts), which is a frozen-at-save-time filing record
// (one per school year, one AMF booklet page each). Mirrors the Troop/DistrictCommittee/
// BarangayCommittee/TrefoilGuild split of "the ongoing entity" vs "this year's registration
// form" — adapted here for a module with no roster, where the "entity" is simply the one
// applicant.

export type AssociateMemberCivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated'
export type AssociateMemberSex = 'Male' | 'Female'

export interface AssociateMember {
  id: string
  lastName: string
  firstName: string
  middleInitial: string
  civilStatus: AssociateMemberCivilStatus | ''
  sex: AssociateMemberSex | ''
  council: string
  region: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this applicant
   *  belongs to — lets the Membership Status Report group this record into the right row. */
  district?: string
  homeAddress: string
  phone: string
  email: string
  businessAddress: string
  businessPhone: string
  profession: string
  occupation: string
  beneficiary: string
  isActive: boolean
}
