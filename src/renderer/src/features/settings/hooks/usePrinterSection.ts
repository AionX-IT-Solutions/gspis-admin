import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import type { PrinterConfig, PrinterInfo } from '../../../../../shared/printing-types'

// No fixed narrow width here — this printer now prints full accountable-form documents
// (Sales Invoice, Service Invoice, Acknowledgment Receipt), not an 80mm thermal roll, so the
// test print should just confirm the OS driver/device actually accepts a job.
const TEST_RECEIPT_HTML = `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8" /><title>Test Print</title></head>
    <body style="font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 24px; font-size: 12px; text-align: center;">
      <p style="font-weight: 700;">GSP Ilocos Sur Council</p>
      <p>Test Print — Printer OK</p>
      <p>${new Date().toLocaleString('en-PH')}</p>
    </body>
  </html>
`

export function usePrinterSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const [printers, setPrinters] = useState<PrinterInfo[]>([])
  const [config, setConfig] = useState<PrinterConfig>({ deviceName: null, autoPrintReceipt: true })
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    Promise.all([
      window.api?.printer.list() ?? Promise.resolve([]),
      window.api?.printer.getConfig() ?? Promise.resolve(config)
    ])
      .then(([printerList, savedConfig]) => {
        setPrinters(printerList)
        setConfig(savedConfig)
      })
      .finally(() => setLoading(false))
    // Config is only ever read once on mount — saves happen imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setDeviceName(deviceName: string | null) {
    const next = { ...config, deviceName }
    setConfig(next)
    window.api?.printer.saveConfig({ deviceName })
  }

  function setAutoPrintReceipt(autoPrintReceipt: boolean) {
    const next = { ...config, autoPrintReceipt }
    setConfig(next)
    window.api?.printer.saveConfig({ autoPrintReceipt })
  }

  async function handleTestPrint() {
    if (!window.api?.printer) return
    setTesting(true)
    try {
      const result = await window.api.printer.silentPrint({
        html: TEST_RECEIPT_HTML,
        deviceName: config.deviceName
      })
      if (result.ok) toast.success(t('settings.receiptPrinter.testSuccess'))
      else
        toast.error(
          t('settings.receiptPrinter.testFailure', { error: result.error || 'unknown error' })
        )
    } finally {
      setTesting(false)
    }
  }

  return { printers, config, loading, testing, setDeviceName, setAutoPrintReceipt, handleTestPrint }
}
