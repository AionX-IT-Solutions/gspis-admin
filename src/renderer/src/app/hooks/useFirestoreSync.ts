import { useEffect } from 'react'
import { useHRStore } from '@/features/hr/store/hr.store'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useDailyCollectionsStore } from '@/features/accounting/store/dailyCollections.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useCategoriesStore } from '@/features/pos/store/categories.store'
import { useGoalsStore } from '@/features/goals/store/goals.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useVisitorsStore } from '@/features/visitors/store/visitors.store'
import { useActivitiesStore } from '@/features/activities/store/activities.store'
import { useCashReceiptsStore } from '@/features/scrd/store/cashReceipts.store'
import { useBanksStore } from '@/features/scrd/store/banks.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { useProgramReportsStore } from '@/features/programReports/store/programReports.store'
import { useProgramReportSectionMetaStore } from '@/features/programReports/store/programReportSectionMeta.store'
import { useTrainingReportsStore } from '@/features/trainingReports/store/trainingReports.store'
import { useAnnouncementsStore } from '@/features/announcements/store/announcements.store'
import { useBudgetStore } from '@/features/budget/store/budget.store'
import { useBudgetSourceMappingsStore } from '@/features/budget/store/budgetSourceMappings.store'
import { useCouncilDepositsStore } from '@/features/councilDeposits/store/councilDeposits.store'
import { useExpenseSummaryStore } from '@/features/expenseSummary/store/expenseSummary.store'
import { useTrainingProfilesStore } from '@/features/trainingProfiles/store/trainingProfiles.store'
import { useCouncilBoardStore } from '@/features/councilBoard/store/councilBoard.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
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
import { useIccgMemberStore } from '@/features/iccgRegistration/store/iccgMember.store'
import { useMembershipGoalsStore } from '@/features/membershipStatusReport/store/membershipGoals.store'
import { useMembershipDailyCollectionsStore } from '@/features/membershipReports/store/membershipDailyCollections.store'

/**
 * Loads every module's data from Firestore once per session (each store seeds its own
 * collections from the app's built-in starting data on first run if they're still empty).
 * Mounted once, in the authenticated shell — the Audit Log page hydrates separately since
 * only admin/super_admin can read it.
 */
