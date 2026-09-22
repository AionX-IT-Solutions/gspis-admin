import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTroopRegistrationExcel,
  exportTroopRegistrationPdf,
  exportTroopRegistrationDocx,
  buildTroopRegistrationPdfDoc,
  type TroopRegistrationExportData
} from '../lib/troopRegistrationExport'

interface TroopRegistrationExportMenuProps {
  registration: TroopRegistrationExportData
}

export function TroopRegistrationExportMenu({ registration }: TroopRegistrationExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('troopRegistration.exportButton')}
        onView={async () => {
          preview.openPreview(await buildTroopRegistrationPdfDoc(registration))
        }}
        onExportExcel={() => {
          exportTroopRegistrationExcel(registration)
          toast.success(t('troopRegistration.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportTroopRegistrationPdf(registration)
          toast.success(t('troopRegistration.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportTroopRegistrationDocx(registration)
          toast.success(t('troopRegistration.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('troopRegistration.title')}
        onDownloadExcel={() => {
          exportTroopRegistrationExcel(registration)
          toast.success(t('troopRegistration.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTroopRegistrationPdf(registration)
          toast.success(t('troopRegistration.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportTroopRegistrationDocx(registration)
          toast.success(t('troopRegistration.toast.exportedWord'))
        }}
      />
    </>
  )
}
