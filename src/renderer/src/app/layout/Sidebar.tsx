import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  BookOpen,
  FileText,
  Users,
  Truck,
  BarChart3,
  ShoppingCart,
  Boxes,
  UserCog,
  Fingerprint,
  CalendarClock,
  CalendarDays,
  Wallet,
  Briefcase,
  Calculator,
  Ticket,
  Building2,
  ShieldCheck,
  ClipboardList,
  UserCog2,
  Target,
  Usb,
  Network,
  Tent,
  UserCheck,
  GraduationCap,
  Megaphone,
  Wallet2,
  CalendarRange,
  Award,
  Landmark,
  IdCard,
  ClipboardCheck
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/app.store'
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode
} from 'react'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { usePermissions } from '../hooks/usePermissions'
import { useRoleLabel } from '../hooks/useRoleLabel'
import { MODULE_PERMISSIONS, type Permission } from '../lib/permissions'

interface NavItem {
  path: string
  labelKey: string
  icon: ReactNode
  permission?: Permission
}

interface NavGroup {
  titleKey: string
  icon: ReactNode
  items: NavItem[]
}

// Ungrouped, always at the top of the nav list
const coreNavItems: NavItem[] = [
  {
    path: '/dashboard',
    labelKey: 'sidebar.nav.dashboard',
    icon: <LayoutDashboard size={16} />,
    permission: MODULE_PERMISSIONS.dashboard
  },
  {
    path: '/announcements',
    labelKey: 'sidebar.nav.announcements',
    icon: <Megaphone size={16} />,
    permission: MODULE_PERMISSIONS.announcements
  },
  {
    path: '/activities',
    labelKey: 'sidebar.nav.activities',
    icon: <CalendarRange size={16} />,
    permission: MODULE_PERMISSIONS.activities
  },
  {
    path: '/pos',
    labelKey: 'sidebar.nav.pos',
    icon: <ShoppingCart size={16} />,
    permission: MODULE_PERMISSIONS.pos
  },
  {
    path: '/products',
    labelKey: 'sidebar.nav.products',
    icon: <Boxes size={16} />,
    permission: MODULE_PERMISSIONS.products
  },
  {
    path: '/members',
    labelKey: 'sidebar.nav.members',
    icon: <Users size={16} />,
    permission: MODULE_PERMISSIONS.members
  }
]

