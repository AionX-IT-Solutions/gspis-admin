export const USER_ROLES = [
  'super_admin',
  'admin',
  'cashier',
  'accountant',
  'hr',
  'inventory_clerk',
  'manager'
] as const

export type UserRole = (typeof USER_ROLES)[number]

/** A role id — one of the built-in `UserRole` literals, or a custom role's slug.
 *  `string & {}` keeps literal-type autocomplete for the built-ins while still
 *  accepting any custom role string. */
export type RoleId = UserRole | (string & {})

/** A role added at runtime via the "Role Permissions" screen (Super Admin/Admin only).
 *  `baseRole` is what actually gets written as the user's real `role` (Firestore doc +
 *  Auth custom claim) — Firestore security rules and gspi-app (mobile) only ever
 *  understand the 7 built-in roles, so a custom role can't be a standalone access tier.
 *  The custom role id itself becomes a cosmetic label + desktop-only permission-checklist
 *  overlay, carried on the user doc as `customRoleId` (see users.store.ts). */
export interface CustomRole {
  id: string
  label: string
  baseRole: UserRole
}

export function isBuiltInRole(role: string): role is UserRole {
  return (USER_ROLES as readonly string[]).includes(role)
}

/** Resolves a role id to its display label — built-in roles go through i18n,
 *  custom roles use their stored (user-entered) label. */
export function resolveRoleLabel(
  role: string,
  t: (key: string) => string,
  customRoles: CustomRole[]
): string {
  if (isBuiltInRole(role)) return t(`roles.${role}`)
  return customRoles.find((r) => r.id === role)?.label ?? role
}

/** The single place a role-dropdown selection resolves to what actually gets written:
 *  a custom role always resolves to its `baseRole` (+ its id carried separately as
 *  `customRoleId`); a built-in role passes through unchanged with no custom id. */
export function resolveRoleAssignment(
  selected: RoleId,
  customRoles: CustomRole[]
): { role: UserRole; customRoleId: string | null } {
  const custom = customRoles.find((r) => r.id === selected)
  if (custom) return { role: custom.baseRole, customRoleId: custom.id }
  return { role: selected as UserRole, customRoleId: null }
}

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: '/dashboard',
  admin: '/dashboard',
  accountant: '/dashboard',
  cashier: '/pos',
  hr: '/employees',
  inventory_clerk: '/products',
  manager: '/dashboard'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  cashier: 'Cashier',
  accountant: 'Accountant',
  hr: 'HR',
  inventory_clerk: 'Inventory Clerk',
  manager: 'Manager'
}

/** Every capability the app understands — `view:x` (page visibility) and `manage:x` (create/edit/delete on that module). */
export const ALL_PERMISSIONS = [
  'view:dashboard',
  'view:pos',
  'manage:pos',
  'view:products',
  'manage:products',
  'view:members',
  'manage:members',
  'view:vendors',
  'manage:vendors',
  'view:reports',
  'manage:reports',
  'view:employees',
  'manage:employees',
  'view:councilBoard',
  'manage:councilBoard',
  'view:troops',
  'manage:troops',
  'view:troopRegistration',
  'manage:troopRegistration',
  'view:troopLeaderSubmissions',
  'manage:troopLeaderSubmissions',
  'view:districtCommittee',
  'manage:districtCommittee',
  'view:barangayCommittee',
  'manage:barangayCommittee',
  'view:trefoilGuild',
  'manage:trefoilGuild',
  'view:oavf',
  'manage:oavf',
  'view:honoraryMember',
  'manage:honoraryMember',
  'view:associateMember',
  'manage:associateMember',
  'view:iccgRegistration',
  'manage:iccgRegistration',
  'view:membershipStatusReport',
  'view:membershipReports',
  'manage:membershipReports',
  'view:activities',
  'manage:activities',
  'view:programReports',
  'manage:programReports',
  'view:trainingReports',
  'manage:trainingReports',
  'view:trainingProfiles',
  'manage:trainingProfiles',
  'view:attendance',
  'manage:attendance',
  'view:leave',
  'manage:leave',
  'view:payroll',
  'manage:payroll',
  'view:orgChart',
  'view:vouchers',
  'manage:vouchers',
  'view:rentals',
  'manage:rentals',
  'view:visitors',
  'manage:visitors',
  'view:facilityCalendar',
  'view:scrd',
  'manage:scrd',
  'manage:users',
  'view:auditLog',
  'view:goals',
  'manage:goals',
  'view:devices',
  'manage:devices',
  'view:announcements',
  'manage:announcements',
  'view:budget',
  'manage:budget',
  'view:ptdg',
  'manage:ptdg',
  'view:councilDeposits',
  'manage:councilDeposits'
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]

/** Route key -> permission required to reach it. `undefined` = reachable by any signed-in user
 *  (Settings/About are personal preferences, not system config — intentionally ungated). */
