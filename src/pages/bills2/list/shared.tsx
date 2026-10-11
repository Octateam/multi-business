import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  HdsBadge,
  HdsButton,
  HdsCheckbox,
  HdsInput,
  HdsSearch,
  HdsActionMenu,
  Chevron,
  inputRowClass,
  type ActionItem,
  type BadgeColor,
  type SelectOption,
  HdsToggleSegment,
} from '../../../components/ui/hds'
import { setBillRole, useBillRole, type BillRole } from './billRole'
import { KitSelect, MenuSelect, PAGE_SIZE_OPTIONS, useDismiss } from '../hdsKit'
import { useAddedBills } from '../addBill/billDraft'

import iconPlus from '../../../assets/icons/list1-plus.svg'
import iconFilter from '../../../assets/icons/list1-filter.svg'
import iconCategoryDot from '../../../assets/icons/list1-category-dot.svg'
import iconPaginationArrow from '../../../assets/icons/list1-pagination-arrow.svg'
import iconCloseSquare from '../../../assets/icons/list1-close-square.svg'
import iconCalendar from '../../../assets/icons/list1-calendar.svg'
import iconToastSuccessCheck from '../../../assets/icons/list1-toast-success-check.svg'
import iconToastClose from '../../../assets/icons/list1-toast-close.svg'
import iconToastErrorAlert from '../../../assets/icons/list1-toast-error-alert.svg'
import iconRowMenuDots from '../../../assets/icons/dashboard-row-menu-dots.svg'
import iconSelectionReview from '../../../assets/icons/bills-selection-review.svg'
import iconSelectionClear from '../../../assets/icons/bills-selection-clear.svg'
import iconSelectionDivider from '../../../assets/icons/bills-selection-divider.svg'

/* ---------------------------------------------------------------------- */
/*  Data                                                                   */
/* ---------------------------------------------------------------------- */

export type BillRow = {
  id: string
  bill: string
  invoice: string
  categoryBadge?: string
  vendor: string
  vendorCode: string
  /** Vendor isn't in the vendor list yet (Figma 41310:643438 — clock badge + "New vendor awaiting approval" tooltip). */
  newVendor?: boolean
  frequency: string
  createdBy?: string
  amount: string
  dueDate?: string
  dueNote?: string
  payOn?: string
  payOnNote?: string
  dueBy?: string
  dueByNote?: string
  status: string
}

