import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportDistrictCommitteeRegistrationExcel,
  exportDistrictCommitteeRegistrationPdf,
  exportDistrictCommitteeRegistrationDocx,
  buildDistrictCommitteeRegistrationPdfDoc,
  type DistrictCommitteeRegistrationExportData
} from '../lib/districtCommitteeRegistrationExport'

interface DistrictCommitteeRegistrationExportMenuProps {
  registration: DistrictCommitteeRegistrationExportData
}

export function DistrictCommitteeRegistrationExportMenu({
  registration
}: DistrictCommitteeRegistrationExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('districtCommitteeRegistration.exportButton')}
        onView={async () => {
          preview.openPreview(await buildDistrictCommitteeRegistrationPdfDoc(registration))
        }}
        onExportExcel={() => {
          exportDistrictCommitteeRegistrationExcel(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportDistrictCommitteeRegistrationPdf(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportDistrictCommitteeRegistrationDocx(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('districtCommitteeRegistration.title')}
        onDownloadExcel={() => {
          exportDistrictCommitteeRegistrationExcel(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportDistrictCommitteeRegistrationPdf(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportDistrictCommitteeRegistrationDocx(registration)
          toast.success(t('districtCommitteeRegistration.toast.exportedWord'))
        }}
      />
    </>
  )
}
