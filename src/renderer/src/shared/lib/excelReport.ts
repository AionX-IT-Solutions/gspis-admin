import type ExcelJS from 'exceljs'
import { getReportLogoDataUrl } from './reportLogo'

// Excel's own approximation for turning a column's "character width" into pixels,
// for the sheet's default font (Calibri 11) — good enough to roughly center a
// floating image over the sheet's actual columns without needing exact metrics.
function columnWidthPx(width: number | undefined): number {
  return (width ?? 8.43) * 7 + 5
}

/** Nearest column *boundary* (a plain integer — no sub-column fraction) to where an
 *  `imageWidthPx`-wide image would need to start to sit centered over every column
 *  currently defined on `sheet`. Deliberately whole numbers only: ExcelJS's `tl.col`
 *  fractional part isn't real EMU despite being written straight into the `colOff`
 *  XML field Excel reads as EMU — it's scaled off each column's raw character width
 *  instead, so a computed fraction lands nowhere near the intended on-screen pixel
 *  offset once Excel opens the file. Snapping to a column boundary sidesteps that
 *  entirely and is precise enough for a decorative logo. */
/** Column range (1-indexed, inclusive) that a sheet's header banner text is actually
 *  merged/centered across — pass this when it's narrower than the full sheet (e.g. a
 *  sheet that reserves column 1 as a blank indent and centers its banner from column 2
 *  onward), so the floating logo lands over the same visual center as the text instead
 *  of the whole sheet's. */
export interface HeaderColumnRange {
  startCol: number
  endCol: number
}

function centeredColumnIndex(
  sheet: ExcelJS.Worksheet,
  imageWidthPx: number,
  range?: HeaderColumnRange
): number {
  const widths = (sheet.columns ?? []).map((c) => columnWidthPx(c?.width))
  const startIdx = range ? range.startCol - 1 : 0
  const endIdx = range ? range.endCol - 1 : widths.length - 1
  const leftOffsetPx = widths.slice(0, startIdx).reduce((sum, w) => sum + w, 0)
  const rangeWidths = widths.slice(startIdx, endIdx + 1)
  const totalPx = rangeWidths.reduce((sum, w) => sum + w, 0)
  const targetLeftPx = leftOffsetPx + Math.max(0, (totalPx - imageWidthPx) / 2)

  let boundaryPx = 0
  for (let i = 0; i < widths.length; i++) {
    const nextBoundaryPx = boundaryPx + widths[i]
    if (nextBoundaryPx >= targetLeftPx) {
      return targetLeftPx - boundaryPx <= nextBoundaryPx - targetLeftPx ? i : i + 1
    }
    boundaryPx = nextBoundaryPx
  }
  return Math.max(0, widths.length - 1)
}

/**
 * Anchors the GSPIS/Girl Scouts logo as a floating image centered above the
 * worksheet's header, matching the PDF/Word exports' centered logo (see
 * pdfExport.ts's addHeaderLines, docxExport.ts's headerParagraphs). Those reserve
 * space by advancing a vertical cursor past the logo before any text is drawn;
 * Excel instead just grows row 1 tall enough to hold the logo above the header
 * text, which needs no changes from callers because Excel's own default cell
 * vertical alignment is 'bottom' (none of them override it), so existing row-1
 * text already sits at the bottom of that row, clear of the logo at its top.
 * Floating images sit on top of the grid independent of cell values, so this
 * never disturbs existing header text, merges, or row numbering.
 */
export async function addWorksheetLogo(
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  headerRange?: HeaderColumnRange
): Promise<void> {
  const logo = await getReportLogoDataUrl()
  if (!logo) return

  const imageId = workbook.addImage({ base64: logo, extension: 'png' })
  const logoSize = 40
  const logoHeightPt = logoSize * 0.75 // 96 DPI px -> pt
  // Room for the logo itself, plus a full text line's worth of height below it for
  // row 1's own header text (org name, typically 10-11pt) to sit in without the two
  // clipping into each other — a row only as tall as the image left virtually none.
  const textLineAllowancePt = 18

  sheet.getRow(1).height = Math.max(sheet.getRow(1).height ?? 0, logoHeightPt + textLineAllowancePt)
  const col = centeredColumnIndex(sheet, logoSize, headerRange)
  sheet.addImage(imageId, { tl: { col, row: 0.05 }, ext: { width: logoSize, height: logoSize } })
}

/** Marks a row as a report's grand-final total the way an accountant would on paper —
 *  a double rule under the figure. Only for the one truly final total of a report (a
 *  section subtotal midway through stays single/bold); combine with the cell's own
 *  bold font, which this doesn't touch. */
export function applyDoubleRule(
  sheet: ExcelJS.Worksheet,
  row: number,
  colStart: number,
  colEnd: number
): void {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = sheet.getCell(row, c)
    cell.border = { ...cell.border, bottom: { style: 'double' } }
  }
}