// Rows matching Figma node 41310:643438 / 45033:223926 ("Bills list" — Queue), plus a Draft and a
// Cancelled bill so every status in the row-actions spec (44840:253001) is represented. "Pay on" /
// "Due by" feed the Upcoming tab (Figma 43881:165141). Per-bill detail lives in ./billRecords.
export const DASHBOARD_BILLS: BillRow[] = [
  {
    id: 'nw-2481',
    bill: 'Software',
    invoice: 'invoice NW-2481',
    vendor: 'Northwind Design Ltd',
    vendorCode: 'VND-2481',
    frequency: 'Monthly',
    createdBy: 'Fiona Ames',
    amount: '$9,200.00',
    dueDate: '14 Aug 2026',
    dueNote: 'Due tomorrow',
    payOn: '8 Aug 2026',
    payOnNote: '2 days overdue',
    dueBy: '14 Aug 2026',
    dueByNote: 'Due tomorrow',
    status: 'Overdue',
  },
  {
    id: 'ml-4419',
    bill: 'Contractors',
    invoice: 'invoice ML-4419',
    vendor: 'Meridian Legal Partners',
    vendorCode: 'VND-2482',
    newVendor: true,
    frequency: 'Weekly',
    createdBy: 'Luke Frank',
    amount: '$4,800.00',
    dueDate: '29 Aug 2026',
    dueNote: 'Due in 2 days',
    payOn: '28 Aug 2026',
    payOnNote: 'Due tomorrow',
    dueBy: '29 Aug 2026',
    dueByNote: 'Due in 2 days',
    status: 'Needs action',
  },
  {
    id: 'ap-2201',
    bill: 'Marketing',
    invoice: 'invoice AP-2201',
    vendor: 'Acme Print Co',
    vendorCode: 'VND-2483',
    newVendor: true,
    frequency: 'Quarterly',
    createdBy: 'Caleb Joel',
    amount: '$10,488.00',
    dueDate: '4 Jul 2026',
    dueNote: 'Due in 14 days',
    payOn: '3 Jul 2026',
    payOnNote: 'Due in 13 days',
    dueBy: '4 Jul 2026',
    dueByNote: 'Due in 14 days',
    status: 'Pending approval',
  },
  {
    id: 'ub-5521',
    bill: 'Travel',
    invoice: 'invoice UB-5521',
    categoryBadge: 'Travel',
    vendor: 'Uber for Business',
    vendorCode: 'VND-2484',
    frequency: 'Daily',
    createdBy: 'Betsy Flinch',
    amount: '$340.00',
    dueDate: '5 Aug 2026',
    dueNote: 'Due in 33 days',
    payOn: '4 Aug 2026',
    payOnNote: 'Due in 32 days',
    dueBy: '5 Aug 2026',
    dueByNote: 'Due in 33 days',
    status: 'Needs action',
  },
  {
    id: 'nd-1187',
    bill: 'Rent & facilities',
    invoice: 'invoice ND-1187',
    vendor: 'Northwide Design Ltd',
    vendorCode: 'VND-2485',
    frequency: 'Annually',
    createdBy: 'Zach Hardy',
    amount: '$5,130.00',
    dueDate: '5 Aug 2026',
    dueNote: '2 days overdue',
    payOn: '3 Aug 2026',
    payOnNote: 'Payment failed',
    dueBy: '5 Aug 2026',
    dueByNote: '2 days overdue',
    status: 'Payment failed',
  },
  {
    id: 'dl-9012',
    bill: 'Utilities',
    invoice: 'invoice DL-9012',
    vendor: 'Deliveroo',
    vendorCode: 'VND-2486',
    frequency: 'Quarterly',
    createdBy: 'William Kaye',
    amount: '$186.00',
    dueDate: '1 Jul 2026',
    dueNote: 'Today',
    payOn: '1 Jul 2026',
    payOnNote: 'Today',
    dueBy: '1 Jul 2026',
    dueByNote: 'Today',
    status: 'Payment pending',
  },
  {
    id: 'fg-3390',
    bill: 'Equipment',
    invoice: 'invoice FG-3390',
    vendor: 'Figma',
    vendorCode: 'VND-2487',
    frequency: 'Weekly',
    createdBy: 'Jonathan Lin',
    amount: '$5,000.00',
    dueDate: '12 Jun 2026',
    dueNote: 'Due tomorrow',
    payOn: '11 Jun 2026',
    payOnNote: 'Today',
    dueBy: '12 Jun 2026',
    dueByNote: 'Due tomorrow',
    status: 'Overdue',
  },
  {
    id: 'st-0412',
    bill: 'Office supplies',
    invoice: 'invoice ST-0412',
    vendor: 'Staples',
    vendorCode: 'VND-2489',
    frequency: 'One-time',
    createdBy: 'John Doe',
    amount: '$612.44',
    dueDate: '30 Aug 2026',
    dueNote: 'Not submitted',
    payOn: '—',
    payOnNote: 'Not scheduled',
    dueBy: '30 Aug 2026',
    dueByNote: 'Not submitted',
    status: 'Draft',
  },
  {
    id: 'aws-8834',
    bill: 'Cloud infrastructure',
    invoice: 'invoice AWS-8834',
    vendor: 'Amazon Web Services',
    vendorCode: 'VND-2488',
    frequency: 'Monthly',
    createdBy: 'Priya Raman',
    amount: '$2,500.00',
    dueDate: '15 Aug 2026',
    dueNote: 'Paid on time',
    payOn: '15 Aug 2026',
    payOnNote: 'Paid',
    dueBy: '15 Aug 2026',
    dueByNote: 'Paid on time',
    status: 'Paid',
  },
  {
    id: 'ns-7710',
    bill: 'Software',
    invoice: 'invoice NS-7710',
    vendor: 'Northstar Labs',
    vendorCode: 'VND-2490',
    frequency: 'Monthly',
    createdBy: 'Marcus Reid',
    amount: '$4,800.00',
    dueDate: '20 Jul 2026',
    dueNote: 'Cancelled 18 Jul',
    payOn: '—',
    payOnNote: 'Cancelled',
    dueBy: '20 Jul 2026',
    dueByNote: 'Cancelled 18 Jul',
    status: 'Cancelled',
  },
]

/* ---------------------------------------------------------------------- */
/*  Status pill — HDS Badge (Figma HDS 798:7, filled, md)                  */
/* ---------------------------------------------------------------------- */

const STATUS_COLOR: Record<string, BadgeColor> = {
  Overdue: 'amber',
  'Pending approval': 'amber',
  'Needs action': 'navy',
  'Payment failed': 'red',
  'Payment pending': 'navy',
  Paid: 'green',
  Cancelled: 'red',
  Draft: 'grey',
  Active: 'green',
}

export function StatusPill({ label }: { label: string }) {
  return <HdsBadge color={STATUS_COLOR[label] ?? 'grey'}>{label}</HdsBadge>
}

/* ---------------------------------------------------------------------- */
/*  Header + stat cards                                                    */
/* ---------------------------------------------------------------------- */

/** Bills created in this session (New bill → Submit / Save as draft), newest first, ahead of the sample rows. */
export function useBillRows(base: BillRow[]) {
  const added = useAddedBills()
  return added.length ? [...added, ...base] : base
}

