import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useAppStore } from '@/app/store/app.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { uploadFile } from '@/shared/lib/storageSync'
import { formatDate, todayLocalIso } from '@/shared/lib/utils'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { useDistrictCommitteeStore } from '@/features/districtCommittee/store/districtCommittee.store'
import { useBarangayCommitteeStore } from '@/features/barangayCommittee/store/barangayCommittee.store'
import { useTrefoilGuildStore } from '@/features/trefoilGuild/store/trefoilGuild.store'
import { useIccgMemberStore } from '@/features/iccgRegistration/store/iccgMember.store'
import { useOavfStore } from '@/features/oavf/store/oavf.store'
import { useOavfMemberStore } from '@/features/oavf/store/oavfMember.store'
import { useHonoraryMemberRegistrationStore } from '@/features/honoraryMember/store/honoraryMemberRegistration.store'
import { useHonoraryMemberStore } from '@/features/honoraryMember/store/honoraryMember.store'
import { useAssociateMemberRegistrationStore } from '@/features/associateMember/store/associateMemberRegistration.store'
import { useAssociateMemberStore } from '@/features/associateMember/store/associateMember.store'
import { buildMembershipCollectionRows } from '../lib/membershipCollectionRows'
import { useMembershipDailyCollectionsStore } from '../store/membershipDailyCollections.store'
import {
  PERSON_TAG_COLUMNS,
  type ManualMembershipReceiptLine,
  type MembershipReportAttachment,
  type PersonTag,
  type RowOverride
} from '../types/membershipDailyCollection.types'
import {
  exportMembershipDailyCollectionExcel,
  exportMembershipDailyCollectionPdf,
  exportMembershipDailyCollectionDocx,
  buildMembershipDailyCollectionPdfDoc,
  type MembershipCollectionExportRow,
  type MembershipDailyCollectionData
} from '../lib/membershipDailyCollectionExport'

export interface MembershipReportDisplayRow {
  id: string
  isManual: boolean
  payor: string
  troopNo: string
  district: string
  regFormNo: string
  rorDate: string
  rorNo: string
  amount: number
  counts: Partial<Record<PersonTag, number>>
  depositedAmount: number
  dateDeposited: string
  remarks: string
}

function newManualLine(): ManualMembershipReceiptLine {
  return {
    id: crypto.randomUUID(),
    payor: '',
    troopNo: '',
    district: '',
    regFormNo: '',
    rorNo: '',
    rorDate: '',
    amount: 0,
    personCount: 0,
    depositedAmount: 0,
    dateDeposited: '',
    remarks: ''
  }
}

