import { useTranslation } from 'react-i18next'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { formatCurrency } from '@/shared/lib/utils'
import { MEMBERSHIP_FEE_CATEGORIES } from '@/shared/lib/receiptCategories'
import type { ModeOfPayment } from '@/features/vouchers/types/vouchers.types'
import type { ReceiptBreakdownLine, ReceiptKind } from '@/shared/types/receipt.types'

interface ReceiptFieldsSectionProps {
  receiptType: ReceiptKind
  onReceiptTypeChange: (type: ReceiptKind) => void
  receiptNumber: string
  onReceiptNumberChange: (value: string) => void
  tin: string
  onTinChange: (value: string) => void
  address: string
  onAddressChange: (value: string) => void
  businessStyle: string
  onBusinessStyleChange: (value: string) => void
  modeOfPayment: ModeOfPayment
  onModeOfPaymentChange: (value: ModeOfPayment) => void
  checkNumber: string
  onCheckNumberChange: (value: string) => void
  /** Service Invoice tab — read-only preview of the itemized lines this receipt covers. */
  officialReceiptLines: ReceiptBreakdownLine[]
  officialReceiptTotalLabel: string
  officialReceiptTotal: number
  /** Acknowledgment Receipt tab — editable breakdown, validated against `targetTotal`. */
  breakdown: Record<string, number>
  onBreakdownAmountChange: (category: string, amount: number) => void
  othersLabel: string
  onOthersLabelChange: (value: string) => void
  othersAmount: number
  onOthersAmountChange: (value: number) => void
  acknowledgmentTotal: number
  targetTotal: number
}

/** The "which receipt template, what breakdown" fields shared by every payment-collection
 *  modal that needs to print one of the Council's two receipt booklets — Invoices' Record
 *  Payment and Troops & Membership's Record Bulk Payment. Callers supply their own payor
 *  name/date fields around this (they already have those) and read the values back via the
 *  paired useReceiptFields hook. */
export function ReceiptFieldsSection({
  receiptType,
  onReceiptTypeChange,
  receiptNumber,
  onReceiptNumberChange,
  tin,
  onTinChange,
  address,
  onAddressChange,
  businessStyle,
  onBusinessStyleChange,
  modeOfPayment,
  onModeOfPaymentChange,
  checkNumber,
  onCheckNumberChange,
  officialReceiptLines,
  officialReceiptTotalLabel,
  officialReceiptTotal,
  breakdown,
  onBreakdownAmountChange,
  othersLabel,
  onOthersLabelChange,
  othersAmount,
  onOthersAmountChange,
  acknowledgmentTotal,
  targetTotal
}: ReceiptFieldsSectionProps) {
  const { t } = useTranslation()

  return (
    <Tabs value={receiptType} onValueChange={(v) => onReceiptTypeChange(v as ReceiptKind)}>
      <TabsList>
        <TabsTrigger value="service_invoice">{t('receipts.tabServiceInvoice')}</TabsTrigger>
        <TabsTrigger value="acknowledgment_receipt">
          {t('receipts.tabAcknowledgmentReceipt')}
        </TabsTrigger>
      </TabsList>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 16 }}
      >
        <FormField label={t('receipts.receiptNumber')} required>
          <FieldInput
            value={receiptNumber}
            onChange={(e) => onReceiptNumberChange(e.target.value)}
            placeholder="0001234"
            autoFocus
          />
        </FormField>
        <FormField label={t('receipts.modeOfPayment')}>
          <FieldSelect
            value={modeOfPayment}
            onChange={(e) => onModeOfPaymentChange(e.target.value as ModeOfPayment)}
            options={[
              { value: 'cash', label: t('vouchers.form.modeCash') },
              { value: 'check', label: t('vouchers.form.modeCheck') }
            ]}
          />
        </FormField>
        {modeOfPayment === 'check' && (
          <FormField label={t('vouchers.form.checkNumber')}>
            <FieldInput value={checkNumber} onChange={(e) => onCheckNumberChange(e.target.value)} />
          </FormField>
        )}
        <FormField label={t('receipts.tin')}>
          <FieldInput value={tin} onChange={(e) => onTinChange(e.target.value)} />
        </FormField>
        <FormField label={t('receipts.address')}>
          <FieldInput value={address} onChange={(e) => onAddressChange(e.target.value)} />
        </FormField>
        <FormField label={t('receipts.businessStyle')} className="col-span-2">
          <FieldInput
            value={businessStyle}
            onChange={(e) => onBusinessStyleChange(e.target.value)}
          />
        </FormField>
      </div>

      <TabsContent value="service_invoice" className="mt-4">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--text-muted)' }}>
                {t('receipts.descriptionColumn')}
              </th>
              <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--text-muted)' }}>
                {t('receipts.amountColumn')}
              </th>
            </tr>
          </thead>
          <tbody>
            {officialReceiptLines.map((line, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '6px 0' }}>{line.label}</td>
                <td style={{ padding: '6px 0', textAlign: 'right' }}>
                  {formatCurrency(line.amount)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 700 }}>{officialReceiptTotalLabel}</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(officialReceiptTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </TabsContent>

      <TabsContent value="acknowledgment_receipt" className="mt-4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MEMBERSHIP_FEE_CATEGORIES.map((category) => (
            <div
              key={category}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}
            >
              <span style={{ fontSize: 13, alignSelf: 'center' }}>{category}</span>
              <FieldInput
                type="number"
                min={0}
                value={breakdown[category] || ''}
                onChange={(e) => onBreakdownAmountChange(category, parseFloat(e.target.value) || 0)}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <FieldInput
              value={othersLabel}
              onChange={(e) => onOthersLabelChange(e.target.value)}
              placeholder={t('receipts.othersPlaceholder')}
            />
            <FieldInput
              type="number"
              min={0}
              value={othersAmount || ''}
              onChange={(e) => onOthersAmountChange(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 8,
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <span>{t('receipts.breakdownTotal')}</span>
            <span
              style={{
                color:
                  Math.abs(acknowledgmentTotal - targetTotal) > 0.01
                    ? '#ef4444'
                    : 'var(--text-primary)'
              }}
            >
              {formatCurrency(acknowledgmentTotal)} / {formatCurrency(targetTotal)}
            </span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
