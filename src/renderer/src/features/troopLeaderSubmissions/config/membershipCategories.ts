import {
  Award,
  Baby,
  Briefcase,
  Building2,
  Flower2,
  Handshake,
  Tent,
  type LucideIcon
} from 'lucide-react'
import { useTroopLeaderSubmissionsStore } from '../store/troopLeaderSubmissions.store'
import { useBarangayCommitteeSubmissionsStore } from '../store/barangayCommitteeSubmissions.store'
import { useDistrictCommitteeSubmissionsStore } from '../store/districtCommitteeSubmissions.store'
import { useTrefoilGuildSubmissionsStore } from '../store/trefoilGuildSubmissions.store'
import { useOavfSubmissionsStore } from '../store/oavfSubmissions.store'
import { useHonoraryMemberSubmissionsStore } from '../store/honoraryMemberSubmissions.store'
import { useAssociateMemberSubmissionsStore } from '../store/associateMemberSubmissions.store'
import { useIccgSubmissionsStore } from '../store/iccgSubmissions.store'
import type {
  LeaderSubmissionBase,
  LeaderSubmissionStatus
} from '../types/leaderSubmissionBase.types'
import type { LeaderTroopSubmission } from '../types/troopLeaderSubmission.types'
import type { LeaderBarangayCommitteeSubmission } from '../types/barangayCommitteeSubmission.types'
import type { LeaderDistrictCommitteeSubmission } from '../types/districtCommitteeSubmission.types'
import type { LeaderTrefoilGuildSubmission } from '../types/trefoilGuildSubmission.types'
import type { LeaderOavfSubmission } from '../types/oavfSubmission.types'
import type { LeaderHonoraryMemberSubmission } from '../types/honoraryMemberSubmission.types'
import type { LeaderAssociateMemberSubmission } from '../types/associateMemberSubmission.types'
import type { LeaderIccgSubmission } from '../types/iccgSubmission.types'
import { mergeTroopSubmission } from '@/features/troops/lib/mergeTroopSubmission'
import { mergeBarangayCommitteeSubmission } from '@/features/barangayCommittee/lib/mergeBarangayCommitteeSubmission'
import { mergeDistrictCommitteeSubmission } from '@/features/districtCommittee/lib/mergeDistrictCommitteeSubmission'
import { mergeTrefoilGuildSubmission } from '@/features/trefoilGuild/lib/mergeTrefoilGuildSubmission'
import { mergeOavfSubmission } from '@/features/oavf/lib/mergeOavfSubmission'
import { mergeHonoraryMemberSubmission } from '@/features/honoraryMember/lib/mergeHonoraryMemberSubmission'
import { mergeAssociateMemberSubmission } from '@/features/associateMember/lib/mergeAssociateMemberSubmission'
import { mergeIccgSubmission } from '@/features/iccgRegistration/lib/mergeIccgSubmission'

export interface DetailField {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (submission: any) => string | undefined
}

export interface RosterCard {
  title: string
  subtitle: string
}

export interface MembershipCategoryConfig {
  key: string
  collectionName: string
  tabLabelKey: string
  icon: LucideIcon
  hasRoster: boolean
  useStore: () => {
    submissions: LeaderSubmissionBase[]
    hydrated: boolean
    hydrate: (force?: boolean) => Promise<void>
    decideSubmission: (id: string, status: LeaderSubmissionStatus, notes?: string) => void
    deleteSubmission: (id: string) => void
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPrimaryLabel: (submission: any) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCount: (submission: any) => number | undefined
  detailFields: DetailField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRosterCards: (submission: any) => RosterCard[]
  /** Turns an approved submission into the real Troop/Committee/Member + roster + Registration
   *  — see features/troops/lib/mergeTroopSubmission.ts for the full rationale. Throws with a
   *  user-facing message on failure (caller shows it and leaves the submission pending). `extra`
   *  is only used by ICCG (the troop id picked via TroopPickerModal before Approve proceeds —
   *  see requiresTroopPick below). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  merge: (submission: any, extra?: unknown) => void
  /** True only for ICCG — its submission carries no troop link, so Approve must collect one via
   *  TroopPickerModal before merge() can run. */
  requiresTroopPick?: boolean
}

function joinTruthy(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' · ')
}

