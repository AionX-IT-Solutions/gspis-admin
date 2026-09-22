import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportAssociateMemberRegistrationExcel,
  exportAssociateMemberRegistrationPdf,
  exportAssociateMemberRegistrationDocx,
  buildAssociateMemberRegistrationPdfDoc,
  type AssociateMemberRegistrationExportData
} from '../lib/associateMemberExport'

interface AssociateMemberExportMenuProps {
  data: AssociateMemberRegistrationExportData
}

export function AssociateMemberExportMenu({ data }: AssociateMemberExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        iconOnly
        title={t('associateMember.exportLabel')}
        onView={async () => preview.openPreview(await buildAssociateMemberRegistrationPdfDoc(data))}
        onExportExcel={() => {
          exportAssociateMemberRegistrationExcel(data)
          toast.success(t('associateMember.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportAssociateMemberRegistrationPdf(data)
          toast.success(t('associateMember.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportAssociateMemberRegistrationDocx(data)
          toast.success(t('associateMember.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('associateMember.title')} — ${data.member.lastName}, ${data.member.firstName}`}
        onDownloadExcel={() => {
          exportAssociateMemberRegistrationExcel(data)
          toast.success(t('associateMember.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportAssociateMemberRegistrationPdf(data)
          toast.success(t('associateMember.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportAssociateMemberRegistrationDocx(data)
          toast.success(t('associateMember.toast.exportedWord'))
        }}
      />
    </>
  )
}
