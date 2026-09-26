import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TitleBar } from './layout/TitleBar'
import { Sidebar } from './layout/Sidebar'
import { Breadcrumb } from '@/shared/components/ui/Breadcrumb'
import { Toaster } from '@/shared/components/ui/Toaster'
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary'
import { RequirePermission } from './components/RequirePermission'
import { useTheme } from './hooks/useTheme'
import { useAnalytics } from './hooks/useAnalytics'
import { useUpdateStatus } from './hooks/useUpdateStatus'
import { useFirebaseAuthBridge } from './hooks/useFirebaseAuthBridge'
import { useFirestoreSync } from './hooks/useFirestoreSync'
import { useHikvisionAttendanceBridge } from './hooks/useHikvisionAttendanceBridge'
import { useAppStore } from './store/app.store'
import { MODULE_PERMISSIONS } from './lib/permissions'

// Lazy-loaded views — each view is a separate chunk
const Dashboard = lazy(() =>
  import('@/features/dashboard/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
)
const Announcements = lazy(() =>
  import('@/features/announcements/pages/Announcements').then((m) => ({
    default: m.Announcements
  }))
)
const Budget = lazy(() =>
  import('@/features/budget/pages/Budget').then((m) => ({ default: m.Budget }))
)
const Vendors = lazy(() =>
  import('@/features/accounting/pages/Vendors').then((m) => ({ default: m.Vendors }))
)
const Reports = lazy(() =>
  import('@/features/accounting/pages/Reports').then((m) => ({ default: m.Reports }))
)
const Settings = lazy(() =>
  import('@/features/settings/pages/Settings').then((m) => ({ default: m.Settings }))
)
const Devices = lazy(() =>
  import('@/features/settings/pages/Devices').then((m) => ({ default: m.Devices }))
)
const Profile = lazy(() =>
  import('@/features/profile/pages/Profile').then((m) => ({ default: m.Profile }))
)
const About = lazy(() => import('@/features/about/pages/About').then((m) => ({ default: m.About })))
const Manual = lazy(() =>
  import('@/features/manual/pages/Manual').then((m) => ({ default: m.Manual }))
)
const Login = lazy(() => import('@/features/auth/pages/Login').then((m) => ({ default: m.Login })))
const POS = lazy(() => import('@/features/pos/pages/POS').then((m) => ({ default: m.POS })))
const Products = lazy(() =>
  import('@/features/pos/pages/Products').then((m) => ({ default: m.Products }))
)
const Members = lazy(() =>
  import('@/features/pos/pages/Members').then((m) => ({ default: m.Members }))
)
const CouncilBoard = lazy(() =>
  import('@/features/councilBoard/pages/CouncilBoard').then((m) => ({ default: m.CouncilBoard }))
)
const CouncilBoardProfile = lazy(() =>
  import('@/features/councilBoard/pages/CouncilBoardProfile').then((m) => ({
    default: m.CouncilBoardProfile
  }))
)
const Employees = lazy(() =>
  import('@/features/hr/pages/Employees').then((m) => ({ default: m.Employees }))
)
const EmployeeProfile = lazy(() =>
  import('@/features/hr/pages/EmployeeProfile').then((m) => ({ default: m.EmployeeProfile }))
)
const Troops = lazy(() =>
  import('@/features/troops/pages/Troops').then((m) => ({ default: m.Troops }))
)
const TroopProfile = lazy(() =>
  import('@/features/troops/pages/TroopProfile').then((m) => ({ default: m.TroopProfile }))
)
const TroopRegistrationForm = lazy(() =>
  import('@/features/troopRegistration/pages/TroopRegistrationForm').then((m) => ({
    default: m.TroopRegistrationForm
  }))
)
const TroopLeaderSubmissions = lazy(() =>
  import('@/features/troopLeaderSubmissions/pages/TroopLeaderSubmissions').then((m) => ({
    default: m.TroopLeaderSubmissions
  }))
)
const DistrictCommittees = lazy(() =>
  import('@/features/districtCommittee/pages/DistrictCommittees').then((m) => ({
    default: m.DistrictCommittees
  }))
)
const DistrictCommitteeRegistrationForm = lazy(() =>
  import('@/features/districtCommittee/pages/DistrictCommitteeRegistrationForm').then((m) => ({
    default: m.DistrictCommitteeRegistrationForm
  }))
)
const BarangayCommittees = lazy(() =>
  import('@/features/barangayCommittee/pages/BarangayCommittees').then((m) => ({
    default: m.BarangayCommittees
  }))
)
const BarangayCommitteeRegistrationForm = lazy(() =>
  import('@/features/barangayCommittee/pages/BarangayCommitteeRegistrationForm').then((m) => ({
    default: m.BarangayCommitteeRegistrationForm
  }))
)
const TrefoilGuilds = lazy(() =>
  import('@/features/trefoilGuild/pages/TrefoilGuilds').then((m) => ({ default: m.TrefoilGuilds }))
)
const TrefoilGuildRegistrationForm = lazy(() =>
  import('@/features/trefoilGuild/pages/TrefoilGuildRegistrationForm').then((m) => ({
    default: m.TrefoilGuildRegistrationForm
  }))
)
const OavfRegistrations = lazy(() =>
  import('@/features/oavf/pages/OavfRegistrations').then((m) => ({ default: m.OavfRegistrations }))
)
const HonoraryMembers = lazy(() =>
  import('@/features/honoraryMember/pages/HonoraryMembers').then((m) => ({
    default: m.HonoraryMembers
  }))
)
const AssociateMembers = lazy(() =>
  import('@/features/associateMember/pages/AssociateMembers').then((m) => ({
    default: m.AssociateMembers
  }))
)
const IccgRegistrations = lazy(() =>
  import('@/features/iccgRegistration/pages/IccgRegistrations').then((m) => ({
    default: m.IccgRegistrations
  }))
)
const IccgRegistrationForm = lazy(() =>
  import('@/features/iccgRegistration/pages/IccgRegistrationForm').then((m) => ({
    default: m.IccgRegistrationForm
  }))
)
const MembershipStatusReport = lazy(() =>
  import('@/features/membershipStatusReport/pages/MembershipStatusReport').then((m) => ({
    default: m.MembershipStatusReport
  }))
)
const MembershipReports = lazy(() =>
  import('@/features/membershipReports/pages/MembershipReports').then((m) => ({
    default: m.MembershipReports
  }))
)
const Activities = lazy(() =>
  import('@/features/activities/pages/Activities').then((m) => ({ default: m.Activities }))
)
const Attendance = lazy(() =>
  import('@/features/hr/pages/Attendance').then((m) => ({ default: m.Attendance }))
)
const BiometricEnrollment = lazy(() =>
  import('@/features/hr/pages/BiometricEnrollment').then((m) => ({
    default: m.BiometricEnrollment
  }))
)
const Leave = lazy(() => import('@/features/hr/pages/Leave').then((m) => ({ default: m.Leave })))
const Payroll = lazy(() =>
  import('@/features/hr/pages/Payroll').then((m) => ({ default: m.Payroll }))
)
const OrgChart = lazy(() =>
  import('@/features/hr/pages/OrgChart').then((m) => ({ default: m.OrgChart }))
)
const Vouchers = lazy(() =>
  import('@/features/vouchers/pages/Vouchers').then((m) => ({ default: m.Vouchers }))
)
const Ptdg = lazy(() => import('@/features/ptdg/pages/Ptdg').then((m) => ({ default: m.Ptdg })))
const CouncilDeposits = lazy(() =>
  import('@/features/councilDeposits/pages/CouncilDeposits').then((m) => ({
    default: m.CouncilDeposits
  }))
)
const Rentals = lazy(() =>
  import('@/features/rentals/pages/Rentals').then((m) => ({ default: m.Rentals }))
)
const Visitors = lazy(() =>
  import('@/features/visitors/pages/Visitors').then((m) => ({ default: m.Visitors }))
)
const FacilityCalendar = lazy(() =>
  import('@/features/facility-calendar/pages/FacilityCalendar').then((m) => ({
    default: m.FacilityCalendar
  }))
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/Users').then((m) => ({ default: m.Users }))
)
const AuditLog = lazy(() =>
  import('@/features/audit-log/pages/AuditLog').then((m) => ({ default: m.AuditLog }))
)
const SCRD = lazy(() => import('@/features/scrd/pages/SCRD').then((m) => ({ default: m.SCRD })))
const Goals = lazy(() => import('@/features/goals/pages/Goals').then((m) => ({ default: m.Goals })))
const ProgramReports = lazy(() =>
  import('@/features/programReports/pages/ProgramReports').then((m) => ({
    default: m.ProgramReports
  }))
)
const TrainingReports = lazy(() =>
  import('@/features/trainingReports/pages/TrainingReports').then((m) => ({
    default: m.TrainingReports
  }))
)
const TrainingProfiles = lazy(() =>
  import('@/features/trainingProfiles/pages/TrainingProfiles').then((m) => ({
    default: m.TrainingProfiles
  }))
)

function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid var(--border-default)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.7s linear infinite',
          boxShadow: '0 0 12px var(--accent-primary-glow)'
        }}
      />
    </motion.div>
  )
}