const navGroups: NavGroup[] = [
  {
    titleKey: 'sidebar.groups.troopsMembership',
    icon: <Tent size={16} />,
    items: [
      {
        path: '/troops',
        labelKey: 'sidebar.nav.troops',
        icon: <Tent size={16} />,
        permission: MODULE_PERMISSIONS.troops
      },
      {
        path: '/district-committee',
        labelKey: 'sidebar.nav.districtCommittee',
        icon: <Landmark size={16} />,
        permission: MODULE_PERMISSIONS.districtCommittee
      },
      {
        path: '/barangay-committee',
        labelKey: 'sidebar.nav.barangayCommittee',
        icon: <Landmark size={16} />,
        permission: MODULE_PERMISSIONS.barangayCommittee
      },
      {
        path: '/trefoil-guild',
        labelKey: 'sidebar.nav.trefoilGuild',
        icon: <Landmark size={16} />,
        permission: MODULE_PERMISSIONS.trefoilGuild
      },
      {
        path: '/oavf',
        labelKey: 'sidebar.nav.oavf',
        icon: <Briefcase size={16} />,
        permission: MODULE_PERMISSIONS.oavf
      },
      {
        path: '/honorary-members',
        labelKey: 'sidebar.nav.honoraryMember',
        icon: <Award size={16} />,
        permission: MODULE_PERMISSIONS.honoraryMember
      },
      {
        path: '/associate-members',
        labelKey: 'sidebar.nav.associateMember',
        icon: <UserCheck size={16} />,
        permission: MODULE_PERMISSIONS.associateMember
      },
      {
        path: '/iccg-registrations',
        labelKey: 'sidebar.nav.iccgRegistration',
        icon: <IdCard size={16} />,
        permission: MODULE_PERMISSIONS.iccgRegistration
      },
      {
        path: '/membership-status-report',
        labelKey: 'sidebar.nav.membershipStatusReport',
        icon: <ClipboardCheck size={16} />,
        permission: MODULE_PERMISSIONS.membershipStatusReport
      }
    ]
  },
  {
    titleKey: 'sidebar.groups.accounting',
    icon: <Calculator size={16} />,
    items: [
      {
        path: '/budget',
        labelKey: 'sidebar.nav.budget',
        icon: <Wallet2 size={16} />,
        permission: MODULE_PERMISSIONS.budget
      },
      {
        path: '/vendors',
        labelKey: 'sidebar.nav.vendors',
        icon: <Truck size={16} />,
        permission: MODULE_PERMISSIONS.vendors
      },
      {
        path: '/vouchers',
        labelKey: 'sidebar.nav.vouchers',
        icon: <Ticket size={16} />,
        permission: MODULE_PERMISSIONS.vouchers
      },
      {
        path: '/reports',
        labelKey: 'sidebar.nav.reports',
        icon: <BarChart3 size={16} />,
        permission: MODULE_PERMISSIONS.reports
      },
      {
        path: '/scrd',
        labelKey: 'sidebar.nav.scrd',
        icon: <FileText size={16} />,
        permission: MODULE_PERMISSIONS.scrd
      },
      {
        path: '/ptdg',
        labelKey: 'sidebar.nav.ptdg',
        icon: <Award size={16} />,
        permission: MODULE_PERMISSIONS.ptdg
      },
      {
        path: '/council-deposits',
        labelKey: 'sidebar.nav.councilDeposits',
        icon: <Landmark size={16} />,
        permission: MODULE_PERMISSIONS.councilDeposits
      }
    ]
  },
  {
    titleKey: 'sidebar.groups.councilPrograms',
    icon: <Tent size={16} />,
    items: [
      {
        path: '/training-profiles',
        labelKey: 'sidebar.nav.trainingProfiles',
        icon: <IdCard size={16} />,
        permission: MODULE_PERMISSIONS.trainingProfiles
      },
      {
        path: '/goals',
        labelKey: 'sidebar.nav.goals',
        icon: <Target size={16} />,
        permission: MODULE_PERMISSIONS.goals
      },
      {
        path: '/program-reports',
        labelKey: 'sidebar.nav.programReports',
        icon: <ClipboardList size={16} />,
        permission: MODULE_PERMISSIONS.programReports
      },
      {
        path: '/training-reports',
        labelKey: 'sidebar.nav.trainingReports',
        icon: <GraduationCap size={16} />,
        permission: MODULE_PERMISSIONS.trainingReports
      }
    ]
  },
  {
    titleKey: 'sidebar.groups.hrPayroll',
    icon: <Briefcase size={16} />,
    items: [
      {
        path: '/employees',
        labelKey: 'sidebar.nav.employees',
        icon: <UserCog size={16} />,
        permission: MODULE_PERMISSIONS.employees
      },
      {
        path: '/council-board',
        labelKey: 'sidebar.nav.councilBoard',
        icon: <Landmark size={16} />,
        permission: MODULE_PERMISSIONS.councilBoard
      },
      {
        path: '/attendance',
        labelKey: 'sidebar.nav.attendance',
        icon: <Fingerprint size={16} />,
        permission: MODULE_PERMISSIONS.attendance
      },
      {
        path: '/leave',
        labelKey: 'sidebar.nav.leave',
        icon: <CalendarClock size={16} />,
        permission: MODULE_PERMISSIONS.leave
      },
      {
        path: '/payroll',
        labelKey: 'sidebar.nav.payroll',
        icon: <Wallet size={16} />,
        permission: MODULE_PERMISSIONS.payroll
      },
      {
        path: '/org-chart',
        labelKey: 'sidebar.nav.orgChart',
        icon: <Network size={16} />,
        permission: MODULE_PERMISSIONS.orgChart
      }
    ]
  },
  {
    titleKey: 'sidebar.groups.facility',
    icon: <Building2 size={16} />,
    items: [
      {
        path: '/rentals',
        labelKey: 'sidebar.nav.rentals',
        icon: <Building2 size={16} />,
        permission: MODULE_PERMISSIONS.rentals
      },
      {
        path: '/visitors',
        labelKey: 'sidebar.nav.visitors',
        icon: <UserCheck size={16} />,
        permission: MODULE_PERMISSIONS.visitors
      },
      {
        path: '/facility-calendar',
        labelKey: 'sidebar.nav.facilityCalendar',
        icon: <CalendarDays size={16} />,
        permission: MODULE_PERMISSIONS.facilityCalendar
      }
    ]
  },
  {
    titleKey: 'sidebar.groups.admin',
    icon: <ShieldCheck size={16} />,
    items: [
      {
        path: '/users',
        labelKey: 'sidebar.nav.users',
        icon: <UserCog2 size={16} />,
        permission: MODULE_PERMISSIONS.users
      },
      {
        path: '/audit-log',
        labelKey: 'sidebar.nav.auditLog',
        icon: <ClipboardList size={16} />,
        permission: MODULE_PERMISSIONS.auditLog
      }
    ]
  }
]

