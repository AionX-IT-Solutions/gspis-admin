import { create } from 'zustand'
import { doc, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/shared/lib/firebase'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure,
  stripUndefined
} from '@/shared/lib/firestoreSync'
import { localIsoFromDate } from '@/shared/lib/utils'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { deleteFile } from '@/shared/lib/storageSync'
import type {
  AttendanceRecord,
  AttendanceStatus,
  BiometricEnrollment,
  BiometricMethod,
  Employee,
  EmployeeDocument,
  LeaveApprovalTouch,
  LeaveCreditGrant,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
  PayrollEntry,
  PayrollStatus
} from '../types/hr.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

/** This user's manual attendance input/edits are excluded from the audit trail per admin request. */
const ATTENDANCE_AUDIT_EXEMPT_EMAILS = new Set(['ronamy1995@gmail.com'])

function isAttendanceAuditExempt() {
  const email = useAppStore.getState().currentUser?.email
  return !!email && ATTENDANCE_AUDIT_EXEMPT_EMAILS.has(email.toLowerCase())
}

function datesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const cursor = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  while (cursor.getTime() <= end.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export function daysCountBetween(startDate: string, endDate: string) {
  return datesInRange(startDate, endDate).length
}

const OVERTIME_THRESHOLD_HOURS = 8
const COMP_TIME_MIN_OVERTIME_HOURS = 4
const CREDIT_EXPIRY_MONTHS = 3
export const COMP_TIME_LEAVE_TYPE_ID = 'lt-comp-time'

// Standard GSPIS leave types, seeded once so the leave type list isn't just Compensatory Time
// Off — annual credit counts are editable afterward via "Edit Balances" on the Leave page.
const STANDARD_LEAVE_TYPES: LeaveType[] = [
  { id: 'lt-vacation', name: 'Vacation Leave', defaultAnnualCredits: 15, isPaid: true },
  { id: 'lt-sick', name: 'Sick Leave', defaultAnnualCredits: 15, isPaid: true },
  { id: 'lt-maternity', name: 'Maternity Leave', defaultAnnualCredits: 105, isPaid: true },
  { id: 'lt-paternity', name: 'Paternity Leave', defaultAnnualCredits: 7, isPaid: true },
  {
    id: 'lt-special-privilege',
    name: 'Special Privilege Leave',
    defaultAnnualCredits: 3,
    isPaid: true
  },
  { id: 'lt-solo-parent', name: 'Solo Parent Leave', defaultAnnualCredits: 7, isPaid: true },
  {
    id: 'lt-bereavement',
    name: 'Bereavement/Emergency Leave',
    defaultAnnualCredits: 3,
    isPaid: true
  }
]

// GSPIS official workday: 8:00 AM to 5:00 PM, plus a 15-minute grace period on the start —
// a clock-in past 8:15 AM is Late; anything at or before that is on time. An early clock-in
// (e.g. a device that lets staff badge in at 7:00 AM) never moves this start time earlier —
// it just means they're on premises sooner, not that their shift or overtime accounting starts
// sooner. Overtime is symmetric: it only ever starts counting from 5:00 PM, regardless of how
// early they clocked in that day.
const WORK_START_HOUR = 8
const WORK_START_MINUTE = 0
const WORK_END_HOUR = 17
const WORK_END_MINUTE = 0
const LATE_GRACE_PERIOD_MINUTES = 15

// The workday's 1-hour unpaid lunch break (12:00-1:00 NN) is never separately clocked (this app
// only records one time-in and one time-out per day), so it has to be inferred from whether the
// employee was actually present at some point during that hour, then subtracted as a flat hour —
// not prorated to exactly how many minutes of it they were present for.
const LUNCH_BREAK_START_HOUR = 12
const LUNCH_BREAK_START_MINUTE = 0
const LUNCH_BREAK_END_HOUR = 13
const LUNCH_BREAK_END_MINUTE = 0
const LUNCH_BREAK_HOURS = 1

export function isLateClockIn(clockInIso: string): boolean {
  const clockIn = new Date(clockInIso)
  const graceDeadline = new Date(clockIn)
  graceDeadline.setHours(WORK_START_HOUR, WORK_START_MINUTE + LATE_GRACE_PERIOD_MINUTES, 0, 0)
  return clockIn.getTime() > graceDeadline.getTime()
}

/** Hours actually worked past the 5:00 PM shift end, floored at 0 — the only thing that counts
 *  as overtime. A clock-out at or before 5:00 PM (no matter how early the clock-in was) is 0. */
export function overtimeHoursPastShiftEnd(clockOutIso: string): number {
  const clockOut = new Date(clockOutIso)
  const shiftEnd = new Date(clockOut)
  shiftEnd.setHours(WORK_END_HOUR, WORK_END_MINUTE, 0, 0)
  const hours = (clockOut.getTime() - shiftEnd.getTime()) / (1000 * 60 * 60)
  return Math.max(0, Math.round(hours * 100) / 100)
}

/** True once the workday's morning half (8:00 AM-12:00 NN) is entirely missed — clocking in at or
 *  after 12:00 NN. That's a Half Day no matter how late they end up working that afternoon, since
 *  they still only attended one of the day's two halves. */
export function isAfternoonOnlyArrival(clockInIso: string): boolean {
  const clockIn = new Date(clockInIso)
  const afternoonCutoff = new Date(clockIn)
  afternoonCutoff.setHours(LUNCH_BREAK_START_HOUR, LUNCH_BREAK_START_MINUTE, 0, 0)
  return clockIn.getTime() >= afternoonCutoff.getTime()
}

/**
 * The "Hours" figure GSPIS actually pays/credits for, as opposed to raw clock-out minus clock-in:
 * - The regular portion is capped to the 8:00 AM-5:00 PM window on both ends — clocking in at
 *   7:00 AM doesn't earn extra regular hours, and neither does staying past 5:00 PM (that time is
 *   added back separately, in full, as overtime below).
 * - The 1-hour lunch break is subtracted from that regular portion, but only if the employee was
 *   actually present at some point during 12:00-1:00 NN — someone who leaves before noon (a
 *   morning-only half day) or arrives at/after 12:00 NN (an afternoon-only half day, see
 *   isAfternoonOnlyArrival) never had a lunch break there to deduct.
 * - Overtime (time actually worked past 5:00 PM) is added back in full, since lunch happens well
 *   before it and was already accounted for above.
 * A normal 8:00 AM-5:00 PM day nets to exactly 8 hours; arriving early or working late shifts
 * nothing except genuine overtime past 5:00 PM.
 */
export function computeShiftHoursWorked(clockInIso: string, clockOutIso: string): number {
  const clockIn = new Date(clockInIso)
  const clockOut = new Date(clockOutIso)

  const shiftStart = new Date(clockIn)
  shiftStart.setHours(WORK_START_HOUR, WORK_START_MINUTE, 0, 0)
  const shiftEnd = new Date(clockOut)
  shiftEnd.setHours(WORK_END_HOUR, WORK_END_MINUTE, 0, 0)

  const effectiveStart = Math.max(clockIn.getTime(), shiftStart.getTime())
  const effectiveEnd = Math.min(clockOut.getTime(), shiftEnd.getTime())
  const regularSpanHours = Math.max(0, (effectiveEnd - effectiveStart) / (1000 * 60 * 60))

  const lunchStart = new Date(clockIn)
  lunchStart.setHours(LUNCH_BREAK_START_HOUR, LUNCH_BREAK_START_MINUTE, 0, 0)
  const lunchEnd = new Date(clockIn)
  lunchEnd.setHours(LUNCH_BREAK_END_HOUR, LUNCH_BREAK_END_MINUTE, 0, 0)
  const overlapsLunch = effectiveStart < lunchEnd.getTime() && effectiveEnd > lunchStart.getTime()
  const regularHours = Math.max(0, regularSpanHours - (overlapsLunch ? LUNCH_BREAK_HOURS : 0))

  const overtimeHours = overtimeHoursPastShiftEnd(clockOutIso)
  return Math.round((regularHours + overtimeHours) * 100) / 100
}

/** `clockOut` is required to detect real overtime (time past 5:00 PM) — pass null only for a
 *  record with no clock-out yet, which can't be Overtime regardless of `hoursWorked`. Overtime
 *  only shows once it actually clears COMP_TIME_MIN_OVERTIME_HOURS — the same bar that has to be
 *  met for it to earn any Compensatory Time Off (see overtimeHoursToCompDays). A minute or two
 *  past 5:00 PM (walking to the scanner, a quick wrap-up) is incidental, not overtime, and never
 *  earns credit either — the status shouldn't claim otherwise. */
export function statusForHoursWorked(
  hoursWorked: number,
  clockOut: string | null = null
): AttendanceStatus {
  if (hoursWorked < 4) return 'half-day'
  if (clockOut && overtimeHoursPastShiftEnd(clockOut) >= COMP_TIME_MIN_OVERTIME_HOURS)
    return 'overtime'
  return 'present'
}

/**
 * Combines hours-based status with lateness. Half-day always wins since it's the more severe
 * attendance issue — either worked under 4h total, or missed the entire morning (see
 * isAfternoonOnlyArrival, which can coexist with plenty of raw hours if they worked a long
 * afternoon/evening — that's still only one of the day's two halves). Otherwise Late takes
 * priority over Present/Overtime per GSPIS policy.
 */
export function combinedAttendanceStatus(
  clockIn: string,
  hoursWorked: number,
  clockOut: string
): AttendanceStatus {
  if (hoursWorked < 4 || isAfternoonOnlyArrival(clockIn)) return 'half-day'
  const hoursStatus = statusForHoursWorked(hoursWorked, clockOut)
  return isLateClockIn(clockIn) ? 'late' : hoursStatus
}

/**
 * GSPIS HR policy: Compensatory Time Off is earned in flat brackets, not pro-rated per minute —
 * under 4h overtime in a day earns nothing, 4h up to (but under) 8h earns a half day, 8h or more
 * earns a full day. So 4h30m still only earns 0.5 day, same as exactly 4h.
 */
export function overtimeHoursToCompDays(overtimeHours: number): number {
  if (overtimeHours < COMP_TIME_MIN_OVERTIME_HOURS) return 0
  if (overtimeHours < OVERTIME_THRESHOLD_HOURS) return 0.5
  return 1
}

function addMonthsIso(dateIso: string, months: number): string {
  const d = new Date(dateIso)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

interface ClockResult {
  ok: boolean
  message: string
  employeeName?: string
}

interface HRState {
  employees: Employee[]
  attendance: AttendanceRecord[]
  enrollments: BiometricEnrollment[]
  leaveTypes: LeaveType[]
  leaveRequests: LeaveRequest[]
  leaveCreditGrants: LeaveCreditGrant[]
  payroll: PayrollEntry[]
  employeeDocuments: EmployeeDocument[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  addEmployeeDocument: (document: EmployeeDocument) => void
  /** Deletes both the metadata doc and the underlying Storage file. */
  deleteEmployeeDocument: (id: string) => void

  enrollBiometric: (employeeId: string, method: BiometricMethod) => void
  setEnrollmentActive: (employeeId: string, isActive: boolean) => void
  clockBiometric: (
    employeeId: string,
    method: BiometricMethod,
    direction: 'in' | 'out',
    /** The scan's actual time (ISO) — pass this for a backfilled/historical event so it's dated
     *  to when it really happened rather than to whenever the backfill happens to run. Omit for
     *  a live scan, where "now" is correct. */
    timestamp?: string
  ) => ClockResult
  recordAttendanceManual: (record: Omit<AttendanceRecord, 'id'>) => void
  deleteAttendanceRecord: (id: string) => void

  /** Grants a Compensatory Time Off credit (in days, converted 1hr OT = 1/8 day) that expires 3 months from now. */
  grantOvertimeCredit: (
    employeeId: string,
    overtimeHours: number,
    attendanceRecordId?: string
  ) => void

  fileLeaveRequest: (
    request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'daysCount'>
  ) => void
  decideLeaveRequest: (id: string, status: LeaveRequestStatus, notes?: string) => void
  /** Reverts an approved request back to rejected, undoing any Attendance records the approval touched. */
  revertLeaveApproval: (id: string, reason?: string) => void
  /** Deletes a leave request outright, undoing any Attendance records an approval had touched. */
  deleteLeaveRequest: (id: string) => void
  /** Admin-settable annual credit pool for a leave type. Compensatory Time Off is grant-based (from overtime) and can't be set this way. */
  updateLeaveTypeCredits: (leaveTypeId: string, defaultAnnualCredits: number) => void

  addPayrollEntry: (entry: PayrollEntry) => void
  updatePayrollEntry: (id: string, patch: Partial<PayrollEntry>) => void
  deletePayrollEntry: (id: string) => void
  setPayrollStatus: (id: string, status: PayrollStatus) => void
}

export const useHRStore = create<HRState>()((set, get) => ({
  employees: [],
  attendance: [],
  enrollments: [],
  leaveTypes: [],
  leaveRequests: [],
  leaveCreditGrants: [],
  payroll: [],
  employeeDocuments: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [
        employees,
        attendance,
        enrollments,
        leaveTypes,
        leaveRequests,
        leaveCreditGrants,
        payroll,
        employeeDocuments
      ] = await Promise.all([
        hydrateCollection<Employee>('employees'),
        hydrateCollection<AttendanceRecord>('attendance'),
        hydrateCollection<BiometricEnrollment>('biometricEnrollments'),
        hydrateCollection<LeaveType>('leaveTypes'),
        hydrateCollection<LeaveRequest>('leaveRequests'),
        hydrateCollection<LeaveCreditGrant>('leaveCreditGrants'),
        hydrateCollection<PayrollEntry>('payroll'),
        hydrateCollection<EmployeeDocument>('employeeDocuments')
      ])

      // Compensatory Time Off is earned automatically from overtime — make sure the leave
      // type it draws against exists, seeding it once if this is the first time it's needed.
      let resolvedLeaveTypes = leaveTypes
      if (!leaveTypes.some((lt) => lt.id === COMP_TIME_LEAVE_TYPE_ID)) {
        const compTimeType: LeaveType = {
          id: COMP_TIME_LEAVE_TYPE_ID,
          name: 'Compensatory Time Off',
          defaultAnnualCredits: 0,
          isPaid: true
        }
        resolvedLeaveTypes = [...resolvedLeaveTypes, compTimeType]
        persist('leaveTypes', compTimeType.id, compTimeType)
      }

      // Seed the standard leave types too, so a fresh (or pre-existing but incomplete)
      // environment isn't stuck with only Compensatory Time Off in the dropdown.
      const missingStandardTypes = STANDARD_LEAVE_TYPES.filter(
        (standard) => !leaveTypes.some((lt) => lt.id === standard.id)
      )
      if (missingStandardTypes.length > 0) {
        resolvedLeaveTypes = [...resolvedLeaveTypes, ...missingStandardTypes]
        missingStandardTypes.forEach((lt) => persist('leaveTypes', lt.id, lt))
      }

      set({
        employees,
        attendance,
        enrollments,
        leaveTypes: resolvedLeaveTypes,
        leaveRequests,
        leaveCreditGrants,
        payroll,
        employeeDocuments,
        hydrated: true
      })
    } catch (err) {
      reportHydrateFailure('[hr.store] Failed to hydrate', err)
    }
  },

  addEmployee: (employee) => {
    set((s) => ({ employees: [employee, ...s.employees] }))
    persist('employees', employee.id, employee)
    appendAuditLog({
      action: 'employee_created',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record created for ${employee.fullName}.`
    })
  },
  updateEmployee: (id, patch) => {
    set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
    const emp = get().employees.find((e) => e.id === id)
    if (emp) persist('employees', id, emp)
    appendAuditLog({
      action: 'employee_updated',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record updated for ${emp?.fullName ?? id}.`
    })
  },
  deleteEmployee: (id) => {
    const emp = get().employees.find((e) => e.id === id)
    const docs = get().employeeDocuments.filter((d) => d.employeeId === id)
    set((s) => ({
      employees: s.employees.filter((e) => e.id !== id),
      employeeDocuments: s.employeeDocuments.filter((d) => d.employeeId !== id)
    }))
    deleteDocById('employees', id)
    if (emp?.photoStoragePath) deleteFile(emp.photoStoragePath)
    for (const document of docs) {
      deleteDocById('employeeDocuments', document.id)
      deleteFile(document.storagePath)
    }
    appendAuditLog({
      action: 'employee_deleted',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record deleted for ${emp?.fullName ?? id}.`
    })
  },

  addEmployeeDocument: (document) => {
    set((s) => ({ employeeDocuments: [document, ...s.employeeDocuments] }))
    persist('employeeDocuments', document.id, document)
    const emp = get().employees.find((e) => e.id === document.employeeId)
    appendAuditLog({
      action: 'employee_document_added',
      actorName: actorName(),
      entityType: 'employee_document',
      summary: `${document.type} "${document.name}" uploaded for ${emp?.fullName ?? 'employee'}.`
    })
  },
  deleteEmployeeDocument: (id) => {
    const document = get().employeeDocuments.find((d) => d.id === id)
    set((s) => ({ employeeDocuments: s.employeeDocuments.filter((d) => d.id !== id) }))
    deleteDocById('employeeDocuments', id)
    if (document) deleteFile(document.storagePath)
    const emp = document ? get().employees.find((e) => e.id === document.employeeId) : undefined
    appendAuditLog({
      action: 'employee_document_deleted',
      actorName: actorName(),
      entityType: 'employee_document',
      summary: `${document?.type ?? 'Document'} "${document?.name ?? id}" deleted for ${emp?.fullName ?? 'employee'}.`
    })
  },

  enrollBiometric: (employeeId, method) => {
    const mockTemplateId = `MOCK-${method.toUpperCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    set((s) => {
      const existing = s.enrollments.find((e) => e.employeeId === employeeId)
      if (existing) {
        return {
          enrollments: s.enrollments.map((e) =>
            e.employeeId === employeeId
              ? {
                  ...e,
                  method,
                  mockTemplateId,
                  isActive: true,
                  enrolledAt: new Date().toISOString()
                }
              : e
          )
        }
      }
      return {
        enrollments: [
          ...s.enrollments,
          {
            id: crypto.randomUUID(),
            employeeId,
            method,
            mockTemplateId,
            isActive: true,
            enrolledAt: new Date().toISOString()
          }
        ]
      }
    })
    const enrollment = get().enrollments.find((e) => e.employeeId === employeeId)
    if (enrollment) persist('biometricEnrollments', enrollment.id, enrollment)
  },

  setEnrollmentActive: (employeeId, isActive) => {
    set((s) => ({
      enrollments: s.enrollments.map((e) => (e.employeeId === employeeId ? { ...e, isActive } : e))
    }))
    const enrollment = get().enrollments.find((e) => e.employeeId === employeeId)
    if (enrollment) persist('biometricEnrollments', enrollment.id, enrollment)
  },

  clockBiometric: (employeeId, method, direction, timestamp) => {
    const state = get()
    const employee = state.employees.find((e) => e.id === employeeId)
    if (!employee) return { ok: false, message: 'Employee not found' }

    const enrollment = state.enrollments.find((e) => e.employeeId === employeeId && e.isActive)
    if (!enrollment)
      return { ok: false, message: `${employee.fullName} is not enrolled for biometric attendance` }

    // A backfilled scan (see the Hikvision bridge) carries its own real time — dating it to
    // whenever the backfill happens to run instead would misfile it under the wrong day.
    const parsedTimestamp = timestamp ? new Date(timestamp) : null
    const eventDate =
      parsedTimestamp && !Number.isNaN(parsedTimestamp.getTime()) ? parsedTimestamp : new Date()
    const today = localIsoFromDate(eventDate)
    const existing = state.attendance.find((a) => a.employeeId === employeeId && a.date === today)

    if (existing?.status === 'leave') {
      return { ok: false, message: `${employee.fullName} is on approved leave today` }
    }

    if (direction === 'in') {
      if (existing?.clockIn)
        return { ok: false, message: `${employee.fullName} already clocked in today` }
      const clockIn = eventDate.toISOString()
      const clockInStatus: AttendanceStatus = isAfternoonOnlyArrival(clockIn)
        ? 'half-day'
        : isLateClockIn(clockIn)
          ? 'late'
          : 'present'
      const record: AttendanceRecord = existing
        ? { ...existing, clockIn, status: clockInStatus }
        : {
            id: crypto.randomUUID(),
            employeeId,
            date: today,
            clockIn,
            clockOut: null,
            hoursWorked: null,
            status: clockInStatus
          }
      set((s) => ({
        attendance: existing
          ? s.attendance.map((a) => (a.id === existing.id ? record : a))
          : [...s.attendance, record]
      }))
      persist('attendance', record.id, record)
      appendAuditLog({
        action: 'attendance_clocked',
        actorName: actorName(),
        entityType: 'attendance',
        summary: `${employee.fullName} clocked in via ${method} recognition.`
      })
      return {
        ok: true,
        message: `${employee.fullName} clocked in successfully.`,
        employeeName: employee.fullName
      }
    }

    if (!existing?.clockIn)
      return { ok: false, message: `${employee.fullName} has not clocked in yet today` }
    if (existing.clockOut)
      return { ok: false, message: `${employee.fullName} already clocked out today` }
    const clockOut = eventDate.toISOString()
    const hoursWorked = computeShiftHoursWorked(existing.clockIn, clockOut)
    const status = combinedAttendanceStatus(existing.clockIn, hoursWorked, clockOut)
    const record: AttendanceRecord = { ...existing, clockOut, hoursWorked, status }
    set((s) => ({
      attendance: s.attendance.map((a) => (a.id === existing.id ? record : a))
    }))
    persist('attendance', record.id, record)
    // Checked directly against clock-out time, not the day's overall status label — a Half Day
    // arrival (see isAfternoonOnlyArrival) who still works past 5:00 PM earns that overtime same
    // as anyone else, even though their status for the day reads "Half Day" rather than "Overtime".
    if (overtimeHoursPastShiftEnd(clockOut) > 0) {
      get().grantOvertimeCredit(employeeId, overtimeHoursPastShiftEnd(clockOut), record.id)
    }
    appendAuditLog({
      action: 'attendance_clocked',
      actorName: actorName(),
      entityType: 'attendance',
      summary: `${employee.fullName} clocked out via ${method} recognition.`
    })
    return {
      ok: true,
      message: `${employee.fullName} clocked out successfully.`,
      employeeName: employee.fullName
    }
  },

  grantOvertimeCredit: (employeeId, overtimeHours, attendanceRecordId) => {
    if (
      attendanceRecordId &&
      get().leaveCreditGrants.some((g) => g.attendanceRecordId === attendanceRecordId)
    ) {
      return
    }
    const days = overtimeHoursToCompDays(overtimeHours)
    if (days <= 0) return
    const grantedAt = new Date().toISOString()
    const grant: LeaveCreditGrant = {
      id: crypto.randomUUID(),
      employeeId,
      leaveTypeId: COMP_TIME_LEAVE_TYPE_ID,
      days,
      grantedAt,
      expiresAt: addMonthsIso(grantedAt, CREDIT_EXPIRY_MONTHS),
      source: 'overtime',
      attendanceRecordId
    }
    set((s) => ({ leaveCreditGrants: [...s.leaveCreditGrants, grant] }))
    persist('leaveCreditGrants', grant.id, grant)
    const employee = get().employees.find((e) => e.id === employeeId)
    appendAuditLog({
      action: 'comp_time_granted',
      actorName: actorName(),
      entityType: 'leave_credit_grant',
      summary: `${employee?.fullName ?? 'Employee'} earned ${days} day(s) of Compensatory Time Off from ${overtimeHours}h overtime (expires ${grant.expiresAt.slice(0, 10)}).`
    })
  },

  recordAttendanceManual: (record) => {
    const existing = get().attendance.find(
      (a) => a.employeeId === record.employeeId && a.date === record.date
    )
    const saved: AttendanceRecord = existing
      ? { ...existing, ...record }
      : { ...record, id: crypto.randomUUID() }
    set((s) => ({
      attendance: existing
        ? s.attendance.map((a) => (a.id === existing.id ? saved : a))
        : [...s.attendance, saved]
    }))
    persist('attendance', saved.id, saved)
    // Gate the credit on actual hours worked past the 5:00 PM shift end, not the free-standing
    // Status dropdown or the day's overall status label — an admin backfilling a past day can
    // enter real overtime clock-in/out times while the status field is still sitting on its
    // 'present' default (which used to swallow the credit silently), and a Half Day arrival (see
    // isAfternoonOnlyArrival) who still works late still earns overtime despite that label.
    // grantOvertimeCredit itself no-ops if this record already has a grant, so re-saving an
    // already-credited day (e.g. fixing a typo in notes) is safe to repeat.
    if (saved.clockOut && overtimeHoursPastShiftEnd(saved.clockOut) > 0) {
      get().grantOvertimeCredit(
        saved.employeeId,
        overtimeHoursPastShiftEnd(saved.clockOut),
        saved.id
      )
    }
    if (!isAttendanceAuditExempt()) {
      const emp = get().employees.find((e) => e.id === saved.employeeId)
      appendAuditLog({
        action: 'attendance_recorded',
        actorName: actorName(),
        entityType: 'attendance',
        summary: `Attendance for ${emp?.fullName ?? 'employee'} on ${saved.date} recorded manually.`
      })
    }
  },

  deleteAttendanceRecord: (id) => {
    const record = get().attendance.find((a) => a.id === id)
    set((s) => ({ attendance: s.attendance.filter((a) => a.id !== id) }))
    deleteDocById('attendance', id)
    const emp = record ? get().employees.find((e) => e.id === record.employeeId) : undefined
    appendAuditLog({
      action: 'attendance_deleted',
      actorName: actorName(),
      entityType: 'attendance',
      summary: `Attendance record for ${emp?.fullName ?? 'employee'} on ${record?.date ?? id} deleted.`
    })
  },

  fileLeaveRequest: (request) => {
    const isHalfDay = !!request.halfDay && request.startDate === request.endDate
    const saved: LeaveRequest = {
      ...request,
      halfDay: isHalfDay,
      id: crypto.randomUUID(),
      daysCount: isHalfDay ? 0.5 : daysCountBetween(request.startDate, request.endDate),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    set((s) => ({ leaveRequests: [saved, ...s.leaveRequests] }))
    persist('leaveRequests', saved.id, saved)
    const emp = get().employees.find((e) => e.id === request.employeeId)
    appendAuditLog({
      action: 'leave_request_created',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request filed for ${emp?.fullName ?? 'employee'} (${request.startDate} to ${request.endDate}).`
    })
  },

  decideLeaveRequest: (id, status, notes) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target || target.status !== 'pending') return

    let attendance = state.attendance
    let touches: LeaveApprovalTouch[] | undefined

    if (status === 'approved') {
      const leaveType = state.leaveTypes.find((lt) => lt.id === target.leaveTypeId)
      const dates = datesInRange(target.startDate, target.endDate)
      const leaveStatus = target.halfDay ? ('half-day' as const) : ('leave' as const)
      const notesText = `Approved leave: ${leaveType?.name ?? 'Leave'}${target.halfDay ? ' (Half day)' : ''}`

      touches = []
      for (const date of dates) {
        const existingIdx = attendance.findIndex(
          (a) => a.employeeId === target.employeeId && a.date === date
        )
        if (existingIdx >= 0) {
          const prior = attendance[existingIdx]
          attendance = attendance.map((a, i) =>
            i === existingIdx ? { ...a, status: leaveStatus, notes: notesText } : a
          )
          touches.push({
            attendanceId: prior.id,
            wasNew: false,
            priorStatus: prior.status,
            priorNotes: prior.notes
          })
        } else {
          const created: AttendanceRecord = {
            id: crypto.randomUUID(),
            employeeId: target.employeeId,
            date,
            clockIn: null,
            clockOut: null,
            hoursWorked: null,
            status: leaveStatus,
            notes: notesText
          }
          attendance = [...attendance, created]
          touches.push({ attendanceId: created.id, wasNew: true })
        }
      }
    }

    const updatedRequest: LeaveRequest = {
      ...target,
      status,
      decisionNotes: notes,
      approvalTouches: touches
    }
    const touchedIds = new Set((touches ?? []).map((t) => t.attendanceId))
    const touchedAttendance = attendance.filter((a) => touchedIds.has(a.id))

    set({
      leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updatedRequest : r)),
      attendance
    })

    const onWriteFailure = (err: unknown) => {
      const code = (err as { code?: string })?.code
      if (code === 'permission-denied') return
      console.error('[hr.store] Failed to save leave decision:', err)
      toast.error('Failed to save changes to the server — check your connection.')
    }
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, 'leaveRequests', updatedRequest.id), stripUndefined(updatedRequest))
      for (const record of touchedAttendance) {
        batch.set(doc(db, 'attendance', record.id), stripUndefined(record))
      }
      batch.commit().catch(onWriteFailure)
    } catch (err) {
      onWriteFailure(err)
    }

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_status_updated',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request for ${emp?.fullName ?? 'employee'} marked as ${status}.`
    })
  },

  revertLeaveApproval: (id, reason) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target || target.status !== 'approved') return

    const touches = target.approvalTouches ?? []
    let attendance = state.attendance
    const removedIds: string[] = []
    const touchedIds: string[] = []

    for (const touch of touches) {
      if (touch.wasNew) {
        attendance = attendance.filter((a) => a.id !== touch.attendanceId)
        removedIds.push(touch.attendanceId)
      } else {
        attendance = attendance.map((a) =>
          a.id === touch.attendanceId
            ? { ...a, status: touch.priorStatus ?? 'present', notes: touch.priorNotes }
            : a
        )
        touchedIds.push(touch.attendanceId)
      }
    }
    const restoredRecords = attendance.filter((a) => touchedIds.includes(a.id))

    const updatedRequest: LeaveRequest = {
      ...target,
      status: 'rejected',
      decisionNotes: reason?.trim() || 'Approval reverted',
      approvalTouches: undefined
    }
    set({
      leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updatedRequest : r)),
      attendance
    })

    const onWriteFailure = (err: unknown) => {
      const code = (err as { code?: string })?.code
      if (code === 'permission-denied') return
      console.error('[hr.store] Failed to save leave revert:', err)
      toast.error('Failed to save changes to the server — check your connection.')
    }
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, 'leaveRequests', id), stripUndefined(updatedRequest))
      for (const record of restoredRecords)
        batch.set(doc(db, 'attendance', record.id), stripUndefined(record))
      for (const removedId of removedIds) batch.delete(doc(db, 'attendance', removedId))
      batch.commit().catch(onWriteFailure)
    } catch (err) {
      onWriteFailure(err)
    }

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_reverted',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave approval reverted to rejected for ${emp?.fullName ?? 'employee'} (${target.startDate} to ${target.endDate}).`
    })
  },

  deleteLeaveRequest: (id) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target) return

    const touches = target.status === 'approved' ? (target.approvalTouches ?? []) : []
    let attendance = state.attendance
    const removedIds: string[] = []
    const touchedIds: string[] = []

    for (const touch of touches) {
      if (touch.wasNew) {
        attendance = attendance.filter((a) => a.id !== touch.attendanceId)
        removedIds.push(touch.attendanceId)
      } else {
        attendance = attendance.map((a) =>
          a.id === touch.attendanceId
            ? { ...a, status: touch.priorStatus ?? 'present', notes: touch.priorNotes }
            : a
        )
        touchedIds.push(touch.attendanceId)
      }
    }
    const restoredRecords = attendance.filter((a) => touchedIds.includes(a.id))

    set({ leaveRequests: state.leaveRequests.filter((r) => r.id !== id), attendance })

    deleteDocById('leaveRequests', id)
    for (const record of restoredRecords) persist('attendance', record.id, record)
    for (const removedId of removedIds) deleteDocById('attendance', removedId)

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_deleted',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request for ${emp?.fullName ?? 'employee'} (${target.startDate} to ${target.endDate}) deleted.`
    })
  },

  updateLeaveTypeCredits: (leaveTypeId, defaultAnnualCredits) => {
    if (leaveTypeId === COMP_TIME_LEAVE_TYPE_ID) return
    set((s) => ({
      leaveTypes: s.leaveTypes.map((lt) =>
        lt.id === leaveTypeId ? { ...lt, defaultAnnualCredits } : lt
      )
    }))
    const leaveType = get().leaveTypes.find((lt) => lt.id === leaveTypeId)
    if (leaveType) persist('leaveTypes', leaveTypeId, leaveType)
    appendAuditLog({
      action: 'leave_type_credits_updated',
      actorName: actorName(),
      entityType: 'leave_type',
      summary: `Annual credits for "${leaveType?.name ?? leaveTypeId}" set to ${defaultAnnualCredits}.`
    })
  },

  addPayrollEntry: (entry) => {
    set((s) => ({ payroll: [entry, ...s.payroll] }))
    persist('payroll', entry.id, entry)
    const emp = get().employees.find((e) => e.id === entry.employeeId)
    appendAuditLog({
      action: 'payroll_created',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry.payrollNumber} created for ${emp?.fullName ?? 'employee'}.`
    })
  },
  updatePayrollEntry: (id, patch) => {
    set((s) => ({ payroll: s.payroll.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    const entry = get().payroll.find((p) => p.id === id)
    if (entry) persist('payroll', id, entry)
    appendAuditLog({
      action: 'payroll_updated',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry?.payrollNumber ?? id} updated.`
    })
  },
  deletePayrollEntry: (id) => {
    const entry = get().payroll.find((p) => p.id === id)
    set((s) => ({ payroll: s.payroll.filter((p) => p.id !== id) }))
    deleteDocById('payroll', id)
    appendAuditLog({
      action: 'payroll_deleted',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry?.payrollNumber ?? id} deleted.`
    })
  },
  setPayrollStatus: (id, status) => {
    set((s) => ({ payroll: s.payroll.map((p) => (p.id === id ? { ...p, status } : p)) }))
    const entry = get().payroll.find((p) => p.id === id)
    if (entry) persist('payroll', id, entry)
    appendAuditLog({
      action: 'payroll_status_updated',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry?.payrollNumber ?? id} marked as ${status}.`
    })
  }
}))

