import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, FileText, FileType } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface DocumentPreviewModalProps {
  open: boolean
  onClose: () => void
  title?: string
  url: string | null
  onDownloadExcel?: () => void
  onDownloadPdf?: () => void
  onDownloadWord?: () => void
  /** Single generic download action — used for previewing an already-uploaded file
   *  (e.g. an attachment) rather than one of the Excel/PDF/Word report exports above. */
  onDownload?: () => void
}

/** The "View" counterpart to ExportMenu's download buttons — renders a jsPDF-generated
 *  blob URL in an <iframe> using Electron/Chromium's built-in PDF viewer (no extra
 *  dependency). Works as the universal preview for Excel/Word exports too, since every
 *  format shares the same underlying content — see the "same template" export toolkit
 *  in shared/lib/{pdfExport,docxExport,excelReport}.ts. */
export function DocumentPreviewModal({
  open,
  onClose,
  title,
  url,
  onDownloadExcel,
  onDownloadPdf,
  onDownloadWord,
  onDownload
}: DocumentPreviewModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={title ?? t('common.preview')}
      size="full"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
          {onDownloadExcel && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet size={13} />}
              onClick={onDownloadExcel}
            >
              Excel
            </Button>
          )}
          {onDownloadPdf && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText size={13} />}
              onClick={onDownloadPdf}
            >
              PDF
            </Button>
          )}
          {onDownloadWord && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileType size={13} />}
              onClick={onDownloadWord}
            >
              Word
            </Button>
          )}
          {onDownload && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={13} />}
              onClick={onDownload}
            >
              {t('common.download')}
            </Button>
          )}
          {(onDownloadExcel || onDownloadPdf || onDownloadWord) && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
              <Download size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
              {t('common.downloadHint')}
            </span>
          )}
        </>
      }
    >
      <div
        style={{
          margin: '-20px -24px',
          height: 'calc(100% + 40px)',
          minHeight: '70vh',
          background: '#525659'
        }}
      >
        {url && (
          <iframe
            src={url}
            title={title ?? 'Document preview'}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>
    </Modal>
  )
}
