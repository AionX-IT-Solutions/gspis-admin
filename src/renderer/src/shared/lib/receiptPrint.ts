import { formatAmount, formatCurrency, formatDate } from '@/shared/lib/utils'
import { amountToWords } from '@/shared/lib/numberToWords'
import { getReportLogoDataUrl } from '@/shared/lib/reportLogo'
import { MEMBERSHIP_FEE_CATEGORIES } from '@/shared/lib/receiptCategories'
import type { ReceiptRecord } from '@/shared/types/receipt.types'
import type { SilentPrintResult } from '../../../../shared/printing-types'

export type ReceiptPrintInput = ReceiptRecord

// Prints a complete, self-contained copy of the Council's booklet on plain paper — letterhead,
// borders, fixed labels, and the control number are all drawn by this template rather than
// relying on a pre-printed booklet page loaded in the printer. Shared by every module that
// collects a payment and needs to print one of the Council's receipt-shaped documents
// (Invoices' Record Payment, Troops & Membership's Record Bulk Payment, and — via its own
// `.title`/table reuse — features/pos/lib/receipt.ts's Sales Invoice).
// The Council's Acknowledgment Receipt and Sales Invoice booklets are both printed on a
// portrait half-sheet; the Service Invoice booklet is the exception — its actual BIR-issued
// pre-printed pad is a landscape half-sheet (wider than tall), confirmed against a physical
// booklet page. Each renderer picks the page size matching its own real paper.
export const PAGE_STYLE_PORTRAIT = `@page { size: 5.5in 8.5in; margin: 0.35in; }`
export const PAGE_STYLE_LANDSCAPE = `@page { size: 8.5in 5.5in; margin: 0.3in; }`

