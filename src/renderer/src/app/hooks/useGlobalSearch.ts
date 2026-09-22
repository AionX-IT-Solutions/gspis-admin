import { useMemo } from 'react'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useHRStore } from '@/features/hr/store/hr.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useVisitorsStore } from '@/features/visitors/store/visitors.store'
import { useActivitiesStore } from '@/features/activities/store/activities.store'
import { useGoalsStore } from '@/features/goals/store/goals.store'
import { useProgramReportsStore } from '@/features/programReports/store/programReports.store'
import { useTrainingReportsStore } from '@/features/trainingReports/store/trainingReports.store'
import { useCashReceiptsStore } from '@/features/scrd/store/cashReceipts.store'
import { useBanksStore } from '@/features/scrd/store/banks.store'
import { usePermissions } from './usePermissions'
import {
  MODULE_LABELS,
  MODULE_PERMISSIONS,
  MODULE_ROUTES,
  PERMISSION_MODULES
} from '../lib/permissions'

export type SearchResultType =
  | 'module'
  | 'vendor'
  | 'employee'
  | 'troop'
  | 'member'
  | 'product'
  | 'voucher'
  | 'leave'
  | 'payroll'
  | 'rental'
  | 'visitor'
  | 'activity'
  | 'goal'
  | 'programReport'
  | 'trainingReport'
  | 'cashReceipt'
  | 'bank'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  path: string
}

const MAX_RESULTS = 20

/** Searches modules by name plus every hydrated record store the current user can view,
 *  and resolves each hit to the page it should navigate to — modules and records with
 *  no dedicated detail page (customers, vendors, members, products, vouchers,
 *  leave, payroll, rentals, visitors, goals, program/training reports, SCRD) link to
 *  that module's list page; employees and troops have real detail routes. */