export const MODULE_PERMISSIONS: Record<string, Permission | undefined> = {
  dashboard: 'view:dashboard',
  announcements: 'view:announcements',
  budget: 'view:budget',
  pos: 'view:pos',
  products: 'view:products',
  members: 'view:members',
  vendors: 'view:vendors',
  reports: 'view:reports',
  employees: 'view:employees',
  councilBoard: 'view:councilBoard',
  troops: 'view:troops',
  troopRegistration: 'view:troopRegistration',
  troopLeaderSubmissions: 'view:troopLeaderSubmissions',
  districtCommittee: 'view:districtCommittee',
  barangayCommittee: 'view:barangayCommittee',
  trefoilGuild: 'view:trefoilGuild',
  oavf: 'view:oavf',
  honoraryMember: 'view:honoraryMember',
  associateMember: 'view:associateMember',
  iccgRegistration: 'view:iccgRegistration',
  membershipStatusReport: 'view:membershipStatusReport',
  membershipReports: 'view:membershipReports',
  activities: 'view:activities',
  programReports: 'view:programReports',
  trainingReports: 'view:trainingReports',
  trainingProfiles: 'view:trainingProfiles',
  attendance: 'view:attendance',
  leave: 'view:leave',
  payroll: 'view:payroll',
  orgChart: 'view:orgChart',
  vouchers: 'view:vouchers',
  rentals: 'view:rentals',
  visitors: 'view:visitors',
  facilityCalendar: 'view:facilityCalendar',
  scrd: 'view:scrd',
  users: 'manage:users',
  auditLog: 'view:auditLog',
  goals: 'view:goals',
  devices: 'view:devices',
  ptdg: 'view:ptdg',
  councilDeposits: 'view:councilDeposits',
  settings: undefined,
  about: undefined
}

/** Human-readable module names, keyed the same as `MODULE_PERMISSIONS` — used by the Role Permissions editor. */
export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  announcements: 'Announcements',
  budget: 'Council Budget',
  pos: 'Point of Sale',
  products: 'Inventory',
  members: 'Members',
  vendors: 'Vendors',
  reports: 'Reports',
  employees: 'Employees',
  councilBoard: 'Council Board',
  troops: 'Troops & Membership',
  troopRegistration: 'Troop Registration',
  troopLeaderSubmissions: 'Membership Submissions',
  districtCommittee: 'District Committee',
  barangayCommittee: 'Barangay Committee',
  trefoilGuild: 'Trefoil Guild',
  oavf: 'OAVF / Career Woman',
  honoraryMember: 'Honorary Members',
  associateMember: 'Associate Members',
  iccgRegistration: 'ICCG Registration',
  membershipStatusReport: 'Membership Status Report',
  membershipReports: 'Membership Reports',
  activities: 'Activities',
  programReports: 'Program Reports',
  trainingReports: 'Training Reports',
  trainingProfiles: 'Training Profiles',
  attendance: 'Attendance',
  leave: 'Leave Requests',
  payroll: 'Payroll',
  orgChart: 'Organizational Chart',
  vouchers: 'Vouchers',
  rentals: 'Rental Bookings',
  visitors: 'Visitors Logbook',
  facilityCalendar: 'Facility Calendar',
  scrd: 'Cash Receipts & Disb.',
  users: 'User Accounts',
  auditLog: 'Audit Log',
  goals: 'Goals & Objectives',
  devices: 'Devices',
  ptdg: 'Program & Training Development Grant (PTDG)',
  councilDeposits: 'Council Deposits (RHQ)'
}

/** Every module that has a real permission requirement, in nav order (excludes Settings/About). */
export const PERMISSION_MODULES = Object.keys(MODULE_PERMISSIONS).filter(
  (key) => MODULE_PERMISSIONS[key] !== undefined
)

/** Route path for each module key — same keys as `MODULE_PERMISSIONS`/`MODULE_LABELS`.
 *  Used by global search to link a matched module straight to its page. */
export const MODULE_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  announcements: '/announcements',
  budget: '/budget',
  pos: '/pos',
  products: '/products',
  members: '/members',
  vendors: '/vendors',
  reports: '/reports',
  employees: '/employees',
  councilBoard: '/council-board',
  troops: '/troops',
  troopRegistration: '/troops',
  troopLeaderSubmissions: '/troop-leader-submissions',
  districtCommittee: '/district-committee',
  barangayCommittee: '/barangay-committee',
  trefoilGuild: '/trefoil-guild',
  oavf: '/oavf',
  honoraryMember: '/honorary-members',
  associateMember: '/associate-members',
  iccgRegistration: '/iccg-registrations',
  membershipStatusReport: '/membership-status-report',
  membershipReports: '/membership-reports',
  activities: '/activities',
  programReports: '/program-reports',
  trainingReports: '/training-reports',
  trainingProfiles: '/training-profiles',
  attendance: '/attendance',
  leave: '/leave',
  payroll: '/payroll',
  orgChart: '/org-chart',
  vouchers: '/vouchers',
  rentals: '/rentals',
  visitors: '/visitors',
  facilityCalendar: '/facility-calendar',
  scrd: '/scrd',
  users: '/users',
  auditLog: '/audit-log',
  goals: '/goals',
  devices: '/devices',
  ptdg: '/ptdg',
  councilDeposits: '/council-deposits',
  settings: '/settings',
  about: '/about'
}

