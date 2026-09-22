import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportIccgRegistrationExcel,
  exportIccgRegistrationPdf,
  exportIccgRegistrationDocx,
  buildIccgRegistrationPdfDoc,
  type IccgRegistrationExportData
} from '../lib/iccgRegistrationExport'

interface IccgRegistrationExportMenuProps {
  registration: IccgRegistrationExportData
}

export function IccgRegistrationExportMenu({ registration }: IccgRegistrationExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('iccgRegistration.exportButton')}
        onView={async () => {
          preview.openPreview(await buildIccgRegistrationPdfDoc(registration))
        }}
        onExportExcel={() => {
          exportIccgRegistrationExcel(registration)
          toast.success(t('iccgRegistration.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportIccgRegistrationPdf(registration)
          toast.success(t('iccgRegistration.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportIccgRegistrationDocx(registration)
          toast.success(t('iccgRegistration.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('iccgRegistration.title')}
        onDownloadExcel={() => {
          exportIccgRegistrationExcel(registration)
          toast.success(t('iccgRegistration.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportIccgRegistrationPdf(registration)
          toast.success(t('iccgRegistration.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportIccgRegistrationDocx(registration)
          toast.success(t('iccgRegistration.toast.exportedWord'))
        }}
      />
    </>
  )
}
