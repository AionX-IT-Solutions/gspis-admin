import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SearchablePickerProps<T> {
  items: T[]
  value: string
  onChange: (id: string) => void
  getId: (item: T) => string
  getLabel: (item: T) => string
  getSubLabel?: (item: T) => string | undefined
  searchPlaceholder?: string
  emptyMessage?: string
  maxHeight?: number
}

/** A search box + scrollable, click-to-select list — the searchable alternative to a plain
 *  FieldSelect dropdown, used by the "pick which Troop/Committee/Guild to register" modals
 *  (TroopPickerModal etc.) where the underlying list can run into the dozens and a dropdown
 *  makes finding the right one tedious. */
export function SearchablePicker<T>({
  items,
  value,
  onChange,
  getId,
  getLabel,
  getSubLabel,
  searchPlaceholder,
  emptyMessage,
  maxHeight = 260
}: SearchablePickerProps<T>) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const label = getLabel(item).toLowerCase()
      const sub = getSubLabel?.(item)?.toLowerCase() ?? ''
      return label.includes(q) || sub.includes(q)
    })
  }, [items, query, getLabel, getSubLabel])

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder ?? t('common.search')}
          style={{
            width: '100%',
            height: 34,
            paddingLeft: 30,
            paddingRight: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
      </div>
      <div
        style={{
          maxHeight,
          overflowY: 'auto',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8
        }}
      >
        {filtered.length === 0 && (
          <p style={{ padding: 14, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            {emptyMessage ?? t('common.noRecordsFound')}
          </p>
        )}
        {filtered.map((item) => {
          const id = getId(item)
          const selected = id === value
          const subLabel = getSubLabel?.(item)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 13
              }}
            >
              <div style={{ fontWeight: selected ? 600 : 400 }}>{getLabel(item)}</div>
              {subLabel && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subLabel}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