export function BillsPageHeader({ subtitle, onAddBill }: { subtitle: string; onAddBill?: () => void }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
          Bills
        </h1>
        <p className="font-heading text-base text-[#70707d]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <BillRoleToggle />
        <HdsButton variant="primary" size="md" leadingIcon={<img src={iconPlus} alt="" className="h-[12px] w-[12px]" />} onClick={onAddBill}>
          Add bill
        </HdsButton>
      </div>
    </div>
  )
}

/** Requester / Approver switch — decides what opening, selecting and reviewing a bill does. */
export function BillRoleToggle() {
  const role = useBillRole()
  return (
    <HdsToggleSegment<BillRole>
      options={[
        { value: 'requester', label: 'Requester' },
        { value: 'approver', label: 'Approver' },
      ]}
      value={role}
      onChange={setBillRole}
    />
  )
}

const STAT_CARDS = [
  { label: 'Due soon', value: '$31,600.00', note: '3 bills due within 7 days' },
  { label: 'Overdue', value: '$8,730.00', note: '1 overdue bill' },
  {
    label: 'Pending approval',
    value: '$13,360.00',
    note: '1 bill awaiting approval',
  },
  {
    label: 'Payment issues',
    value: '$6,530.00',
    note: '1 payment needs attention',
  },
]