const footerNavItems: NavItem[] = [
  { path: '/settings', labelKey: 'sidebar.nav.settings', icon: <Settings size={16} /> },
  {
    path: '/devices',
    labelKey: 'sidebar.nav.devices',
    icon: <Usb size={16} />,
    permission: MODULE_PERMISSIONS.devices
  },
  { path: '/manual', labelKey: 'sidebar.nav.manual', icon: <BookOpen size={16} /> },
  { path: '/about', labelKey: 'sidebar.nav.about', icon: <Info size={16} /> }
]

// ─── Nav item ─────────────────────────────────────────────────────────────────

interface SidebarNavItemProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
> {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}

const SidebarNavItem = forwardRef<HTMLButtonElement, SidebarNavItemProps>(function SidebarNavItem(
  { item, isActive, collapsed, onClick, onMouseEnter, onMouseLeave, ...rest },
  ref
) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseEnter={(e) => {
        setHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        onMouseLeave?.(e)
      }}
      {...rest}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%',
        height: 38,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '0 11px' : '0 12px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: !isActive && hovered ? 'var(--sidebar-nav-hover)' : 'transparent',
        transition: 'background 0.15s ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0
      }}
    >
      {/* Shared active pill — glides between items via framer-motion layoutId */}
      {isActive && (
        <motion.span
          layoutId="sidebarActivePill"
          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 10,
            background:
              'linear-gradient(135deg, var(--accent-primary-subtle) 0%, rgba(99, 102, 241, 0.03) 100%)',
            border: '1px solid var(--accent-primary-subtle)',
            boxShadow: '0 2px 14px rgba(99, 102, 241, 0.18), inset 3px 0 0 var(--accent-primary)',
            zIndex: 0
          }}
        />
      )}

      {/* Icon */}
      <motion.span
        animate={{ scale: hovered && !isActive ? 1.08 : 1 }}
        transition={{ duration: 0.15 }}
        style={{
          color: isActive
            ? 'var(--accent-primary)'
            : hovered
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s ease',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
          filter: isActive ? 'drop-shadow(0 0 6px var(--accent-primary-glow))' : 'none'
        }}
      >
        {item.icon}
      </motion.span>

      {/* Label */}
      {!collapsed && (
        <span
          style={{
            fontSize: 13,
            fontWeight: isActive ? 600 : 500,
            color: isActive
              ? 'var(--text-primary)'
              : hovered
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.15s ease',
            position: 'relative',
            zIndex: 1
          }}
        >
          {t(item.labelKey)}
        </span>
      )}
    </motion.button>
  )
})

// ─── Collapsible nav group ────────────────────────────────────────────────────

