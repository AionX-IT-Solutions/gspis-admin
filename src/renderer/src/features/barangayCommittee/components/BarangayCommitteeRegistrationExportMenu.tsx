import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportBarangayCommitteeRegistrationExcel,
  exportBarangayCommitteeRegistrationPdf,
  exportBarangayCommitteeRegistrationDocx,
  buildBarangayCommitteeRegistrationPdfDoc,
  type BarangayCommitteeRegistrationExportData
} from '../lib/barangayCommitteeRegistrationExport'

interface BarangayCommitteeRegistrationExportMenuProps {
  registration: BarangayCommitteeRegistrationExportData
}

export function BarangayCommitteeRegistrationExportMenu({
  registration
}: BarangayCommitteeRegistrationExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('barangayCommitteeRegistration.exportButton')}
        onView={async () => {
          preview.openPreview(await buildBarangayCommitteeRegistrationPdfDoc(registration))
        }}
        onExportExcel={() => {
          exportBarangayCommitteeRegistrationExcel(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportBarangayCommitteeRegistrationPdf(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportBarangayCommitteeRegistrationDocx(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('barangayCommitteeRegistration.title')}
        onDownloadExcel={() => {
          exportBarangayCommitteeRegistrationExcel(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportBarangayCommitteeRegistrationPdf(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportBarangayCommitteeRegistrationDocx(registration)
          toast.success(t('barangayCommitteeRegistration.toast.exportedWord'))
        }}
      />
    </>
  )
}