export function BillsStatCards() {
  return (
    <div className="flex w-full gap-2.5">
      {STAT_CARDS.map((card) => (
        <div key={card.label} className="flex flex-1 flex-col justify-center gap-3 rounded-xl border-[0.5px] border-[#cbd0d8] p-4">
          <p className="text-sm font-medium text-[#111927]">{card.label}</p>
          <p
            className="font-heading text-[32px] font-semibold leading-[40px] tracking-[-0.64px] text-[#111927]"
            style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}
          >
            {card.value}
          </p>
          <p className="text-[13px] text-[#9aa1ac]">{card.note}</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Search / filter bar + tabs                                             */
/* ---------------------------------------------------------------------- */

export function BillsSearchFilterBar({
  onFilterClick,
  filterCount,
  query: controlledQuery,
  onQueryChange,
}: {
  onFilterClick?: () => void
  filterCount?: number
  query?: string
  onQueryChange?: (q: string) => void
}) {
  const [localQuery, setLocalQuery] = useState('')
  const query = controlledQuery ?? localQuery
  const setQuery = onQueryChange ?? setLocalQuery
  return (
    <div className="flex items-center gap-3">
      <HdsSearch value={query} onChange={setQuery} placeholder="Search bills" className="w-[320px]" />
      <HdsButton variant="secondary" size="sm" onClick={onFilterClick} leadingIcon={<img src={iconFilter} alt="" className="h-[14px] w-[14px]" />}>
        Filter
        {!!filterCount && (
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#004b87] px-1 text-[10px] font-semibold text-white">
            {filterCount}
          </span>
        )}
      </HdsButton>
    </div>
  )
}

export type BillsTabItem = { key: string; label: string; count?: number }

/** Horizontal tabs — Figma "Horizontal tabs" (43617:171156): 32px gap, active = Semi Bold ink + ink count pill + 3px indicator. */
export function BillsTabs({ tabs, active, onChange }: { tabs: BillsTabItem[]; active: string; onChange?: (key: string) => void }) {
  return (
    <div role="tablist" className="flex w-full items-end gap-8 border-b border-[#edeff2]">
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-tab={tab.key}
            onClick={() => onChange?.(tab.key)}
            className="group flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <p className={isActive ? 'text-base font-semibold text-[#1a1d23]' : 'text-base font-medium text-[#4b5563] group-hover:text-[#111927]'}>
                {tab.label}
              </p>
              {tab.count !== undefined && (
                <span data-tab-count className="contents">
                  <HdsBadge color={isActive ? 'dark' : 'grey'} className="min-w-6 justify-center">
                    {tab.count}
                  </HdsBadge>
                </span>
              )}
            </div>
            <div className={`h-[3px] w-full rounded-sm ${isActive ? 'bg-[#1a1d23]' : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Table                                                                   */
/* ---------------------------------------------------------------------- */

export type BillsColumn = 'createdBy' | 'dueDate' | 'payOn' | 'dueBy'

const KebabTrigger = ({ label, open, onClick }: { label: string; open?: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-haspopup="menu"
    aria-expanded={open}
    className={`flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[#edeff2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87] ${open ? 'bg-[#edeff2]' : ''}`}
  >
    <img src={iconRowMenuDots} alt="" className="h-[15px] w-[2.5px]" />
  </button>
)

/** Small dark tooltip (Figma "Tooltip" 44598:167619) shown under its anchor on hover / focus. */
function HoverTip({ tip, children }: { tip: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex items-center" tabIndex={0} aria-label={tip}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111927] px-3 py-1 text-[10px] font-medium leading-[14px] text-white shadow group-hover/tip:block group-focus/tip:block"
      >
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-x-[6px] border-b-[6px] border-x-transparent border-b-[#111927]" />
        {tip}
      </span>
    </span>
  )
}

// Figma column widths (42 / 125 / 208 / 144 / 130 / 125 / 130 / 125 / 42 at 1071px) as flex ratios, so the
// table fits the content column without a horizontal scroller (which would also clip the ⋯ menus).
const COLS = {
  check: 'w-[42px] shrink-0 justify-center',
  bill: 'min-w-0 flex-[125_1_0%]',
  vendor: 'min-w-0 flex-[208_1_0%]',
  frequency: 'min-w-0 flex-[110_1_0%]',
  createdBy: 'min-w-0 flex-[130_1_0%]',
  amount: 'min-w-0 flex-[110_1_0%]',
  date: 'min-w-0 flex-[130_1_0%]',
  status: 'w-[140px] shrink-0',
  menu: 'w-[42px] shrink-0 justify-center',
}

/**
 * Bills table — Figma 41310:643438 (Queue: Created by + Due date) / 43881:165141 (Upcoming: Pay on + Due by).
 * Row-based so the whole row is the click target for the bill's details; the checkbox, vendor link and
 * ⋯ menu stop propagation. Selection is controlled by the parent (it drives the "n Selected | Review" bar).
 */
export function BillsTable({
  rows,
  columns,
  onRowClick,
  rowActions,
  onVendorClick,
  vendorClickable,
  selected,
  onSelectedChange,
  selectable = true,
  emptyMessage = 'No bills here yet.',
}: {
  rows: BillRow[]
  columns: BillsColumn[]
  onRowClick?: (row: BillRow) => void
  /** Items for a row's ⋯ menu (per status — Figma 44840:253001). */
  rowActions?: (row: BillRow) => ActionItem[]
  onVendorClick?: (row: BillRow) => void
  vendorClickable?: (row: BillRow) => boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  /** Row checkboxes — approvers select bills to review; requesters don't get them. */
  selectable?: boolean
  emptyMessage?: string
}) {
  const [localSelected, setLocalSelected] = useState<string[]>([])
  const sel = selected ?? localSelected
  const setSel = onSelectedChange ?? setLocalSelected
  const allSelected = rows.length > 0 && rows.every((r) => sel.includes(r.id))
  const someSelected = sel.length > 0 && !allSelected
  const toggleRow = (id: string) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id])
  const th = 'flex h-9 items-center px-2.5 text-sm font-medium text-[#525866]'
  const td = 'flex flex-col justify-center gap-2 px-2.5'
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

  const dateCell = (date?: string, note?: string) => (
    <>
      <p className="text-sm font-medium text-[#222121]">{date}</p>
      {note && <p className={`text-[11px] ${/overdue|failed/i.test(note) ? 'text-[#b72020]' : /tomorrow/i.test(note) ? 'text-[#dc6803]' : 'text-[#9aa1ac]'}`}>{note}</p>}
    </>
  )

  return (
    <div className="w-full" data-bills-table>
      <div className="flex w-full flex-col">
        {/* header */}
        <div role="row" className="flex w-full rounded-lg bg-[#efefef]">
          {selectable && (
            <div className={`${th} ${COLS.check}`}>
              <HdsCheckbox
                size="md"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={() => setSel(allSelected || someSelected ? [] : rows.map((r) => r.id))}
              />
            </div>
          )}
          <div className={`${th} ${COLS.bill}`}>Bill</div>
          <div className={`${th} ${COLS.vendor}`}>Vendor</div>
          <div className={`${th} ${COLS.frequency}`}>Frequency</div>
          {columns.includes('createdBy') && <div className={`${th} ${COLS.createdBy}`}>Created by</div>}
          <div className={`${th} ${COLS.amount}`}>Amount</div>
          {columns.includes('dueDate') && <div className={`${th} ${COLS.date}`}>Due date</div>}
          {columns.includes('payOn') && <div className={`${th} ${COLS.date}`}>Pay on</div>}
          {columns.includes('dueBy') && <div className={`${th} ${COLS.date}`}>Due by</div>}
          <div className={`${th} ${COLS.status}`}>Status</div>
          <div className={`${th} ${COLS.menu}`} />
        </div>

        {rows.length === 0 && <p className="px-2.5 py-10 text-center text-sm text-[#9aa1ac]">{emptyMessage}</p>}

        {rows.map((r) => {
          const isSel = sel.includes(r.id)
          return (
            <div
              key={r.id}
              role="row"
              data-bill-row={r.id}
              data-status={r.status}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(r)}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onRowClick?.(r)
                }
              }}
              className={`flex h-[66px] w-full items-stretch border-b border-[#efefef] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#004b87] ${ onRowClick ? 'cursor-pointer hover:bg-[#f8f9fa]' : '' } ${isSel ? 'bg-[#f5f8fc]' : ''}`}
            >
              {selectable && (
                <div className={`flex items-center ${COLS.check}`} onClick={stop}>
                  <HdsCheckbox size="md" checked={isSel} onChange={() => toggleRow(r.id)} />
                </div>
              )}

              <div className={`${td} ${COLS.bill}`}>
                {r.categoryBadge ? (
                  <span className="inline-flex items-center gap-1.5">
                    <HoverTip tip="New action needed">
                      <span className="flex items-center justify-center rounded-full bg-[#dbefdc] p-0.5">
                        <img src={iconCategoryDot} alt="" className="h-[7px] w-[7px]" />
                      </span>
                    </HoverTip>
                    <span className="text-sm font-medium text-[#222121]">{r.categoryBadge}</span>
                  </span>
                ) : (
                  <p className="truncate text-sm font-medium text-[#222121]">{r.bill}</p>
                )}
                <p className="text-[11px] text-[#9aa1ac]">{r.invoice}</p>
              </div>

              <div className={`${td} ${COLS.vendor}`}>
                <span className="flex min-w-0 items-center gap-1">
                  {r.newVendor && (
                    <HoverTip tip="New vendor awaiting approval">
                      <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-[#fef0c7]">
                        <span className="size-1.5 rounded-full bg-[#dc6803]" />
                      </span>
                    </HoverTip>
                  )}
                  {onVendorClick && (vendorClickable?.(r) ?? true) ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVendorClick(r)
                      }}
                      className="w-fit truncate text-left text-sm font-medium text-[#004b87] underline decoration-transparent underline-offset-4 transition-colors hover:text-[#004378] hover:decoration-[#004378]"
                    >
                      {r.vendor}
                    </button>
                  ) : (
                    <p className="truncate text-sm font-medium text-[#222121]">{r.vendor}</p>
                  )}
                </span>
                <p className="text-[11px] text-[#9aa1ac]">{r.vendorCode}</p>
              </div>

              <div className={`${td} ${COLS.frequency}`}>
                <p className="truncate text-sm font-medium text-[#222121]">{r.frequency}</p>
              </div>

              {columns.includes('createdBy') && (
                <div className={`${td} ${COLS.createdBy}`}>
                  <p className="truncate text-sm font-medium text-[#222121]">{r.createdBy}</p>
                </div>
              )}

              <div className={`${td} ${COLS.amount}`}>
                <p className="text-sm font-medium text-[#222121]">{r.amount}</p>
              </div>

              {columns.includes('dueDate') && <div className={`${td} ${COLS.date}`}>{dateCell(r.dueDate, r.dueNote)}</div>}
              {columns.includes('payOn') && <div className={`${td} ${COLS.date}`}>{dateCell(r.payOn, r.payOnNote)}</div>}
              {columns.includes('dueBy') && <div className={`${td} ${COLS.date}`}>{dateCell(r.dueBy, r.dueByNote)}</div>}

              <div className={`${td} ${COLS.status} items-start`}>
                <StatusPill label={r.status} />
              </div>

              <div className={`flex items-center ${COLS.menu}`} onClick={stop}>
                {rowActions ? (
                  <HdsActionMenu
                    theme="light"
                    width={168}
                    items={rowActions(r)}
                    trigger={({ open, toggle }) => <KebabTrigger label={`Open actions for ${r.bill} — ${r.vendor}`} open={open} onClick={toggle} />}
                  />
                ) : (
                  <KebabTrigger label={`Open ${r.bill}`} onClick={() => onRowClick?.(r)} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Row-action icon (Figma 44840:253001 icons, tinted to the menu text)     */
/* ---------------------------------------------------------------------- */

/** Masks the Figma glyph so it takes the menu item's text colour (grey / red on the white row menu). */
export function MenuGlyph({ src, inset }: { src: string; inset: string }) {
  // Quoted: small SVGs are inlined by Vite as data: URLs, which break an unquoted url().
  const url = `url(${JSON.stringify(src)})`
  return (
    <span className="relative block size-3 shrink-0">
      <span
        className="absolute bg-current"
        style={{ inset, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}
      />
    </span>
  )
}

/* ---------------------------------------------------------------------- */
/*  "n Selected | Review" bar — Figma 43889:155919                         */
/* ---------------------------------------------------------------------- */

export function BillsSelectionBar({ count, onReview, onClear }: { count: number; onReview: () => void; onClear: () => void }) {
  if (count < 1) return null
  return (
    // Zero-height sticky anchor: the pill floats over the bottom of the table, centred on the content column.
    // Sits 80px up so it clears the prototype's floating version switcher at the bottom of the viewport.
    <div className="pointer-events-none sticky bottom-20 z-30 flex h-0 w-full items-start justify-center">
      <div
        role="region"
        aria-label="Selected bills"
        data-selection-bar
        className="pointer-events-auto flex shrink-0 -translate-y-full animate-[popIn_140ms_ease-out] items-center gap-5 rounded-[123px] bg-black px-4 py-3 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.35)]"
      >
        <div className="flex items-center gap-[22px]">
          <div className="flex items-center gap-4">
            <p className="whitespace-nowrap text-sm font-medium leading-5 text-white">{count} Selected</p>
            <img src={iconSelectionDivider} alt="" width={1} height={16} className="h-4 w-px" />
          </div>
          <button
            type="button"
            onClick={onReview}
            className="flex items-center gap-1 rounded-[123px] bg-[#222121] px-4 py-1 transition-colors hover:bg-[#3a3939] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="relative block size-4 shrink-0">
              <img src={iconSelectionReview} alt="" className="absolute inset-[9.38%] block size-[81.24%] max-w-none" />
            </span>
            <span className="text-sm font-semibold leading-5 text-[#f5f6f8]">Review</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="relative block size-4 shrink-0 rounded-full opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <img src={iconSelectionClear} alt="" className="absolute inset-[5.21%] block size-[89.58%] max-w-none" />
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pagination                                                              */
/* ---------------------------------------------------------------------- */

export function BillsPagination({ total }: { total?: number }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState('20')
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / Number(pageSize)))
  const current = Math.min(page, totalPages)
  const first = Math.max(1, Math.min(current - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => first + i)
  const arrowCls =
    'flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
  return (
    <div className="flex w-full items-center justify-between pt-2">
      <p className="px-2.5 py-1.5 text-sm text-[#9aa1ac]">
        Page {current} of {totalPages}
      </p>
      <div className="flex items-center gap-6">
        <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className={arrowCls}>
          <img src={iconPaginationArrow} alt="" className="size-5 rotate-180" />
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === current ? 'page' : undefined}
              onClick={() => setPage(n)}
              className={`flex size-8 items-center justify-center rounded-lg text-sm transition-colors ${ n === current ? 'bg-[#111927] font-semibold text-white' : 'border-[0.5px] border-[#e1e4e9] text-[#4b5563] hover:bg-[#f5f6f8]' }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} className={arrowCls}>
          <img src={iconPaginationArrow} alt="" className="size-5" />
        </button>
      </div>
      <MenuSelect
        options={PAGE_SIZE_OPTIONS}
        value={pageSize}
        onChange={(v) => {
          setPageSize(v)
          setPage(1)
        }}
        align="right"
        placement="top"
        width={180}
        trigger={({ open, toggle, selected }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex h-9 items-center gap-1 rounded-lg border-[0.5px] bg-[#f5f6f8] px-3.5 text-[13px] text-[#111927] transition-colors hover:bg-[#edeff2] ${open ? 'border-[#004b87]' : 'border-[#e1e4e9]'}`}
          >
            {selected?.label ?? 'Show 20 items'}
            <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
          </button>
        )}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Toast                                                                   */
/* ---------------------------------------------------------------------- */

export function BillsToast({
  variant,
  title,
  message,
  onClose,
  action,
}: {
  variant: 'success' | 'error'
  title: string
  message: string
  onClose?: () => void
  action?: ReactNode
}) {
  const isSuccess = variant === 'success'
  return (
    <div
      role="status"
      className="absolute right-8 top-6 z-20 flex w-[400px] items-start gap-3 rounded-[10px] border-[0.5px] py-4 pl-4 pr-3.5 shadow-lg"
      style={{
        backgroundColor: isSuccess ? '#e6f7f1' : '#fde8ea',
        borderColor: isSuccess ? '#0e9e74' : '#b4232e',
      }}
    >
      <img src={isSuccess ? iconToastSuccessCheck : iconToastErrorAlert} alt="" className="h-[18px] w-[18px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold" style={{ color: isSuccess ? '#077155' : '#b4232e' }}>
          {title}
        </p>
        <p className="text-xs text-[#4b5563]">{message}</p>
        {action && <div className="pt-1">{action}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 rounded opacity-65 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]"
      >
        <img src={iconToastClose} alt="" className="h-[16px] w-[16px]" />
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Filter drawer                                                           */
/* ---------------------------------------------------------------------- */

const SCHEDULE_OPTIONS = ['One-off', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
const STATUS_OPTIONS = ['Pending approval', 'Overdue', 'Needs action', 'Paid', 'Payment pending', 'Cancelled', 'Payment failed', 'Draft']

// Not specified in Figma — drawn from the bills in this workspace (Bill = category, Vendor, Created by).
const uniq = (list: (string | undefined)[]) => Array.from(new Set(list.filter(Boolean) as string[]))
const BILL_FILTER_OPTIONS: SelectOption[] = uniq(DASHBOARD_BILLS.map((b) => b.bill)).map((b) => ({ value: b, label: b }))
const VENDOR_FILTER_OPTIONS: SelectOption[] = DASHBOARD_BILLS.map((b) => ({
  value: b.vendor,
  label: b.vendor,
  meta: b.vendorCode,
}))
const CREATED_BY_FILTER_OPTIONS: SelectOption[] = uniq(DASHBOARD_BILLS.map((b) => b.createdBy)).map((n) => ({ value: n, label: n }))

export function FilterCheckboxRow({ options, checked, onToggle }: { options: string[]; checked?: string[]; onToggle?: (opt: string) => void }) {
  // renders options two-per-row, matching the Figma grid
  const rows: string[][] = []
  for (let i = 0; i < options.length; i += 2) rows.push(options.slice(i, i + 2))
  return (
    <div className="flex w-full flex-col">
      {rows.map((row, i) => (
        <div key={i} className="flex w-full items-start">
          {row.map((opt) => (
            <div key={opt} onClick={() => onToggle?.(opt)} className="flex flex-1 cursor-pointer select-none items-center gap-2 px-1.5 py-2.5">
              <HdsCheckbox size="md" checked={!!checked?.includes(opt)} onChange={() => onToggle?.(opt)} />
              <span className="text-sm text-[#111927]">{opt}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* -- Date fields + mini calendar ---------------------------------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n: number) => String(n).padStart(2, '0')
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
export function parseDate(v: string): Date | null {
  const m = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? null : d
}
const sameDay = (a: Date | null, b: Date) => !!a && a.toDateString() === b.toDateString()

export function MiniDatePicker({ value, rangeFrom, rangeTo, onPick }: { value: string; rangeFrom: string; rangeTo: string; onPick: (v: string) => void }) {
  const selected = parseDate(value)
  const from = parseDate(rangeFrom)
  const to = parseDate(rangeTo)
  const [view, setView] = useState(() => {
    const base = selected ?? new Date(2026, 0, 1)
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const lead = view.getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const shift = (n: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1))
  const navBtn = 'flex size-7 items-center justify-center rounded-lg text-[#4b5563] hover:bg-[#f5f6f8]'
  return (
    <div className="absolute left-0 top-[104px] z-30 w-full animate-[popIn_140ms_ease-out] rounded-xl border-[0.5px] border-[#e1e4e9] bg-white p-4 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className={navBtn}>
          <Chevron className="rotate-90" />
        </button>
        <p className="text-sm font-semibold text-[#111927]">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </p>
        <button type="button" aria-label="Next month" onClick={() => shift(1)} className={navBtn}>
          <Chevron className="-rotate-90" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-[#9aa1ac]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="pb-1">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = new Date(view.getFullYear(), view.getMonth(), i + 1)
          const isSel = sameDay(selected, day)
          const isEdge = sameDay(from, day) || sameDay(to, day)
          const inRange = !!from && !!to && day > from && day < to
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(fmtDate(day))}
              className={`flex size-8 items-center justify-center justify-self-center rounded-full text-sm transition-colors ${ isSel || isEdge ? 'bg-[#111927] font-semibold text-white' : inRange ? 'bg-[#eaf2f9] text-[#004b87]' : 'text-[#111927] hover:bg-[#f5f6f8]' }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FilterDateField({
  label,
  value,
  onChange,
  active,
  onOpen,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  active: boolean
  onOpen: () => void
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <p className="text-sm font-medium text-[#111927]">{label}</p>
      <div className={`${inputRowClass({ focus: active })} h-11`}>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
          placeholder="DD/MM/YYYY"
          value={value}
          onFocus={onOpen}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" onClick={onOpen} aria-label={`Open ${label} calendar`} className="flex shrink-0">
          <img src={iconCalendar} alt="" className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  )
}

export function FilterDrawer({
  onClose,
  onApply,
  scheduleChecked = [],
  statusChecked = [],
  amountMin,
  amountMax,
  dueFrom,
  dueTo,
  showDatePicker = false,
}: {
  onClose?: () => void
  onApply?: () => void
  scheduleChecked?: string[]
  statusChecked?: string[]
  amountMin?: string
  amountMax?: string
  dueFrom?: string
  dueTo?: string
  showDatePicker?: boolean
}) {
  const [schedule, setSchedule] = useState(scheduleChecked)
  const [status, setStatus] = useState(statusChecked)
  const [bill, setBill] = useState<string | null>(null)
  const [vendor, setVendor] = useState<string | null>(null)
  const [createdBy, setCreatedBy] = useState<string | null>(null)
  const [min, setMin] = useState(amountMin ?? '')
  const [max, setMax] = useState(amountMax ?? '')
  const [from, setFrom] = useState(dueFrom ?? '')
  const [to, setTo] = useState(dueTo ?? '')
  const [picker, setPicker] = useState<'from' | 'to' | null>(showDatePicker ? 'from' : null)
  const dateRef = useDismiss(!!picker, () => setPicker(null))
  const toggle = (list: string[], set: (l: string[]) => void) => (opt: string) => set(list.includes(opt) ? list.filter((o) => o !== opt) : [...list, opt])
  const filled =
    schedule.length > 0 || status.length > 0 || !!bill || !!vendor || !!createdBy || Number(min) > 0 || Number(max) > 0 || !!from.trim() || !!to.trim()
  const clear = () => {
    setSchedule([])
    setStatus([])
    setBill(null)
    setVendor(null)
    setCreatedBy(null)
    setMin('')
    setMax('')
    setFrom('')
    setTo('')
    setPicker(null)
  }
  const amount = (v: string) => v.replace(/[^0-9.]/g, '')

  return (
    <div className="fixed bottom-10 right-10 top-10 z-20 w-[465px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
          Filter
        </h2>
        <button type="button" onClick={onClose} aria-label="Close filter panel">
          <img src={iconCloseSquare} alt="" className="size-6" />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2 border-b border-[#f6f6f6] pb-4">
          <p className="text-sm font-medium text-[#111927]">Schedule</p>
          <FilterCheckboxRow options={SCHEDULE_OPTIONS} checked={schedule} onToggle={toggle(schedule, setSchedule)} />
        </div>

        <div className="flex flex-col gap-2 border-b border-[#f6f6f6] pb-4">
          <p className="text-sm font-medium text-[#111927]">Status</p>
          <FilterCheckboxRow options={STATUS_OPTIONS} checked={status} onToggle={toggle(status, setStatus)} />
        </div>

        <div className="flex gap-2.5 border-b border-[#f6f6f6] pb-4">
          <KitSelect className="flex-1" label="Bill" placeholder="Select" options={BILL_FILTER_OPTIONS} value={bill} onChange={setBill} />
          <KitSelect
            className="flex-1"
            label="Vendor"
            placeholder="Select"
            options={VENDOR_FILTER_OPTIONS}
            value={vendor}
            onChange={setVendor}
            searchable
            searchPlaceholder="Search vendors"
          />
        </div>

        <div className="flex flex-col gap-4 border-b border-[#f6f6f6] pb-4">
          <p className="text-sm font-medium text-[#111927]">Amount</p>
          <div className="flex gap-4">
            <div className="min-w-0 flex-1">
              <HdsInput label="Min" prefix="$" inputMode="decimal" placeholder="0.00" value={min} onChange={(e) => setMin(amount(e.target.value))} />
            </div>
            <div className="min-w-0 flex-1">
              <HdsInput
                label="Max"
                prefix="$"
                inputMode="decimal"
                placeholder="0.00"
                value={max}
                onChange={(e) => setMax(amount(e.target.value))}
                error={min && max && Number(max) < Number(min) ? 'Max must be more than min' : undefined}
              />
            </div>
          </div>
        </div>

        <div className="border-b border-[#f6f6f6] pb-4">
          <KitSelect label="Created by" placeholder="Select" options={CREATED_BY_FILTER_OPTIONS} value={createdBy} onChange={setCreatedBy} />
        </div>

        <div ref={dateRef} className="relative flex flex-col gap-2 pb-4">
          <p className="text-sm font-medium text-[#111927]">Due date</p>
          <div className="flex gap-2">
            <FilterDateField label="From" value={from} onChange={setFrom} active={picker === 'from'} onOpen={() => setPicker('from')} />
            <FilterDateField label="To" value={to} onChange={setTo} active={picker === 'to'} onOpen={() => setPicker('to')} />
          </div>

          {picker && (
            <MiniDatePicker
              key={picker}
              value={picker === 'from' ? from : to}
              rangeFrom={from}
              rangeTo={to}
              onPick={(v) => {
                if (picker === 'from') {
                  setFrom(v)
                  setPicker('to')
                } else {
                  setTo(v)
                  setPicker(null)
                }
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <HdsButton variant="primary" fullWidth onClick={onApply} disabled={!filled}>
          Apply filter
        </HdsButton>
        <HdsButton variant="secondary" fullWidth onClick={clear} disabled={!filled}>
          Clear filter
        </HdsButton>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Nav helper                                                              */
/* ---------------------------------------------------------------------- */

export function AddBillLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Link to="/bills/add/manual-entry-empty" className={className}>
      {children}
    </Link>
  )
}
