import { motion } from 'framer-motion'
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { DISTRICT_COMMITTEE_POSITIONS } from '../types/districtCommittee.types'
import { useDistrictCommitteeRegistrationForm } from '../hooks/useDistrictCommitteeRegistrationForm'
import { DistrictCommitteeRegistrationExportMenu } from '../components/DistrictCommitteeRegistrationExportMenu'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const REGISTRATION_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 're-registered', label: 'Re-registered' }
]
const REG_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 're-reg', label: 'Re-Reg' }
]
const POSITION_OPTIONS = DISTRICT_COMMITTEE_POSITIONS.map((p) => ({ value: p, label: p }))

function peso(n: number) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function DistrictCommitteeRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    canManage,
    isNew,
    committee,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    registrationStatus,
    setRegistrationStatus,
    memberRows,
    addMemberRow,
    removeMemberRow,
    updateMemberRow,
    submittedByName,
    setSubmittedByName,
    submittedByDate,
    setSubmittedByDate,
    notedByName,
    setNotedByName,
    notedByDate,
    setNotedByDate,
    remittance,
    updateRemittance,
    memberCounts,
    dcGroupFee,
    setDcGroupFee,
    rorNo,
    setRorNo,
    rorDate,
    setRorDate,
    dccrNo,
    setDccrNo,
    dateOfDeposit,
    setDateOfDeposit,
    dccrSumNo,
    setDccrSumNo,
    branchCode,
    setBranchCode,
    adultsFrom,
    setAdultsFrom,
    adultsTo,
    setAdultsTo,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    handleSave
  } = useDistrictCommitteeRegistrationForm()

  if (!committee) {
    return (
      <div className="page-wrapper">
        <PageHeader
          title={t('districtCommitteeRegistration.title')}
          icon={<ClipboardList size={18} />}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/district-committee?tab=registrations')}
            >
              {t('common.back')}
            </Button>
          }
        />
        <Card>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {t('districtCommitteeRegistration.committeeNotFound')}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      key="district-committee-registration-form"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={
          isNew
            ? t('districtCommitteeRegistration.form.newTitle', { name: committee.name })
            : t('districtCommitteeRegistration.form.editTitle', { name: committee.name })
        }
        subtitle={committee.address}
        icon={<ClipboardList size={18} />}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft size={13} />}
              onClick={() => navigate('/district-committee?tab=registrations')}
            >
              {t('common.back')}
            </Button>
            {!isNew && (
              <DistrictCommitteeRegistrationExportMenu
                registration={{
                  committee,
                  schoolYear,
                  dateApplied,
                  registrationStatus,
                  members: memberRows,
                  submittedByName,
                  submittedByDate,
                  notedByName,
                  notedByDate,
                  remittance,
                  dcGroupFee: dcGroupFee.trim() ? parseFloat(dcGroupFee) : undefined,
                  rorNo,
                  rorDate,
                  dccrNo,
                  dateOfDeposit,
                  dccrSumNo,
                  branchCode,
                  cardsIssued: { adultsFrom, adultsTo },
                  processedByName,
                  approvedByName
                }}
              />
            )}
            {canManage && (
              <Button variant="primary" size="sm" onClick={handleSave}>
                {t('common.save')}
              </Button>
            )}
          </>
        }
      />

      <Card header={t('districtCommitteeRegistration.form.headerSection')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <FormField label={t('districtCommitteeRegistration.form.schoolYear')} required>
            <FieldInput value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
          </FormField>
          <FormField label={t('districtCommitteeRegistration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </FormField>
          <FormField label={t('districtCommitteeRegistration.form.registrationStatus')}>
            <FieldSelect
              value={registrationStatus}
              onChange={(e) => setRegistrationStatus(e.target.value as typeof registrationStatus)}
              options={REGISTRATION_STATUS_OPTIONS}
            />
          </FormField>
        </div>
      </Card>

      <Card
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('districtCommitteeRegistration.form.membersSection')}</span>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={13} />}
                onClick={addMemberRow}
              >
                {t('districtCommitteeRegistration.form.addMember')}
              </Button>
            )}
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {memberRows.map((member) => (
            <div
              key={member.rowId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.6fr 1fr 1.2fr 1fr 1.2fr auto',
                gap: 10,
                alignItems: 'end'
              }}
            >
              <FormField label={t('districtCommitteeRegistration.form.position')}>
                <FieldSelect
                  value={member.position}
                  onChange={(e) => updateMemberRow(member.rowId, { position: e.target.value })}
                  options={POSITION_OPTIONS}
                />
              </FormField>
              <FormField label={t('districtCommitteeRegistration.form.fullName')} required>
                <FieldInput
                  value={member.fullName}
                  onChange={(e) => updateMemberRow(member.rowId, { fullName: e.target.value })}
                />
              </FormField>
              <FormField label={t('districtCommitteeRegistration.form.birthdate')}>
                <FieldInput
                  type="date"
                  value={member.birthdate ?? ''}
                  onChange={(e) => updateMemberRow(member.rowId, { birthdate: e.target.value })}
                />
              </FormField>
              <FormField label={t('districtCommitteeRegistration.form.groupRepresented')}>
                <FieldInput
                  value={member.groupRepresented ?? ''}
                  onChange={(e) =>
                    updateMemberRow(member.rowId, { groupRepresented: e.target.value })
                  }
                />
              </FormField>
              <FormField label={t('districtCommitteeRegistration.form.regStatus')}>
                <FieldSelect
                  value={member.regStatus}
                  onChange={(e) =>
                    updateMemberRow(member.rowId, {
                      regStatus: e.target.value as typeof member.regStatus
                    })
                  }
                  options={REG_STATUS_OPTIONS}
                />
              </FormField>
              <FormField label={t('districtCommitteeRegistration.form.beneficiary')}>
                <FieldInput
                  value={member.beneficiary ?? ''}
                  onChange={(e) => updateMemberRow(member.rowId, { beneficiary: e.target.value })}
                />
              </FormField>
              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMemberRow(member.rowId)}
                  title={t('common.delete')}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card
        header={t('districtCommitteeRegistration.form.signaturesSection')}
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <FormField label={t('districtCommitteeRegistration.form.submittedByName')}>
            <FieldInput
              value={submittedByName}
              onChange={(e) => setSubmittedByName(e.target.value)}
            />
          </FormField>
          <FormField label={t('districtCommitteeRegistration.form.submittedByDate')}>
            <FieldInput
              type="date"
              value={submittedByDate}
              onChange={(e) => setSubmittedByDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('districtCommitteeRegistration.form.notedByName')}>
            <FieldInput value={notedByName} onChange={(e) => setNotedByName(e.target.value)} />
          </FormField>
          <FormField label={t('districtCommitteeRegistration.form.notedByDate')}>
            <FieldInput
              type="date"
              value={notedByDate}
              onChange={(e) => setNotedByDate(e.target.value)}
            />
          </FormField>
        </div>
      </Card>

      <Card
        header={t('districtCommitteeRegistration.form.remittanceSection')}
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div>
              <FormField label={t('districtCommitteeRegistration.form.memberFeeTotal')}>
                <FieldInput
                  type="number"
                  value={remittance.memberFeeTotal || ''}
                  onChange={(e) =>
                    updateRemittance({ memberFeeTotal: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {t('districtCommitteeRegistration.form.memberCountsHint', {
                  reReg: memberCounts.reReg,
                  new: memberCounts.new
                })}
              </p>
            </div>
            <FormField label={t('districtCommitteeRegistration.form.memberFeePerMember')}>
              <FieldInput
                type="number"
                value={remittance.memberFeePerMember || ''}
                onChange={(e) =>
                  updateRemittance({ memberFeePerMember: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <FormField label={t('districtCommitteeRegistration.form.programDevelopmentFund')}>
              <FieldInput
                type="number"
                value={remittance.programDevelopmentFund || ''}
                onChange={(e) =>
                  updateRemittance({ programDevelopmentFund: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.mutualAssistanceFund')}>
              <FieldInput
                type="number"
                value={remittance.mutualAssistanceFundContribution || ''}
                onChange={(e) =>
                  updateRemittance({
                    mutualAssistanceFundContribution: parseFloat(e.target.value) || 0
                  })
                }
              />
            </FormField>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
              fontWeight: 700
            }}
          >
            <span>{t('districtCommitteeRegistration.form.totalRemittance')}:</span>
            <span>₱{peso(remittance.totalRemittance)}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14
            }}
          >
            <FormField label={t('districtCommitteeRegistration.form.dcGroupFee')}>
              <FieldInput
                type="number"
                value={dcGroupFee}
                onChange={(e) => setDcGroupFee(e.target.value)}
              />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.adultsCardsFrom')}>
              <FieldInput value={adultsFrom} onChange={(e) => setAdultsFrom(e.target.value)} />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.adultsCardsTo')}>
              <FieldInput value={adultsTo} onChange={(e) => setAdultsTo(e.target.value)} />
            </FormField>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14
            }}
          >
            <FormField label={t('districtCommitteeRegistration.form.rorNo')}>
              <FieldInput value={rorNo} onChange={(e) => setRorNo(e.target.value)} />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.rorDate')}>
              <FieldInput
                type="date"
                value={rorDate}
                onChange={(e) => setRorDate(e.target.value)}
              />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.dccrNo')}>
              <FieldInput value={dccrNo} onChange={(e) => setDccrNo(e.target.value)} />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.dateOfDeposit')}>
              <FieldInput
                type="date"
                value={dateOfDeposit}
                onChange={(e) => setDateOfDeposit(e.target.value)}
              />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.dccrSumNo')}>
              <FieldInput value={dccrSumNo} onChange={(e) => setDccrSumNo(e.target.value)} />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.branchCode')}>
              <FieldInput value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
            </FormField>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14
            }}
          >
            <FormField label={t('districtCommitteeRegistration.form.processedByName')}>
              <FieldInput
                value={processedByName}
                onChange={(e) => setProcessedByName(e.target.value)}
              />
            </FormField>
            <FormField label={t('districtCommitteeRegistration.form.approvedByName')}>
              <FieldInput
                value={approvedByName}
                onChange={(e) => setApprovedByName(e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
