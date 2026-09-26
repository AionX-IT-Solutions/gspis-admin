import { useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Paperclip, Eye } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { FieldInput } from '@/shared/components/ui/FormField'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { downloadFile } from '@/shared/lib/storageSync'
import { formatCurrency } from '@/shared/lib/utils'
import {
  useMembershipDailyCollectionReport,
  type MembershipReportDisplayRow
} from '../hooks/useMembershipDailyCollectionReport'
import {
  PERSON_TAG_COLUMNS,
  type MembershipReportAttachment
} from '../types/membershipDailyCollection.types'

const th: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  padding: '6px 8px',
  textAlign: 'right'
}
const thLeft: CSSProperties = { ...th, textAlign: 'left' }
const td: CSSProperties = { padding: '6px 8px', fontSize: 13, textAlign: 'right' }
const tdLeft: CSSProperties = { ...td, textAlign: 'left' }

export function MembershipReports() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; name: string } | null>(
    null
  )
  const [attachmentToDelete, setAttachmentToDelete] = useState<MembershipReportAttachment | null>(
    null
  )
  const {
    canManage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRange,
    rows,
    columnTotals,
    totalCashCollection,
    totalDeposited,
    underOverDeposit,
    bankBranchCode,
    setBankBranchCode,
    remarks,
    setRemarks,
    addManualRow,
    updateManualRow,
    removeManualRow,
    setAutoRowOverride,
    isSaved,
    handleSave,
    handleRefresh,
    attachments,
    uploadingAttachment,
    handleUploadAttachment,
    handleDeleteAttachment,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preparedByDisplay
  } = useMembershipDailyCollectionReport()

  function updateRow(
    row: MembershipReportDisplayRow,
    patch: { depositedAmount?: number; dateDeposited?: string; remarks?: string }
  ) {
    if (row.isManual) updateManualRow(row.id, patch)
    else setAutoRowOverride(row.id, patch)
  }

  return (
    <>
      <Card
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('membershipReports.cardTitle')}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {isRange
                    ? t('membershipReports.rangeSubtitle')
                    : t('membershipReports.cardSubtitle')}
                </p>
              </div>
              <Badge variant={isRange ? 'outline' : isSaved ? 'success' : 'outline'}>
                {isRange
                  ? t('membershipReports.rangeBadge')
                  : isSaved
                    ? t('membershipReports.saved')
                    : t('membershipReports.draft')}
              </Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FieldInput
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ width: 150 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>–</span>
              <FieldInput
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ width: 150 }}
              />
              <RefreshButton onRefresh={handleRefresh} />
              <ExportMenu
                label={t('membershipReports.exportLabel')}
                onView={handleView}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onExportWord={handleExportWord}
              />
            </div>
          </div>
        }
      >
        <div style={{ overflowX: 'auto', marginBottom: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thLeft}>{t('membershipReports.table.payor')}</th>
                <th style={thLeft}>{t('membershipReports.table.troopNo')}</th>
                <th style={thLeft}>{t('membershipReports.table.district')}</th>
                <th style={thLeft}>{t('membershipReports.table.regFormNo')}</th>
                <th style={thLeft}>{t('membershipReports.table.rorDate')}</th>
                <th style={thLeft}>{t('membershipReports.table.rorNo')}</th>
                <th style={th}>{t('membershipReports.table.amount')}</th>
                {PERSON_TAG_COLUMNS.map((c) => (
                  <th key={c.key} style={{ ...th, textAlign: 'center' }} title={c.label}>
                    {c.key}
                  </th>
                ))}
                <th style={th}>{t('membershipReports.table.totalCollected')}</th>
                <th style={th}>{t('membershipReports.table.totalDeposited')}</th>
                <th style={thLeft}>{t('membershipReports.table.dateDeposited')}</th>
                <th style={thLeft}>{t('membershipReports.table.remarks')}</th>
                <th style={{ ...th, width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        value={row.payor}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { payor: e.target.value })}
                        style={{ width: 130 }}
                      />
                    ) : (
                      row.payor
                    )}
                  </td>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        value={row.troopNo}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { troopNo: e.target.value })}
                        style={{ width: 80 }}
                      />
                    ) : (
                      row.troopNo || '—'
                    )}
                  </td>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        value={row.district}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { district: e.target.value })}
                        style={{ width: 100 }}
                      />
                    ) : (
                      row.district || '—'
                    )}
                  </td>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        value={row.regFormNo}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { regFormNo: e.target.value })}
                        style={{ width: 100 }}
                      />
                    ) : (
                      row.regFormNo || '—'
                    )}
                  </td>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        type="date"
                        value={row.rorDate}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { rorDate: e.target.value })}
                        style={{ width: 130 }}
                      />
                    ) : (
                      row.rorDate || '—'
                    )}
                  </td>
                  <td style={tdLeft}>
                    {row.isManual ? (
                      <FieldInput
                        value={row.rorNo}
                        disabled={!canManage || isRange}
                        onChange={(e) => updateManualRow(row.id, { rorNo: e.target.value })}
                        style={{ width: 90 }}
                      />
                    ) : (
                      row.rorNo || '—'
                    )}
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>
                    {row.isManual ? (
                      <FieldInput
                        type="number"
                        min={0}
                        value={row.amount}
                        disabled={!canManage || isRange}
                        onChange={(e) =>
                          updateManualRow(row.id, { amount: parseFloat(e.target.value) || 0 })
                        }
                        style={{ width: 90, textAlign: 'right' }}
                      />
                    ) : (
                      formatCurrency(row.amount)
                    )}
                  </td>
                  {PERSON_TAG_COLUMNS.map((c) => (
                    <td key={c.key} style={{ ...td, textAlign: 'center' }}>
                      {row.counts[c.key] || '—'}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(row.amount)}</td>
                  <td style={td}>
                    <FieldInput
                      type="number"
                      min={0}
                      value={row.depositedAmount}
                      disabled={!canManage || isRange}
                      onChange={(e) =>
                        updateRow(row, { depositedAmount: parseFloat(e.target.value) || 0 })
                      }
                      style={{ width: 90, textAlign: 'right' }}
                    />
                  </td>
                  <td style={tdLeft}>
                    <FieldInput
                      type="date"
                      value={row.dateDeposited}
                      disabled={!canManage || isRange}
                      onChange={(e) => updateRow(row, { dateDeposited: e.target.value })}
                      style={{ width: 130 }}
                    />
                  </td>
                  <td style={tdLeft}>
                    <FieldInput
                      value={row.remarks}
                      disabled={!canManage || isRange}
                      onChange={(e) => updateRow(row, { remarks: e.target.value })}
                      style={{ width: 120 }}
                    />
                  </td>
                  <td style={td}>
                    {row.isManual && canManage && !isRange && (
                      <button
                        onClick={() => removeManualRow(row.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 2
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={tdLeft} colSpan={6}>
                  <strong>{t('membershipReports.table.totals')}</strong>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(totalCashCollection)}</td>
                {PERSON_TAG_COLUMNS.map((c) => (
                  <td key={c.key} style={{ ...td, textAlign: 'center', fontWeight: 700 }}>
                    {columnTotals[c.key] || '—'}
                  </td>
                ))}
                <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(totalCashCollection)}</td>
                <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(totalDeposited)}</td>
                <td style={td} colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
        {canManage && !isRange && (
          <Button size="sm" variant="ghost" leftIcon={<Plus size={12} />} onClick={addManualRow}>
            {t('membershipReports.addLine')}
          </Button>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 420
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('membershipReports.totalCashCollection')}
            </span>
            <span style={{ fontSize: 13 }}>{formatCurrency(totalCashCollection)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('membershipReports.totalDeposited')}
            </span>
            <span style={{ fontSize: 13 }}>{formatCurrency(totalDeposited)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 10,
              background: underOverDeposit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${underOverDeposit >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('membershipReports.underOverDeposit')}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: underOverDeposit >= 0 ? '#10b981' : '#ef4444'
              }}
            >
              {formatCurrency(underOverDeposit)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('membershipReports.bankBranchCode')}
            </span>
            <FieldInput
              value={bankBranchCode}
              disabled={!canManage || isRange}
              onChange={(e) => setBankBranchCode(e.target.value)}
              style={{ width: 160 }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('membershipReports.remarks')}
            </span>
            <FieldInput
              value={remarks}
              disabled={!canManage || isRange}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: 160 }}
            />
          </div>
        </div>

        {/* Attachments */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            margin: '20px 0 8px'
          }}
        >
          {t('membershipReports.attachments')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {attachments.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('membershipReports.noAttachments')}
            </p>
          )}
          {attachments.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <Paperclip size={13} color="var(--text-muted)" />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {a.name}
              </span>
              <button
                onClick={() => setPreviewAttachment({ url: a.url, name: a.name })}
                title={t('common.view')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <Eye size={13} color="var(--text-muted)" />
              </button>
              {canManage && !isRange && (
                <button
                  onClick={() => setAttachmentToDelete(a)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={13} color="var(--text-muted)" />
                </button>
              )}
            </div>
          ))}
        </div>
        {canManage && !isRange && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUploadAttachment(file)
                e.target.value = ''
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Paperclip size={12} />}
              loading={uploadingAttachment}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('membershipReports.uploadAttachment')}
            </Button>
          </>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          {t('membershipReports.preparedBy', { name: preparedByDisplay })}
        </p>

        {canManage && !isRange && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button variant="primary" size="sm" onClick={handleSave}>
              {t('membershipReports.saveButton')}
            </Button>
          </div>
        )}
      </Card>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('membershipReports.cardTitle')}
        onDownloadExcel={handleExportExcel}
        onDownloadPdf={handleExportPdf}
        onDownloadWord={handleExportWord}
      />

      <DocumentPreviewModal
        open={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        url={previewAttachment?.url ?? null}
        title={previewAttachment?.name ?? t('membershipReports.attachments')}
        onDownload={
          previewAttachment
            ? () => downloadFile(previewAttachment.url, previewAttachment.name)
            : undefined
        }
      />

      <ConfirmDialog
        open={!!attachmentToDelete}
        title={t('membershipReports.deleteAttachmentTitle')}
        message={t('membershipReports.deleteAttachmentMessage', {
          name: attachmentToDelete?.name ?? ''
        })}
        onConfirm={() => {
          if (attachmentToDelete) handleDeleteAttachment(attachmentToDelete.id)
          setAttachmentToDelete(null)
        }}
        onCancel={() => setAttachmentToDelete(null)}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  )
}
