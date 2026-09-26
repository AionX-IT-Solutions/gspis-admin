import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  Inbox,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

interface DataTableProps<T extends { id?: string }> {
  columns: Column<T>[]
  data: T[]
  hiddenColumns?: Set<string>
  selectedId?: string | null
  onRowClick?: (row: T) => void
  onRowDoubleClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
}

const PAGE_SIZE_OPTIONS = [25, 50, 100]

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useColumnVisibility<T>(_columns: Column<T>[]) {
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())

  const toggleColumn = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return { hiddenColumns, toggleColumn }
}

// ─── Columns Button ───────────────────────────────────────────────────────────

export function ColumnsButton<T>({
  columns,
  hiddenColumns,
  onToggle
}: {
  columns: Column<T>[]
  hiddenColumns: Set<string>
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggleOpen() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen((v) => !v)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={cn('btn-ghost', open && 'bg-[var(--c-accent)] text-white')}
        onClick={toggleOpen}
        style={{ gap: 6 }}
      >
        <SlidersHorizontal size={14} />
        {t('common.columns')}
        {hiddenColumns.size > 0 && (
          <span
            style={{
              background: open ? 'rgba(255,255,255,0.3)' : 'var(--c-accent)',
              color: '#fff',
              borderRadius: 10,
              padding: '0 5px',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '16px',
              minWidth: 16,
              textAlign: 'center'
            }}
          >
            {hiddenColumns.size}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
              // See ExportMenu.tsx — Radix Dialog disables body pointer-events while a
              // modal is open, and this dropdown is portaled outside the dialog's own
              // content node, so it needs its own override to stay clickable there.
              pointerEvents: 'auto',
              background: 'var(--popover-bg)',
              border: '1px solid var(--popover-border)',
              borderRadius: 10,
              padding: '6px 0',
              minWidth: 190,
              boxShadow: 'var(--popover-shadow)'
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--c-text-3)',
                padding: '4px 14px 8px'
              }}
            >
              {t('common.toggleColumns')}
            </p>
            {columns.map((col) => {
              const key = String(col.key)
              const visible = !hiddenColumns.has(key)
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--c-text-1)',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--popover-item-hover)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => onToggle(key)}
                    style={{ accentColor: 'var(--c-accent)', width: 14, height: 14 }}
                  />
                  {col.header}
                </label>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  hiddenColumns,
  selectedId,
  onRowClick,
  onRowDoubleClick,
  loading,
  emptyMessage
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const resolvedEmptyMessage = emptyMessage ?? t('common.noRecordsFound')
  const containerRef = useRef<HTMLDivElement>(null)

  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Column resizing — drag a column's right edge to widen/narrow it. Widths are
  // session-local (not persisted) and stored by key so they survive column
  // show/hide toggling and re-sorting.
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({})
  const resizeState = useRef<{ key: string; startX: number; startWidth: number } | null>(null)

  const handleResizeMove = useCallback((e: MouseEvent) => {
    const state = resizeState.current
    if (!state) return
    const next = Math.max(60, state.startWidth + (e.clientX - state.startX))
    setColumnWidths((prev) => ({ ...prev, [state.key]: next }))
  }, [])

  const handleResizeEnd = useCallback(() => {
    resizeState.current = null
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }, [handleResizeMove])

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent, key: string) => {
      e.preventDefault()
      e.stopPropagation()
      const startWidth = columnWidths[key] ?? thRefs.current[key]?.offsetWidth ?? 120
      resizeState.current = { key, startX: e.clientX, startWidth }
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    },
    [columnWidths, handleResizeMove, handleResizeEnd]
  )

  // Defensive cleanup if the table unmounts mid-drag.
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [handleResizeMove, handleResizeEnd])

  useEffect(() => {
    setPage(1)
  }, [data, sortKey, pageSize])

  function handleSort(key: string) {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return key
      }
      setSortDir('asc')
      return key
    })
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = String((a as Record<string, unknown>)[sortKey] ?? '')
      const bVal = String((b as Record<string, unknown>)[sortKey] ?? '')
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const visibleColumns = useMemo(
    () => (hiddenColumns ? columns.filter((col) => !hiddenColumns.has(String(col.key))) : columns),
    [columns, hiddenColumns]
  )

  const totalCount = sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalCount)
  const pageData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)

  if (loading) {
    return (
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 40, borderRadius: 8, opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Table area */}
      <div ref={containerRef} className="scrollbar-thin" style={{ overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr
              style={{
                background: 'var(--c-thead-bg)',
                borderBottom: '2px solid var(--c-divider)'
              }}
            >
              {visibleColumns.map((col, i) => {
                const key = String(col.key)
                const sortable = col.sortable !== false
                const isActive = sortKey === key
                return (
                  <th
                    key={key}
                    ref={(el) => {
                      thRefs.current[key] = el
                    }}
                    className={cn(col.width)}
                    onClick={sortable ? () => handleSort(key) : undefined}
                    style={{
                      position: 'relative',
                      padding: '11px 16px',
                      width: columnWidths[key],
                      textAlign:
                        col.align === 'right'
                          ? 'right'
                          : col.align === 'center'
                            ? 'center'
                            : 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      color: isActive ? 'var(--c-accent)' : 'var(--c-text-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      borderRight:
                        i < visibleColumns.length - 1 ? '1px solid var(--c-divider)' : 'none',
                      cursor: sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      transition: 'color 0.15s'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.header}
                      {sortable && (
                        <span
                          style={{ opacity: isActive ? 1 : 0.35, flexShrink: 0, lineHeight: 0 }}
                        >
                          {isActive ? (
                            sortDir === 'asc' ? (
                              <ChevronUp size={11} />
                            ) : (
                              <ChevronDown size={11} />
                            )
                          ) : (
                            <ChevronsUpDown size={11} />
                          )}
                        </span>
                      )}
                    </span>
                    {/* Drag handle to resize this column — separate from the header's own
                        sort-toggle onClick above, so a resize drag never also flips the sort. */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, key)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: -3,
                        width: 6,
                        height: '100%',
                        cursor: 'col-resize',
                        userSelect: 'none',
                        zIndex: 1
                      }}
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      padding: '56px 0',
                      color: 'var(--c-text-3)'
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Inbox size={22} color="var(--c-text-3)" strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--c-text-3)', fontWeight: 500 }}>
                      {resolvedEmptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={cn(
                    'table-row-hover',
                    row.id && selectedId === row.id && 'table-row-selected'
                  )}
                  style={{
                    borderBottom: '1px solid var(--c-divider)',
                    cursor: onRowClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {visibleColumns.map((col, ci) => {
                    const key = String(col.key)
                    const rawVal = (row as Record<string, unknown>)[key]
                    const val = col.render ? col.render(row) : String(rawVal ?? '-')
                    const resizedWidth = columnWidths[key]
                    return (
                      <td
                        key={key}
                        style={{
                          padding: '11px 16px',
                          color: 'var(--c-text-2)',
                          textAlign:
                            col.align === 'right'
                              ? 'right'
                              : col.align === 'center'
                                ? 'center'
                                : 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: resizedWidth,
                          maxWidth: resizedWidth ?? 240,
                          borderRight:
                            ci < visibleColumns.length - 1 ? '1px solid var(--c-divider)' : 'none',
                          fontSize: 13
                        }}
                        title={typeof val === 'string' ? val : undefined}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderTop: '1px solid var(--c-divider)',
          background: 'var(--c-thead-bg)',
          flexShrink: 0,
          gap: 12,
          fontSize: 12,
          color: 'var(--c-text-3)'
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>
          {t('common.showing')}{' '}
          <b style={{ color: 'var(--c-text-2)' }}>
            {start}–{end}
          </b>{' '}
          {t('common.of')} <b style={{ color: 'var(--c-text-2)' }}>{totalCount}</b>
        </span>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid var(--c-border)',
            background: 'var(--bg-elevated)',
            color: 'var(--c-text-2)',
            fontSize: 12,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t('common.perPageOption', { count: s })}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span>
            {t('common.page')} <b style={{ color: 'var(--c-text-2)' }}>{safePage}</b>{' '}
            {t('common.of')} <b style={{ color: 'var(--c-text-2)' }}>{totalPages}</b>
          </span>
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              border: '1px solid var(--c-border)',
              background: 'var(--bg-elevated)',
              color: safePage <= 1 ? 'var(--c-text-3)' : 'var(--c-text-2)',
              cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              opacity: safePage <= 1 ? 0.45 : 1,
              padding: 0
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              border: '1px solid var(--c-border)',
              background: 'var(--bg-elevated)',
              color: safePage >= totalPages ? 'var(--c-text-3)' : 'var(--c-text-2)',
              cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: safePage >= totalPages ? 0.45 : 1,
              padding: 0
            }}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
