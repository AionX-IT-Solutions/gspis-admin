import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from './Badge'

interface DistrictFilterChipProps {
  district: string
  extraLabel?: string
  onClear: () => void
}

/** Shown in a list page's toolbar when it was opened via a Membership Status Report drill-down
 *  link (?district=...) — makes the narrowed list legible and gives a one-click way back to
 *  the unfiltered view, without touching the page's own free-text search box. */
export function DistrictFilterChip({ district, extraLabel, onClear }: DistrictFilterChipProps) {
  const { t } = useTranslation()
  return (
    <Badge variant="primary">
      {t('common.filteredByDistrict', { district })}
      {extraLabel ? ` · ${extraLabel}` : ''}
      <button
        onClick={onClear}
        title={t('common.clearFilter')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          padding: 0,
          marginLeft: 2
        }}
      >
        <X size={11} />
      </button>
    </Badge>
  )
}
