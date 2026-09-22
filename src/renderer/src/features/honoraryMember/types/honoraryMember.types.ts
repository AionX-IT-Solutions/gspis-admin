// Honorary Member — the persistent person profile, separate from HonoraryMemberRegistration
// (types/honoraryMemberRegistration.types.ts), which is a frozen-at-save-time filing record
// (one per school year). Mirrors the Troop/DistrictCommittee/BarangayCommittee/TrefoilGuild
// split of "the ongoing entity" vs "this year's registration form" — adapted here for a module
// with no roster, where the "entity" is simply the one honoree.

export type HonoraryMemberCivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated'
export type HonoraryMemberSex = 'Male' | 'Female'

export interface HonoraryMember {
  id: string
  lastName: string
  firstName: string
  middleInitial: string
  civilStatus: HonoraryMemberCivilStatus | ''
  sex: HonoraryMemberSex | ''
  council: string
  region: string
  nhq: string
  /** Which of the Council's 33 districts (shared/data/districts.data.ts) this member belongs
   *  to — lets the Membership Status Report group this record into the right row. */
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
