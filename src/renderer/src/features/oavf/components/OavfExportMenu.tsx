import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportOavfRegistrationExcel,
  exportOavfRegistrationPdf,
  exportOavfRegistrationDocx,
  buildOavfRegistrationPdfDoc,
  type OavfRegistrationExportData
} from '../lib/oavfExport'

interface OavfExportMenuProps {
  data: OavfRegistrationExportData
}

export function OavfExportMenu({ data }: OavfExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        iconOnly
        title={t('oavf.exportLabel')}
        onView={async () => preview.openPreview(await buildOavfRegistrationPdfDoc(data))}
        onExportExcel={() => {
          exportOavfRegistrationExcel(data)
          toast.success(t('oavf.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportOavfRegistrationPdf(data)
          toast.success(t('oavf.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportOavfRegistrationDocx(data)
          toast.success(t('oavf.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('oavf.title')} — ${data.member.lastName}, ${data.member.firstName}`}
        onDownloadExcel={() => {
          exportOavfRegistrationExcel(data)
          toast.success(t('oavf.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportOavfRegistrationPdf(data)
          toast.success(t('oavf.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportOavfRegistrationDocx(data)
          toast.success(t('oavf.toast.exportedWord'))
        }}
      />
    </>
  )
}
