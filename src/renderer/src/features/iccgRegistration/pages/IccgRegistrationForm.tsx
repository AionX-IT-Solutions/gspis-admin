import { motion } from 'framer-motion'
import { ArrowLeft, IdCard, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useIccgRegistrationForm } from '../hooks/useIccgRegistrationForm'
import { IccgRegistrationExportMenu } from '../components/IccgRegistrationExportMenu'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

function peso(n: number) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function IccgRegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    canManage,
    isNew,
    troop,
    school,
    setSchool,
    ageLevel,
    setAgeLevel,
    schoolYear,
    setSchoolYear,
    dateApplied,
    setDateApplied,
    formNo,
    setFormNo,
    seriesYear,
    setSeriesYear,
    girls,
    addGirlRow,
    removeGirlRow,
    updateGirlRow,
    adults,
    addAdultRow,
    removeAdultRow,
    updateAdultRow,
    girlsCount,
    adultsCount,
    submittedByName,
    setSubmittedByName,
    submittedByDate,
    setSubmittedByDate,
    notedByName,
    setNotedByName,
    notedByDate,
    setNotedByDate,
    processedByName,
    setProcessedByName,
    approvedByName,
    setApprovedByName,
    fee,
    updateFee,
    councilShare,
    handleSave
  } = useIccgRegistrationForm()

  if (!troop) {
    return (
      <div className="page-wrapper">
        <PageHeader
          title={t('iccgRegistration.title')}
          icon={<IdCard size={18} />}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/iccg-registrations?tab=registrations')}
            >
              {t('common.back')}
            </Button>
          }
        />
        <Card>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {t('iccgRegistration.troopNotFound')}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      key="iccg-registration-form"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={
          isNew
            ? t('iccgRegistration.form.newTitle', { troopNumber: troop.troopNumber })
            : t('iccgRegistration.form.editTitle', { troopNumber: troop.troopNumber })
        }
        subtitle={troop.troopName}
        icon={<IdCard size={18} />}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft size={13} />}
              onClick={() => navigate('/iccg-registrations?tab=registrations')}
            >
              {t('common.back')}
            </Button>
            {!isNew && (
              <IccgRegistrationExportMenu
                registration={{
                  troop,
                  school,
                  ageLevel,
                  schoolYear,
                  dateApplied,
                  formNo,
                  seriesYear,
                  girls,
                  adults,
                  submittedByName,
                  submittedByDate,
                  notedByName,
                  notedByDate,
                  processedByName,
                  approvedByName,
                  fee
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

      <Card header={t('iccgRegistration.form.headerSection')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <FormField label={t('iccgRegistration.form.school')} required>
            <FieldInput value={school} onChange={(e) => setSchool(e.target.value)} />
          </FormField>
          <FormField label={t('iccgRegistration.form.ageLevel')}>
            <FieldInput value={ageLevel} onChange={(e) => setAgeLevel(e.target.value)} />
          </FormField>
          <FormField label={t('iccgRegistration.form.schoolYear')} required>
            <FieldInput value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} />
          </FormField>
          <FormField label={t('iccgRegistration.form.dateApplied')}>
            <FieldInput
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
          </FormField>
          <FormField label={t('iccgRegistration.form.formNo')}>
            <FieldInput value={formNo} onChange={(e) => setFormNo(e.target.value)} />
          </FormField>
          <FormField label={t('iccgRegistration.form.seriesYear')}>
            <FieldInput value={seriesYear} onChange={(e) => setSeriesYear(e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('iccgRegistration.form.girlsSection')}</span>
            {canManage && (
              <Button size="sm" variant="ghost" leftIcon={<Plus size={13} />} onClick={addGirlRow}>
                {t('iccgRegistration.form.addGirl')}
              </Button>
            )}
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {girls.map((girl) => (
            <div
              key={girl.rowId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.8fr 1fr 1.4fr auto',
                gap: 10,
                alignItems: 'end'
              }}
            >
              <FormField label={t('iccgRegistration.form.name')}>
                <FieldInput
                  value={girl.fullName}
                  onChange={(e) => updateGirlRow(girl.rowId, { fullName: e.target.value })}
                />
              </FormField>
              <FormField label={t('iccgRegistration.form.gradeYear')}>
                <FieldInput
                  value={girl.gradeYear ?? ''}
                  onChange={(e) => updateGirlRow(girl.rowId, { gradeYear: e.target.value })}
                />
              </FormField>
              <FormField label={t('iccgRegistration.form.email')}>
                <FieldInput
                  type="email"
                  value={girl.email ?? ''}
                  onChange={(e) => updateGirlRow(girl.rowId, { email: e.target.value })}
                />
              </FormField>
              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeGirlRow(girl.rowId)}
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
            <span>{t('iccgRegistration.form.adultsSection')}</span>
            {canManage && (
              <Button size="sm" variant="ghost" leftIcon={<Plus size={13} />} onClick={addAdultRow}>
                {t('iccgRegistration.form.addAdult')}
              </Button>
            )}
          </div>
        }
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adults.map((adult) => (
            <div
              key={adult.rowId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.8fr 1.4fr auto',
                gap: 10,
                alignItems: 'end'
              }}
            >
              <FormField label={t('iccgRegistration.form.name')}>
                <FieldInput
                  value={adult.fullName}
                  onChange={(e) => updateAdultRow(adult.rowId, { fullName: e.target.value })}
                />
              </FormField>
              <FormField label={t('iccgRegistration.form.email')}>
                <FieldInput
                  type="email"
                  value={adult.email ?? ''}
                  onChange={(e) => updateAdultRow(adult.rowId, { email: e.target.value })}
                />
              </FormField>
              {canManage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAdultRow(adult.rowId)}
                  title={t('common.delete')}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card header={t('iccgRegistration.form.signaturesSection')} style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('iccgRegistration.form.submittedByName')}>
            <FieldInput
              value={submittedByName}
              onChange={(e) => setSubmittedByName(e.target.value)}
            />
          </FormField>
          <FormField label={t('iccgRegistration.form.submittedByDate')}>
            <FieldInput
              type="date"
              value={submittedByDate}
              onChange={(e) => setSubmittedByDate(e.target.value)}
            />
          </FormField>
          <FormField label={t('iccgRegistration.form.notedByName')}>
            <FieldInput value={notedByName} onChange={(e) => setNotedByName(e.target.value)} />
          </FormField>
          <FormField label={t('iccgRegistration.form.notedByDate')}>
            <FieldInput
              type="date"
              value={notedByDate}
              onChange={(e) => setNotedByDate(e.target.value)}
            />
          </FormField>
        </div>
      </Card>

      <Card
        header={t('iccgRegistration.form.feeSection')}
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('iccgRegistration.form.noOfGirls')}
              </span>
              <div style={{ fontWeight: 700 }}>{girlsCount}</div>
            </div>
            <FormField label={t('iccgRegistration.form.amountGirls')}>
              <FieldInput
                type="number"
                value={fee.amountGirls || ''}
                onChange={(e) => updateFee({ amountGirls: parseFloat(e.target.value) || 0 })}
              />
            </FormField>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('iccgRegistration.form.noOfAdults')}
              </span>
              <div style={{ fontWeight: 700 }}>{adultsCount}</div>
            </div>
            <FormField label={t('iccgRegistration.form.amountAdults')}>
              <FieldInput
                type="number"
                value={fee.amountAdults || ''}
                onChange={(e) => updateFee({ amountAdults: parseFloat(e.target.value) || 0 })}
              />
            </FormField>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              padding: 10,
              borderRadius: 8,
              background: 'var(--glass-bg)',
              border: '1px dashed var(--border-default)'
            }}
          >
            <FormField label={t('iccgRegistration.form.feePerMemberTotal')}>
              <FieldInput
                type="number"
                value={fee.feePerMemberTotal || ''}
                onChange={(e) => updateFee({ feePerMemberTotal: parseFloat(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label={t('iccgRegistration.form.feePerMemberCouncilShare')}>
              <FieldInput
                type="number"
                value={fee.feePerMemberCouncilShare || ''}
                onChange={(e) =>
                  updateFee({ feePerMemberCouncilShare: parseFloat(e.target.value) || 0 })
                }
              />
            </FormField>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('iccgRegistration.form.councilRetainedShare')}
              </span>
              <span style={{ fontWeight: 700 }}>₱{peso(councilShare)}</span>
            </div>
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
            <span>{t('iccgRegistration.form.total')}:</span>
            <span>₱{peso(fee.total)}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 14
            }}
          >
            <FormField label={t('iccgRegistration.form.arNo')}>
              <FieldInput
                value={fee.arNo ?? ''}
                onChange={(e) => updateFee({ arNo: e.target.value })}
              />
            </FormField>
            <FormField label={t('iccgRegistration.form.dateOfDeposit')}>
              <FieldInput
                type="date"
                value={fee.dateOfDeposit ?? ''}
                onChange={(e) => updateFee({ dateOfDeposit: e.target.value })}
              />
            </FormField>
            <FormField label={t('iccgRegistration.form.dccrNo')}>
              <FieldInput
                value={fee.dccrNo ?? ''}
                onChange={(e) => updateFee({ dccrNo: e.target.value })}
              />
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
            <FormField label={t('iccgRegistration.form.processedByName')}>
              <FieldInput
                value={processedByName}
                onChange={(e) => setProcessedByName(e.target.value)}
              />
            </FormField>
            <FormField label={t('iccgRegistration.form.approvedByName')}>
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