export function useGlobalSearch(query: string): SearchResult[] {
  const { hasPermission } = usePermissions()
  const vendors = useAccountingStore((s) => s.vendors)
  const employees = useHRStore((s) => s.employees)
  const leaveRequests = useHRStore((s) => s.leaveRequests)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const payroll = useHRStore((s) => s.payroll)
  const products = usePOSStore((s) => s.products)
  const members = usePOSStore((s) => s.members)
  const troops = useTroopsStore((s) => s.troops)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const rentalBookings = useRentalsStore((s) => s.bookings)
  const rentalSpaces = useRentalsStore((s) => s.spaces)
  const visitors = useVisitorsStore((s) => s.visitors)
  const activities = useActivitiesStore((s) => s.activities)
  const goals = useGoalsStore((s) => s.goals)
  const programReportItems = useProgramReportsStore((s) => s.lineItems)
  const trainingReports = useTrainingReportsStore((s) => s.trainingReports)
  const cashReceipts = useCashReceiptsStore((s) => s.receipts)
  const banks = useBanksStore((s) => s.banks)

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const results: SearchResult[] = []
    const matches = (...values: (string | undefined)[]) =>
      values.some((v) => v && v.toLowerCase().includes(q))

    for (const key of PERMISSION_MODULES) {
      const path = MODULE_ROUTES[key]
      const label = MODULE_LABELS[key]
      if (!path || !label || !hasPermission(MODULE_PERMISSIONS[key])) continue
      if (label.toLowerCase().includes(q)) {
        results.push({ id: `module-${key}`, type: 'module', title: label, path })
      }
    }

    if (hasPermission('view:vendors')) {
      for (const v of vendors) {
        if (matches(v.name, v.company, v.email)) {
          results.push({
            id: `vendor-${v.id}`,
            type: 'vendor',
            title: v.company ?? v.name,
            subtitle: v.name,
            path: '/vendors'
          })
        }
      }
    }

    if (hasPermission('view:employees')) {
      for (const e of employees) {
        if (matches(e.fullName, e.employeeNumber, e.position, e.department)) {
          results.push({
            id: `employee-${e.id}`,
            type: 'employee',
            title: e.fullName,
            subtitle: e.position,
            path: `/employees/${e.id}`
          })
        }
      }
    }

    if (hasPermission('view:leave')) {
      for (const l of leaveRequests) {
        const employee = employees.find((e) => e.id === l.employeeId)
        const leaveType = leaveTypes.find((t) => t.id === l.leaveTypeId)
        if (matches(employee?.fullName, leaveType?.name, l.reason)) {
          results.push({
            id: `leave-${l.id}`,
            type: 'leave',
            title: employee?.fullName ?? leaveType?.name ?? 'Leave Request',
            subtitle: leaveType?.name,
            path: '/leave'
          })
        }
      }
    }

    if (hasPermission('view:payroll')) {
      for (const p of payroll) {
        const employee = employees.find((e) => e.id === p.employeeId)
        if (matches(p.payrollNumber, employee?.fullName)) {
          results.push({
            id: `payroll-${p.id}`,
            type: 'payroll',
            title: p.payrollNumber,
            subtitle: employee?.fullName,
            path: '/payroll'
          })
        }
      }
    }

    if (hasPermission('view:troops')) {
      for (const t of troops) {
        if (matches(t.troopName, t.troopNumber, t.leaderName, t.barangay)) {
          results.push({
            id: `troop-${t.id}`,
            type: 'troop',
            title: t.troopName ?? `Troop ${t.troopNumber}`,
            subtitle: t.leaderName,
            path: `/troops/${t.id}`
          })
        }
      }
    }

    if (hasPermission('view:members')) {
      for (const m of members) {
        if (matches(m.name, m.code, m.email)) {
          results.push({
            id: `member-${m.id}`,
            type: 'member',
            title: m.name,
            subtitle: m.code,
            path: '/members'
          })
        }
      }
    }

    if (hasPermission('view:products')) {
      for (const p of products) {
        if (matches(p.name, p.sku, p.barcode)) {
          results.push({
            id: `product-${p.id}`,
            type: 'product',
            title: p.name,
            subtitle: p.sku,
            path: '/products'
          })
        }
      }
    }

    if (hasPermission('view:vouchers')) {
      for (const v of vouchers) {
        if (matches(v.voucherNumber, v.payee, v.particulars)) {
          results.push({
            id: `voucher-${v.id}`,
            type: 'voucher',
            title: v.voucherNumber,
            subtitle: v.payee,
            path: '/vouchers'
          })
        }
      }
    }

    if (hasPermission('view:rentals')) {
      for (const b of rentalBookings) {
        const space = rentalSpaces.find((s) => s.id === b.rentalSpaceId)
        if (matches(b.renterName, space?.name, b.notes)) {
          results.push({
            id: `rental-${b.id}`,
            type: 'rental',
            title: b.renterName,
            subtitle: space?.name,
            path: '/rentals'
          })
        }
      }
      for (const s of rentalSpaces) {
        if (matches(s.name, s.description)) {
          results.push({
            id: `rentalSpace-${s.id}`,
            type: 'rental',
            title: s.name,
            subtitle: s.description,
            path: '/rentals'
          })
        }
      }
    }

    if (hasPermission('view:visitors')) {
      for (const v of visitors) {
        if (matches(v.fullName, v.purpose, v.personToVisit)) {
          results.push({
            id: `visitor-${v.id}`,
            type: 'visitor',
            title: v.fullName,
            subtitle: v.purpose,
            path: '/visitors'
          })
        }
      }
    }

    if (hasPermission('view:activities')) {
      for (const a of activities) {
        if (matches(a.title, a.location, a.organizer)) {
          results.push({
            id: `activity-${a.id}`,
            type: 'activity',
            title: a.title,
            subtitle: a.location,
            path: '/activities'
          })
        }
      }
    }

    if (hasPermission('view:goals')) {
      for (const g of goals) {
        if (matches(g.title, g.code)) {
          results.push({
            id: `goal-${g.id}`,
            type: 'goal',
            title: g.title,
            subtitle: g.code,
            path: '/goals'
          })
        }
        for (const o of g.objectives) {
          if (matches(o.label, o.code)) {
            results.push({
              id: `goal-objective-${o.id}`,
              type: 'goal',
              title: o.label,
              subtitle: g.title,
              path: '/goals'
            })
          }
        }
      }
    }

    if (hasPermission('view:programReports')) {
      for (const li of programReportItems) {
        if (matches(li.label, li.code)) {
          results.push({
            id: `programReport-${li.id}`,
            type: 'programReport',
            title: li.label,
            subtitle: li.code,
            path: '/program-reports'
          })
        }
      }
    }

    if (hasPermission('view:trainingReports')) {
      for (const tr of trainingReports) {
        if (matches(tr.title, tr.reportNo, tr.place)) {
          results.push({
            id: `trainingReport-${tr.id}`,
            type: 'trainingReport',
            title: tr.title,
            subtitle: tr.reportNo,
            path: '/training-reports'
          })
        }
      }
    }

    if (hasPermission('view:scrd')) {
      for (const r of cashReceipts) {
        if (matches(r.payor, r.particulars, r.referenceNumber)) {
          results.push({
            id: `cashReceipt-${r.id}`,
            type: 'cashReceipt',
            title: r.payor,
            subtitle: r.particulars,
            path: '/scrd'
          })
        }
      }
      for (const b of banks) {
        if (matches(b.name, b.accountNumber)) {
          results.push({
            id: `bank-${b.id}`,
            type: 'bank',
            title: b.name,
            subtitle: b.accountNumber,
            path: '/scrd'
          })
        }
      }
    }

    return results.slice(0, MAX_RESULTS)
  }, [
    query,
    hasPermission,
    vendors,
    employees,
    leaveRequests,
    leaveTypes,
    payroll,
    products,
    members,
    troops,
    vouchers,
    rentalBookings,
    rentalSpaces,
    visitors,
    activities,
    goals,
    programReportItems,
    trainingReports,
    cashReceipts,
    banks
  ])
}