interface NavGroupSectionProps {
  group: NavGroup
  collapsed: boolean
  isActive: (path: string) => boolean
  onNavigate: (path: string) => void
}

function NavGroupSection({ group, collapsed, isActive, onNavigate }: NavGroupSectionProps) {
  const { t } = useTranslation()
  const hasActiveChild = group.items.some((item) => isActive(item.path))
  const [open, setOpen] = useState(hasActiveChild)
  const [headerHovered, setHeaderHovered] = useState(false)

  useEffect(() => {
    if (hasActiveChild) setOpen(true)
  }, [hasActiveChild])

  if (collapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {group.items.map((item) => (
          <Tooltip key={item.path} content={t(item.labelKey)} side="right">
            <SidebarNavItem
              item={item}
              isActive={isActive(item.path)}
              collapsed
              onClick={() => onNavigate(item.path)}
            />
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          width: '100%',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: '2px 0',
          padding: '0 12px',
          borderRadius: 8,
          background: headerHovered ? 'var(--sidebar-nav-hover)' : 'none',
          border: 'none',
          cursor: 'pointer',
          color: headerHovered ? 'var(--text-secondary)' : 'var(--text-muted)',
          transition: 'background 0.15s ease, color 0.15s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', opacity: 0.85 }}>{group.icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em'
          }}
        >
          {t(group.titleKey)}
        </span>
        <ChevronDown
          size={12}
          style={{
            marginLeft: 'auto',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingTop: 2,
                paddingBottom: 4
              }}
            >
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  isActive={isActive(item.path)}
                  collapsed={false}
                  onClick={() => onNavigate(item.path)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { t } = useTranslation()
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed)
  const logout = useAppStore((s) => s.logout)
  const currentUser = useAppStore((s) => s.currentUser)
  const { hasPermission } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  const filterItems = (items: NavItem[]) => items.filter((item) => hasPermission(item.permission))

  const visibleCoreItems = filterItems(coreNavItems)
  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: filterItems(group.items) }))
    .filter((group) => group.items.length > 0)

  const initials = currentUser
    ? currentUser.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GS'

  const roleLabel = useRoleLabel(currentUser?.role)

  function renderNavItem(item: NavItem) {
    const active = isActive(item.path)
    const navItem = (
      <SidebarNavItem
        key={item.path}
        item={item}
        isActive={active}
        collapsed={collapsed}
        onClick={() => navigate(item.path)}
      />
    )
    return collapsed ? (
      <Tooltip key={item.path} content={t(item.labelKey)} side="right">
        {navItem}
      </Tooltip>
    ) : (
      navItem
    )
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 270 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: 'var(--sidebar-shadow)',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* ── Header: Logo + Title + Collapse btn ─────────────────── */}
      <div
        style={{
          minHeight: 66,
          padding: collapsed ? '9px 12px' : '12px 12px 12px 14px',
          borderBottom: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
          transition: 'padding 0.25s ease'
        }}
      >
        {/* Logo + text */}
        <Tooltip content={collapsed ? t('sidebar.orgTooltip') : ''} side="right">
          <button
            onClick={() => collapsed && setSidebarCollapsed(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: collapsed ? 'pointer' : 'default',
              padding: 0,
              overflow: 'hidden',
              minWidth: 0
            }}
          >
            {/* Logo square */}
            <div
              style={{
                width: collapsed ? 46 : 54,
                height: collapsed ? 46 : 54,
                borderRadius: collapsed ? 12 : 14,
                flexShrink: 0,
                background: '#ffffff',
                border: '1px solid var(--sidebar-border)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'width 0.25s ease, height 0.25s ease'
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="GSP Ilocos Sur"
                style={{
                  width: collapsed ? 33 : 40,
                  height: collapsed ? 33 : 40,
                  objectFit: 'contain',
                  display: 'block'
                }}
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            {/* App name + subtitle */}
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 12.5,
                    lineHeight: 1.3,
                    color: 'var(--text-primary)',
                    whiteSpace: 'normal',
                    wordBreak: 'normal',
                    maxWidth: 175
                  }}
                >
                  Girl Scouts of the Philippines
                </p>
                <p
                  style={{
                    fontSize: 10,
                    marginTop: 3,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Ilocos Sur Council
                </p>
              </motion.div>
            )}
          </button>
        </Tooltip>

        {/* Collapse button — only when expanded */}
        {!collapsed && (
          <Tooltip content={t('sidebar.collapseSidebar')} side="right">
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 7,
                border: '1px solid var(--sidebar-border)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sidebar-nav-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <ChevronLeft size={13} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Main navigation (scrollable) ────────────────────────── */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? '10px 8px' : '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: collapsed ? 2 : 6,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none'
        }}
      >
        {visibleCoreItems.map(renderNavItem)}
        {visibleGroups.length > 0 && (
          <div
            style={{
              height: 1,
              background:
                'linear-gradient(to right, transparent, var(--sidebar-border) 20%, var(--sidebar-border) 80%, transparent)',
              margin: collapsed ? '4px 0' : '6px 4px'
            }}
          />
        )}
        {visibleGroups.map((group) => (
          <NavGroupSection
            key={group.titleKey}
            group={group}
            collapsed={collapsed}
            isActive={isActive}
            onNavigate={navigate}
          />
        ))}
      </nav>

      {/* ── Footer: expand + settings + about + logout ──────────── */}
      <div
        style={{
          padding: collapsed ? '10px 8px' : '10px 10px',
          borderTop: '1px solid var(--sidebar-border)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Expand button — only when collapsed */}
        {collapsed && (
          <Tooltip content={t('sidebar.expandSidebar')} side="right">
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                width: '100%',
                height: 34,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '1px solid var(--sidebar-border)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sidebar-nav-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </Tooltip>
        )}

        {/* Settings + About */}
        {filterItems(footerNavItems).map(renderNavItem)}
      </div>

      {/* ── User profile ─────────────────────────────────────────── */}
      <div
        style={{
          padding: collapsed ? '10px 8px' : '8px',
          borderTop: '1px solid var(--sidebar-border)',
          flexShrink: 0
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            overflow: 'hidden',
            minWidth: 0,
            padding: collapsed ? 0 : '6px 8px',
            borderRadius: 10,
            background: collapsed ? 'transparent' : 'var(--glass-bg)',
            border: collapsed ? '1px solid transparent' : '1px solid var(--glass-border)'
          }}
        >
          {/* Avatar — click through to My Profile */}
          <Tooltip content={t('sidebar.myProfile')} side="right">
            <button
              onClick={() => navigate('/profile')}
              style={{
                position: 'relative',
                width: 34,
                height: 34,
                borderRadius: '50%',
                overflow: 'visible',
                background: 'transparent',
                border: 'none',
                padding: 0,
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background:
                    'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 0 12px var(--accent-primary-glow)'
                }}
              >
                {currentUser?.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>
              {/* Online status dot */}
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)',
                  border: '2px solid var(--bg-elevated)',
                  boxShadow: '0 0 6px var(--accent-emerald-glow)'
                }}
              />
            </button>
          </Tooltip>

          {/* Name + role + logout — only when expanded */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => navigate('/profile')}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser?.fullName ?? t('sidebar.guest')}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {roleLabel || '—'}
                </div>
              </button>

              {/* Logout icon button */}
              <Tooltip content={t('common.signOut')} side="top">
                <LogoutIconButton
                  onLogout={() => {
                    logout()
                    navigate('/')
                  }}
                />
              </Tooltip>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

// ─── Logout icon button ───────────────────────────────────────────────────────

function LogoutIconButton({ onLogout }: { onLogout: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        background: hovered ? 'rgba(239,68,68,0.12)' : 'transparent',
        border: hovered ? '1px solid rgba(239,68,68,0.25)' : '1px solid transparent',
        cursor: 'pointer',
        color: hovered ? '#ef4444' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s ease'
      }}
    >
      <LogOut size={14} />
    </button>
  )
}
