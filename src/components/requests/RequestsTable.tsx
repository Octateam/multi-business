import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_META, TYPE_COLOR, type RequestRow, type RequestType } from '../../data/requests'
import { detailPathFor } from '../../data/requestStore'
import { DropdownMenu, HdsBadge, HdsButton, HdsSearch, HdsSelect, Chevron } from '../ui/hds'
import filterIcon from '../../assets/icons/dashboard-filter.svg'
import selfBadgeIcon from '../../assets/icons/dashboard-self-badge.svg'
import menuDotsIcon from '../../assets/icons/dashboard-row-menu-dots.svg'
import viewIcon from '../../assets/icons/row-action-view.svg'
import editIcon from '../../assets/icons/row-action-edit.svg'
import cancelIcon from '../../assets/icons/row-action-cancel.svg'

const dueToneClass: Record<RequestRow['dueNoteTone'], string> = {
  error: 'text-[#b4232e]',
  warning: 'text-[#ff8b39]',
  muted: 'text-[#6b7280]',
}

// Type column filter — options as designed (Figma 42563:368496 / FilterDrawer "Type").
export const TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'Reimbursement', label: 'Reimbursement' },
  { value: 'Vendor payment', label: 'Vendor payment' },
]

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

function TypeHeader({ values, onChange, initiallyOpen }: { values: RequestType[]; onChange: (v: RequestType[]) => void; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(!!initiallyOpen)
  const ref = useOutside(open, () => setOpen(false))
  const active = values.length > 0
  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1 text-sm font-medium hover:text-[#111927] ${active || open ? 'text-[#004b87]' : 'text-[#525866]'}`}
      >
        Type
        {active && <span className="rounded-full bg-[#004b87] px-1.5 text-[10px] font-semibold text-white">{values.length}</span>}
        <Chevron open={open} className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[220px] font-normal">
          <DropdownMenu
            multiple
            options={TYPE_OPTIONS}
            values={values}
            onSelect={(v) => {
              const t = v as RequestType
              onChange(values.includes(t) ? values.filter((x) => x !== t) : [...values, t])
            }}
            footer={
              active ? (
                <button type="button" onClick={() => onChange([])} className="w-full rounded-[10px] px-3.5 py-2 text-left text-xs font-semibold text-[#9aa1ac] hover:bg-[#4b5563] hover:text-white">
                  Clear selection
                </button>
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  )
}

/**
 * Row ⋯ menu — exactly as designed on the Requests dashboard (Figma 37453:198095, "Row actions — open"):
 * pending approval (incl. overdue) → View / Edit / Cancel request; every other status → View request.
 */
export function RowActions({ row, onView }: { row: RequestRow; onView: () => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useOutside(open, () => setOpen(false))
  const base = detailPathFor(row)
  const go = (action: 'edit' | 'cancel') => navigate(`${base}${base.includes('?') ? '&' : '?'}action=${action}`)
  const items: { label: string; icon: string; onSelect: () => void }[] = [{ label: 'View request', icon: viewIcon, onSelect: onView }]
  if (row.statusKey === 'pending-approval') {
    items.push({ label: 'Edit request', icon: editIcon, onSelect: () => go('edit') }, { label: 'Cancel request', icon: cancelIcon, onSelect: () => go('cancel') })
  }
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mx-auto flex size-7 items-center justify-center rounded-md hover:bg-[#edeff2] ${open ? 'bg-[#edeff2]' : ''}`}
        aria-label={`Open actions for ${row.payee}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img src={menuDotsIcon} alt="" className="h-[15px] w-[2.5px]" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+4px)] z-30 flex w-[130px] flex-col gap-1 rounded-lg bg-white p-1 shadow-[2px_16px_15.1px_0px_rgba(164,162,162,0.05),0_0_0_0.5px_#edeff2]">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); it.onSelect() }}
              className="flex w-full items-center gap-1 rounded px-2.5 py-1 text-left text-[10px] font-medium leading-4 text-[#6b7280] hover:bg-[#f5f6f8] hover:text-[#111927]"
            >
              <span className="flex size-3 shrink-0 items-center justify-center">
                <img src={it.icon} alt="" className="max-h-[11px] max-w-[11px]" />
              </span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZES = [
  { value: '5', label: 'Show 5 items' },
  { value: '10', label: 'Show 10 items' },
  { value: '20', label: 'Show 20 items' },
  { value: '50', label: 'Show 50 items' },
]

export default function RequestsTable({
  rows,
  search,
  onSearch,
  onFilterClick,
  filterCount = 0,
  typeValues = [],
  onTypeChange,
  typeMenuInitiallyOpen,
  selectedRowId,
  emptyState,
}: {
  rows: RequestRow[]
  search: string
  onSearch: (v: string) => void
  onFilterClick?: () => void
  filterCount?: number
  typeValues?: RequestType[]
  onTypeChange?: (v: RequestType[]) => void
  typeMenuInitiallyOpen?: boolean
  onQuickView?: (row: RequestRow) => void
  selectedRowId?: string
  emptyState?: ReactNode
}) {
  const navigate = useNavigate()
  const [pageSize, setPageSize] = useState('20')
  const [page, setPage] = useState(1)
  const size = Number(pageSize)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * size, current * size)

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex items-start gap-4">
        <HdsSearch value={search} onChange={(v) => { onSearch(v); setPage(1) }} placeholder="Search requests" className="w-[320px]" />
        <HdsButton
          variant="secondary"
          size="sm"
          onClick={onFilterClick}
          leadingIcon={<img src={filterIcon} alt="" className="size-4" />}
          className={filterCount ? '' : '!bg-[#edeff2] hover:!bg-[#e1e4e9]'}
        >
          Filter{filterCount ? ` · ${filterCount}` : ''}
        </HdsButton>
      </div>

      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[180px]" />
          <col />
          <col />
          <col className="w-[98px]" />
          <col />
          <col />
          <col className="w-[140px]" />
          <col className="w-[42px]" />
        </colgroup>
        <thead>
          <tr className="bg-[#efefef]">
            <th className="rounded-l-lg px-2.5 py-2 text-sm font-medium text-[#525866]">Payee</th>
            <th className="px-2.5 py-2">{onTypeChange ? <TypeHeader values={typeValues} onChange={onTypeChange} initiallyOpen={typeMenuInitiallyOpen} /> : <span className="text-sm font-medium text-[#525866]">Type</span>}</th>
            <th className="px-2.5 py-2 text-sm font-medium text-[#525866]">Requested by</th>
            <th className="px-2.5 py-2 text-sm font-medium text-[#525866]">Amount</th>
            <th className="px-2.5 py-2 text-sm font-medium text-[#525866]">Request date</th>
            <th className="px-2.5 py-2 text-sm font-medium text-[#525866]">Due date</th>
            <th className="px-2.5 py-2 text-sm font-medium text-[#525866]">Status</th>
            <th className="rounded-r-lg" />
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => {
            const open = () => navigate(detailPathFor(row))
            return (
              <tr
                key={row.id}
                onClick={open}
                className={`group relative cursor-pointer border-b border-[#e1e4e9] transition-colors hover:bg-[#f5f6f8] ${selectedRowId === row.id ? 'bg-[#eaf2f9] hover:bg-[#eaf2f9]' : ''}`}
              >
                <td className="px-2.5 py-3.5 align-middle">
                  <p className="truncate text-sm font-medium text-[#222121]">{row.payee}</p>
                  <p className="truncate text-xs text-[#9aa1ac]">{row.refId}</p>
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  <HdsBadge color={TYPE_COLOR[row.type]}>{row.type}</HdsBadge>
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  <div className="flex items-center gap-1">
                    {row.requestedByIsSelf && (
                      <span className="flex items-center rounded-pill bg-[#dbefdc] p-0.5" title="You">
                        <img src={selfBadgeIcon} alt="" className="h-[7px] w-[4.33px]" />
                      </span>
                    )}
                    <p className="truncate text-sm font-medium text-[#222121]">{row.requestedBy}</p>
                  </div>
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  <p className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.amount}</p>
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  <p className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.requestDate}</p>
                  <p className="whitespace-nowrap text-xs text-[#9aa1ac]">{row.requestTime}</p>
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  {row.dueDate ? (
                    <>
                      <p className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.dueDate}</p>
                      {row.dueNote && <p className={`whitespace-nowrap text-xs ${dueToneClass[row.dueNoteTone]}`}>{row.dueNote}</p>}
                    </>
                  ) : (
                    <p className="whitespace-nowrap text-sm font-medium text-[#0e121b]">--</p>
                  )}
                </td>
                <td className="px-2.5 py-3.5 align-middle">
                  <HdsBadge color={STATUS_META[row.statusKey].color}>{row.status}</HdsBadge>
                </td>
                <td className="relative px-2.5 py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                  <RowActions row={row} onView={open} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {rows.length === 0 && (emptyState ?? (
        <div className="flex w-full flex-col items-center gap-1 py-10 text-center">
          <p className="font-heading text-base font-medium text-[#111927]">No requests match</p>
          <p className="text-sm text-[#6b7280]">Try a different search term or clear your filters.</p>
        </div>
      ))}

      {rows.length > 0 && (
        <div className="flex w-full items-center justify-between">
          <span className="w-[160px]" />
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page" className="flex size-8 items-center justify-center rounded-lg text-[#4b5563] hover:bg-[#edeff2] disabled:opacity-40">
              <Chevron className="rotate-90" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === current ? 'page' : undefined}
                className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium ${p === current ? 'border border-[#e1e4e9] bg-white text-[#111927]' : 'text-[#4b5563] hover:bg-[#edeff2]'}`}
              >
                {p}
              </button>
            ))}
            <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page" className="flex size-8 items-center justify-center rounded-lg text-[#4b5563] hover:bg-[#edeff2] disabled:opacity-40">
              <Chevron className="-rotate-90" />
            </button>
          </nav>
          <div className="w-[160px]">
            <HdsSelect size="sm" options={PAGE_SIZES} value={pageSize} onChange={(v) => { setPageSize(v); setPage(1) }} />
          </div>
        </div>
      )}
    </div>
  )
}
