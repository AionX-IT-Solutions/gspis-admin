import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTrefoilGuildRegistrationExcel,
  exportTrefoilGuildRegistrationPdf,
  exportTrefoilGuildRegistrationDocx,
  buildTrefoilGuildRegistrationPdfDoc,
  type TrefoilGuildRegistrationExportData
} from '../lib/trefoilGuildRegistrationExport'

interface TrefoilGuildRegistrationExportMenuProps {
  registration: TrefoilGuildRegistrationExportData
}

export function TrefoilGuildRegistrationExportMenu({
  registration
}: TrefoilGuildRegistrationExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('trefoilGuildRegistration.exportButton')}
        onView={async () => {
          preview.openPreview(await buildTrefoilGuildRegistrationPdfDoc(registration))
        }}
        onExportExcel={() => {
          exportTrefoilGuildRegistrationExcel(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportTrefoilGuildRegistrationPdf(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportTrefoilGuildRegistrationDocx(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('trefoilGuildRegistration.title')}
        onDownloadExcel={() => {
          exportTrefoilGuildRegistrationExcel(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTrefoilGuildRegistrationPdf(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportTrefoilGuildRegistrationDocx(registration)
          toast.success(t('trefoilGuildRegistration.toast.exportedWord'))
        }}
      />
    </>
  )
}
