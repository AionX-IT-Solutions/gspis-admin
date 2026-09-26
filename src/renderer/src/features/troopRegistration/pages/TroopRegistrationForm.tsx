import { motion } from 'framer-motion'
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { REGISTRATION_AGE_LEVELS } from '../types/troopRegistration.types'
import { useTroopRegistrationForm } from '../hooks/useTroopRegistrationForm'
import { TroopRegistrationExportMenu } from '../components/TroopRegistrationExportMenu'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

const TROOP_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 're-registered', label: 'Re-registered' }
]
const REG_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 're-reg', label: 'Re-Reg' }
]
const RBO_STATUS_OPTIONS = [
  { value: 'old', label: 'Old' },
  { value: 'new', label: 'New' }
]
const TRAINED_OPTIONS = [
  { value: 'true', label: 'Trained' },
  { value: 'false', label: 'Not Trained' }
]
const AGE_LEVEL_OPTIONS = REGISTRATION_AGE_LEVELS.map((l) => ({ value: l, label: l }))

function peso(n: number) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TroopRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    canManage,
    isNew,
    troop,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    troopStatus,
    setTroopStatus,
    ageLevel,
    setAgeLevel,
    leaders,
    addLeaderRow,
    removeLeaderRow,
    updateLeaderRow,
    members,
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
    troopNo,
    setTroopNo,
    cardsIssued,
    setCardsIssued,
    girlsIdCardSeriesYear,
    setGirlsIdCardSeriesYear,
    adultsIdCardSeriesYear,
    setAdultsIdCardSeriesYear,
    troopFee,
    setTroopFee,
    rorNo,
    setRorNo,
    rorDate,
    setRorDate,
    dccrNo,
    setDccrNo,
    dateOfDeposit,
    setDateOfDeposit,
    branchCode,
    setBranchCode,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    councilShare,
    handleSave
  } = useTroopRegistrationForm()

  if (!troop) {
    return (
      <div className="page-wrapper">
        <PageHeader
          title={t('troopRegistration.title')}
          icon={<ClipboardList size={18} />}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/troops?tab=registrations')}
            >
              {t('common.back')}
            </Button>
          }
        />
        <Card>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {t('troopRegistration.troopNotFound')}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      key="troop-registration-form"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={
          isNew
            ? t('troopRegistration.form.newTitle', { troopNumber: troop.troopNumber })
            : t('troopRegistration.form.editTitle', { troopNumber: troop.troopNumber })
        }
        subtitle={troop.troopName}
        icon={<ClipboardList size={18} />}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft size={13} />}
              onClick={() => navigate('/troops?tab=registrations')}
            >
              {t('common.back')}
            </Button>
            {!isNew && (
              <TroopRegistrationExportMenu
                registration={{
                  troop,
                  schoolYear,
                  dateApplied,
                  troopStatus,
                  ageLevel,
                  leaders,
                  members,
                  submittedByName,
                  submittedByDate,
                  notedByName,
                  notedByDate,
                  remittance,
                  troopNo,
                  cardsIssued,
                  girlsIdCardSeriesYear,
                  adultsIdCardSeriesYear,
                  troopFee: troopFee.trim() ? parseFloat(troopFee) : undefined,
                  rorNo,
                  rorDate,
                  dccrNo,
                  dateOfDeposit,
                  branchCode,
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

      <Card header={t('troopRegistration.form.headerSection')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <FormField label={t('troopRegistration.form.schoolYear')} required>
            <FieldInput value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
          </FormField>
          <FormField label={t('troopRegistration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </FormField>
          <FormField label={t('troopRegistration.form.troopStatus')}>
            <FieldSelect
              value={troopStatus}
              onChange={(e) => setTroopStatus(e.target.value as typeof troopStatus)}
              options={TROOP_STATUS_OPTIONS}
            />
          </FormField>
          <FormField label={t('troopRegistration.form.ageLevel')}>
            <FieldSelect
              value={ageLevel}
              onChange={(e) => setAgeLevel(e.target.value as typeof ageLevel)}
              options={AGE_LEVEL_OPTIONS}
            />
          </FormField>
        </div>
      </Card>

      <Card
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('troopRegistration.form.leadersSection')}</span>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={13} />}
                onClick={addLeaderRow}
              >
                {t('troopRegistration.form.addLeader')}
              </Button>
            )}
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaders.map((leader) => (
            <div
              key={leader.rowId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 1.3fr auto',
                gap: 10,
                alignItems: 'end'
              }}
            >
              <FormField label={t('troopRegistration.form.position')}>
                <FieldInput
                  value={leader.position}
                  onChange={(e) => updateLeaderRow(leader.rowId, { position: e.target.value })}
                  placeholder="Troop Leader"
                />
              </FormField>
              <FormField label={t('troopRegistration.form.name')}>
                <FieldInput
                  value={leader.name}
                  onChange={(e) => updateLeaderRow(leader.rowId, { name: e.target.value })}
                />
              </FormField>
              <FormField label={t('troopRegistration.form.trained')}>
                <FieldSelect
                  value={String(leader.trained)}
                  onChange={(e) =>
                    updateLeaderRow(leader.rowId, { trained: e.target.value === 'true' })
                  }
                  options={TRAINED_OPTIONS}
                />
              </FormField>
              <FormField label={t('troopRegistration.form.rboStatus')}>
                <FieldSelect
                  value={leader.rboStatus}
                  onChange={(e) =>
                    updateLeaderRow(leader.rowId, {
                      rboStatus: e.target.value as typeof leader.rboStatus
                    })
                  }
                  options={RBO_STATUS_OPTIONS}
                />
              </FormField>
              <FormField label={t('troopRegistration.form.birthdate')}>
                <FieldInput
                  type="date"
                  value={leader.birthdate ?? ''}
                  onChange={(e) => updateLeaderRow(leader.rowId, { birthdate: e.target.value })}
                />
              </FormField>
              <FormField label={t('troopRegistration.form.beneficiary')}>
                <FieldInput
                  value={leader.beneficiary ?? ''}
                  onChange={(e) => updateLeaderRow(leader.rowId, { beneficiary: e.target.value })}
                />
              </FormField>
              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLeaderRow(leader.rowId)}
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
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('troopRegistration.form.membersSection')}</span>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Plus size={13} />}
                onClick={addMemberRow}
              >
                {t('troopRegistration.form.addMember')}
              </Button>
            )}
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((member) => (
              <div
                key={member.rowId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 0.7fr 1fr 1.3fr auto',
                  gap: 10,
                  alignItems: 'end'
                }}
              >
                <FormField label={t('troopRegistration.form.name')}>
                  <FieldInput
                    value={member.fullName}
                    onChange={(e) => updateMemberRow(member.rowId, { fullName: e.target.value })}
                  />
                </FormField>
                <FormField label={t('troopRegistration.form.birthdate')}>
                  <FieldInput
                    type="date"
                    value={member.birthdate}
                    onChange={(e) => updateMemberRow(member.rowId, { birthdate: e.target.value })}
                  />
                </FormField>
                <FormField label={t('troopRegistration.form.gradeYear')}>
                  <FieldInput
                    value={member.gradeYear ?? ''}
                    onChange={(e) => updateMemberRow(member.rowId, { gradeYear: e.target.value })}
                    placeholder="VI"
                  />
                </FormField>
                <FormField label={t('troopRegistration.form.regStatus')}>
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
                <FormField label={t('troopRegistration.form.beneficiary')}>
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
        </div>
      </Card>

      <Card header={t('troopRegistration.form.signaturesSection')} style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('troopRegistration.form.submittedByName')}>
            <FieldInput
              value={submittedByName}
              onChange={(e) => setSubmittedByName(e.target.value)}
            />
          </FormField>
          <FormField label={t('troopRegistration.form.submittedByDate')}>
            <FieldInput
              type="date"
              value={submittedByDate}
              onChange={(e) => setSubmittedByDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('troopRegistration.form.notedByName')}>
            <FieldInput value={notedByName} onChange={(e) => setNotedByName(e.target.value)} />
          </FormField>
          <FormField label={t('troopRegistration.form.notedByDate')}>
            <FieldInput
              type="date"
              value={notedByDate}
              onChange={(e) => setNotedByDate(e.target.value)}
            />
          </FormField>
        </div>
      </Card>

      <Card
        header={t('troopRegistration.form.remittanceSection')}
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>
              {t('troopRegistration.form.gspMembershipFee')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <FormField label={t('troopRegistration.form.girlsReReg')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeGirlsReReg || ''}
                  onChange={(e) =>
                    updateRemittance({ membershipFeeGirlsReReg: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <FormField label={t('troopRegistration.form.girlsNew')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeGirlsNew || ''}
                  onChange={(e) =>
                    updateRemittance({ membershipFeeGirlsNew: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <div />
              <FormField label={t('troopRegistration.form.leaderReReg')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeLeaderReReg || ''}
                  onChange={(e) =>
                    updateRemittance({ membershipFeeLeaderReReg: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <FormField label={t('troopRegistration.form.leaderNew')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeLeaderNew || ''}
                  onChange={(e) =>
                    updateRemittance({ membershipFeeLeaderNew: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <div />
              <FormField label={t('troopRegistration.form.coLeaderReReg')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeCoLeaderReReg || ''}
                  onChange={(e) =>
                    updateRemittance({
                      membershipFeeCoLeaderReReg: parseFloat(e.target.value) || 0
                    })
                  }
                />
              </FormField>
              <FormField label={t('troopRegistration.form.coLeaderNew')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeeCoLeaderNew || ''}
                  onChange={(e) =>
                    updateRemittance({ membershipFeeCoLeaderNew: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                background: 'var(--glass-bg)',
                border: '1px dashed var(--border-default)'
              }}
            >
              <FormField label={t('troopRegistration.form.membershipFeePerMemberTotal')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeePerMemberTotal || ''}
                  onChange={(e) =>
                    updateRemittance({
                      membershipFeePerMemberTotal: parseFloat(e.target.value) || 0
                    })
                  }
                />
              </FormField>
              <FormField label={t('troopRegistration.form.membershipFeePerMemberCouncilShare')}>
                <FieldInput
                  type="number"
                  value={remittance.membershipFeePerMemberCouncilShare || ''}
                  onChange={(e) =>
                    updateRemittance({
                      membershipFeePerMemberCouncilShare: parseFloat(e.target.value) || 0
                    })
                  }
                />
              </FormField>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {t('troopRegistration.form.councilRetainedShare')}
                </span>
                <span style={{ fontWeight: 700 }}>₱{peso(councilShare)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <FormField label={t('troopRegistration.form.programDevelopmentFund')}>
              <FieldInput
                type="number"
                value={remittance.programDevelopmentFund || ''}
                onChange={(e) =>
                  updateRemittance({ programDevelopmentFund: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label={t('troopRegistration.form.mutualAssistanceFund')}>
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
            <FormField label={t('troopRegistration.form.magazineSubscriptionFee')}>
              <FieldInput
                type="number"
                value={remittance.magazineSubscriptionFee || ''}
                onChange={(e) =>
                  updateRemittance({ magazineSubscriptionFee: parseFloat(e.target.value) || 0 })
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
            <span>{t('troopRegistration.form.totalRemittance')}:</span>
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
            <FormField label={t('troopRegistration.form.troopNo')}>
              <FieldInput value={troopNo} onChange={(e) => setTroopNo(e.target.value)} />
            </FormField>
            <FormField label={t('troopRegistration.form.girlsCardsFrom')}>
              <FieldInput
                value={cardsIssued.girlsFrom ?? ''}
                onChange={(e) => setCardsIssued({ ...cardsIssued, girlsFrom: e.target.value })}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.girlsCardsTo')}>
              <FieldInput
                value={cardsIssued.girlsTo ?? ''}
                onChange={(e) => setCardsIssued({ ...cardsIssued, girlsTo: e.target.value })}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.girlsIdCardSeriesYear')}>
              <FieldInput
                value={girlsIdCardSeriesYear}
                onChange={(e) => setGirlsIdCardSeriesYear(e.target.value)}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.troopFee')}>
              <FieldInput
                type="number"
                value={troopFee}
                onChange={(e) => setTroopFee(e.target.value)}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.thinkingDayFee')}>
              <FieldInput
                type="number"
                value={remittance.thinkingDayFee || ''}
                onChange={(e) =>
                  updateRemittance({ thinkingDayFee: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label={t('troopRegistration.form.adultsCardsFrom')}>
              <FieldInput
                value={cardsIssued.adultsFrom ?? ''}
                onChange={(e) => setCardsIssued({ ...cardsIssued, adultsFrom: e.target.value })}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.adultsCardsTo')}>
              <FieldInput
                value={cardsIssued.adultsTo ?? ''}
                onChange={(e) => setCardsIssued({ ...cardsIssued, adultsTo: e.target.value })}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.adultsIdCardSeriesYear')}>
              <FieldInput
                value={adultsIdCardSeriesYear}
                onChange={(e) => setAdultsIdCardSeriesYear(e.target.value)}
              />
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
            <FormField label={t('troopRegistration.form.rorNo')}>
              <FieldInput value={rorNo} onChange={(e) => setRorNo(e.target.value)} />
            </FormField>
            <FormField label={t('troopRegistration.form.rorDate')}>
              <FieldInput
                type="date"
                value={rorDate}
                onChange={(e) => setRorDate(e.target.value)}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.dccrNo')}>
              <FieldInput value={dccrNo} onChange={(e) => setDccrNo(e.target.value)} />
            </FormField>
            <FormField label={t('troopRegistration.form.dateOfDeposit')}>
              <FieldInput
                type="date"
                value={dateOfDeposit}
                onChange={(e) => setDateOfDeposit(e.target.value)}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.branchCode')}>
              <FieldInput value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
            </FormField>
            <FormField label={t('troopRegistration.form.processedByName')}>
              <FieldInput
                value={processedByName}
                onChange={(e) => setProcessedByName(e.target.value)}
              />
            </FormField>
            <FormField label={t('troopRegistration.form.approvedByName')}>
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
