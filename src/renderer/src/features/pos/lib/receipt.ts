import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { getReportLogoDataUrl } from '@/shared/lib/reportLogo'
import { SHARED_STYLES, PAGE_STYLE_PORTRAIT, fieldRow, fieldRow2 } from '@/shared/lib/receiptPrint'
import type { Sale } from '../types/pos.types'
import type { SilentPrintResult } from '../../../../../shared/printing-types'

// Prints a complete, self-contained copy of the Council's third receipt booklet — the Sales
// Invoice, used for POS's sale of goods (as opposed to the Service Invoice/Acknowledgment
// Receipt, both for services/fees — see shared/lib/receiptPrint.ts, whose styles and
// field-row markup this shares) — on plain paper via the regular printer configured in
// Settings, not the POS/thermal receipt roll.
async function renderSalesInvoiceHtml(sale: Sale): Promise<string> {
  const logoDataUrl = await getReportLogoDataUrl()

  const itemsHtml = sale.items
    .map(
      (item) => `
        <tr>
          <td class="amount">${item.quantity}</td>
          <td>${item.unit}</td>
          <td>${item.name}</td>
          <td class="amount">${formatCurrency(item.unitPrice)}</td>
          <td class="amount">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Sales Invoice ${sale.saleNumber}</title>
        <style>${PAGE_STYLE_PORTRAIT}${SHARED_STYLES}</style>
      </head>
      <body>
        <div class="center">
          ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" />` : ''}
          <p class="org-name">GIRL SCOUT OF THE PHILIPPINES</p>
          <p class="org-sub">ILOCOS SUR GIRL SCOUT COUNCIL</p>
          <p class="org-sub">Plaza Burgos Ilocos Sur 2700 City of Vigan (Capital) Ilocos Sur Philippines</p>
          <p class="org-sub">Non Vat Reg. TIN: 000-768-350-00041</p>
          <p class="title">Sales Invoice</p>
          <p class="title-sub">(Exempt)</p>
        </div>
        <div class="divider"></div>

        ${fieldRow2('Sold to:', sale.memberName ?? '', 'Date', formatDate(sale.createdAt))}
        ${fieldRow2('TIN:', '', 'Term', '')}
        ${fieldRow('Address:', '')}
        ${fieldRow('Business Style:', '')}

        <table class="lines" style="margin-top: 10px;">
          <thead>
            <tr>
              <th style="width: 60px;">Quantity</th>
              <th style="width: 50px;">Unit</th>
              <th>Articles</th>
              <th class="amount">Unit Price</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="3"></td>
              <td>Total Sales</td>
              <td class="amount">${formatCurrency(sale.subtotal)}</td>
            </tr>
            <tr>
              <td colspan="3"></td>
              <td>Less: Discount</td>
              <td class="amount">${sale.discountAmount > 0 ? formatCurrency(sale.discountAmount) : '&nbsp;'}</td>
            </tr>
            <tr class="totals-row">
              <td colspan="3"></td>
              <td>Total Amount Due</td>
              <td class="amount">${formatCurrency(sale.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px;">
          <p style="font-style: italic; margin: 0;">Girl Scout of the Philippines</p>
          <p class="serial-red" style="margin: 0; font-size: 12px;">${sale.saleNumber}</p>
        </div>

        <div class="signature">
          <div style="display: inline-flex; align-items: baseline; gap: 8px;">
            <span>By:</span>
            <span style="display: inline-block; width: 200px; height: 14px; border-bottom: 1px solid #000;"></span>
          </div>
          <div style="font-size: 10px; color: #444; margin-top: 2px;">Cashier / Authorized Representative</div>
        </div>
      </body>
    </html>
  `
}

/** Prints straight to the configured printer with no OS dialog. Used both for the Sale-Complete
 *  modal's Print Receipt button and for reprinting from Sales History. */
export async function silentPrintReceipt(
  sale: Sale,
  deviceName?: string | null
): Promise<SilentPrintResult> {
  if (!window.api?.printer) return { ok: false, error: 'Printer bridge unavailable' }
  const html = await renderSalesInvoiceHtml(sale)
  return window.api.printer.silentPrint({ html, deviceName })
}
