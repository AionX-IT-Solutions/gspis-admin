import { useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Paperclip, Eye, Lock } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { downloadFile } from '@/shared/lib/storageSync'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { bankDisplayName } from '@/features/scrd/store/banks.store'
import { useDailyCollectionsTab } from '../hooks/useDailyCollectionsTab'
import type { DailyCollectionAttachment } from '../types/dailyCollection.types'

const categoryCols: {
  key:
    | 'nes'
    | 'bcFee'
    | 'dcFee'
    | 'tgFee'
    | 'csf'
    | 'iccg'
    | 'memReg'
    | 'rentals'
    | 'refundOfCa'
    | 'troopFee'
    | 'thinkingDay'
    | 'oavfFee'
    | 'honoraryFee'
    | 'associateMemberFee'
  label: string
}[] = [
  { key: 'nes', label: 'NES' },
  { key: 'bcFee', label: 'BC Fee' },
  { key: 'dcFee', label: 'DC Fee' },
  { key: 'tgFee', label: 'TG Fee' },
  { key: 'csf', label: 'CSF' },
  { key: 'iccg', label: 'ICCG' },
  { key: 'memReg', label: 'Mem. Reg.' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'refundOfCa', label: 'Refund of CA' },
  { key: 'troopFee', label: 'Troop Fee' },
  { key: 'thinkingDay', label: 'Thinking Day' },
  { key: 'oavfFee', label: 'OAVF Fee' },
  { key: 'honoraryFee', label: 'Honorary Fee' },
  { key: 'associateMemberFee', label: 'Assoc. Member Fee' }
]

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