function AuthenticatedShell() {
  useFirestoreSync()
  useHikvisionAttendanceBridge()

  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Breadcrumb />
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.dashboard}>
                      <Dashboard />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.announcements}>
                      <Announcements />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/budget"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.budget}>
                      <Budget />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.pos}>
                      <POS />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.products}>
                      <Products />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.members}>
                      <Members />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.employees}>
                      <Employees />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/employees/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.employees}>
                      <EmployeeProfile />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/council-board"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.councilBoard}>
                      <CouncilBoard />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/council-board/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.councilBoard}>
                      <CouncilBoardProfile />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/troops"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.troops}>
                      <Troops />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/troops/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.troops}>
                      <TroopProfile />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/troop-registration/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.troopRegistration}>
                      <TroopRegistrationForm />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/troop-leader-submissions"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.troopLeaderSubmissions}>
                      <TroopLeaderSubmissions />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/district-committee"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.districtCommittee}>
                      <DistrictCommittees />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/district-committee-registration/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.districtCommittee}>
                      <DistrictCommitteeRegistrationForm />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/barangay-committee"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.barangayCommittee}>
                      <BarangayCommittees />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/barangay-committee-registration/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.barangayCommittee}>
                      <BarangayCommitteeRegistrationForm />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/trefoil-guild"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.trefoilGuild}>
                      <TrefoilGuilds />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/trefoil-guild-registration/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.trefoilGuild}>
                      <TrefoilGuildRegistrationForm />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/oavf"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.oavf}>
                      <OavfRegistrations />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/honorary-members"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.honoraryMember}>
                      <HonoraryMembers />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/associate-members"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.associateMember}>
                      <AssociateMembers />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/iccg-registrations"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.iccgRegistration}>
                      <IccgRegistrations />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/iccg-registration/:id"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.iccgRegistration}>
                      <IccgRegistrationForm />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/membership-status-report"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.membershipStatusReport}>
                      <MembershipStatusReport />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/membership-reports"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.membershipReports}>
                      <MembershipReports />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.activities}>
                      <Activities />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.attendance}>
                      <Attendance />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/attendance/enrollment"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.attendance}>
                      <BiometricEnrollment />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/leave"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.leave}>
                      <Leave />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.payroll}>
                      <Payroll />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/org-chart"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.orgChart}>
                      <OrgChart />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/vouchers"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.vouchers}>
                      <Vouchers />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/ptdg"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.ptdg}>
                      <Ptdg />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/council-deposits"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.councilDeposits}>
                      <CouncilDeposits />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/rentals"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.rentals}>
                      <Rentals />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/visitors"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.visitors}>
                      <Visitors />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/facility-calendar"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.facilityCalendar}>
                      <FacilityCalendar />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.users}>
                      <UsersPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/audit-log"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.auditLog}>
                      <AuditLog />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/scrd"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.scrd}>
                      <SCRD />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/vendors"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.vendors}>
                      <Vendors />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.reports}>
                      <Reports />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.goals}>
                      <Goals />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/program-reports"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.programReports}>
                      <ProgramReports />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/training-reports"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.trainingReports}>
                      <TrainingReports />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/training-profiles"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.trainingProfiles}>
                      <TrainingProfiles />
                    </RequirePermission>
                  }
                />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/devices"
                  element={
                    <RequirePermission permission={MODULE_PERMISSIONS.devices}>
                      <Devices />
                    </RequirePermission>
                  }
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="/manual" element={<Manual />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function AuthLoadingShell() {
  return (
    <div className="app-shell">
      <TitleBar />
      <div style={{ flex: 1, display: 'flex' }}>
        <PageLoader />
      </div>
    </div>
  )
}

function UnauthenticatedShell() {
  return (
    <div className="app-shell">
      <TitleBar />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

function AppInner() {
  useTheme()
  useAnalytics()
  useUpdateStatus()
  useFirebaseAuthBridge()
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const authLoading = useAppStore((s) => s.authLoading)

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {authLoading ? (
          <AuthLoadingShell key="auth-loading" />
        ) : isAuthenticated ? (
          <AuthenticatedShell key="app" />
        ) : (
          <UnauthenticatedShell key="login" />
        )}
      </AnimatePresence>
      <Toaster />
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  )
}