/** Roles staff accounts can be assigned to. Excludes `super_admin`, which is always
 *  full-access and reserved for the bootstrap owner account (not assignable/editable via the UI). */
export const ASSIGNABLE_USER_ROLES = USER_ROLES.filter((role) => role !== 'super_admin')

export function permissionsForModule(moduleKey: string): Permission[] {
  return ALL_PERMISSIONS.filter((p) => p.endsWith(`:${moduleKey}`))
}

/** Default permission set per role — seed data for the permissions store, one-to-one with the
 *  access every role already had under the old route->role[] map, so default behavior doesn't change. */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  admin: [...ALL_PERMISSIONS],
  cashier: [
    'view:pos',
    'view:products',
    'manage:products',
    'view:members',
    'manage:members',
    'view:rentals',
    'manage:rentals',
    'view:visitors',
    'manage:visitors',
    'view:facilityCalendar',
    'view:announcements'
  ],
  accountant: [
    'view:dashboard',
    'view:products',
    'manage:products',
    'view:vendors',
    'manage:vendors',
    'view:reports',
    'manage:reports',
    'view:payroll',
    'manage:payroll',
    'view:vouchers',
    'manage:vouchers',
    'view:scrd',
    'manage:scrd',
    'view:goals',
    'manage:goals',
    'view:announcements',
    'view:budget',
    'manage:budget',
    'view:ptdg',
    'manage:ptdg',
    'view:councilDeposits',
    'manage:councilDeposits'
  ],
  hr: [
    'view:dashboard',
    'view:employees',
    'manage:employees',
    'view:councilBoard',
    'manage:councilBoard',
    'view:attendance',
    'manage:attendance',
    'view:leave',
    'manage:leave',
    'view:payroll',
    'manage:payroll',
    'view:orgChart',
    'view:troops',
    'manage:troops',
    'view:troopRegistration',
    'manage:troopRegistration',
    'view:troopLeaderSubmissions',
    'manage:troopLeaderSubmissions',
    'view:districtCommittee',
    'manage:districtCommittee',
    'view:barangayCommittee',
    'manage:barangayCommittee',
    'view:trefoilGuild',
    'manage:trefoilGuild',
    'view:oavf',
    'manage:oavf',
    'view:honoraryMember',
    'manage:honoraryMember',
    'view:associateMember',
    'manage:associateMember',
    'view:iccgRegistration',
    'manage:iccgRegistration',
    'view:membershipStatusReport',
    'view:membershipReports',
    'manage:membershipReports',
    'view:activities',
    'manage:activities',
    'view:programReports',
    'manage:programReports',
    'view:trainingReports',
    'manage:trainingReports',
    'view:trainingProfiles',
    'manage:trainingProfiles',
    'view:visitors',
    'manage:visitors',
    'view:facilityCalendar',
    'view:announcements'
  ],
  inventory_clerk: ['view:products', 'manage:products', 'view:announcements'],
  manager: [
    'view:dashboard',
    'view:members',
    'manage:members',
    'view:reports',
    'view:orgChart',
    'view:councilBoard',
    'view:troops',
    'manage:troops',
    'view:troopRegistration',
    'manage:troopRegistration',
    'view:troopLeaderSubmissions',
    'manage:troopLeaderSubmissions',
    'view:districtCommittee',
    'manage:districtCommittee',
    'view:barangayCommittee',
    'manage:barangayCommittee',
    'view:trefoilGuild',
    'manage:trefoilGuild',
    'view:oavf',
    'manage:oavf',
    'view:honoraryMember',
    'manage:honoraryMember',
    'view:associateMember',
    'manage:associateMember',
    'view:iccgRegistration',
    'manage:iccgRegistration',
    'view:membershipStatusReport',
    'view:membershipReports',
    'manage:membershipReports',
    'view:activities',
    'manage:activities',
    'view:programReports',
    'manage:programReports',
    'view:trainingReports',
    'manage:trainingReports',
    'view:trainingProfiles',
    'manage:trainingProfiles',
    'view:vouchers',
    'manage:vouchers',
    'view:rentals',
    'manage:rentals',
    'view:visitors',
    'manage:visitors',
    'view:facilityCalendar',
    'view:scrd',
    'manage:scrd',
    'view:goals',
    'manage:goals',
    'view:announcements',
    'view:budget',
    'view:ptdg'
  ]
}