// One entry per Troops & Membership self-registration category, driving the tabs, each tab's
// DataTable, and the config-driven detail modal on the Membership Submissions page. Every
// category's decideSubmission/hydrate logic is identical (see createSubmissionsStore.ts) — only
// what's listed here (primary label, roster rendering, header fields) actually differs.
export const MEMBERSHIP_CATEGORIES: MembershipCategoryConfig[] = [
  {
    key: 'troop',
    collectionName: 'troopLeaderSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.troop',
    icon: Tent,
    hasRoster: true,
    useStore: useTroopLeaderSubmissionsStore,
    getPrimaryLabel: (s: LeaderTroopSubmission) => s.troopName || s.troopNumber || 'Untitled troop',
    getCount: (s: LeaderTroopSubmission) => s.members.length,
    detailFields: [
      { label: 'Troop #', get: (s: LeaderTroopSubmission) => s.troopNumber },
      { label: 'Troop Name', get: (s: LeaderTroopSubmission) => s.troopName },
      { label: 'Level', get: (s: LeaderTroopSubmission) => s.level },
      { label: 'Troop Leader', get: (s: LeaderTroopSubmission) => s.leaderName },
      { label: 'Co-Leader', get: (s: LeaderTroopSubmission) => s.assistantLeaderName },
      { label: 'School / Community', get: (s: LeaderTroopSubmission) => s.school },
      { label: 'Barangay', get: (s: LeaderTroopSubmission) => s.barangay },
      { label: 'Meeting Place', get: (s: LeaderTroopSubmission) => s.meetingPlace },
      { label: 'Troop Address', get: (s: LeaderTroopSubmission) => s.troopAddress },
      { label: 'Troop Tel. No.', get: (s: LeaderTroopSubmission) => s.troopTelNo },
      { label: 'District', get: (s: LeaderTroopSubmission) => s.district },
      { label: 'Sponsoring Group', get: (s: LeaderTroopSubmission) => s.sponsoringGroup }
    ],
    getRosterCards: (s: LeaderTroopSubmission) =>
      s.members.map((m) => ({
        title: m.fullName,
        subtitle: joinTruthy([m.birthdate, m.level, m.guardianName, m.guardianContact])
      })),
    merge: (s: LeaderTroopSubmission) => mergeTroopSubmission(s)
  },
  {
    key: 'barangayCommittee',
    collectionName: 'barangayCommitteeSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.barangayCommittee',
    icon: Building2,
    hasRoster: true,
    useStore: useBarangayCommitteeSubmissionsStore,
    getPrimaryLabel: (s: LeaderBarangayCommitteeSubmission) => s.name || 'Untitled committee',
    getCount: (s: LeaderBarangayCommitteeSubmission) => s.members.length,
    detailFields: [
      { label: 'Committee Name', get: (s: LeaderBarangayCommitteeSubmission) => s.name },
      { label: 'Address', get: (s: LeaderBarangayCommitteeSubmission) => s.address },
      { label: 'Tel. No.', get: (s: LeaderBarangayCommitteeSubmission) => s.telNo },
      {
        label: 'District Committee',
        get: (s: LeaderBarangayCommitteeSubmission) => s.districtCommitteeName
      },
      { label: 'District', get: (s: LeaderBarangayCommitteeSubmission) => s.district },
      { label: 'Region', get: (s: LeaderBarangayCommitteeSubmission) => s.region },
      { label: 'Council', get: (s: LeaderBarangayCommitteeSubmission) => s.council },
      { label: 'School Year', get: (s: LeaderBarangayCommitteeSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderBarangayCommitteeSubmission) => s.dateApplied }
    ],
    getRosterCards: (s: LeaderBarangayCommitteeSubmission) =>
      s.members.map((m) => ({
        title: `${m.fullName} — ${m.position}`,
        subtitle: joinTruthy([m.birthdate, m.groupRepresented])
      })),
    merge: (s: LeaderBarangayCommitteeSubmission) => mergeBarangayCommitteeSubmission(s)
  },
  {
    key: 'districtCommittee',
    collectionName: 'districtCommitteeSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.districtCommittee',
    icon: Building2,
    hasRoster: true,
    useStore: useDistrictCommitteeSubmissionsStore,
    getPrimaryLabel: (s: LeaderDistrictCommitteeSubmission) => s.name || 'Untitled committee',
    getCount: (s: LeaderDistrictCommitteeSubmission) => s.members.length,
    detailFields: [
      { label: 'Committee Name', get: (s: LeaderDistrictCommitteeSubmission) => s.name },
      { label: 'Address', get: (s: LeaderDistrictCommitteeSubmission) => s.address },
      { label: 'Tel. No.', get: (s: LeaderDistrictCommitteeSubmission) => s.telNo },
      { label: 'District', get: (s: LeaderDistrictCommitteeSubmission) => s.district },
      { label: 'Region', get: (s: LeaderDistrictCommitteeSubmission) => s.region },
      { label: 'Council', get: (s: LeaderDistrictCommitteeSubmission) => s.council },
      { label: 'School Year', get: (s: LeaderDistrictCommitteeSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderDistrictCommitteeSubmission) => s.dateApplied }
    ],
    getRosterCards: (s: LeaderDistrictCommitteeSubmission) =>
      s.members.map((m) => ({
        title: `${m.fullName} — ${m.position}`,
        subtitle: joinTruthy([m.birthdate, m.groupRepresented])
      })),
    merge: (s: LeaderDistrictCommitteeSubmission) => mergeDistrictCommitteeSubmission(s)
  },
  {
    key: 'trefoilGuild',
    collectionName: 'trefoilGuildSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.trefoilGuild',
    icon: Flower2,
    hasRoster: true,
    useStore: useTrefoilGuildSubmissionsStore,
    getPrimaryLabel: (s: LeaderTrefoilGuildSubmission) => s.name || 'Untitled guild',
    getCount: (s: LeaderTrefoilGuildSubmission) => s.members.length,
    detailFields: [
      { label: 'Guild Name', get: (s: LeaderTrefoilGuildSubmission) => s.name },
      { label: 'Guild Number', get: (s: LeaderTrefoilGuildSubmission) => s.guildNumber },
      { label: 'Address', get: (s: LeaderTrefoilGuildSubmission) => s.address },
      { label: 'Tel. No.', get: (s: LeaderTrefoilGuildSubmission) => s.telNo },
      { label: 'Email', get: (s: LeaderTrefoilGuildSubmission) => s.email },
      { label: 'District', get: (s: LeaderTrefoilGuildSubmission) => s.district },
      { label: 'Region', get: (s: LeaderTrefoilGuildSubmission) => s.region },
      { label: 'Council', get: (s: LeaderTrefoilGuildSubmission) => s.council },
      { label: 'School Year', get: (s: LeaderTrefoilGuildSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderTrefoilGuildSubmission) => s.dateApplied }
    ],
    getRosterCards: (s: LeaderTrefoilGuildSubmission) =>
      s.members.map((m) => ({
        title: `${m.fullName} — ${m.position}`,
        subtitle: joinTruthy([m.birthdate, m.beneficiary])
      })),
    merge: (s: LeaderTrefoilGuildSubmission) => mergeTrefoilGuildSubmission(s)
  },
  {
    key: 'oavf',
    collectionName: 'oavfSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.oavf',
    icon: Award,
    hasRoster: false,
    useStore: useOavfSubmissionsStore,
    getPrimaryLabel: (s: LeaderOavfSubmission) =>
      [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unnamed applicant',
    getCount: () => undefined,
    detailFields: [
      { label: 'Last Name', get: (s: LeaderOavfSubmission) => s.lastName },
      { label: 'First Name', get: (s: LeaderOavfSubmission) => s.firstName },
      { label: 'Middle Initial', get: (s: LeaderOavfSubmission) => s.middleInitial },
      { label: 'Civil Status', get: (s: LeaderOavfSubmission) => s.civilStatus },
      { label: 'Sex', get: (s: LeaderOavfSubmission) => s.sex },
      { label: 'Birthdate', get: (s: LeaderOavfSubmission) => s.birthdate },
      { label: 'Mobile No.', get: (s: LeaderOavfSubmission) => s.mobileNo },
      { label: 'Email', get: (s: LeaderOavfSubmission) => s.email },
      { label: 'Home Address', get: (s: LeaderOavfSubmission) => s.homeAddress },
      { label: 'Religion', get: (s: LeaderOavfSubmission) => s.religion },
      {
        label: 'Educational Attainment',
        get: (s: LeaderOavfSubmission) => s.educationalAttainment
      },
      { label: 'Profession', get: (s: LeaderOavfSubmission) => s.profession },
      { label: 'Occupation', get: (s: LeaderOavfSubmission) => s.occupation },
      { label: 'Interests', get: (s: LeaderOavfSubmission) => s.interests },
      { label: 'Other Org. Affiliated', get: (s: LeaderOavfSubmission) => s.otherOrgAffiliated },
      { label: 'Beneficiary', get: (s: LeaderOavfSubmission) => s.beneficiary },
      {
        label: 'Beneficiary Contact No.',
        get: (s: LeaderOavfSubmission) => s.beneficiaryContactNo
      },
      { label: 'Council', get: (s: LeaderOavfSubmission) => s.council },
      { label: 'Region', get: (s: LeaderOavfSubmission) => s.region },
      { label: 'District', get: (s: LeaderOavfSubmission) => s.district },
      { label: 'School Year', get: (s: LeaderOavfSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderOavfSubmission) => s.dateApplied },
      {
        label: 'Was a Girl Scout?',
        get: (s: LeaderOavfSubmission) => (s.wasGirlScout ? 'Yes' : 'No')
      },
      {
        label: 'GS Region',
        get: (s: LeaderOavfSubmission) => (s.wasGirlScout ? s.gsRegion : undefined)
      },
      {
        label: 'GS Council',
        get: (s: LeaderOavfSubmission) => (s.wasGirlScout ? s.gsCouncil : undefined)
      },
      {
        label: 'Date Last Registered',
        get: (s: LeaderOavfSubmission) => (s.wasGirlScout ? s.dateLastRegistered : undefined)
      },
      {
        label: 'GS Position',
        get: (s: LeaderOavfSubmission) => (s.wasGirlScout ? s.gsPosition : undefined)
      }
    ],
    getRosterCards: () => [],
    merge: (s: LeaderOavfSubmission) => mergeOavfSubmission(s)
  },
  {
    key: 'honoraryMember',
    collectionName: 'honoraryMemberSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.honoraryMember',
    icon: Handshake,
    hasRoster: false,
    useStore: useHonoraryMemberSubmissionsStore,
    getPrimaryLabel: (s: LeaderHonoraryMemberSubmission) =>
      [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unnamed applicant',
    getCount: () => undefined,
    detailFields: [
      { label: 'Last Name', get: (s: LeaderHonoraryMemberSubmission) => s.lastName },
      { label: 'First Name', get: (s: LeaderHonoraryMemberSubmission) => s.firstName },
      { label: 'Middle Initial', get: (s: LeaderHonoraryMemberSubmission) => s.middleInitial },
      { label: 'Civil Status', get: (s: LeaderHonoraryMemberSubmission) => s.civilStatus },
      { label: 'Sex', get: (s: LeaderHonoraryMemberSubmission) => s.sex },
      { label: 'Council', get: (s: LeaderHonoraryMemberSubmission) => s.council },
      { label: 'Region', get: (s: LeaderHonoraryMemberSubmission) => s.region },
      { label: 'NHQ', get: (s: LeaderHonoraryMemberSubmission) => s.nhq },
      { label: 'District', get: (s: LeaderHonoraryMemberSubmission) => s.district },
      { label: 'Home Address', get: (s: LeaderHonoraryMemberSubmission) => s.homeAddress },
      { label: 'Phone', get: (s: LeaderHonoraryMemberSubmission) => s.phone },
      { label: 'Email', get: (s: LeaderHonoraryMemberSubmission) => s.email },
      { label: 'Business Address', get: (s: LeaderHonoraryMemberSubmission) => s.businessAddress },
      { label: 'Business Phone', get: (s: LeaderHonoraryMemberSubmission) => s.businessPhone },
      { label: 'Profession', get: (s: LeaderHonoraryMemberSubmission) => s.profession },
      { label: 'Occupation', get: (s: LeaderHonoraryMemberSubmission) => s.occupation },
      { label: 'Beneficiary', get: (s: LeaderHonoraryMemberSubmission) => s.beneficiary },
      { label: 'School Year', get: (s: LeaderHonoraryMemberSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderHonoraryMemberSubmission) => s.dateApplied },
      {
        label: 'Was a Girl Scout?',
        get: (s: LeaderHonoraryMemberSubmission) => (s.wasGirlScout ? 'Yes' : 'No')
      },
      {
        label: 'Date Last Registered',
        get: (s: LeaderHonoraryMemberSubmission) =>
          s.wasGirlScout ? s.dateLastRegistered : undefined
      },
      {
        label: 'Position',
        get: (s: LeaderHonoraryMemberSubmission) => (s.wasGirlScout ? s.position : undefined)
      }
    ],
    getRosterCards: () => [],
    merge: (s: LeaderHonoraryMemberSubmission) => mergeHonoraryMemberSubmission(s)
  },
  {
    key: 'associateMember',
    collectionName: 'associateMemberSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.associateMember',
    icon: Briefcase,
    hasRoster: false,
    useStore: useAssociateMemberSubmissionsStore,
    getPrimaryLabel: (s: LeaderAssociateMemberSubmission) =>
      [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unnamed applicant',
    getCount: () => undefined,
    detailFields: [
      { label: 'Last Name', get: (s: LeaderAssociateMemberSubmission) => s.lastName },
      { label: 'First Name', get: (s: LeaderAssociateMemberSubmission) => s.firstName },
      { label: 'Middle Initial', get: (s: LeaderAssociateMemberSubmission) => s.middleInitial },
      { label: 'Civil Status', get: (s: LeaderAssociateMemberSubmission) => s.civilStatus },
      { label: 'Sex', get: (s: LeaderAssociateMemberSubmission) => s.sex },
      { label: 'Council', get: (s: LeaderAssociateMemberSubmission) => s.council },
      { label: 'Region', get: (s: LeaderAssociateMemberSubmission) => s.region },
      { label: 'District', get: (s: LeaderAssociateMemberSubmission) => s.district },
      { label: 'Home Address', get: (s: LeaderAssociateMemberSubmission) => s.homeAddress },
      { label: 'Phone', get: (s: LeaderAssociateMemberSubmission) => s.phone },
      { label: 'Email', get: (s: LeaderAssociateMemberSubmission) => s.email },
      { label: 'Business Address', get: (s: LeaderAssociateMemberSubmission) => s.businessAddress },
      { label: 'Business Phone', get: (s: LeaderAssociateMemberSubmission) => s.businessPhone },
      { label: 'Profession', get: (s: LeaderAssociateMemberSubmission) => s.profession },
      { label: 'Occupation', get: (s: LeaderAssociateMemberSubmission) => s.occupation },
      { label: 'Beneficiary', get: (s: LeaderAssociateMemberSubmission) => s.beneficiary },
      { label: 'School Year', get: (s: LeaderAssociateMemberSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderAssociateMemberSubmission) => s.dateApplied },
      {
        label: 'Was a Girl Scout?',
        get: (s: LeaderAssociateMemberSubmission) => (s.wasGirlScout ? 'Yes' : 'No')
      },
      {
        label: 'Date Last Registered',
        get: (s: LeaderAssociateMemberSubmission) =>
          s.wasGirlScout ? s.dateLastRegistered : undefined
      },
      {
        label: 'Position',
        get: (s: LeaderAssociateMemberSubmission) => (s.wasGirlScout ? s.position : undefined)
      }
    ],
    getRosterCards: () => [],
    merge: (s: LeaderAssociateMemberSubmission) => mergeAssociateMemberSubmission(s)
  },
  {
    key: 'iccg',
    collectionName: 'iccgSubmissions',
    tabLabelKey: 'troopLeaderSubmissions.tabs.iccg',
    icon: Baby,
    hasRoster: true,
    useStore: useIccgSubmissionsStore,
    getPrimaryLabel: (s: LeaderIccgSubmission) => s.school || 'Untitled ICCG filing',
    getCount: (s: LeaderIccgSubmission) => s.girls.length + s.adults.length,
    detailFields: [
      { label: 'School', get: (s: LeaderIccgSubmission) => s.school },
      { label: 'Age Level', get: (s: LeaderIccgSubmission) => s.ageLevel },
      { label: 'School Year', get: (s: LeaderIccgSubmission) => s.schoolYear },
      { label: 'Date Applied', get: (s: LeaderIccgSubmission) => s.dateApplied }
    ],
    getRosterCards: (s: LeaderIccgSubmission) => [
      ...s.girls.map((g) => ({
        title: g.fullName,
        subtitle: joinTruthy(['Girl', g.gradeYear, g.email])
      })),
      ...s.adults.map((a) => ({
        title: a.fullName,
        subtitle: joinTruthy(['Adult', a.email])
      }))
    ],
    merge: (s: LeaderIccgSubmission, troopId?: unknown) =>
      mergeIccgSubmission(s, troopId as string),
    requiresTroopPick: true
  }
]
