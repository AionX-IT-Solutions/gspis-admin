import { useEffect, useState } from 'react'

/** The printer configured in Settings > Receipt Printer — shared by every module that
 *  silently prints one of the Council's accountable-form booklets (Service Invoice,
 *  Acknowledgment Receipt, Sales Invoice), so they all consistently target that same printer
 *  instead of silently falling back to whatever Windows happens to have as its own default. */
export function usePrinterDeviceName() {
  const [deviceName, setDeviceName] = useState<string | null>(null)

  useEffect(() => {
    window.api?.printer
      .getConfig()
      .then((cfg) => setDeviceName(cfg.deviceName))
      .catch(() => {})
  }, [])

  return deviceName
}
