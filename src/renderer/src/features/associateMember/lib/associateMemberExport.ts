import ExcelJS from 'exceljs'
import { Paragraph, TextRun } from 'docx'
import { orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  headerLineSplit,
  buildTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import type { AssociateMember } from '../types/associateMember.types'
import type { AssociateMemberRegistration } from '../types/associateMemberRegistration.types'

// Decoupled into a live AssociateMember (bio profile, can be corrected anytime) joined with
// the frozen-at-save-time AssociateMemberRegistration for one filing (its own AMF booklet
// control number, school year, Girl Scout history, fee/payment) — mirrors
// features/oavf/lib/oavfExport.ts's OavfRegistrationExportData exactly.
export interface AssociateMemberRegistrationExportData {
  member: AssociateMember
  registration: AssociateMemberRegistration
}

function fileBase(data: AssociateMemberRegistrationExportData): string {
  return `Associate_Member_Registration_${data.member.lastName}_${data.member.firstName}_${data.registration.schoolYear}`.replace(
    /[^0-9a-zA-Z_]/g,
    '_'
  )
}

function peso(n: number | undefined): string {
  return (n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function girlScoutLine(registration: AssociateMemberRegistration): string {
  return `[${registration.wasGirlScout ? 'X' : ' '}] Yes    [${!registration.wasGirlScout ? 'X' : ' '}] No`
}

// The physical AMF booklet's own pre-printed control number, filled with this filing's real
// values (unlike District/Barangay Committee/Trefoil Guild's "No./Series" corner, which stays
// blank on export — see associateMemberRegistration.types.ts's own comment on amfNumber/series).
function controlNumberLine(registration: AssociateMemberRegistration): string {
  return `AMF No. ${registration.amfNumber || '__________'}   Series ${registration.series || '______'}`
}

// Field/value row pairs — same order as the Council's own "Associate Member Registration
// Form", shared by the PDF/Excel/Word builders below.
function personalInfoRows(
  data: AssociateMemberRegistrationExportData
): [string, string, string, string][] {
  const { member } = data
  return [
    ['Council', member.council, 'Region', member.region],
    ['Last Name', member.lastName, 'First Name', member.firstName],
    ['M.I.', member.middleInitial, 'Civil Status', member.civilStatus],
    ['Sex', member.sex, '', ''],
    ['Home Address', member.homeAddress, '', ''],
    ['Phone', member.phone, 'E-mail', member.email],
    ['Business Address', member.businessAddress, '', ''],
    ['Phone', member.businessPhone, '', ''],
    ['Profession', member.profession, 'Occupation', member.occupation],
    ['Beneficiary', member.beneficiary, '', '']
  ]
}

function girlScoutHistoryRows(
  data: AssociateMemberRegistrationExportData
): [string, string, string, string][] {
  const { registration } = data
  return [
    ['Please indicate if you had been a Girl Scout', girlScoutLine(registration), '', ''],
    [
      'Date Last Registered',
      registration.dateLastRegistered ? formatDate(registration.dateLastRegistered) : '',
      'Position',
      registration.position
    ]
  ]
}

function paymentRows(
  data: AssociateMemberRegistrationExportData
): [string, string, string, string][] {
  const { registration } = data
  return [
    ['Fee Amount', peso(registration.membershipFeeTotal), 'AR No.', registration.arNumber],
    [
      'Date',
      registration.arDate ? formatDate(registration.arDate) : '',
      'Processed By',
      registration.processedByName
    ]
  ]
}

// ─── PDF ───

function pdfSectionLabel(doc: ReturnType<typeof createPdf>, y: number, text: string): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(text, 30, y)
  return y + 14
}

export async function buildAssociateMemberRegistrationPdfDoc(
  data: AssociateMemberRegistrationExportData
) {
  const doc = createPdf('portrait')
  const margin = 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(controlNumberLine(data.registration), margin, 20)

  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'ASSOCIATE MEMBER REGISTRATION FORM', bold: true, size: 12 },
    { text: `School Year ${data.registration.schoolYear}` },
    { text: data.registration.dateApplied ? formatDate(data.registration.dateApplied) : '' }
  ])

  y = addTable(doc, {
    startY: y,
    head: [],
    body: personalInfoRows(data),
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  y = pdfSectionLabel(doc, y + 14, 'Please indicate if you had been a Girl Scout')
  y = addTable(doc, {
    startY: y,
    head: [],
    body: girlScoutHistoryRows(data),
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  y = pdfSectionLabel(doc, y + 14, 'Council Processing')
  addTable(doc, {
    startY: y,
    head: [],
    body: paymentRows(data),
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  })

  return doc
}

export async function exportAssociateMemberRegistrationPdf(
  data: AssociateMemberRegistrationExportData
) {
  const doc = await buildAssociateMemberRegistrationPdfDoc(data)
  savePdf(doc, `${fileBase(data)}.pdf`)
}

// ─── Excel ───

export async function exportAssociateMemberRegistrationExcel(
  data: AssociateMemberRegistrationExportData
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Associate Member')
  sheet.columns = [{ width: 24 }, { width: 22 }, { width: 24 }, { width: 22 }]
  await addWorksheetLogo(wb, sheet)

  sheet.mergeCells(1, 1, 1, 2)
  sheet.getCell('A1').value = controlNumberLine(data.registration)
  sheet.getCell('A1').font = { size: 8 }

  const headLines = [
    { text: orgHeader.orgName, bold: true, size: 12 },
    { text: orgHeader.region, size: 10 },
    { text: orgHeader.council, size: 10 },
    { text: 'ASSOCIATE MEMBER REGISTRATION FORM', bold: true, size: 13 },
    { text: `School Year ${data.registration.schoolYear}`, size: 9 },
    {
      text: data.registration.dateApplied ? formatDate(data.registration.dateApplied) : '',
      size: 9
    }
  ]
  headLines.forEach((line, i) => {
    const row = i + 2
    sheet.mergeCells(row, 1, row, 4)
    const cell = sheet.getCell(`A${row}`)
    cell.value = line.text
    cell.font = { bold: !!line.bold, size: line.size ?? 10 }
    cell.alignment = { horizontal: 'center' }
  })

  let r2 = 9
  function writeRows(rows: [string, string, string, string][], sectionLabel?: string) {
    if (sectionLabel) {
      sheet.getCell(`A${r2}`).value = sectionLabel
      sheet.getCell(`A${r2}`).font = { bold: true, size: 10 }
      r2++
    }
    for (const [labelA, valueA, labelB, valueB] of rows) {
      sheet.getCell(`A${r2}`).value = labelA
      sheet.getCell(`A${r2}`).font = { bold: true, size: 9 }
      sheet.getCell(`B${r2}`).value = valueA
      sheet.getCell(`B${r2}`).font = { size: 9 }
      if (labelB) {
        sheet.getCell(`C${r2}`).value = labelB
        sheet.getCell(`C${r2}`).font = { bold: true, size: 9 }
        sheet.getCell(`D${r2}`).value = valueB
        sheet.getCell(`D${r2}`).font = { size: 9 }
      }
      r2++
    }
    r2++
  }

  writeRows(personalInfoRows(data))
  writeRows(girlScoutHistoryRows(data), 'Please indicate if you had been a Girl Scout')
  writeRows(paymentRows(data), 'Council Processing')

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBase(data)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Word ───

export async function exportAssociateMemberRegistrationDocx(
  data: AssociateMemberRegistrationExportData
) {
  const children = [
    headerLineSplit(controlNumberLine(data.registration), ''),
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'ASSOCIATE MEMBER REGISTRATION FORM', bold: true, size: 26 },
      { text: `School Year ${data.registration.schoolYear}` },
      { text: data.registration.dateApplied ? formatDate(data.registration.dateApplied) : '' }
    ])),
    spacer(),
    buildTable([], personalInfoRows(data)),
    spacer(),
    new Paragraph({
      children: [new TextRun({ text: 'Please indicate if you had been a Girl Scout', bold: true })]
    }),
    buildTable([], girlScoutHistoryRows(data)),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'Council Processing', bold: true })] }),
    buildTable([], paymentRows(data))
  ]

  await saveDocx(children, `${fileBase(data)}.docx`)
}