export const SHARED_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 11px;
    color: #000;
    line-height: 1.5;
  }
  .center { text-align: center; }
  .logo { width: 42px; height: 42px; object-fit: contain; margin-bottom: 4px; }
  .org-name { font-size: 15px; font-weight: 700; margin: 0; letter-spacing: 0.3px; }
  .org-sub { font-size: 10px; margin: 1px 0; color: #222; }
  .title {
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 10px 0 0;
  }
  .title-sub { font-size: 10px; margin: 0 0 2px; letter-spacing: 0.5px; }
  .serial-red { font-weight: 700; color: #a40000; }
  .divider { border-top: 1px solid #000; margin: 8px 0; }
  .fill-line-pair { display: flex; gap: 24px; margin: 14px 0 4px; }
  .fill-line-pair .cell { flex: 1; text-align: center; }
  .fill-line-pair .rule { border-top: 1px solid #000; height: 12px; }
  .fill-line-pair .caption { font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-top: 2px; }
  .field-row { display: flex; align-items: flex-end; gap: 6px; margin: 7px 0 2px; font-size: 11.5px; }
  .field-label { white-space: nowrap; }
  .field-value { flex: 1; border-bottom: 1px solid #000; min-height: 15px; padding: 0 4px; }
  .field-value.narrow { flex: 0.45; }
  table.lines { width: 100%; border-collapse: collapse; margin: 8px 0; table-layout: fixed; }
  table.lines th, table.lines td { border: 1px solid #000; padding: 4px 6px; font-size: 11px; text-align: left; }
  table.lines th { font-weight: 700; }
  table.lines td.amount, table.lines th.amount { text-align: right; width: 90px; }
  .totals-row td { font-weight: 700; }
  .checkbox-row { display: flex; gap: 22px; margin-top: 10px; font-size: 12px; align-items: baseline; }
  .checkbox-row .box { font-family: 'DejaVu Sans', Arial, sans-serif; margin-right: 4px; font-size: 13px; }
  .signature { margin-top: 26px; text-align: center; }
  .signature .line { border-top: 1px solid #000; width: 200px; margin: 3px auto; }
`

export function fieldRow(label: string, value: string, narrow = false): string {
  return `<div class="field-row"><span class="field-label">${label}</span><span class="field-value${narrow ? ' narrow' : ''}">${value || '&nbsp;'}</span></div>`
}

export function fieldRow2(label1: string, value1: string, label2: string, value2: string): string {
  return `
    <div class="field-row">
      <span class="field-label">${label1}</span>
      <span class="field-value narrow">${value1 || '&nbsp;'}</span>
      <span class="field-label">${label2}</span>
      <span class="field-value">${value2 || '&nbsp;'}</span>
    </div>
  `
}

/** The "the sum of {{words}} ( P {{amount}} )" line both booklets share. amountToWords()
 *  already ends in "...PESOS ONLY" (or "...PESOS & XX/100 ONLY" when there are real
 *  centavos — see numberToWords.ts) — the confirming figure underneath is a literal "P" on
 *  the real form, not a ₱ glyph, so it deliberately uses formatAmount (no currency symbol)
 *  rather than formatCurrency here. */
function sumOfLine(total: number): string {
  return `
    ${fieldRow('the sum of', amountToWords(total))}
    <p style="margin: 2px 0 0; text-align: right; font-size: 11px;">( P ${formatAmount(total)} )</p>
  `
}

async function renderServiceInvoiceHtml(receipt: ReceiptPrintInput): Promise<string> {
  const logoDataUrl = await getReportLogoDataUrl()
  const totalDue = receipt.lines.reduce((s, l) => s + l.amount, 0)
  const isCash = receipt.modeOfPayment === 'cash'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Service Invoice ${receipt.receiptNumber}</title>
        <style>${PAGE_STYLE_LANDSCAPE}${SHARED_STYLES}</style>
      </head>
      <body>
        <div class="center">
          ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" />` : ''}
          <p class="org-name">GIRL SCOUT OF THE PHILIPPINES</p>
          <p class="org-sub">ILOCOS SUR GIRL SCOUT COUNCIL</p>
          <p class="org-sub">Plaza Burgos, Ilocos Sur, 2700 City of Vigan (Capital), Ilocos Sur, Philippines</p>
          <p class="org-sub">Non-Vat Reg. TIN: 000-768-350-00041</p>
          <p class="title">Service Invoice</p>
          <p class="title-sub">(Exempt)</p>
        </div>
        <div class="divider"></div>

        <div style="display: flex; gap: 18px; margin-top: 6px;">
          <div style="width: 42%;">
            <table class="lines">
              <thead>
                <tr><th>Billing Invoice No.</th><th class="amount">Amount</th></tr>
              </thead>
              <tbody>
                ${receipt.lines
                  .map(
                    (l) =>
                      `<tr><td>${l.label}</td><td class="amount">${formatCurrency(l.amount)}</td></tr>`
                  )
                  .join('')}
                <tr><td>Total Sales</td><td class="amount">${formatCurrency(totalDue)}</td></tr>
                <tr><td>Less: Discount</td><td class="amount">&nbsp;</td></tr>
                <tr class="totals-row"><td>Total Due</td><td class="amount">${formatCurrency(totalDue)}</td></tr>
              </tbody>
            </table>
            <table class="lines">
              <thead>
                <tr><th colspan="2">Form of Payment</th></tr>
              </thead>
              <tbody>
                <tr><td>Cash</td><td class="amount">${isCash ? formatCurrency(totalDue) : '&nbsp;'}</td></tr>
                <tr><td>Check</td><td class="amount">${!isCash ? formatCurrency(totalDue) : '&nbsp;'}</td></tr>
              </tbody>
            </table>
            <p class="serial-red" style="margin-top: 10px; font-size: 12px;">${receipt.receiptNumber}</p>
          </div>

          <div style="flex: 1;">
            <div style="text-align: right; font-size: 11px; margin-bottom: 8px;">
              Date <span style="display: inline-block; min-width: 110px; border-bottom: 1px solid #000;">${formatDate(receipt.date)}</span>
            </div>
            ${fieldRow2('RECEIVED from', receipt.payorName, 'with TIN', receipt.tin ?? '')}
            ${fieldRow('and address at', receipt.address ?? '')}
            ${fieldRow('engaged in the business style of', receipt.businessStyle ?? '')}
            ${sumOfLine(totalDue)}
            ${fieldRow('In partial / full payment for', receipt.referenceNote ?? '')}

            <p class="center" style="font-style: italic; margin-top: 24px;">Girl Scout of the Philippines</p>
            <div class="signature">
              <div style="display: inline-flex; align-items: baseline; gap: 8px;">
                <span>By:</span>
                <span style="display: inline-block; width: 200px; height: 14px; border-bottom: 1px solid #000;"></span>
              </div>
              <div style="font-size: 10px; color: #444; margin-top: 2px;">Cashier / Authorized Representative</div>
            </div>
          </div>
        </div>

        <p style="margin-top: 12px; font-size: 9.5px; font-style: italic; text-align: center;">This document is not valid for claiming input tax.</p>
      </body>
    </html>
  `
}

/** The real Acknowledgment Receipt booklet splits its amount column in two near the right
 *  edge — a wide "pesos" column and a narrow "centavos" column (prefixed with its own "."),
 *  the standard Philippine ledger convention for a column of figures — rather than one column
 *  with an inline decimal point. Blank (zero) rows return empty cells instead of "0"/".00",
 *  matching the unfilled booklet. */
function pesoCentavoCells(amount: number): string {
  if (amount <= 0) {
    return `<td class="amount">&nbsp;</td><td class="amount" style="width: 34px;">&nbsp;</td>`
  }
  const pesos = Math.floor(amount)
  const centavos = Math.round((amount - pesos) * 100)
  return `<td class="amount">${pesos.toLocaleString('en-PH')}</td><td class="amount" style="width: 34px;">.${String(centavos).padStart(2, '0')}</td>`
}

async function renderAcknowledgmentReceiptHtml(receipt: ReceiptPrintInput): Promise<string> {
  const logoDataUrl = await getReportLogoDataUrl()
  const total = receipt.lines.reduce((s, l) => s + l.amount, 0)
  const isCash = receipt.modeOfPayment === 'cash'

  // The real booklet's Registration Fee table has FIXED pre-printed rows (Girl / Leader /
  // ... / Others) — match each breakdown line back to its row by category name so the order
  // always mirrors the paper form; a category with nothing collected this time just shows a
  // blank cell instead of a zero.
  const fixedRows = MEMBERSHIP_FEE_CATEGORIES.map((category) => ({
    label: category as string,
    amount: receipt.lines.find((l) => l.label === category)?.amount ?? 0
  }))
  const othersLine = receipt.lines.find(
    (l) => !(MEMBERSHIP_FEE_CATEGORIES as readonly string[]).includes(l.label)
  )

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Acknowledgment Receipt ${receipt.receiptNumber}</title>
        <style>${PAGE_STYLE_PORTRAIT}${SHARED_STYLES}</style>
      </head>
      <body>
        <div class="center">
          ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" />` : ''}
          <p class="org-name">GIRL SCOUTS OF THE PHILIPPINES</p>
          <p class="org-sub">GSP National Headquarters, 901 Padre Faura Street,</p>
          <p class="org-sub">Zone 73, Brgy. 676, 1000 Ermita, City of Manila, Philippines</p>
          <p class="org-sub">Tel. Nos.: 8523-8331 - 42 ; 8526-5194 &bull; Non-Vat Reg. TIN 000-768-350-00000</p>
        </div>

        <div class="fill-line-pair">
          <div class="cell"><div class="rule"></div><div class="caption">REGION</div></div>
          <div class="cell"><div class="rule"></div><div class="caption">COUNCIL</div></div>
        </div>

        <p class="title center">Acknowledgment Receipt</p>
        <div style="text-align: right; margin-top: 4px;">
          <div class="serial-red" style="font-size: 15px;">No. ${receipt.receiptNumber}</div>
          <div style="font-size: 11px; margin-top: 2px;">
            Date: <span style="display: inline-block; min-width: 110px; border-bottom: 1px solid #000;">${formatDate(receipt.date)}</span>
          </div>
        </div>

        <div style="margin-top: 10px;">
          ${fieldRow('This is to acknowledge the receipt from:', receipt.payorName)}
        </div>
        ${fieldRow2('with TIN', receipt.tin ?? '', 'and address at', receipt.address ?? '')}
        ${fieldRow('engaged in the business style of', receipt.businessStyle ?? '')}
        ${sumOfLine(total)}

        <p style="margin: 8px 0 4px;">in payment for the following:</p>

        <table class="lines">
          <thead>
            <tr>
              <th style="background: #3a3a3a; color: #fff;">Registration Fee</th>
              <th class="amount" style="text-align: left;">₱</th>
              <th class="amount" style="width: 34px;"></th>
            </tr>
          </thead>
          <tbody>
            ${fixedRows
              .map((r) => `<tr><td>${r.label}</td>${pesoCentavoCells(r.amount)}</tr>`)
              .join('')}
            <tr>
              <td>Others <span style="display: inline-block; min-width: 130px; border-bottom: 1px solid #000;">${othersLine?.label ?? '&nbsp;'}</span></td>
              ${pesoCentavoCells(othersLine?.amount ?? 0)}
            </tr>
            <tr class="totals-row"><td style="font-style: italic;">TOTAL</td>${pesoCentavoCells(total)}</tr>
          </tbody>
        </table>

        <div class="checkbox-row">
          <span><span class="box">${isCash ? '☒' : '☐'}</span>CASH</span>
          <span>
            <span class="box">${!isCash ? '☒' : '☐'}</span>CHECKS
            <span style="display: inline-block; min-width: 90px; border-bottom: 1px solid #000; margin-left: 4px;">&nbsp;</span>
          </span>
        </div>

        <div class="signature">
          <div style="display: inline-flex; align-items: baseline; gap: 8px;">
            <span>By:</span>
            <span style="display: inline-block; width: 200px; height: 14px; border-bottom: 1px solid #000;"></span>
          </div>
          <div style="font-size: 10px; color: #444; margin-top: 2px;">Cashier / Authorized Representative</div>
        </div>

        <p style="margin-top: 12px; font-size: 9.5px; font-style: italic; text-align: center;">This document is not valid for claiming input taxes.</p>
      </body>
    </html>
  `
}

/** Prints on the regular printer configured in Settings (not the POS/thermal receipt roll) —
 *  a complete, self-contained copy of the Council's booklet on plain paper. Shared by every
 *  module that collects a payment and needs to print one of the Council's two receipt
 *  booklets (Invoices' Record Payment, Troops & Membership's Record Bulk Payment). */
export async function printReceipt(
  receipt: ReceiptPrintInput,
  deviceName?: string | null
): Promise<SilentPrintResult> {
  if (!window.api?.printer) return { ok: false, error: 'Printer bridge unavailable' }
  const html =
    receipt.receiptType === 'acknowledgment_receipt'
      ? await renderAcknowledgmentReceiptHtml(receipt)
      : await renderServiceInvoiceHtml(receipt)
  return window.api.printer.silentPrint({ html, deviceName })
}
