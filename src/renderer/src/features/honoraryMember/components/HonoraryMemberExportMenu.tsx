import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportHonoraryMemberRegistrationExcel,
  exportHonoraryMemberRegistrationPdf,
  exportHonoraryMemberRegistrationDocx,
  buildHonoraryMemberRegistrationPdfDoc,
  type HonoraryMemberRegistrationExportData
} from '../lib/honoraryMemberExport'

interface HonoraryMemberExportMenuProps {
  data: HonoraryMemberRegistrationExportData
}

export function HonoraryMemberExportMenu({ data }: HonoraryMemberExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        iconOnly
        title={t('honoraryMember.exportLabel')}
        onView={async () => preview.openPreview(await buildHonoraryMemberRegistrationPdfDoc(data))}
        onExportExcel={() => {
          exportHonoraryMemberRegistrationExcel(data)
          toast.success(t('honoraryMember.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportHonoraryMemberRegistrationPdf(data)
          toast.success(t('honoraryMember.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportHonoraryMemberRegistrationDocx(data)
          toast.success(t('honoraryMember.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('honoraryMember.title')} — ${data.member.lastName}, ${data.member.firstName}`}
        onDownloadExcel={() => {
          exportHonoraryMemberRegistrationExcel(data)
          toast.success(t('honoraryMember.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportHonoraryMemberRegistrationPdf(data)
          toast.success(t('honoraryMember.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportHonoraryMemberRegistrationDocx(data)
          toast.success(t('honoraryMember.toast.exportedWord'))
        }}
      />
    </>
  )
}
