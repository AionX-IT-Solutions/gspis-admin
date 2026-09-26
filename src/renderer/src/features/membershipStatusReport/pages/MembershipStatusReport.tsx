import { motion } from 'framer-motion'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Settings2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { FormField, FieldSelect, FieldInput } from '@/shared/components/ui/FormField'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import { useTroopRegistrationStore } from '@/features/troopRegistration/store/troopRegistration.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
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
import { useMembershipGoalsStore } from '../store/membershipGoals.store'
import { useMembershipStatusReport } from '../hooks/useMembershipStatusReport'
import { EditGoalsModal } from '../components/EditGoalsModal'
import {
  buildMembershipStatusReportPdfDoc,
  exportMembershipStatusReportExcel,
  exportMembershipStatusReportPdf,
  exportMembershipStatusReportDocx
} from '../lib/membershipStatusReportExport'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const th: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--text-muted)',
  padding: '4px 6px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border-subtle)'
}
const td: CSSProperties = {
  padding: '4px 6px',
  fontSize: 11,
  textAlign: 'center',
  borderBottom: '1px solid var(--border-subtle)'
}
const tdLeft: CSSProperties = { ...td, textAlign: 'left', whiteSpace: 'nowrap' }
const groupTh: CSSProperties = {
  ...th,
  borderBottom: '1px solid var(--border-subtle)',
  background: 'var(--c-thead-bg)'
}
const divider: CSSProperties = { borderLeft: '1.5px solid var(--text-muted)' }

const SUB_HEADERS_UNITS = [
  'TW',
  'ST',
  'JR',
  'SR',
  'CDT',
  'BC',
  'DC',
  'AM',
  'HM',
  'TG',
  'CW',
  'ICCG'
]
const SUB_HEADERS_PEOPLE = [
  'TW',
  'ST',
  'JR',
  'SR',
  'CDT',
  'TG',
  'ICCG',
  'BC',
  'TL',
  'DC',
  'AM',
  'HM',
  'CW'
]
const UNIT_KEYS = [
  'tw',
  'st',
  'jr',
  'sr',
  'cdt',
  'bc',
  'dc',
  'am',
  'hm',
  'tg',
  'cw',
  'iccg'
] as const
const PEOPLE_KEYS = [
  'tw',
  'st',
  'jr',
  'sr',
  'cdt',
  'tg',
  'iccg',
  'bc',
  'tl',
  'dc',
  'am',
  'hm',
  'cw'
] as const

function dash(n: number) {
  return n === 0 ? '—' : n
}

interface CategoryLinkTarget {
  path: string
  extraParams?: Record<string, string>
}

// Where each report column's count actually comes from — clicking a cell (even a "—") jumps
// straight to that source module's list, pre-filtered to this district (and, for the age-level
// columns, the matching Troop Registration age level too), so staff can go register/fix data
// without hunting for the right page first. district is always chosen from a fixed dropdown
// (see ILOCOS_SUR_DISTRICTS) on every module's own form, so these links can't drift from a
// typo'd district name. 'tl' (Troop Leaders) has no standalone list of its own — leaders are
// embedded inside each Troop Registration — so it's left unlinked.
const CATEGORY_LINKS: Partial<Record<(typeof PEOPLE_KEYS)[number], CategoryLinkTarget>> = {
  tw: { path: '/troops', extraParams: { tab: 'registrations', ageLevel: 'Twinkler' } },
  st: { path: '/troops', extraParams: { tab: 'registrations', ageLevel: 'Star' } },
  jr: { path: '/troops', extraParams: { tab: 'registrations', ageLevel: 'Junior' } },
  sr: { path: '/troops', extraParams: { tab: 'registrations', ageLevel: 'Senior' } },
  cdt: { path: '/troops', extraParams: { tab: 'registrations', ageLevel: 'Cadet' } },
  bc: { path: '/barangay-committee', extraParams: { tab: 'registrations' } },
  dc: { path: '/district-committee', extraParams: { tab: 'registrations' } },
  am: { path: '/associate-members', extraParams: { tab: 'members' } },
  hm: { path: '/honorary-members', extraParams: { tab: 'members' } },
  tg: { path: '/trefoil-guild', extraParams: { tab: 'registrations' } },
  cw: { path: '/oavf', extraParams: { tab: 'members' } },
  // Counts here are computed from filed registrations (see useMembershipStatusReport.ts),
  // not the persistent Members roster — deep-link straight to that tab (its district
  // filtering is what the ?district= param below actually narrows) rather than the
  // default-open Members tab.
  iccg: { path: '/iccg-registrations', extraParams: { tab: 'registrations' } }
}

function categoryLinkHref(target: CategoryLinkTarget, district: string | null): string {
  const params = new URLSearchParams(target.extraParams)
  if (district) params.set('district', district)
  const qs = params.toString()
  return qs ? `${target.path}?${qs}` : target.path
}

const linkStyle: CSSProperties = { color: 'var(--accent-primary)', textDecoration: 'underline' }

