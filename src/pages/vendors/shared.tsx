import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Chevron, HdsActionMenu, HdsBadge, HdsButton, HdsInput, HdsSearch, HdsSwitch, HdsToggleSegment, type ActionItem, type BadgeColor } from '../../components/ui/hds'
import { Drawer } from '../accounts/ui'
import { CardNotice } from '../cards/CardDrawers'
import { FilterCheckboxRow, FilterDateField, MenuGlyph, MiniDatePicker, parseDate } from '../bills2/list/shared'
import { clearVendorNotice, notifyVendor, setVendorStatus, useVendorStore } from './vendorStore'
import {
  COUNTRY_OPTIONS,
  Flag,
  KitPhoneInput,
  KitSelect,
  MenuSelect,
  PAGE_SIZE_OPTIONS,
  VENDOR_CATEGORY_OPTIONS,
  VENDOR_TYPE_OPTIONS,
  useDismiss,
  type SelectOption,
} from '../bills2/hdsKit'

import iconPlus from '../../assets/icons/vendors-icon-plus.svg'
import iconFilter from '../../assets/icons/vendors-icon-filter.svg'
import iconExport from '../../assets/icons/vendors-icon-export.svg'
import iconKebabVector from '../../assets/icons/vendors-icon-kebab-vector.svg'
import iconPaginationArrow from '../../assets/icons/vendors-icon-pagination-arrow.svg'
import iconAlertError from '../../assets/icons/vendors-icon-alert-error.svg'
import iconToastClose from '../../assets/icons/vendors-icon-toast-close.svg'
import menuView from '../../assets/icons/vendormenu-view.svg'
import menuArchive from '../../assets/icons/vendormenu-archive.svg'
import menuEdit from '../../assets/icons/vendormenu-edit.svg'
import menuBill from '../../assets/icons/vendormenu-bill.svg'
import menuDeactivate from '../../assets/icons/vendormenu-deactivate.svg'
import menuRestore from '../../assets/icons/vendormenu-restore.svg'
import menuReactivate from '../../assets/icons/vendormenu-reactivate.svg'
import iconCloseSquare from '../../assets/icons/list1-close-square.svg'
import iconModalClose from '../../assets/icons/vendors-icon-modal-close.svg'
import iconModalWarning from '../../assets/icons/vendors-icon-modal-warning.svg'
import iconBackArrow from '../../assets/icons/vendors-icon-back-arrow.svg'
import iconSectionChevron from '../../assets/icons/vendors-icon-section-chevron.svg'
import iconFileDoc from '../../assets/icons/vendors-icon-file-doc.svg'
import iconRemoveUpload from '../../assets/icons/vendors-icon-remove-upload.svg'
import iconTrash from '../../assets/icons/vendors-icon-trash.svg'
import iconCaretExpanded from '../../assets/icons/vendors-icon-caret-expanded.svg'
import iconCaretCollapsed from '../../assets/icons/vendors-icon-caret-collapsed.svg'
import flagCanada from '../../assets/icons/vendors-flag-canada.svg'
import flagFrance from '../../assets/icons/vendors-flag-france.svg'
import flagGermany from '../../assets/icons/vendors-flag-germany.svg'
import flagGhana from '../../assets/icons/vendors-flag-ghana.svg'
import flagIndia from '../../assets/icons/vendors-flag-india.svg'
import flagKenya from '../../assets/icons/vendors-flag-kenya.svg'

/* ---------------------------------------------------------------------- */
/*  Data — Figma node 46505:352050 ("Vendor List" populated table)         */
/* ---------------------------------------------------------------------- */

export type VendorType = 'Business' | 'Individual'
export type VendorStatus = 'Active' | 'Pending' | 'Archived' | 'Deactivated'

export type VendorRow = {
  id: string
  name: string
  vendorCode: string
  email: string
  category: string
  type: VendorType
  payments: number
  dateCreated: string
  dateCreatedTime: string
  status: VendorStatus
}