export function useMembershipDailyCollectionReport() {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:membershipReports')
  const currentUser = useAppStore((s) => s.currentUser)

  const reports = useMembershipDailyCollectionsStore((s) => s.reports)
  const saveReportAction = useMembershipDailyCollectionsStore((s) => s.saveReport)
  const addAttachmentAction = useMembershipDailyCollectionsStore((s) => s.addAttachment)
  const deleteAttachmentAction = useMembershipDailyCollectionsStore((s) => s.deleteAttachment)
  const hydrateReports = useMembershipDailyCollectionsStore((s) => s.hydrate)

  const troops = useTroopsStore((s) => s.troops)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const hydrateTroops = useTroopsStore((s) => s.hydrate)
  const troopRegistrations = useTroopRegistrationStore((s) => s.registrations)
  const hydrateTroopRegistrations = useTroopRegistrationStore((s) => s.hydrate)
  const districtCommittees = useDistrictCommitteeStore((s) => s.committees)
  const districtCommitteeMembers = useDistrictCommitteeStore((s) => s.members)
  const hydrateDistrictCommittee = useDistrictCommitteeStore((s) => s.hydrate)
  const barangayCommittees = useBarangayCommitteeStore((s) => s.committees)
  const barangayCommitteeMembers = useBarangayCommitteeStore((s) => s.members)
  const hydrateBarangayCommittee = useBarangayCommitteeStore((s) => s.hydrate)
  const trefoilGuilds = useTrefoilGuildStore((s) => s.guilds)
  const trefoilGuildMembers = useTrefoilGuildStore((s) => s.members)
  const hydrateTrefoilGuild = useTrefoilGuildStore((s) => s.hydrate)
  const iccgMembers = useIccgMemberStore((s) => s.members)
  const hydrateIccgMember = useIccgMemberStore((s) => s.hydrate)
  const oavfRegistrations = useOavfStore((s) => s.registrations)
  const hydrateOavf = useOavfStore((s) => s.hydrate)
  const oavfMembers = useOavfMemberStore((s) => s.members)
  const hydrateOavfMember = useOavfMemberStore((s) => s.hydrate)
  const honoraryMemberRegistrations = useHonoraryMemberRegistrationStore((s) => s.registrations)
  const hydrateHonoraryMemberRegistration = useHonoraryMemberRegistrationStore((s) => s.hydrate)
  const honoraryMembers = useHonoraryMemberStore((s) => s.members)
  const hydrateHonoraryMember = useHonoraryMemberStore((s) => s.hydrate)
  const associateMemberRegistrations = useAssociateMemberRegistrationStore((s) => s.registrations)
  const hydrateAssociateMemberRegistration = useAssociateMemberRegistrationStore((s) => s.hydrate)
  const associateMembers = useAssociateMemberStore((s) => s.members)
  const hydrateAssociateMember = useAssociateMemberStore((s) => s.hydrate)

  async function handleRefresh() {
    await Promise.all([
      hydrateReports(true),
      hydrateTroops(true),
      hydrateTroopRegistrations(true),
      hydrateDistrictCommittee(true),
      hydrateBarangayCommittee(true),
      hydrateTrefoilGuild(true),
      hydrateIccgMember(true),
      hydrateOavf(true),
      hydrateOavfMember(true),
      hydrateHonoraryMemberRegistration(true),
      hydrateHonoraryMember(true),
      hydrateAssociateMemberRegistration(true),
      hydrateAssociateMember(true)
    ])
  }

  // Single calendar date by default, matching the paper form's one-report-per-day convention
  // — widening dateTo past dateFrom switches to a read-only consolidated view across every
  // saved day in between, same as Accounting's own Daily Collections tab.
  const [dateFrom, setDateFromRaw] = useState(todayLocalIso())
  const [dateTo, setDateToRaw] = useState(todayLocalIso())
  const isRange = dateFrom !== dateTo

  function setDateFrom(value: string) {
    setDateFromRaw(value)
    setDateToRaw((prev) => (value > prev ? value : prev))
  }
  function setDateTo(value: string) {
    setDateToRaw(value)
    setDateFromRaw((prev) => (value < prev ? value : prev))
  }

  const existingReport = !isRange ? (reports.find((r) => r.date === dateFrom) ?? null) : null

  const [manualRows, setManualRows] = useState<ManualMembershipReceiptLine[]>([])
  const [rowOverrides, setRowOverrides] = useState<Record<string, RowOverride>>({})
  const [bankBranchCode, setBankBranchCode] = useState('')
  const [remarks, setRemarks] = useState('')
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  useEffect(() => {
    if (isRange) return
    if (existingReport) {
      setManualRows(existingReport.manualRows)
      setRowOverrides(existingReport.rowOverrides)
      setBankBranchCode(existingReport.bankBranchCode ?? '')
      setRemarks(existingReport.remarks ?? '')
      return
    }
    setManualRows([])
    setRowOverrides({})
    setBankBranchCode('')
    setRemarks('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, isRange, existingReport?.id])

  // Clears the single-day editable state on entering range mode, so a stale in-progress edit
  // doesn't render mixed in with the range's read-only rows.
  useEffect(() => {
    if (!isRange) return
    setManualRows([])
    setRowOverrides({})
  }, [isRange])

  const rawAutoRows = useMemo(
    () =>
      buildMembershipCollectionRows({
        troops,
        scoutMembers,
        troopRegistrations,
        districtCommittees,
        districtCommitteeMembers,
        barangayCommittees,
        barangayCommitteeMembers,
        trefoilGuilds,
        trefoilGuildMembers,
        iccgMembers,
        oavfRegistrations,
        oavfMembers,
        honoraryMemberRegistrations,
        honoraryMembers,
        associateMemberRegistrations,
        associateMembers
      }),
    [
      troops,
      scoutMembers,
      troopRegistrations,
      districtCommittees,
      districtCommitteeMembers,
      barangayCommittees,
      barangayCommitteeMembers,
      trefoilGuilds,
      trefoilGuildMembers,
      iccgMembers,
      oavfRegistrations,
      oavfMembers,
      honoraryMemberRegistrations,
      honoraryMembers,
      associateMemberRegistrations,
      associateMembers
    ]
  )

  const autoRows = useMemo(
    () => rawAutoRows.filter((r) => r.date >= dateFrom && r.date <= dateTo),
    [rawAutoRows, dateFrom, dateTo]
  )

  // Every saved report touching the selected range — only meaningful in range mode, where it
  // supplies the (read-only) manual rows, row overrides, and attachments that would otherwise
  // live behind each individual day's editable form.
  const rangeReports = useMemo(
    () => reports.filter((r) => r.date >= dateFrom && r.date <= dateTo),
    [reports, dateFrom, dateTo]
  )

  const effectiveManualRows = isRange ? rangeReports.flatMap((r) => r.manualRows) : manualRows
  const effectiveRowOverrides: Record<string, RowOverride> = isRange
    ? rangeReports.reduce(
        (acc, r) => ({ ...acc, ...r.rowOverrides }),
        {} as Record<string, RowOverride>
      )
    : rowOverrides
  const effectiveBankBranchCode = isRange
    ? (rangeReports.find((r) => r.bankBranchCode)?.bankBranchCode ?? '')
    : bankBranchCode
  const effectiveRemarks = isRange
    ? rangeReports
        .map((r) => r.remarks)
        .filter((r): r is string => !!r)
        .join('; ')
    : remarks
  const effectiveAttachments: MembershipReportAttachment[] = isRange
    ? rangeReports.flatMap((r) => r.attachments)
    : (existingReport?.attachments ?? [])

  const rows: MembershipReportDisplayRow[] = useMemo(() => {
    const fromAuto = autoRows.map((r) => {
      const ov = effectiveRowOverrides[r.id]
      return {
        id: r.id,
        isManual: false,
        payor: r.payor,
        troopNo: r.troopNo ?? '',
        district: r.district ?? '',
        regFormNo: r.regFormNo ?? '',
        rorDate: r.rorDate ?? '',
        rorNo: r.rorNo ?? '',
        amount: r.amount,
        counts: r.personCounts ?? {},
        depositedAmount: ov?.depositedAmount ?? 0,
        dateDeposited: ov?.dateDeposited ?? '',
        remarks: ov?.remarks ?? ''
      }
    })
    const fromManual = effectiveManualRows.map((l) => ({
      id: l.id,
      isManual: true,
      payor: l.payor,
      troopNo: l.troopNo,
      district: l.district,
      regFormNo: l.regFormNo,
      rorDate: l.rorDate,
      rorNo: l.rorNo,
      amount: l.amount,
      counts: l.personTag ? { [l.personTag]: l.personCount } : {},
      depositedAmount: l.depositedAmount,
      dateDeposited: l.dateDeposited,
      remarks: l.remarks
    }))
    return [...fromAuto, ...fromManual]
  }, [autoRows, effectiveRowOverrides, effectiveManualRows])

  const columnTotals = useMemo(() => {
    const totals: Partial<Record<PersonTag, number>> = {}
    for (const row of rows) {
      for (const col of PERSON_TAG_COLUMNS) {
        if (row.counts[col.key])
          totals[col.key] = (totals[col.key] ?? 0) + (row.counts[col.key] ?? 0)
      }
    }
    return totals
  }, [rows])

  const totalCashCollection = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows])
  const totalDeposited = useMemo(() => rows.reduce((s, r) => s + r.depositedAmount, 0), [rows])
  const underOverDeposit = totalCashCollection - totalDeposited

  function addManualRow() {
    if (!canManage || isRange) return
    setManualRows((p) => [...p, newManualLine()])
  }
  function updateManualRow(id: string, patch: Partial<ManualMembershipReceiptLine>) {
    if (isRange) return
    setManualRows((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function removeManualRow(id: string) {
    if (isRange) return
    setManualRows((p) => p.filter((l) => l.id !== id))
  }

  function setAutoRowOverride(rowId: string, patch: Partial<RowOverride>) {
    if (!canManage || isRange) return
    setRowOverrides((p) => ({ ...p, [rowId]: { ...p[rowId], ...patch } }))
  }

  function handleSave() {
    if (!canManage || isRange) return
    saveReportAction({
      date: dateFrom,
      manualRows,
      rowOverrides,
      bankBranchCode,
      remarks,
      preparedBy: existingReport?.preparedBy ?? currentUser?.fullName ?? 'System'
    })
    toast.success(t('membershipReports.toast.saved'))
  }

  async function handleUploadAttachment(file: File) {
    if (!canManage || isRange) return
    setUploadingAttachment(true)
    try {
      const path = `membershipDailyCollectionAttachments/${dateFrom}/${Date.now()}-${file.name}`
      const url = await uploadFile(path, file)
      addAttachmentAction(dateFrom, {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        storagePath: path,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.fullName ?? 'System'
      })
      toast.success(t('membershipReports.toast.attachmentUploaded'))
    } catch {
      toast.error(t('membershipReports.toast.attachmentFailed'))
    } finally {
      setUploadingAttachment(false)
    }
  }

  function handleDeleteAttachment(attachmentId: string) {
    if (!canManage || isRange || !existingReport) return
    deleteAttachmentAction(existingReport.id, attachmentId)
    toast.success(t('membershipReports.toast.attachmentDeleted'))
  }

  const preparedByDisplay = existingReport?.preparedBy ?? currentUser?.fullName ?? ''
  const dateLabel = isRange
    ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
    : formatDate(dateFrom)

  const isSaved =
    !isRange &&
    !!existingReport &&
    JSON.stringify(existingReport.manualRows) === JSON.stringify(manualRows) &&
    JSON.stringify(existingReport.rowOverrides) === JSON.stringify(rowOverrides) &&
    (existingReport.bankBranchCode ?? '') === bankBranchCode &&
    (existingReport.remarks ?? '') === remarks

  function reportData(): MembershipDailyCollectionData {
    const exportRows: MembershipCollectionExportRow[] = rows.map((r) => ({
      payor: r.payor,
      troopNo: r.troopNo,
      district: r.district,
      regFormNo: r.regFormNo,
      rorDate: r.rorDate ? formatDate(r.rorDate) : '',
      rorNo: r.rorNo,
      amount: r.amount,
      counts: r.counts,
      totalDeposited: r.depositedAmount,
      dateDeposited: r.dateDeposited ? formatDate(r.dateDeposited) : '',
      remarks: r.remarks
    }))
    return {
      dateLabel,
      preparedBy: preparedByDisplay,
      rows: exportRows,
      totalCashCollection,
      totalDeposited,
      underOverDeposit,
      bankBranchCode: effectiveBankBranchCode,
      remarks: effectiveRemarks
    }
  }

  async function handleView() {
    preview.openPreview(await buildMembershipDailyCollectionPdfDoc(reportData()))
  }
  function handleExportExcel() {
    exportMembershipDailyCollectionExcel(reportData())
    toast.success(t('membershipReports.toast.excel'))
  }
  function handleExportPdf() {
    exportMembershipDailyCollectionPdf(reportData())
    toast.success(t('membershipReports.toast.pdf'))
  }
  function handleExportWord() {
    exportMembershipDailyCollectionDocx(reportData())
    toast.success(t('membershipReports.toast.word'))
  }

  return {
    canManage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRange,
    dateLabel,
    rows,
    columnTotals,
    totalCashCollection,
    totalDeposited,
    underOverDeposit,
    bankBranchCode: effectiveBankBranchCode,
    setBankBranchCode,
    remarks: effectiveRemarks,
    setRemarks,
    addManualRow,
    updateManualRow,
    removeManualRow,
    setAutoRowOverride,
    isSaved,
    handleSave,
    handleRefresh,
    attachments: effectiveAttachments,
    uploadingAttachment,
    handleUploadAttachment,
    handleDeleteAttachment,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preparedByDisplay
  }
}