export function useFirestoreSync() {
  const hydrateHR = useHRStore((s) => s.hydrate)
  const hydrateAccounting = useAccountingStore((s) => s.hydrate)
  const hydrateDailyCollections = useDailyCollectionsStore((s) => s.hydrate)
  const hydratePOS = usePOSStore((s) => s.hydrate)
  const hydrateCategories = useCategoriesStore((s) => s.hydrate)
  const hydrateGoals = useGoalsStore((s) => s.hydrate)
  const hydrateRentals = useRentalsStore((s) => s.hydrate)
  const hydrateVisitors = useVisitorsStore((s) => s.hydrate)
  const hydrateActivities = useActivitiesStore((s) => s.hydrate)
  const hydrateCashReceipts = useCashReceiptsStore((s) => s.hydrate)
  const hydrateBanks = useBanksStore((s) => s.hydrate)
  const hydrateVouchers = useVouchersStore((s) => s.hydrate)
  const hydrateTroops = useTroopsStore((s) => s.hydrate)
  const hydrateOrgSettings = useOrgSettingsStore((s) => s.hydrate)
  const hydratePermissions = usePermissionsStore((s) => s.hydrate)
  const hydrateProgramReports = useProgramReportsStore((s) => s.hydrate)
  const hydrateProgramReportSectionMeta = useProgramReportSectionMetaStore((s) => s.hydrate)
  const hydrateTrainingReports = useTrainingReportsStore((s) => s.hydrate)
  const hydrateAnnouncements = useAnnouncementsStore((s) => s.hydrate)
  const hydrateBudget = useBudgetStore((s) => s.hydrate)
  const hydrateBudgetSourceMappings = useBudgetSourceMappingsStore((s) => s.hydrate)
  const hydrateCouncilDeposits = useCouncilDepositsStore((s) => s.hydrate)
  const hydrateExpenseSummary = useExpenseSummaryStore((s) => s.hydrate)
  const hydrateTrainingProfiles = useTrainingProfilesStore((s) => s.hydrate)
  const hydrateCouncilBoard = useCouncilBoardStore((s) => s.hydrate)
  const hydrateTroopRegistration = useTroopRegistrationStore((s) => s.hydrate)
  const hydrateDistrictCommittee = useDistrictCommitteeStore((s) => s.hydrate)
  const hydrateDistrictCommitteeRegistration = useDistrictCommitteeRegistrationStore(
    (s) => s.hydrate
  )
  const hydrateBarangayCommittee = useBarangayCommitteeStore((s) => s.hydrate)
  const hydrateBarangayCommitteeRegistration = useBarangayCommitteeRegistrationStore(
    (s) => s.hydrate
  )
  const hydrateTrefoilGuild = useTrefoilGuildStore((s) => s.hydrate)
  const hydrateTrefoilGuildRegistration = useTrefoilGuildRegistrationStore((s) => s.hydrate)
  const hydrateOavfMember = useOavfMemberStore((s) => s.hydrate)
  const hydrateOavf = useOavfStore((s) => s.hydrate)
  const hydrateHonoraryMember = useHonoraryMemberStore((s) => s.hydrate)
  const hydrateHonoraryMemberRegistration = useHonoraryMemberRegistrationStore((s) => s.hydrate)
  const hydrateAssociateMember = useAssociateMemberStore((s) => s.hydrate)
  const hydrateAssociateMemberRegistration = useAssociateMemberRegistrationStore((s) => s.hydrate)
  const hydrateIccgRegistration = useIccgRegistrationStore((s) => s.hydrate)
  const hydrateIccgMember = useIccgMemberStore((s) => s.hydrate)
  const hydrateMembershipGoals = useMembershipGoalsStore((s) => s.hydrate)
  const hydrateMembershipDailyCollections = useMembershipDailyCollectionsStore((s) => s.hydrate)

  useEffect(() => {
    hydrateHR()
    hydrateAccounting()
    hydrateDailyCollections()
    hydratePOS()
    hydrateCategories()
    hydrateGoals()
    hydrateRentals()
    hydrateVisitors()
    hydrateActivities()
    hydrateCashReceipts()
    hydrateBanks()
    hydrateVouchers()
    hydrateTroops()
    hydrateOrgSettings()
    hydratePermissions()
    hydrateProgramReports()
    hydrateProgramReportSectionMeta()
    hydrateTrainingReports()
    hydrateAnnouncements()
    hydrateBudget()
    hydrateBudgetSourceMappings()
    hydrateCouncilDeposits()
    hydrateExpenseSummary()
    hydrateTrainingProfiles()
    hydrateCouncilBoard()
    hydrateTroopRegistration()
    hydrateDistrictCommittee()
    hydrateDistrictCommitteeRegistration()
    hydrateBarangayCommittee()
    hydrateBarangayCommitteeRegistration()
    hydrateTrefoilGuild()
    hydrateTrefoilGuildRegistration()
    hydrateOavfMember()
    hydrateOavf()
    hydrateHonoraryMember()
    hydrateHonoraryMemberRegistration()
    hydrateAssociateMember()
    hydrateAssociateMemberRegistration()
    hydrateIccgRegistration()
    hydrateIccgMember()
    hydrateMembershipGoals()
    hydrateMembershipDailyCollections()
  }, [
    hydrateHR,
    hydrateAccounting,
    hydrateDailyCollections,
    hydratePOS,
    hydrateCategories,
    hydrateGoals,
    hydrateRentals,
    hydrateVisitors,
    hydrateActivities,
    hydrateCashReceipts,
    hydrateBanks,
    hydrateVouchers,
    hydrateTroops,
    hydrateOrgSettings,
    hydratePermissions,
    hydrateProgramReports,
    hydrateProgramReportSectionMeta,
    hydrateTrainingReports,
    hydrateAnnouncements,
    hydrateBudget,
    hydrateBudgetSourceMappings,
    hydrateCouncilDeposits,
    hydrateExpenseSummary,
    hydrateTrainingProfiles,
    hydrateCouncilBoard,
    hydrateTroopRegistration,
    hydrateDistrictCommittee,
    hydrateDistrictCommitteeRegistration,
    hydrateBarangayCommittee,
    hydrateBarangayCommitteeRegistration,
    hydrateTrefoilGuild,
    hydrateTrefoilGuildRegistration,
    hydrateOavfMember,
    hydrateOavf,
    hydrateHonoraryMember,
    hydrateHonoraryMemberRegistration,
    hydrateAssociateMember,
    hydrateAssociateMemberRegistration,
    hydrateIccgRegistration,
    hydrateIccgMember,
    hydrateMembershipGoals,
    hydrateMembershipDailyCollections
  ])
}