export const VENDOR_ROWS: VendorRow[] = [
  { id: 'VND-00432', name: 'Northwind Design Ltd', vendorCode: 'VND-00432', email: 'billing@ridgeline.io', category: 'Professional Services', type: 'Business', payments: 1, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Active' },
  { id: 'VND-00431', name: 'Meridian Legal Partners', vendorCode: 'VND-00431', email: 'facturen@kairo.nl', category: 'Software', type: 'Business', payments: 12, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Active' },
  { id: 'VND-00429', name: 'Michael Novak', vendorCode: 'VND-00429', email: 'accounts@northwind.com', category: 'Contractor', type: 'Individual', payments: 6, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Active' },
  { id: 'VND-00428', name: 'Northwide Design Ltd', vendorCode: 'VND-00428', email: 'accounts@acmen.com', category: 'Marketing', type: 'Business', payments: 9, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Pending' },
  { id: 'VND-00427', name: 'Alice Mitchell', vendorCode: 'VND-00427', email: 'facturen@kairo.nl', category: 'Logistics', type: 'Individual', payments: 4, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Archived' },
  { id: 'VND-00426', name: 'Figma', vendorCode: 'VND-00426', email: 'accounts@meridian.sg', category: 'Marketing', type: 'Business', payments: 13, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Pending' },
  { id: 'VND-00430', name: 'Acme Print Co', vendorCode: 'VND-00430', email: 'accounts@meridian.sg', category: 'Equipment', type: 'Business', payments: 18, dateCreated: 'Jan 6, 2025', dateCreatedTime: '2:14pm', status: 'Deactivated' },
]

/** Name / vendor ID / email search used by the list search field. */
export const matchVendors = (rows: VendorRow[], query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((r) => `${r.name} ${r.vendorCode} ${r.email}`.toLowerCase().includes(q))
}

/* ---------------------------------------------------------------------- */
/*  Option sets for the vendor forms (HDS dropdown menus)                  */
/* ---------------------------------------------------------------------- */

const designedCountry = (label: string, flag: string): SelectOption => ({ value: label, label, icon: <Flag src={flag} className="size-5" /> })

/** Figma 44939:343968 — designed options first (Kenya selected), then the rest of the Hinstantt corridor list. */
const DESIGNED_COUNTRIES: SelectOption[] = [
  designedCountry('Canada', flagCanada),
  designedCountry('France', flagFrance),
  designedCountry('Germany', flagGermany),
  designedCountry('Ghana', flagGhana),
  designedCountry('India', flagIndia),
  designedCountry('Kenya', flagKenya),
]
export const ADD_VENDOR_COUNTRY_OPTIONS: SelectOption[] = [
  ...DESIGNED_COUNTRIES,
  ...COUNTRY_OPTIONS.filter((c) => !DESIGNED_COUNTRIES.some((d) => d.value === c.value)),
]

/** Country list with the Figma copy for the US ("United States of America"). */
export const VENDOR_COUNTRY_OPTIONS: SelectOption[] = COUNTRY_OPTIONS.map((c) =>
  c.value === 'United States' ? { ...c, value: 'United States of America', label: 'United States of America' } : c,
)

const opts = (labels: string[]): SelectOption[] => labels.map((l) => ({ value: l, label: l }))

const US_STATES = opts([
  'Alabama', 'Arizona', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Illinois', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'New Jersey', 'New York', 'North Carolina', 'Ohio',
  'Oregon', 'Pennsylvania', 'Texas', 'Utah', 'Virginia', 'Washington',
])

const STATES_BY_COUNTRY: Record<string, SelectOption[]> = {
  'United States of America': US_STATES,
  'United States': US_STATES,
  'United Kingdom': opts(['England', 'Scotland', 'Wales', 'Northern Ireland']),
  Canada: opts(['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Nova Scotia', 'Ontario', 'Quebec', 'Saskatchewan']),
  Nigeria: opts(['Abuja (FCT)', 'Lagos', 'Ogun', 'Oyo', 'Rivers', 'Kano', 'Enugu', 'Anambra', 'Delta', 'Kaduna']),
  Kenya: opts(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Uasin Gishu']),
  Ghana: opts(['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern']),
  India: opts(['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Gujarat', 'West Bengal']),
  Germany: opts(['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Baden-Württemberg']),
  France: opts(['Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur", 'Occitanie', 'Nouvelle-Aquitaine']),
}
export const stateOptionsFor = (country?: string | null) => STATES_BY_COUNTRY[country ?? ''] ?? US_STATES

const CITIES_BY_STATE: Record<string, string[]> = {
  'New York': ['New York City', 'Brooklyn', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose', 'Oakland', 'Sacramento'],
  Texas: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'],
  Washington: ['Seattle', 'Bellevue', 'Redmond', 'Tacoma', 'Spokane'],
  Illinois: ['Chicago', 'Evanston', 'Naperville', 'Springfield'],
  Massachusetts: ['Boston', 'Cambridge', 'Worcester', 'Somerville'],
  Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  England: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol'],
  Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
  Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Waterloo'],
  'British Columbia': ['Vancouver', 'Victoria', 'Burnaby'],
  Lagos: ['Ikeja', 'Lekki', 'Victoria Island', 'Yaba', 'Surulere'],
  'Abuja (FCT)': ['Garki', 'Wuse', 'Maitama', 'Asokoro'],
  Nairobi: ['Westlands', 'Kilimani', 'Karen', 'Upper Hill'],
  'Greater Accra': ['Accra', 'Tema', 'East Legon', 'Osu'],
}
export const cityOptionsFor = (state?: string | null): SelectOption[] =>
  opts(CITIES_BY_STATE[state ?? ''] ?? ['New York City', 'San Francisco', 'Austin', 'Seattle', 'Chicago', 'Boston', 'London', 'Toronto', 'Lagos', 'Nairobi', 'Accra'])

/* ---------------------------------------------------------------------- */
/*  Badges / pills — HDS Badge (Figma 798:7)                              */
/* ---------------------------------------------------------------------- */

export function VendorTypeBadge({ type }: { type: VendorType }) {
  return <HdsBadge color={type === 'Business' ? 'navy' : 'grey'}>{type}</HdsBadge>
}

const STATUS_COLOR: Record<VendorStatus, BadgeColor> = {
  Active: 'green',
  Pending: 'amber',
  Archived: 'grey',
  Deactivated: 'red',
}

export function VendorStatusPill({ status }: { status: VendorStatus }) {
  return <HdsBadge color={STATUS_COLOR[status]}>{status}</HdsBadge>
}

/* ---------------------------------------------------------------------- */
/*  Page header                                                            */
/* ---------------------------------------------------------------------- */

export function VendorsPageHeader({
  subtitle,
  onAddVendor,
  onImport,
}: {
  subtitle: string
  onAddVendor?: () => void
  onImport?: () => void
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Vendors</h1>
        <p className="font-heading text-base text-[#70707d]">{subtitle}</p>
      </div>
      <div className="flex items-start gap-2">
        {onImport && (
          <Button variant="secondary" size="lg" onClick={onImport}>
            Import vendors
          </Button>
        )}
        <Button variant="primary" size="lg" icon={<img src={iconPlus} alt="" className="h-[11.67px] w-[11.67px]" />} onClick={onAddVendor}>
          Add vendor
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Search / filter / export bar                                           */
/* ---------------------------------------------------------------------- */

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All vendors' },
  { value: 'Active', label: 'Active', description: 'Can be paid' },
  { value: 'Pending', label: 'Pending', description: 'Awaiting approval' },
  { value: 'Archived', label: 'Archived', description: 'Hidden from new bills' },
  { value: 'Deactivated', label: 'Deactivated', description: 'Payments blocked' },
]

function downloadVendorsCsv(rows: VendorRow[], filename: string) {
  const header = ['Vendor', 'Vendor ID', 'Email', 'Category', 'Type', 'Payments', 'Date created', 'Status']
  const lines = [header, ...rows.map((r) => [r.name, r.vendorCode, r.email, r.category, r.type, String(r.payments), `${r.dateCreated} ${r.dateCreatedTime}`, r.status])]
  const csv = lines.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function VendorsSearchBar({
  query,
  onQueryChange,
  filterCount = 0,
  onFilterClick,
  exportRows,
  filteredRows,
  autoFocus,
}: {
  autoFocus?: boolean
  query: string
  onQueryChange: (q: string) => void
  filterCount?: number
  onFilterClick?: () => void
  exportRows?: VendorRow[]
  filteredRows?: VendorRow[]
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <HdsSearch value={query} onChange={onQueryChange} autoFocus={autoFocus} placeholder="Search by vendor name, ID or email" className="w-[320px]" />
        <HdsButton
          variant="secondary"
          size="sm"
          leadingIcon={<img src={iconFilter} alt="" className="h-[14.33px] w-[14.33px]" />}
          trailingIcon={filterCount ? <HdsBadge color="info" size="sm">{filterCount}</HdsBadge> : undefined}
          onClick={onFilterClick}
        >
          Filter
        </HdsButton>
      </div>
      <HdsActionMenu
        width={240}
        items={[
          { label: 'Export all vendors (CSV)', description: `${(exportRows ?? VENDOR_ROWS).length} vendors`, onSelect: () => downloadVendorsCsv(exportRows ?? VENDOR_ROWS, 'hinstantt-vendors.csv') },
          {
            label: 'Export current view (CSV)',
            description: 'Applies your search and filter',
            disabled: !filteredRows || filteredRows.length === 0,
            onSelect: () => downloadVendorsCsv(filteredRows ?? [], 'hinstantt-vendors-filtered.csv'),
          },
        ]}
        trigger={({ open, toggle }) => (
          <HdsButton variant="secondary" size="sm" aria-expanded={open} onClick={toggle} leadingIcon={<img src={iconExport} alt="" className="h-[11px] w-[11.67px]" />}>
            Export
          </HdsButton>
        )}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Table                                                                   */
/* ---------------------------------------------------------------------- */

export type VendorRowAction = 'view' | 'archive' | 'edit' | 'bill' | 'deactivate' | 'restore' | 'reactivate'

/** Figma 48069:406006 icons (view, folder-03, pen-01, invoice, delete-02, undo, undo-02), tinted to the item's text colour. */
const MENU_ICONS: Record<VendorRowAction, { src: string; inset: string }> = {
  view: { src: menuView, inset: '17.71% 5.21%' },
  archive: { src: menuArchive, inset: '7.29% 5.21%' },
  edit: { src: menuEdit, inset: '11.46% 11.46% 11.46% 11.47%' },
  bill: { src: menuBill, inset: '5.21%' },
  deactivate: { src: menuDeactivate, inset: '5.21% 8.33%' },
  restore: { src: menuRestore, inset: '8.33%' },
  reactivate: { src: menuReactivate, inset: '8.33%' },
}

/** Row menu per status — Figma 48069:405669 (Active / Pending / Archived / Deactivated cases). */
const ROW_ACTIONS: Record<VendorStatus, { action: VendorRowAction; label: string }[]> = {
  Active: [
    { action: 'view', label: 'View vendor' },
    { action: 'archive', label: 'Archive vendor' },
    { action: 'edit', label: 'Edit vendor' },
    { action: 'bill', label: 'Create bill' },
    { action: 'deactivate', label: 'Deactivate vendor' },
  ],
  Pending: [{ action: 'view', label: 'View vendor' }],
  Archived: [
    { action: 'view', label: 'View vendor' },
    { action: 'restore', label: 'Restore vendor' },
  ],
  Deactivated: [
    { action: 'view', label: 'View vendor' },
    { action: 'reactivate', label: 'Reactivate vendor' },
  ],
}

export function VendorsTable({
  rows,
  onAction,
  emptyMessage = 'No vendors match this filter',
}: {
  rows: VendorRow[]
  onAction?: (row: VendorRow, action: VendorRowAction) => void
  emptyMessage?: string
}) {
  const th = 'flex h-9 shrink-0 items-center bg-[#efefef] px-2.5 text-sm font-medium text-[#525866]'
  const td = 'flex h-[62px] shrink-0 flex-col justify-center gap-0.5 border-b border-[#efefef] px-2.5'
  const tdCenter = 'flex h-[62px] shrink-0 items-center border-b border-[#efefef] px-2.5'

  return (
    <div className="w-full">
      <div className="flex w-full min-w-[960px]">
        {/* Vendor column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={`${th} rounded-l-lg`}>Vendor</div>
          {rows.map((r) => (
            <button key={r.id} type="button" onClick={() => onAction?.(r, 'view')} className={`${td} text-left hover:bg-[#f5f6f8]`}>
              <p className="text-sm font-medium text-[#222121]">{r.name}</p>
              <p className="text-[11px] text-text-quaternary">{r.vendorCode}</p>
            </button>
          ))}
        </div>

        {/* Email column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={th}>Email</div>
          {rows.map((r) => (
            <div key={r.id} className={tdCenter}>
              <p className="truncate text-sm font-medium text-[#222121]">{r.email}</p>
            </div>
          ))}
        </div>

        {/* Category column */}
        <div className="flex w-[160px] shrink-0 flex-col">
          <div className={th}>Category</div>
          {rows.map((r) => (
            <div key={r.id} className={tdCenter}>
              <p className="text-sm font-medium text-[#222121]">{r.category}</p>
            </div>
          ))}
        </div>

        {/* Type column */}
        <div className="flex w-[116px] shrink-0 flex-col">
          <div className={th}>Type</div>
          {rows.map((r) => (
            <div key={r.id} className={tdCenter}>
              <VendorTypeBadge type={r.type} />
            </div>
          ))}
        </div>

        {/* Payments column */}
        <div className="flex w-[86px] shrink-0 flex-col">
          <div className={th}>Payments</div>
          {rows.map((r) => (
            <div key={r.id} className={tdCenter}>
              <p className="text-sm font-medium text-[#222121]">{r.payments}</p>
            </div>
          ))}
        </div>

        {/* Date created column */}
        <div className="flex w-[116px] shrink-0 flex-col">
          <div className={th}>Date created</div>
          {rows.map((r) => (
            <div key={r.id} className={td}>
              <p className="text-sm font-medium text-[#222121]">{r.dateCreated}</p>
              <p className="text-[11px] text-[#9aa1ac]">{r.dateCreatedTime}</p>
            </div>
          ))}
        </div>

        {/* Status column */}
        <div className="flex w-[116px] shrink-0 flex-col">
          <div className={th}>Status</div>
          {rows.map((r) => (
            <div key={r.id} className={tdCenter}>
              <VendorStatusPill status={r.status} />
            </div>
          ))}
        </div>

        {/* Row action column — HDS action menu */}
        <div className="flex w-[42px] shrink-0 flex-col">
          <div className={`${th} rounded-r-lg`} />
          {rows.map((r) => (
            <div key={r.id} className="flex h-[62px] items-center justify-center border-b border-[#efefef]">
              <HdsActionMenu
                theme="light"
                width={176}
                items={ROW_ACTIONS[r.status].map(
                  ({ action, label }): ActionItem => ({
                    label,
                    icon: <MenuGlyph {...MENU_ICONS[action]} />,
                    tone: action === 'deactivate' ? 'danger' : 'default',
                    onSelect: () => onAction?.(r, action),
                  }),
                )}
                trigger={({ open, toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-label={`Actions for ${r.name}`}
                    className={`flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[#edeff2] ${open ? 'bg-[#edeff2]' : ''}`}
                  >
                    <img src={iconKebabVector} alt="" className="h-[15px] w-[2.5px]" />
                  </button>
                )}
              />
            </div>
          ))}
        </div>
      </div>
      {rows.length === 0 && <p className="border-b border-[#efefef] px-2.5 py-6 text-center text-sm text-[#6b7280]">{emptyMessage}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Pagination                                                              */
/* ---------------------------------------------------------------------- */

export function VendorsPagination({ totalPages = 12, initialPage = 2 }: { totalPages?: number; initialPage?: number }) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState('20')
  const windowStart = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => windowStart + i)
  return (
    <div className="flex w-full items-center justify-between pt-2">
      <p className="px-2.5 py-1.5 text-sm text-[#9aa1ac]">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={iconPaginationArrow} alt="" className="size-5 rotate-180" />
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => setPage(n)}
              className={`flex size-8 items-center justify-center rounded-lg text-sm transition-colors ${ n === page ? 'bg-[#f5f6f8] font-semibold text-[#111927]' : 'border border-[#e1e4e9] text-[#4b5563] hover:bg-[#f5f6f8]' }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={iconPaginationArrow} alt="" className="size-5" />
        </button>
      </div>
      <MenuSelect
        options={PAGE_SIZE_OPTIONS}
        value={pageSize}
        onChange={setPageSize}
        align="right"
        placement="top"
        width={180}
        trigger={({ open, toggle, selected }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex h-9 items-center gap-1 rounded-lg border px-2.5 text-sm text-[#4b5563] transition-colors hover:bg-[#f5f6f8] ${open ? 'border-[#004b87]' : 'border-[#e1e4e9]'}`}
          >
            {selected?.label ?? 'Show 20 items'}
            <Chevron open={open} className={open ? 'size-5 text-[#004b87]' : 'size-5 text-[#6b7280]'} />
          </button>
        )}
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Summary stats — same card treatment as the Bills stat strip            */
/* ---------------------------------------------------------------------- */

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function VendorsStats({ rows }: { rows: VendorRow[] }) {
  const count = (s: VendorStatus) => rows.filter((r) => r.status === s).length
  const total = rows.length
  const active = count('Active')
  const pending = count('Pending')
  const business = rows.filter((r) => r.type === 'Business').length
  const payments = rows.reduce((sum, r) => sum + r.payments, 0)
  const paid = rows.filter((r) => r.payments > 0).length
  const cards = [
    { label: 'Total vendors', value: total, note: `${business} business · ${total - business} individual` },
    { label: 'Active vendors', value: active, note: `${total ? Math.round((active / total) * 100) : 0}% of vendors can be paid` },
    { label: 'Pending approval', value: pending, note: pending ? `${plural(pending, 'vendor')} awaiting approval` : 'Nothing awaiting approval' },
    { label: 'Payments made', value: payments, note: `Across ${plural(paid, 'vendor')}` },
  ]
  return (
    <div className="flex w-full gap-2.5">
      {cards.map((card) => (
        <div key={card.label} className="flex flex-1 flex-col justify-center gap-3 rounded-xl border-[0.5px] border-[#cbd0d8] p-4">
          <p className="text-sm font-medium text-[#111927]">{card.label}</p>
          <p className="font-heading text-[32px] font-semibold leading-[40px] tracking-[-0.64px] text-[#111927]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
            {card.value}
          </p>
          <p className="text-[13px] text-[#9aa1ac]">{card.note}</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Filter drawer — Figma 48069:406714 / 48069:407291                      */
/* ---------------------------------------------------------------------- */

export type VendorFilters = { status: string[]; category: string[]; type: string[]; from: string; to: string }
export const EMPTY_VENDOR_FILTERS: VendorFilters = { status: [], category: [], type: [], from: '', to: '' }

const FILTER_STATUS_OPTIONS = ['Active', 'Archived', 'Inactive', 'Pending']
const FILTER_CATEGORY_OPTIONS = [
  'Software', 'Professional services', 'Contractors', 'Marketing', 'Travel', 'Meals & entertainment', 'Equipment', 'Logistics', 'Office supplies',
  'Insurance', 'Legal', 'Accounting', 'Banking & fees', 'Training & development', 'Communications', 'Subscriptions', 'Repairs & maintenance',
  'Taxes & government fees',
]
const FILTER_TYPE_OPTIONS = ['Individual', 'Business']

/** "Inactive" in the filter is the Deactivated status in the table. */
const statusFilterValue = (s: VendorStatus) => (s === 'Deactivated' ? 'Inactive' : s)
const normCategory = (c: string) => c.toLowerCase().replace(/s$/, '')
const parseCreated = (d: string) => {
  const t = Date.parse(d)
  return Number.isNaN(t) ? null : new Date(t)
}

export const vendorFilterCount = (f: VendorFilters) => f.status.length + f.category.length + f.type.length + (f.from || f.to ? 1 : 0)

export function applyVendorFilters(rows: VendorRow[], f: VendorFilters) {
  const from = f.from ? parseDate(f.from) : null
  const to = f.to ? parseDate(f.to) : null
  return rows.filter((r) => {
    if (f.status.length && !f.status.includes(statusFilterValue(r.status))) return false
    if (f.category.length && !f.category.some((c) => normCategory(c) === normCategory(r.category))) return false
    if (f.type.length && !f.type.includes(r.type)) return false
    const created = parseCreated(r.dateCreated)
    if (created && from && created < from) return false
    if (created && to && created > to) return false
    return true
  })
}

export function VendorFilterDrawer({ open, initial, onClose, onApply }: { open: boolean; initial: VendorFilters; onClose: () => void; onApply: (f: VendorFilters) => void }) {
  const [f, setF] = useState(initial)
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const dateRef = useDismiss(!!picker, () => setPicker(null))
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setF(initial)
      setPicker(null)
    }
  }
  const toggle = (key: 'status' | 'category' | 'type') => (opt: string) =>
    setF((cur) => ({ ...cur, [key]: cur[key].includes(opt) ? cur[key].filter((o) => o !== opt) : [...cur[key], opt] }))
  const filled = vendorFilterCount(f) > 0
  const section = 'flex flex-col gap-2 border-b border-[#f6f6f6] pb-4'

  return (
    <Drawer open={open} onClose={onClose} width={465}>
      <div className="flex min-h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
            Filter
          </h2>
          <button type="button" onClick={onClose} aria-label="Close filter panel">
            <img src={iconCloseSquare} alt="" className="size-6" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <div className={section}>
            <p className="text-sm font-medium text-[#111927]">Status</p>
            <FilterCheckboxRow options={FILTER_STATUS_OPTIONS} checked={f.status} onToggle={toggle('status')} />
          </div>
          <div className={section}>
            <p className="text-sm font-medium text-[#111927]">Category</p>
            <FilterCheckboxRow options={FILTER_CATEGORY_OPTIONS} checked={f.category} onToggle={toggle('category')} />
          </div>
          <div className={section}>
            <p className="text-sm font-medium text-[#111927]">Type</p>
            <FilterCheckboxRow options={FILTER_TYPE_OPTIONS} checked={f.type} onToggle={toggle('type')} />
          </div>
          <div ref={dateRef} className="relative flex flex-col gap-2 border-b border-[#f6f6f6] pb-4">
            <p className="text-sm font-medium text-[#111927]">Date created</p>
            <div className="flex gap-2">
              <FilterDateField label="From" value={f.from} onChange={(v) => setF((c) => ({ ...c, from: v }))} active={picker === 'from'} onOpen={() => setPicker('from')} />
              <FilterDateField label="To" value={f.to} onChange={(v) => setF((c) => ({ ...c, to: v }))} active={picker === 'to'} onOpen={() => setPicker('to')} />
            </div>
            {picker && (
              <MiniDatePicker
                key={picker}
                value={picker === 'from' ? f.from : f.to}
                rangeFrom={f.from}
                rangeTo={f.to}
                onPick={(v) => {
                  if (picker === 'from') {
                    setF((c) => ({ ...c, from: v }))
                    setPicker('to')
                  } else {
                    setF((c) => ({ ...c, to: v }))
                    setPicker(null)
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-10">
          <HdsButton variant="primary" fullWidth disabled={!filled && vendorFilterCount(initial) === 0} onClick={() => onApply(f)}>
            Apply filter
          </HdsButton>
          <HdsButton
            variant="secondary"
            fullWidth
            disabled={!filled}
            onClick={() => {
              setF(EMPTY_VENDOR_FILTERS)
              setPicker(null)
            }}
          >
            Clear filter
          </HdsButton>
        </div>
      </div>
    </Drawer>
  )
}

/* ---------------------------------------------------------------------- */
/*  Directory block — stats + search + filter + table + pagination         */
/*  Row actions (Figma 48069:405669) change status in the vendor store.    */
/* ---------------------------------------------------------------------- */

export function VendorsDirectory({
  rows: rowsProp,
  searchDemoTo,
  onViewVendor,
  onEditVendor,
  onCreateBill,
}: {
  rows?: VendorRow[]
  /** Called when a search has no matches — routes to the designed empty-search screen. */
  searchDemoTo?: (query: string) => void
  onViewVendor?: (row: VendorRow) => void
  onEditVendor?: (row: VendorRow) => void
  onCreateBill?: (row: VendorRow) => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const store = useVendorStore()
  const rows = rowsProp ?? store.rows
  const stateQuery = (location.state as { query?: string } | null)?.query
  const [query, setQuery] = useState(() => stateQuery ?? '')
  const [filters, setFilters] = useState<VendorFilters>(EMPTY_VENDOR_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ kind: 'archive' | 'deactivate'; row: VendorRow } | null>(null)
  const filtered = useMemo(() => applyVendorFilters(matchVendors(rows, query), filters), [rows, query, filters])

  const onQueryChange = (q: string) => {
    setQuery(q)
    if (searchDemoTo && q.trim() && matchVendors(rows, q).length === 0) searchDemoTo(q)
  }

  const view = onViewVendor ?? ((r: VendorRow) => navigate(`/vendors/detail?id=${r.id}`))
  const onAction = (row: VendorRow, action: VendorRowAction) => {
    if (action === 'view') view(row)
    else if (action === 'edit') onEditVendor ? onEditVendor(row) : navigate(`/vendors/detail?id=${row.id}&edit=1`)
    else if (action === 'bill') onCreateBill ? onCreateBill(row) : navigate('/bills/add/manual-entry-empty')
    else if (action === 'archive' || action === 'deactivate') setConfirm({ kind: action, row })
    else if (action === 'restore') {
      setVendorStatus(row.id, 'Active')
      notifyVendor('Vendor restored', `${row.name} is available for new bills again.`)
    } else if (action === 'reactivate') {
      setVendorStatus(row.id, 'Active')
      notifyVendor('Vendor reactivated', `${row.name} can receive payments and bills again.`)
    }
  }

  const count = vendorFilterCount(filters)
  return (
    <div className="flex flex-col gap-5">
      <VendorsStats rows={rows} />
      <VendorsSearchBar
        autoFocus={!!stateQuery}
        query={query}
        onQueryChange={onQueryChange}
        filterCount={count}
        onFilterClick={() => setFilterOpen(true)}
        exportRows={rows}
        filteredRows={filtered}
      />
      <VendorsTable
        rows={filtered}
        onAction={onAction}
        emptyMessage={query.trim() ? `No vendors match "${query.trim()}"` : 'No vendors match these filters'}
      />
      <VendorsPagination />

      <VendorFilterDrawer
        open={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f)
          setFilterOpen(false)
        }}
      />
      {confirm?.kind === 'archive' && (
        <ArchiveConfirmModal
          onCancel={() => setConfirm(null)}
          onArchive={() => {
            setVendorStatus(confirm.row.id, 'Archived')
            notifyVendor('Vendor archived', `${confirm.row.name} won't be available for new bills.`)
            setConfirm(null)
          }}
        />
      )}
      {confirm?.kind === 'deactivate' && (
        <DeactivateVendorModal
          onCancel={() => setConfirm(null)}
          onDeactivate={() => {
            setVendorStatus(confirm.row.id, 'Deactivated')
            notifyVendor('Vendor deactivated', `${confirm.row.name} won't be available for new payments or bills.`)
            setConfirm(null)
          }}
        />
      )}
      {store.notice && <CardNotice title={store.notice.title} body={store.notice.body} onClose={clearVendorNotice} />}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Toast (error alert) — Figma node 45078:151812 / 45078:153475 / 45078:154044 */
/* ---------------------------------------------------------------------- */

export function VendorsToast({
  title,
  message,
  onClose,
  action,
}: {
  title: string
  message: string
  onClose?: () => void
  action?: ReactNode
}) {
  return (
    <div
      role="alert"
      className="absolute right-6 top-6 z-20 flex w-[352px] items-start gap-3 rounded-[10px] border-[0.5px] py-4 pl-4 pr-3.5 shadow-lg"
      style={{ backgroundColor: '#fde8ea', borderColor: '#b4232e' }}
    >
      <img src={iconAlertError} alt="" className="h-[16.13px] w-[16.13px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-[#b4232e]">{title}</p>
        <p className="text-xs text-[#4b5563]">{message}</p>
        {action && <div className="pt-1">{action}</div>}
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-65 hover:opacity-100">
        <img src={iconToastClose} alt="" className="h-[10.33px] w-[10.33px]" />
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Archive confirmation modal — Figma node 45681:264577                   */
/* ---------------------------------------------------------------------- */

export function ArchiveConfirmModal({ onCancel, onArchive }: { onCancel?: () => void; onArchive?: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Archive this vendor?"
        className="flex w-[483px] flex-col overflow-hidden rounded-[31px]"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(253,116,52) 18.5%, rgb(255,255,255) 78%)',
        }}
      >
        <div className="relative h-[220px] w-full shrink-0">
          <button type="button" onClick={onCancel} aria-label="Close" className="absolute right-6 top-6 size-8">
            <img src={iconModalClose} alt="" className="size-8" />
          </button>
          <div className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
            <img src={iconModalWarning} alt="" className="h-[26px] w-[28.67px]" />
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-[32px] font-semibold leading-[40px] tracking-[-0.64px] text-text-primary">Archive this vendor?</p>
            <p className="text-base leading-6 text-[#4b5563]">This vendor won&apos;t be available for new bills, but its full history is kept.</p>
          </div>
          <div className="flex w-full gap-2">
            <HdsButton variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
              Cancel
            </HdsButton>
            <HdsButton variant="primary" size="lg" className="flex-1" onClick={onArchive}>
              Archive
            </HdsButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Deactivate vendor modal — Figma 48069:406050                           */
/* ---------------------------------------------------------------------- */

export function DeactivateVendorModal({ onCancel, onDeactivate }: { onCancel?: () => void; onDeactivate?: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Deactivate vendor"
        className="flex w-[483px] flex-col overflow-hidden rounded-[31px]"
        style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(190,30,45) 30%, rgb(255,255,255) 100%)' }}
      >
        <div className="relative h-[330px] w-full shrink-0">
          <button type="button" onClick={onCancel} aria-label="Close" className="absolute right-6 top-6 size-8">
            <img src={iconModalClose} alt="" className="size-8" />
          </button>
          <div className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
            <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true">
              <circle cx="14" cy="14" r="13" fill="#111927" />
              <path d="M10 10l8 8M18 10l-8 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-[32px] font-semibold leading-[40px] tracking-[-0.64px] text-text-primary">Deactivate vendor</p>
            <p className="text-base leading-6 text-[#4b5563]">
              This vendor won&apos;t be available for new payments or bills. Their details and history remain, and you can reactivate them anytime.
            </p>
          </div>
          <HdsButton variant="primary" size="lg" fullWidth onClick={onDeactivate}>
            Deactivate vendor
          </HdsButton>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Drawer shell — right-side panel used by Add vendor / Import vendors    */
/* ---------------------------------------------------------------------- */

export function DrawerOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-20 bg-black/30">
      <div className="absolute bottom-10 right-10 top-10 w-[513px] max-w-[calc(100%-80px)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">{children}</div>
    </div>
  )
}

export function DrawerHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <HdsButton
        variant="primary-link"
        size="sm"
        onClick={onBack}
        className="w-fit gap-1 !text-xs font-medium !text-[#555354]"
        leadingIcon={<img src={iconBackArrow} alt="" className="h-3 w-3" />}
      >
        Back
      </HdsButton>
      <div className="flex flex-col gap-2">
        <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">{title}</p>
        {subtitle && <p className="text-sm text-[#555354]">{subtitle}</p>}
      </div>
    </div>
  )
}

export function DrawerSubmitButton({ label, enabled, onClick }: { label: string; enabled?: boolean; onClick?: () => void }) {
  return (
    <HdsButton variant="primary" size="md" fullWidth disabled={!enabled} onClick={onClick}>
      {label}
    </HdsButton>
  )
}

/** Individual / Business — HDS Toggle Segment (Figma 798:5), full drawer width. */
export function ToggleSegment({ active, onChange }: { active: VendorType; onChange?: (v: VendorType) => void }) {
  const [local, setLocal] = useState<VendorType>(active)
  const value = onChange ? active : local
  return (
    <HdsToggleSegment<VendorType>
      className="flex w-full [&>button]:flex-1"
      options={[
        { value: 'Individual', label: 'Individual' },
        { value: 'Business', label: 'Business' },
      ]}
      value={value}
      onChange={(v) => (onChange ? onChange(v) : setLocal(v))}
    />
  )
}

/* ---------------------------------------------------------------------- */
/*  Form fields — HDS input / select                                        */
/* ---------------------------------------------------------------------- */

export function FieldInput({
  label,
  value,
  half,
  placeholder,
  onChange,
  helper,
  error,
  optional,
  type,
}: {
  label: string
  value: string
  half?: boolean
  placeholder?: string
  onChange?: (v: string) => void
  helper?: ReactNode
  error?: ReactNode
  optional?: boolean
  type?: string
}) {
  return (
    <HdsInput
      label={label}
      value={value}
      type={type}
      placeholder={placeholder}
      readOnly={!onChange}
      onChange={(e) => onChange?.(e.target.value)}
      helper={helper}
      error={error}
      optional={optional}
      containerClassName={half ? 'min-w-0 flex-1' : 'w-full'}
    />
  )
}

/** HDS Select (Figma 1588:5747). Controlled when `onChange` is passed, otherwise keeps its own value. */
export function FieldSelect({
  label,
  value,
  helper,
  placeholder = 'Select…',
  half,
  options,
  onChange,
  searchPlaceholder,
  defaultOpen,
  menuMode,
}: {
  label: string
  value?: string | null
  helper?: string
  placeholder?: string
  half?: boolean
  options: SelectOption[]
  onChange?: (v: string) => void
  searchPlaceholder?: string
  defaultOpen?: boolean
  menuMode?: 'overlay' | 'inline'
}) {
  const [local, setLocal] = useState<string | null>(value ?? null)
  const current = onChange ? (value ?? null) : local
  return (
    <KitSelect
      label={label}
      value={current}
      options={options}
      placeholder={placeholder}
      helper={helper}
      searchPlaceholder={searchPlaceholder}
      defaultOpen={defaultOpen}
      menuMode={menuMode}
      className={half ? 'min-w-0 flex-1' : 'w-full'}
      onChange={(v) => (onChange ? onChange(v) : setLocal(v))}
    />
  )
}

export function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5">
      <p className="text-base font-semibold text-text-primary">{label}</p>
      <img src={iconSectionChevron} alt="" className="size-4 rotate-180" />
    </div>
  )
}

/** "This vendor has a tax ID" — HDS Switch (Figma Toggle 1079:7). */
export function TaxIdToggle({ on, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) {
  const [local, setLocal] = useState(!!on)
  const checked = onChange ? !!on : local
  return <HdsSwitch label="This vendor has a tax ID" checked={checked} onChange={(v) => (onChange ? onChange(v) : setLocal(v))} />
}

/** Phone — HDS input row with the dial-code menu (KitPhoneInput). */
export function PhoneField({
  iso,
  onIsoChange,
  number,
  onChange,
}: {
  iso?: string
  onIsoChange?: (iso: string) => void
  number: string
  onChange?: (v: string) => void
}) {
  return <KitPhoneInput label="Phone" iso={iso} onIsoChange={onIsoChange} number={number} onChange={onChange} />
}

/* ---------------------------------------------------------------------- */
/*  Import vendors — parsed CSV row                                        */
/* ---------------------------------------------------------------------- */

export function UploadedFileRow({ onRemove }: { onRemove?: () => void }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#edeff2]">
        <img src={iconFileDoc} alt="" className="h-[14.33px] w-[11.67px]" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium text-[#212121]">vendor_list.csv</p>
        <p className="text-[11px] text-[#6b7280]">1.2 MB · Uploaded</p>
      </div>
      <button type="button" aria-label="Remove file" onClick={onRemove} className="flex size-7 items-center justify-center rounded-pill transition-colors hover:bg-[#edeff2]">
        <img src={iconRemoveUpload} alt="" className="size-[7.75px]" />
      </button>
    </div>
  )
}

function RowIconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[#edeff2]">
      {children}
    </button>
  )
}

export function ImportRowCollapsed({ name, type, onDelete }: { name: string; type: VendorType; onDelete?: () => void }) {
  const [open, setOpen] = useState(false)
  const [vendorType, setVendorType] = useState<string>(type)
  const [businessName, setBusinessName] = useState(name)
  const [category, setCategory] = useState<string>('Professional Services')
  return (
    <div className="flex w-full flex-col rounded-xl border border-[#cbd0d8] bg-white">
      <div className="flex w-full items-center justify-between p-4">
        <p className="text-sm font-medium text-[#222121]">{name}</p>
        <div className="flex items-center gap-2">
          <VendorTypeBadge type={type} />
          <RowIconButton label={`Remove ${name}`} onClick={onDelete}>
            <img src={iconTrash} alt="" className="h-[17.92px] w-[16.25px]" />
          </RowIconButton>
          <RowIconButton label={open ? 'Collapse row' : 'Expand row'} onClick={() => setOpen((o) => !o)}>
            {open ? <img src={iconCaretExpanded} alt="" className="size-4" /> : <img src={iconCaretCollapsed} alt="" className="size-4 rotate-180" />}
          </RowIconButton>
        </div>
      </div>
      {open && (
        <div className="flex w-full flex-col gap-4 border-t border-[#cbd0d8] px-4 pb-3 pt-4">
          <SectionHeading label="Vendor details" />
          <FieldSelect label="Vendor type" value={vendorType} options={VENDOR_TYPE_OPTIONS} onChange={setVendorType} />
          <FieldInput label={vendorType === 'Business' ? 'Business name' : 'Full name'} value={businessName} onChange={setBusinessName} />
          <FieldSelect label="Category" value={category} options={VENDOR_CATEGORY_OPTIONS} onChange={setCategory} helper="Pre-fills on every bill." />
        </div>
      )}
    </div>
  )
}

export function ImportRowNeedsAttention({
  name,
  firstName,
  onFirstNameChange,
  onDelete,
}: {
  name: string
  firstName: string
  onFirstNameChange: (v: string) => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(true)
  const [vendorType, setVendorType] = useState('Individual')
  const [lastName, setLastName] = useState('Freeman')
  const [category, setCategory] = useState('Software')
  const missing = firstName.trim() === ''
  return (
    <div className="flex w-full flex-col gap-2">
      <div className={`flex w-full flex-col gap-2 rounded-xl border bg-white pt-4 ${missing ? 'border-[#b4232e]' : 'border-[#cbd0d8]'} ${open ? '' : 'pb-2'}`}>
        <div className="flex w-full items-center justify-between px-4">
          <p className="text-sm font-medium text-[#222121]">{name}</p>
          <div className="flex items-center gap-2">
            <VendorTypeBadge type={vendorType as VendorType} />
            <RowIconButton label={`Remove ${name}`} onClick={onDelete}>
              <img src={iconTrash} alt="" className="h-[17.92px] w-[16.25px]" />
            </RowIconButton>
            <RowIconButton label={open ? 'Collapse row' : 'Expand row'} onClick={() => setOpen((o) => !o)}>
              {open ? <img src={iconCaretExpanded} alt="" className="size-4" /> : <img src={iconCaretCollapsed} alt="" className="size-4 rotate-180" />}
            </RowIconButton>
          </div>
        </div>
        {open && (
          <div className="flex w-full flex-col gap-4 border-t border-[#cbd0d8] px-4 pb-3 pt-4">
            <SectionHeading label="Vendor details" />
            <FieldSelect label="Vendor type" value={vendorType} options={VENDOR_TYPE_OPTIONS} onChange={setVendorType} />
            <div className="flex w-full items-start gap-4">
              <FieldInput label="First name" value={firstName} placeholder="Enter first name" onChange={onFirstNameChange} error={missing ? 'Provide first name' : undefined} half />
              <FieldInput label="Last name" value={lastName} placeholder="Enter last name" onChange={setLastName} half />
            </div>
            <FieldSelect label="Category" value={category} options={VENDOR_CATEGORY_OPTIONS} onChange={setCategory} helper="Pre-fills on every bill." />
            <SectionHeading label="Payment details" />
            <SectionHeading label="Contact details" />
          </div>
        )}
      </div>
      {missing && <p className="text-sm text-[#b4232e]">Row needs your attention</p>}
    </div>
  )
}