/** A district's (or the Grand Total's, when `district` is null) count for one column — linked
 *  to that column's source module when one exists, plain text otherwise. */
function ReportCell({
  category,
  value,
  district
}: {
  category: (typeof PEOPLE_KEYS)[number]
  value: number
  district: string | null
}) {
  const target = CATEGORY_LINKS[category]
  const label = dash(value)
  if (!target) return <>{label}</>
  return (
    <Link to={categoryLinkHref(target, district)} style={linkStyle}>
      {label}
    </Link>
  )
}

function asOfLabel() {
  return new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

export function MembershipStatusReport() {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [showNewYearModal, setShowNewYearModal] = useState(false)
  const [newYearLabel, setNewYearLabel] = useState('')
  const {
    schoolYear,
    setSchoolYear,
    availableYears,
    suggestedNextYear,
    handleCreateMembershipYear,
    districtRows,
    goalRows,
    currentGoals,
    updateGoals
  } = useMembershipStatusReport()

  const hydrateTroopRegistrations = useTroopRegistrationStore((s) => s.hydrate)
  const hydrateTroops = useTroopsStore((s) => s.hydrate)
  const hydrateDistrictCommittees = useDistrictCommitteeStore((s) => s.hydrate)
  const hydrateDistrictCommitteeRegistrations = useDistrictCommitteeRegistrationStore(
    (s) => s.hydrate
  )
  const hydrateBarangayCommittees = useBarangayCommitteeStore((s) => s.hydrate)
  const hydrateBarangayCommitteeRegistrations = useBarangayCommitteeRegistrationStore(
    (s) => s.hydrate
  )
  const hydrateTrefoilGuilds = useTrefoilGuildStore((s) => s.hydrate)
  const hydrateTrefoilGuildRegistrations = useTrefoilGuildRegistrationStore((s) => s.hydrate)
  const hydrateOavf = useOavfStore((s) => s.hydrate)
  const hydrateOavfMembers = useOavfMemberStore((s) => s.hydrate)
  const hydrateHonoraryMembers = useHonoraryMemberStore((s) => s.hydrate)
  const hydrateHonoraryMemberRegistrations = useHonoraryMemberRegistrationStore((s) => s.hydrate)
  const hydrateAssociateMembers = useAssociateMemberStore((s) => s.hydrate)
  const hydrateAssociateMemberRegistrations = useAssociateMemberRegistrationStore((s) => s.hydrate)
  const hydrateIccgRegistrations = useIccgRegistrationStore((s) => s.hydrate)
  const hydrateMembershipGoals = useMembershipGoalsStore((s) => s.hydrate)

  async function handleRefresh() {
    await Promise.all([
      hydrateTroopRegistrations(true),
      hydrateTroops(true),
      hydrateDistrictCommittees(true),
      hydrateDistrictCommitteeRegistrations(true),
      hydrateBarangayCommittees(true),
      hydrateBarangayCommitteeRegistrations(true),
      hydrateTrefoilGuilds(true),
      hydrateTrefoilGuildRegistrations(true),
      hydrateOavf(true),
      hydrateOavfMembers(true),
      hydrateHonoraryMembers(true),
      hydrateHonoraryMemberRegistrations(true),
      hydrateAssociateMembers(true),
      hydrateAssociateMemberRegistrations(true),
      hydrateIccgRegistrations(true),
      hydrateMembershipGoals(true)
    ])
  }

  const asOf = asOfLabel()

  return (
    <motion.div
      key="membership-status-report"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('membershipStatusReport.title')}
        subtitle={t('membershipStatusReport.subtitle')}
        icon={<ClipboardCheck size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={handleRefresh} />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Settings2 size={13} />}
              onClick={() => setShowGoalsModal(true)}
            >
              {t('membershipStatusReport.goals.editButton')}
            </Button>
            <ExportMenu
              label={t('membershipStatusReport.exportLabel')}
              onView={async () =>
                preview.openPreview(
                  await buildMembershipStatusReportPdfDoc(districtRows, schoolYear, goalRows, asOf)
                )
              }
              onExportExcel={() => {
                exportMembershipStatusReportExcel(districtRows, schoolYear, goalRows, asOf)
                toast.success(t('membershipStatusReport.toast.exportedExcel'))
              }}
              onExportPdf={() => {
                exportMembershipStatusReportPdf(districtRows, schoolYear, goalRows, asOf)
                toast.success(t('membershipStatusReport.toast.exportedPdf'))
              }}
              onExportWord={() => {
                exportMembershipStatusReportDocx(districtRows, schoolYear, goalRows, asOf)
                toast.success(t('membershipStatusReport.toast.exportedWord'))
              }}
            />
          </>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 260, flex: 1, minWidth: 200 }}>
            <FormField label={t('membershipStatusReport.schoolYear')}>
              <FieldSelect
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                options={availableYears.map((y) => ({ value: y, label: y }))}
              />
            </FormField>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={() => {
              setNewYearLabel(suggestedNextYear)
              setShowNewYearModal(true)
            }}
          >
            {t('membershipStatusReport.newYearButton')}
          </Button>
        </div>
      </Card>

      <Card padding="0px">
        <div style={{ overflowX: 'auto', padding: 12 }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 1400 }}>
            <thead>
              <tr>
                <th style={{ ...groupTh, textAlign: 'left' }} rowSpan={2}>
                  {t('membershipStatusReport.table.district')}
                </th>
                <th style={{ ...groupTh, ...divider }} colSpan={SUB_HEADERS_UNITS.length}>
                  {t('membershipStatusReport.table.troopsUnits')}
                </th>
                <th style={{ ...groupTh, ...divider }} colSpan={SUB_HEADERS_PEOPLE.length}>
                  {t('membershipStatusReport.table.girlsAdults')}
                </th>
                <th style={{ ...groupTh, ...divider }} colSpan={2}>
                  {t('membershipStatusReport.table.totalNo')}
                </th>
              </tr>
              <tr>
                {SUB_HEADERS_UNITS.map((h, i) => (
                  <th key={`u-${i}`} style={i === 0 ? { ...th, ...divider } : th}>
                    {h}
                  </th>
                ))}
                {SUB_HEADERS_PEOPLE.map((h, i) => (
                  <th key={`p-${i}`} style={i === 0 ? { ...th, ...divider } : th}>
                    {h}
                  </th>
                ))}
                <th style={{ ...th, ...divider }}>{t('membershipStatusReport.table.girls')}</th>
                <th style={th}>{t('membershipStatusReport.table.adults')}</th>
              </tr>
            </thead>
            <tbody>
              {districtRows.map((row, i) => {
                const isTotal = i === districtRows.length - 1
                const linkDistrict = isTotal ? null : row.district
                return (
                  <tr key={row.district} style={{ fontWeight: isTotal ? 700 : 400 }}>
                    <td style={tdLeft}>{row.district}</td>
                    {UNIT_KEYS.map((k, i) => (
                      <td key={k} style={i === 0 ? { ...td, ...divider } : td}>
                        <ReportCell category={k} value={row.units[k]} district={linkDistrict} />
                      </td>
                    ))}
                    {PEOPLE_KEYS.map((k, i) => (
                      <td key={k} style={i === 0 ? { ...td, ...divider } : td}>
                        <ReportCell category={k} value={row.people[k]} district={linkDistrict} />
                      </td>
                    ))}
                    <td style={{ ...td, ...divider }}>{dash(row.totalGirls)}</td>
                    <td style={td}>{dash(row.totalAdults)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card header={t('membershipStatusReport.goals.title')} style={{ marginTop: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: 'left' }}>
                  {t('membershipStatusReport.goals.category')}
                </th>
                <th style={th}>{t('membershipStatusReport.goals.goal')}</th>
                <th style={th}>{t('membershipStatusReport.goals.achieved')}</th>
                <th style={th}>{t('membershipStatusReport.goals.balance')}</th>
              </tr>
            </thead>
            <tbody>
              {goalRows.map((g) => {
                const balance = g.goal - g.achieved
                return (
                  <tr key={g.key}>
                    <td style={tdLeft}>{g.label}</td>
                    <td style={td}>{g.goal.toLocaleString()}</td>
                    <td style={td}>{g.achieved.toLocaleString()}</td>
                    <td style={{ ...td, color: balance < 0 ? 'var(--success)' : undefined }}>
                      {balance >= 0
                        ? balance.toLocaleString()
                        : `Goal met +${(-balance).toLocaleString()}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <EditGoalsModal
        open={showGoalsModal}
        onOpenChange={setShowGoalsModal}
        schoolYear={schoolYear}
        currentGoals={currentGoals}
        onSave={updateGoals}
      />

      <Modal
        open={showNewYearModal}
        onOpenChange={setShowNewYearModal}
        title={t('membershipStatusReport.newYearModal.title')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowNewYearModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleCreateMembershipYear(newYearLabel)
                setShowNewYearModal(false)
              }}
            >
              {t('membershipStatusReport.newYearModal.createButton')}
            </Button>
          </>
        }
      >
        <FormField label={t('membershipStatusReport.newYearModal.yearLabel')} required>
          <FieldInput
            value={newYearLabel}
            onChange={(e) => setNewYearLabel(e.target.value)}
            placeholder="2027-2028"
          />
        </FormField>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          {t('membershipStatusReport.newYearModal.hint', { year: schoolYear })}
        </p>
      </Modal>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('membershipStatusReport.title')} — ${schoolYear}`}
        onDownloadExcel={() => {
          exportMembershipStatusReportExcel(districtRows, schoolYear, goalRows, asOf)
          toast.success(t('membershipStatusReport.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportMembershipStatusReportPdf(districtRows, schoolYear, goalRows, asOf)
          toast.success(t('membershipStatusReport.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportMembershipStatusReportDocx(districtRows, schoolYear, goalRows, asOf)
          toast.success(t('membershipStatusReport.toast.exportedWord'))
        }}
      />
    </motion.div>
  )
}