// ─── Derived selectors (pure functions over store state) ─────────────────────

export function getLeaveBalance(
  state: Pick<HRState, 'leaveTypes' | 'leaveRequests' | 'leaveCreditGrants' | 'employees'>,
  employeeId: string,
  leaveTypeId: string,
  year: number
) {
  const leaveType = state.leaveTypes.find((lt) => lt.id === leaveTypeId)
  const employee = state.employees.find((e) => e.id === employeeId)
  const grants = state.leaveCreditGrants.filter(
    (g) => g.employeeId === employeeId && g.leaveTypeId === leaveTypeId
  )

  // Grant-based leave types (currently just Compensatory Time Off) don't draw from an annual
  // pool — each batch of credit carries its own 3-month expiration from when it was earned, so
  // usage isn't scoped to a calendar year the way ordinary leave types are. Usage is simulated
  // FIFO against each grant in the order it was earned (oldest first): a grant that's fully used
  // before it expires simply nets to zero, and once it expires it drops out of both the total and
  // the remaining sum together — so a grant that's already been legitimately spent never lingers
  // as phantom "used" days once it's gone, the way a flat total-minus-used subtraction would.
  if (grants.length > 0) {
    const now = new Date().toISOString()
    const sortedGrants = [...grants].sort((a, b) => a.grantedAt.localeCompare(b.grantedAt))
    const approvedRequests = state.leaveRequests
      .filter(
        (r) =>
          r.employeeId === employeeId && r.leaveTypeId === leaveTypeId && r.status === 'approved'
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    const remainingByGrant = new Map(sortedGrants.map((g) => [g.id, g.days]))
    for (const request of approvedRequests) {
      let toConsume = request.daysCount
      for (const grant of sortedGrants) {
        if (toConsume <= 0) break
        if (grant.expiresAt < request.createdAt) continue
        const available = remainingByGrant.get(grant.id) ?? 0
        const take = Math.min(available, toConsume)
        remainingByGrant.set(grant.id, available - take)
        toConsume -= take
      }
    }

    const unexpiredGrants = sortedGrants.filter((g) => g.expiresAt >= now)
    const creditsTotal = unexpiredGrants.reduce((sum, g) => sum + g.days, 0)
    const creditsRemaining = unexpiredGrants.reduce(
      (sum, g) => sum + (remainingByGrant.get(g.id) ?? 0),
      0
    )
    return { creditsTotal, creditsUsed: creditsTotal - creditsRemaining, creditsRemaining }
  }

  const creditsUsed = state.leaveRequests
    .filter(
      (r) =>
        r.employeeId === employeeId &&
        r.leaveTypeId === leaveTypeId &&
        r.status === 'approved' &&
        new Date(r.startDate).getFullYear() === year
    )
    .reduce((sum, r) => sum + r.daysCount, 0)
  // An employee's own override (see Employee.leaveCreditOverrides) takes precedence over
  // the leave type's org-wide default — set from the per-employee "Edit" action on the Leave
  // Balances table, for the rare case one person's annual credit genuinely differs from
  // everyone else's (e.g. a pro-rated first year, a CBA exception).
  const creditsTotal =
    employee?.leaveCreditOverrides?.[leaveTypeId] ?? leaveType?.defaultAnnualCredits ?? 0
  return {
    creditsTotal,
    creditsUsed,
    creditsRemaining: creditsTotal - creditsUsed
  }
}

export function getAttendanceSummary(
  state: Pick<HRState, 'attendance' | 'leaveRequests' | 'leaveTypes'>,
  employeeId: string,
  periodStart: string,
  periodEnd: string
) {
  const records = state.attendance.filter(
    (a) => a.employeeId === employeeId && a.date >= periodStart && a.date <= periodEnd
  )
  const presentDays = records.filter((r) => r.status === 'present').length
  const lateDays = records.filter((r) => r.status === 'late').length
  const absentDays = records.filter((r) => r.status === 'absent').length
  const leaveDays = records.filter((r) => r.status === 'leave').length
  const halfDays = records.filter((r) => r.status === 'half-day').length
  const overtimeDays = records.filter((r) => r.status === 'overtime').length
  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0)
  // Present, Late, and Overtime all represent a full day of attendance — only the arrival/exit
  // time or the presence of extra hours differs, not how much of the day counts toward basic pay.
  // Only Half Day counts for half; Absent/Leave count for nothing here (paid leave isn't folded
  // in — see pullFromAttendance's comment in useNewPayrollEntryModal.ts).
  const daysWorked = presentDays + lateDays + overtimeDays + halfDays * 0.5
  // Summed across every record with real overtime, not just ones whose overall status reads
  // "Overtime" — a Half Day arrival who still worked past 5:00 PM earns and shows overtime hours
  // here too, same as it earns Compensatory Time Off (see isAfternoonOnlyArrival).
  const overtimeHours = records.reduce(
    (sum, r) => sum + (r.clockOut ? overtimeHoursPastShiftEnd(r.clockOut) : 0),
    0
  )

  const unpaidLeaveDays = state.leaveRequests
    .filter((r) => r.employeeId === employeeId && r.status === 'approved')
    .filter((r) => {
      const leaveType = state.leaveTypes.find((lt) => lt.id === r.leaveTypeId)
      return leaveType && !leaveType.isPaid && r.startDate <= periodEnd && r.endDate >= periodStart
    })
    .reduce((sum, r) => sum + r.daysCount, 0)

  return {
    presentDays,
    lateDays,
    absentDays,
    leaveDays,
    halfDays,
    overtimeDays,
    overtimeHours,
    totalHours,
    daysWorked,
    unpaidLeaveDays
  }
}