export function DailyCollectionsTab() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; name: string } | null>(
    null
  )
  const [attachmentToDelete, setAttachmentToDelete] = useState<DailyCollectionAttachment | null>(
    null
  )
  const {
    canManage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRange,
    beginningBalance,
    setBeginningBalance,
    autoReceiptRows,
    manualReceipts,
    addManualReceipt,
    updateManualReceipt,
    removeManualReceipt,
    receiptTotals,
    totalCashCollection,
    totalCashOnHand,
    deposits,
    banks,
    addDeposit,
    updateDeposit,
    setDepositBank,
    removeDeposit,
    totalDeposited,
    balanceUndeposited,
    attachments,
    uploadingAttachment,
    handleUploadAttachment,
    handleDeleteAttachment,
    isSaved,
    handleSave,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  } = useDailyCollectionsTab()

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
                  {t('reports.dailyCollections.cardTitle')}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {isRange
                    ? t('reports.dailyCollections.rangeSubtitle')
                    : t('reports.dailyCollections.cardSubtitle')}
                </p>
              </div>
              <Badge variant={isRange ? 'outline' : isSaved ? 'success' : 'outline'}>
                {isRange
                  ? t('reports.dailyCollections.rangeBadge')
                  : isSaved
                    ? t('reports.dailyCollections.saved')
                    : t('reports.dailyCollections.draft')}
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
              <ExportMenu
                label={t('reports.dailyCollections.exportLabel')}
                onView={handleView}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onExportWord={handleExportWord}
              />
            </div>
          </div>
        }
      >
        {/* Beginning Balance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('reports.dailyCollections.beginningBalance')}
          </span>
          <FieldInput
            type="number"
            min={0}
            value={beginningBalance}
            disabled={!canManage || isRange}
            onChange={(e) => setBeginningBalance(parseFloat(e.target.value) || 0)}
            style={{ width: 160, textAlign: 'right' }}
          />
        </div>

        {/* Cash Receipts */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: 8
          }}
        >
          {t('reports.dailyCollections.addCashReceipts')}
        </p>
        <div style={{ overflowX: 'auto', marginBottom: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1340 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thLeft}>{t('reports.dailyCollections.table.siNo')}</th>
                <th style={thLeft}>{t('reports.dailyCollections.table.receivedFrom')}</th>
                {categoryCols.map((c) => (
                  <th key={c.key} style={th}>
                    {c.label}
                  </th>
                ))}
                <th style={th}>{t('reports.dailyCollections.table.amount')}</th>
                <th style={{ ...th, width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {autoReceiptRows.map((r, i) => (
                <tr key={`auto-${i}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdLeft}>{r.siNo}</td>
                  <td style={tdLeft}>
                    {r.receivedFrom}{' '}
                    <Lock
                      size={10}
                      style={{ opacity: 0.5, display: 'inline', verticalAlign: 'middle' }}
                    />
                  </td>
                  {categoryCols.map((c) => (
                    <td key={c.key} style={td}>
                      {r[c.key] ? formatCurrency(r[c.key]) : '—'}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(r.amount)}</td>
                  <td style={td} />
                </tr>
              ))}
              {manualReceipts.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdLeft}>
                    <FieldInput
                      value={l.siNo}
                      disabled={!canManage}
                      onChange={(e) => updateManualReceipt(l.id, { siNo: e.target.value })}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td style={tdLeft}>
                    <FieldInput
                      value={l.receivedFrom}
                      disabled={!canManage}
                      onChange={(e) => updateManualReceipt(l.id, { receivedFrom: e.target.value })}
                      style={{ width: 140 }}
                    />
                  </td>
                  {categoryCols.map((c) => (
                    <td key={c.key} style={td}>
                      <FieldInput
                        type="number"
                        min={0}
                        value={l[c.key]}
                        disabled={!canManage}
                        onChange={(e) =>
                          updateManualReceipt(l.id, { [c.key]: parseFloat(e.target.value) || 0 })
                        }
                        style={{ width: 80, textAlign: 'right' }}
                      />
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 600 }}>
                    {formatCurrency(
                      l.nes +
                        l.bcFee +
                        l.dcFee +
                        l.tgFee +
                        l.csf +
                        l.iccg +
                        l.memReg +
                        l.rentals +
                        l.refundOfCa +
                        l.troopFee +
                        l.thinkingDay +
                        l.oavfFee +
                        l.honoraryFee +
                        l.associateMemberFee
                    )}
                  </td>
                  <td style={td}>
                    {canManage && (
                      <button
                        onClick={() => removeManualReceipt(l.id)}
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
                <td style={tdLeft} colSpan={2}>
                  <strong>{t('reports.dailyCollections.table.total')}</strong>
                </td>
                {categoryCols.map((c) => (
                  <td key={c.key} style={{ ...td, fontWeight: 700 }}>
                    {formatCurrency(receiptTotals[c.key])}
                  </td>
                ))}
                <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(receiptTotals.amount)}</td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        </div>
        {canManage && !isRange && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Plus size={12} />}
            onClick={addManualReceipt}
          >
            {t('reports.dailyCollections.addLine')}
          </Button>
        )}

        {/* Collection summary */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('reports.dailyCollections.totalCashCollection')}
            </span>
            <span style={{ fontSize: 13 }}>{formatCurrency(totalCashCollection)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('reports.dailyCollections.totalCashOnHand')}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(totalCashOnHand)}</span>
          </div>
        </div>

        {/* Cash Deposits */}
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
          {t('reports.dailyCollections.lessCashDeposit')}
        </p>
        <div style={{ overflowX: 'auto', marginBottom: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thLeft}>{t('reports.dailyCollections.table.bank')}</th>
                <th style={thLeft}>{t('reports.dailyCollections.table.saNo')}</th>
                <th style={thLeft}>{t('reports.dailyCollections.table.purpose')}</th>
                <th style={thLeft} title={t('reports.dailyCollections.table.coversHint')}>
                  {t('reports.dailyCollections.table.covers')}
                </th>
                <th style={th}>{t('reports.dailyCollections.table.amount')}</th>
                <th style={{ ...th, width: 64 }} />
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdLeft}>
                    {isRange ? (
                      <>
                        {d.bankName || '—'}{' '}
                        <Lock
                          size={10}
                          style={{ opacity: 0.5, display: 'inline', verticalAlign: 'middle' }}
                        />
                      </>
                    ) : (
                      <FieldSelect
                        value={d.bankId}
                        disabled={!canManage}
                        onChange={(e) => setDepositBank(d.id, e.target.value)}
                        placeholder={t('reports.dailyCollections.selectBank')}
                        options={banks
                          .filter((b) => b.isActive)
                          .map((b) => ({ value: b.id, label: bankDisplayName(b) }))}
                        style={{ minWidth: 160 }}
                      />
                    )}
                  </td>
                  <td style={tdLeft}>{d.saNo || '—'}</td>
                  <td style={tdLeft}>
                    {isRange ? (
                      d.purpose || '—'
                    ) : (
                      <FieldInput
                        value={d.purpose}
                        disabled={!canManage}
                        onChange={(e) => updateDeposit(d.id, { purpose: e.target.value })}
                        style={{ width: 140 }}
                      />
                    )}
                  </td>
                  <td style={tdLeft}>
                    {isRange ? (
                      d.coverageFrom && d.coverageTo && d.coverageFrom !== d.coverageTo ? (
                        `${formatDate(d.coverageFrom)} – ${formatDate(d.coverageTo)}`
                      ) : (
                        '—'
                      )
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FieldInput
                          type="date"
                          value={d.coverageFrom ?? dateFrom}
                          disabled={!canManage}
                          max={d.coverageTo || dateFrom}
                          onChange={(e) => updateDeposit(d.id, { coverageFrom: e.target.value })}
                          style={{ width: 122 }}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>–</span>
                        <FieldInput
                          type="date"
                          value={d.coverageTo ?? dateFrom}
                          disabled={!canManage}
                          min={d.coverageFrom}
                          max={dateFrom}
                          onChange={(e) => updateDeposit(d.id, { coverageTo: e.target.value })}
                          style={{ width: 122 }}
                        />
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    {isRange ? (
                      formatCurrency(d.amount)
                    ) : (
                      <FieldInput
                        type="number"
                        min={0}
                        value={d.amount}
                        disabled={!canManage}
                        onChange={(e) =>
                          updateDeposit(d.id, { amount: parseFloat(e.target.value) || 0 })
                        }
                        style={{ width: 100, textAlign: 'right' }}
                      />
                    )}
                  </td>
                  <td style={{ ...td, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    {!isRange && canManage && (
                      <button
                        onClick={() => removeDeposit(d.id)}
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
                <td style={tdLeft} colSpan={4}>
                  <strong>{t('reports.dailyCollections.table.total')}</strong>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(totalDeposited)}</td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        </div>
        {canManage && !isRange && (
          <Button size="sm" variant="ghost" leftIcon={<Plus size={12} />} onClick={addDeposit}>
            {t('reports.dailyCollections.addDeposit')}
          </Button>
        )}

        {/* Deposit summary */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('reports.dailyCollections.totalDeposited')}
            </span>
            <span style={{ fontSize: 13 }}>{formatCurrency(totalDeposited)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 10,
              background: balanceUndeposited >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${balanceUndeposited >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('reports.dailyCollections.balanceUndeposited')}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: balanceUndeposited >= 0 ? '#10b981' : '#ef4444'
              }}
            >
              {formatCurrency(balanceUndeposited)}
            </span>
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
          {t('reports.dailyCollections.attachments')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {attachments.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('reports.dailyCollections.noAttachments')}
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
              {t('reports.dailyCollections.uploadAttachment')}
            </Button>
          </>
        )}

        {canManage && !isRange && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button variant="primary" size="sm" onClick={handleSave}>
              {t('reports.dailyCollections.saveButton')}
            </Button>
          </div>
        )}
      </Card>

      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('reports.dailyCollections.cardTitle')}
        onDownloadExcel={handleExportExcel}
        onDownloadPdf={handleExportPdf}
        onDownloadWord={handleExportWord}
      />

      <DocumentPreviewModal
        open={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        url={previewAttachment?.url ?? null}
        title={previewAttachment?.name ?? t('reports.dailyCollections.attachments')}
        onDownload={
          previewAttachment
            ? () => downloadFile(previewAttachment.url, previewAttachment.name)
            : undefined
        }
      />

      <ConfirmDialog
        open={!!attachmentToDelete}
        title={t('reports.dailyCollections.deleteAttachmentTitle')}
        message={t('reports.dailyCollections.deleteAttachmentMessage', {
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
