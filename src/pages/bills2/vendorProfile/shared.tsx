import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Chevron, HdsActionMenu, HdsBadge, HdsButton, HdsCheckbox, HdsInput, HdsSearch, inputRowClass } from '../../../components/ui/hds'
import { KitCombobox, KitPhoneInput, MenuSelect, PAGE_SIZE_OPTIONS, type SelectOption } from '../hdsKit'
import { BillsSelectionBar, StatusPill, type BillRow } from '../list/shared'
import { billActionItems } from '../list/billActions'
import { startReview, useAllBills } from '../list/billRecords'
import { billEntryPath, reviewSelectionPath } from '../list/billRoutes'
import { useBillRole } from '../list/billRole'
import { VendorInfoSheetHost } from '../list/VendorInfoSheet'
import chevronLeft from '../../../assets/icons/vendorprof-chevron-left.svg'
import editPencil from '../../../assets/icons/vendorprof-edit-pencil.svg'
import filterIcon from '../../../assets/icons/vendorprof-filter.svg'
import plusIcon from '../../../assets/icons/vendorprof-plus.svg'
import dotIcon from '../../../assets/icons/vendorprof-dot.svg'
import kebabIcon from '../../../assets/icons/vendorprof-kebab.svg'
import chevronRightPagination from '../../../assets/icons/vendorprof-chevron-right-pagination.svg'
import editTrailing from '../../../assets/icons/vendorprof-edit-trailing.svg'
import flagUs from '../../../assets/icons/vendorprof-flag-us.svg'
import trashIcon from '../../../assets/icons/vendorprof-trash.svg'
import cancelSquare from '../../../assets/icons/vendorprof-cancel-square.svg'
import awsLogo from '../../../assets/img/vendorprof-aws-logo.png'
import contactAddedIllustration from '../../../assets/img/vendorprof-contact-added-illustration.svg'
import invoiceThumbnail from '../../../assets/img/vendorprof-invoice-thumbnail.png'

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

export type AwsBillRowStatus = 'Overdue' | 'Needs action' | 'Pending approval' | 'Payment failed' | 'Payment pending'

export type AwsBill = {
  name: string
  invoice: string
  category: string
  frequency: string
  createdBy: string
  amount: string
  dueDate: string
  dueNote: string
  dueNoteTone: 'amber' | 'gray' | 'red' | 'dark'
  status: AwsBillRowStatus
  highlightDot?: boolean
}

export const AWS_BILLS: AwsBill[] = [
  { name: 'Software', invoice: 'invoice NW-2481', category: 'Cloud services', frequency: 'Monthly', createdBy: 'Fiona Ames', amount: '$9,200.00', dueDate: '14 Aug 2026', dueNote: 'Due tomorrow', dueNoteTone: 'amber', status: 'Overdue' },
  { name: 'Contractors', invoice: 'invoice ML-4419', category: 'Storage & backup', frequency: 'Weekly', createdBy: 'Luke Frank', amount: '$4,800.00', dueDate: '29 Aug 2026', dueNote: 'Due in 2 days', dueNoteTone: 'gray', status: 'Needs action' },
  { name: 'Marketing', invoice: 'invoice AP-2201', category: 'Compute', frequency: 'Quarterly', createdBy: 'Caleb Joel', amount: '$10,488.00', dueDate: '4 Jul 2026', dueNote: 'Due in 14 days', dueNoteTone: 'gray', status: 'Pending approval' },
  { name: 'Travel', invoice: 'invoice UB-5521', category: 'Support & maintenance', frequency: 'Daily', createdBy: 'Betsy Flinch', amount: '$340.00', dueDate: '5 Aug 2026', dueNote: 'Due in 33 days', dueNoteTone: 'gray', status: 'Needs action', highlightDot: true },
  { name: 'Rent & facilities', invoice: 'invoice ND-1187', category: 'Data transfer', frequency: 'Annually', createdBy: 'Zach Hardy', amount: '$5,130.00', dueDate: '5 Aug 2026', dueNote: '2 days overdue', dueNoteTone: 'red', status: 'Payment failed' },
  { name: 'Utilities', invoice: 'invoice DL-9012', category: 'Security', frequency: 'Quarterly', createdBy: 'William Kaye', amount: '$186.00', dueDate: '1 Jul 2026', dueNote: 'Today', dueNoteTone: 'dark', status: 'Payment pending' },
  { name: 'Equipment', invoice: 'invoice FG-3390', category: 'Professional services', frequency: 'Weekly', createdBy: 'Jonathan Lin', amount: '$5,000.00', dueDate: '12 Jun 2026', dueNote: 'Due tomorrow', dueNoteTone: 'amber', status: 'Overdue' },
]

const DUE_NOTE_CLASSES: Record<AwsBill['dueNoteTone'], string> = {
  amber: 'text-[#b45309]',
  gray: 'text-text-quaternary',
  red: 'text-[#b72020]',
  dark: 'text-text-primary',
}

export function AwsBillStatusBadge({ status }: { status: AwsBillRowStatus }) {
  if (status === 'Overdue' || status === 'Pending approval') return <Badge status="pending" label={status} />
  if (status === 'Needs action' || status === 'Payment pending') return <Badge status="info-needed" label={status} />
  return <Badge status="payment-failed" label={status} />
}

export type AwsPaymentAccount = {
  account: string
  accountName: string
  currency: string
  country: string
  addedBy: string
  dateAdded: string
  lastUpdate: string
}

export const AWS_PAYMENT_ACCOUNTS: AwsPaymentAccount[] = [
  { account: 'JPMorgan Chase Bank •••• 1234', accountName: 'Amazon Web Services, Inc.', currency: 'USD', country: 'United States', addedBy: 'Fiona Ames', dateAdded: '14 Aug 2026, 12:21pm', lastUpdate: '14 Aug 2026, 12:21pm' },
  { account: 'Bank of America •••• 5678', accountName: 'Amazon Web Services, Inc.', currency: 'USD', country: 'United States', addedBy: 'Luke Frank', dateAdded: '29 Aug 2026, 12:21pm', lastUpdate: '29 Aug 2026, 12:21pm' },
  { account: 'Visa •••• 4242', accountName: 'Amazon Web Services, Inc.', currency: 'USD', country: 'United States', addedBy: 'Caleb Joel', dateAdded: '4 Jul 2026, 12:21pm', lastUpdate: '4 Jul 2026, 12:21pm' },
]

export type AwsNote = {
  author: string
  date: string
  text: string
  deletable?: boolean
}

export const AWS_NOTES: AwsNote[] = [
  { author: 'Harriet Underwood', date: 'Aug 15, 2026, 10:24 AM', text: 'Confirmed updated banking details with vendor. Effective immediately.', deletable: true },
  { author: 'Tessa Olsen', date: 'Aug 1, 2026, 4:12 PM', text: 'Vendor requested to be paid via ACH for all future invoices.' },
  { author: 'Daniel Adams', date: 'Jul 12, 2026, 11:06 AM', text: 'Reviewed and validated W-8BEN form. Document is on file.' },
  { author: 'Harriet Underwood', date: 'Jun 28, 2026, 9:41 AM', text: 'Discussed annual contract renewal. Pricing remains the same.', deletable: true },
  { author: 'Tessa Olsen', date: 'Jan 10, 2026, 2:18 PM', text: 'Initial vendor setup completed.' },
]

// ---------------------------------------------------------------------------
// AWS vendor profile — shared header + tabs + shell
// ---------------------------------------------------------------------------

export type AwsTabKey = 'bills' | 'payment' | 'contact' | 'notes'

const AWS_TAB_ROUTES: Record<AwsTabKey, string> = {
  bills: '/bills/vendor/amazon-web-services-bills-tab',
  payment: '/bills/vendor/amazon-web-services-payment-details-tab',
  contact: '/bills/vendor/amazon-web-services-contact-information-tab',
  notes: '/bills/vendor/amazon-web-services-notes-tab',
}

function AwsTab({ active, label, count, to }: { active: boolean; label: string; count?: number; to: string }) {
  return (
    <Link to={to} role="tab" aria-selected={active} className="group flex flex-col items-center gap-3 pb-0">
      <span className="flex items-center gap-2">
        <span className={`text-base transition-colors ${active ? 'font-semibold text-[#111927]' : 'font-medium text-[#6b7280] group-hover:text-[#111927]'}`}>{label}</span>
        {count !== undefined && (
          <HdsBadge color={active ? 'dark' : 'grey'} className="min-w-[24px] justify-center !text-[13px]">
            {count}
          </HdsBadge>
        )}
      </span>
      <span className={`h-[3px] w-full rounded transition-colors ${active ? 'bg-[#111927]' : 'bg-transparent group-hover:bg-[#e1e4e9]'}`} />
    </Link>
  )
}

export function AwsVendorProfileShell({ active, children }: { active: AwsTabKey; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-[1071px] max-w-full flex-col gap-6 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link to="/bills" className="flex items-center gap-2">
            <img src={chevronLeft} alt="" className="h-[9px] w-[5px]" />
            <span className="text-sm font-semibold text-text-primary">Vendors</span>
          </Link>
          <HdsButton variant="secondary" size="sm" leadingIcon={<img src={editPencil} alt="" className="h-[12.7px] w-[12.7px]" />}>
            Edit vendor
          </HdsButton>
        </div>

        <div className="flex items-center gap-6">
          <div className="size-[72px] shrink-0 overflow-hidden rounded-xl bg-black">
            <img src={awsLogo} alt="Amazon Web Services" className="size-full object-cover" />
          </div>
          <div className="flex flex-1 items-start gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-[28px] font-semibold tracking-[-0.42px] text-text-primary">Amazon Web Services</h1>
                <Badge status="approved" label="Active" />
              </div>
              <p className="text-[13px] text-[#6b7280]">Cloud infrastructure and services</p>
            </div>
            <div className="flex items-start gap-2 whitespace-nowrap text-[13px]">
              <div className="flex flex-col gap-2 border-r border-[#d2d6db] pr-2">
                <p className="font-medium text-[#384250]">Business</p>
                <p className="text-[#6b7280]">Technology</p>
              </div>
              <div className="flex flex-col gap-2 border-r border-[#d2d6db] pr-2">
                <p className="font-medium text-[#384250]">Added</p>
                <p className="text-[#6b7280]">Jan 10, 2026</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium text-[#384250]">Updated</p>
                <p className="text-[#6b7280]">Aug 15, 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div role="tablist" className="flex items-end gap-8 border-b border-[#edeff2]">
          <AwsTab active={active === 'bills'} label="Bills" count={AWS_BILLS.length} to={AWS_TAB_ROUTES.bills} />
          <AwsTab active={active === 'payment'} label="Payment details" to={AWS_TAB_ROUTES.payment} />
          <AwsTab active={active === 'contact'} label="Contact information" to={AWS_TAB_ROUTES.contact} />
          <AwsTab active={active === 'notes'} label="Notes" to={AWS_TAB_ROUTES.notes} />
        </div>
      </div>

      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bills tab content
// ---------------------------------------------------------------------------

const BILL_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Needs action', label: 'Needs action' },
  { value: 'Pending approval', label: 'Pending approval' },
  { value: 'Payment pending', label: 'Payment pending' },
  { value: 'Payment failed', label: 'Payment failed' },
]

function KebabTrigger({ open, toggle, label }: { open: boolean; toggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={label}
      className={`mx-auto flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[#edeff2] ${open ? 'bg-[#edeff2]' : ''}`}
    >
      <img src={kebabIcon} alt="" className="h-[15px] w-[2.5px]" />
    </button>
  )
}

function TablePagination() {
  const [page, setPage] = useState(2)
  const [pageSize, setPageSize] = useState('20')
  const total = 12
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-text-quaternary">
        Page {page} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={chevronRightPagination} alt="" className="size-5 rotate-180" />
        </button>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? 'page' : undefined}
            onClick={() => setPage(n)}
            className={`flex size-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-[#f5f6f8] ${n === page ? 'bg-[#f5f6f8] font-semibold text-text-primary' : 'text-text-quaternary'}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page === total}
          onClick={() => setPage((p) => Math.min(total, p + 1))}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={chevronRightPagination} alt="" className="size-5" />
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
            className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-sm text-text-primary transition-colors hover:bg-[#f5f6f8] ${open ? 'border-[#004b87]' : 'border-[#e1e4e9]'}`}
          >
            {selected?.label ?? 'Show 20 items'}
            <Chevron open={open} className={open ? 'size-5 text-[#004b87]' : 'size-5 text-[#6b7280]'} />
          </button>
        )}
      />
    </div>
  )
}

export function AwsBillsTabContent() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  // Each vendor bill is the same bill as on the Bills list (matched by invoice), so its status, ⋯ actions and the
  // multi-select "n Selected | Review" bar behave exactly as they do there.
  const allBills = useAllBills()
  const role = useBillRole()
  const live = useMemo(() => new Map<string, BillRow>(allBills.map((b) => [b.invoice, b])), [allBills])
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AWS_BILLS.filter((b) => live.has(b.invoice)).map((b) => ({ ...b, status: live.get(b.invoice)!.status as AwsBillRowStatus })).filter(
      (b) => (status === 'all' || b.status === status) && (!q || `${b.name} ${b.invoice} ${b.category} ${b.createdBy} ${b.amount}`.toLowerCase().includes(q)),
    )
  }, [query, status, live])
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.invoice))
  const someSelected = rows.some((r) => selected.includes(r.invoice))
  const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const statusLabel = status !== 'all' ? status : undefined
  const selectedIds = rows.filter((r) => selected.includes(r.invoice)).map((r) => live.get(r.invoice)!.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-3">
          <HdsSearch value={query} onChange={setQuery} placeholder="Search bills" className="w-[320px]" />
          <MenuSelect
            options={BILL_STATUS_FILTER_OPTIONS}
            value={status}
            onChange={setStatus}
            width={220}
            trigger={({ open, toggle }) => (
              <HdsButton
                variant="secondary"
                size="sm"
                aria-expanded={open}
                onClick={toggle}
                leadingIcon={<img src={filterIcon} alt="" className="size-4" />}
                trailingIcon={statusLabel ? <HdsBadge color="info" size="sm">{statusLabel}</HdsBadge> : undefined}
              >
                Filter
              </HdsButton>
            )}
          />
        </div>
        <HdsButton variant="primary" leadingIcon={<img src={plusIcon} alt="" className="size-4 brightness-0 invert" />} onClick={() => navigate('/bills/add/manual-entry-empty')}>
          Add bill
        </HdsButton>
      </div>

      <div className="w-full rounded-lg border border-[#efefef]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#efefef] text-[#525866]">
              {role === 'approver' && (
                <th className="w-10 rounded-tl-lg py-2 pl-4">
                  <HdsCheckbox
                    size="md"
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.invoice))}
                  />
                </th>
              )}
              <th className={`py-2 pr-2.5 text-left font-medium ${role === 'approver' ? 'pl-2.5' : 'rounded-tl-lg pl-4'}`}>Bill</th>
              <th className="px-2.5 py-2 text-left font-medium">Category</th>
              <th className="px-2.5 py-2 text-left font-medium">Frequency</th>
              <th className="px-2.5 py-2 text-left font-medium">Created by</th>
              <th className="px-2.5 py-2 text-left font-medium">Amount</th>
              <th className="px-2.5 py-2 text-left font-medium">Due date</th>
              <th className="px-2.5 py-2 text-left font-medium">Status</th>
              <th className="w-10 rounded-tr-lg py-2 pr-2"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bill) => (
              <tr
                key={bill.invoice}
                onClick={() => navigate(billEntryPath(live.get(bill.invoice)!, role))}
                className="cursor-pointer border-b border-[#efefef] transition-colors last:border-b-0 hover:bg-[#f8f9fa]"
              >
                {role === 'approver' && (
                  <td className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <HdsCheckbox size="md" checked={selected.includes(bill.invoice)} onChange={() => toggleRow(bill.invoice)} />
                  </td>
                )}
                <td className={`py-3.5 pr-2.5 ${role === 'approver' ? 'pl-2.5' : 'pl-4'}`}>
                  <div className="flex items-center gap-2">
                    {bill.highlightDot && <img src={dotIcon} alt="" className="size-[7px]" />}
                    <span className="font-medium text-[#222121]">{bill.name}</span>
                  </div>
                  <span className="text-xs text-[#9aa1ac]">{bill.invoice}</span>
                </td>
                <td className="px-2.5 py-3.5 text-[#222121]">{bill.category}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{bill.frequency}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{bill.createdBy}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{bill.amount}</td>
                <td className="px-2.5 py-3.5">
                  <div className="flex flex-col">
                    <span className="text-[#222121]">{bill.dueDate}</span>
                    <span className={`text-xs ${DUE_NOTE_CLASSES[bill.dueNoteTone]}`}>{bill.dueNote}</span>
                  </div>
                </td>
                <td className="px-2.5 py-3.5">
                  <StatusPill label={bill.status} />
                </td>
                <td className="pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                  <HdsActionMenu
                    theme="light"
                    width={168}
                    items={billActionItems(live.get(bill.invoice)!, navigate)}
                    trigger={({ open, toggle }) => <KebabTrigger open={open} toggle={toggle} label={`Actions for ${bill.invoice}`} />}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-2.5 py-8 text-center">
                  <p className="text-sm font-medium text-text-primary">No bills found</p>
                  <p className="text-xs text-[#6b7280]">Try a different search term or filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination />
      <VendorInfoSheetHost />
      {role === 'approver' && (
        <BillsSelectionBar
          count={selectedIds.length}
          onClear={() => setSelected([])}
          onReview={() => {
            startReview(selectedIds)
            navigate(reviewSelectionPath(selectedIds))
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Payment details tab content
// ---------------------------------------------------------------------------

export function AwsPaymentDetailsTabContent() {
  const [query, setQuery] = useState('')
  const [accounts, setAccounts] = useState(AWS_PAYMENT_ACCOUNTS)
  const [defaultAccount, setDefaultAccount] = useState(AWS_PAYMENT_ACCOUNTS[0].account)
  const q = query.trim().toLowerCase()
  const rows = q ? accounts.filter((r) => `${r.account} ${r.accountName} ${r.currency} ${r.country} ${r.addedBy}`.toLowerCase().includes(q)) : accounts

  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-12 items-center justify-between">
        <HdsSearch value={query} onChange={setQuery} placeholder="Search payment methods" className="w-[336px]" />
        <HdsButton variant="primary" leadingIcon={<img src={plusIcon} alt="" className="size-4 brightness-0 invert" />}>
          Add payment method
        </HdsButton>
      </div>

      <div className="w-full rounded-lg border border-[#efefef]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#efefef] text-[#525866]">
              <th className="rounded-tl-lg px-2.5 py-2 text-left font-medium">Account</th>
              <th className="px-2.5 py-2 text-left font-medium">Account name</th>
              <th className="px-2.5 py-2 text-left font-medium">Currency</th>
              <th className="px-2.5 py-2 text-left font-medium">Country</th>
              <th className="px-2.5 py-2 text-left font-medium">Added by</th>
              <th className="px-2.5 py-2 text-left font-medium">Date added</th>
              <th className="px-2.5 py-2 text-left font-medium">Last update</th>
              <th className="w-10 rounded-tr-lg py-2 pr-2"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.account} className="border-b border-[#efefef] last:border-b-0">
                <td className="px-2.5 py-3.5 font-medium text-[#222121]">
                  <span className="flex items-center gap-2">
                    {row.account}
                    {row.account === defaultAccount && (
                      <HdsBadge color="navy" size="sm">
                        Default
                      </HdsBadge>
                    )}
                  </span>
                </td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.accountName}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.currency}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.country}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.addedBy}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.dateAdded}</td>
                <td className="px-2.5 py-3.5 text-[#222121]">{row.lastUpdate}</td>
                <td className="pr-2 text-center">
                  <HdsActionMenu
                    width={220}
                    items={[
                      { label: 'Set as default', disabled: row.account === defaultAccount, onSelect: () => setDefaultAccount(row.account) },
                      { label: 'Edit details', onSelect: () => {} },
                      {
                        label: 'Remove payment method',
                        tone: 'danger',
                        disabled: row.account === defaultAccount,
                        description: row.account === defaultAccount ? 'Set another default first' : undefined,
                        onSelect: () => setAccounts((a) => a.filter((x) => x.account !== row.account)),
                      },
                    ]}
                    trigger={({ open, toggle }) => <KebabTrigger open={open} toggle={toggle} label={`Actions for ${row.account}`} />}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-2.5 py-8 text-center">
                  <p className="text-sm font-medium text-text-primary">No payment methods found</p>
                  <p className="text-xs text-[#6b7280]">Try a different search term.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contact information tab content (also used, with the address section shown,
// as the dimmed backdrop behind the add/confirm contact panels)
// ---------------------------------------------------------------------------

function ContactField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {children}
    </div>
  )
}

// Read-only HDS input row on the grey contact card (white fill so it reads against bg-secondary).
const readOnlyRow = `${inputRowClass()} h-11 !bg-white hover:!bg-white`

function ReadOnlyValue({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className={readOnlyRow}>
      <span className="min-w-0 flex-1 truncate text-sm text-[#111927]">{children}</span>
      {trailing}
    </div>
  )
}

function ContactCard({ title }: { title: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <HdsButton
          variant="secondary"
          size="sm"
          onClick={() => navigate('/bills/vendor/add-new-contact-details-filled')}
          trailingIcon={<img src={editTrailing} alt="" className="h-[14.3px] w-[14.3px]" />}
        >
          Edit
        </HdsButton>
      </div>
      <div className="flex gap-4">
        <ContactField label="Email">
          <ReadOnlyValue>account@northwind.com</ReadOnlyValue>
        </ContactField>
        <ContactField label="Phone">
          <div className={readOnlyRow}>
            <img src={flagUs} alt="" className="size-4" />
            <span className="text-sm text-text-primary">US</span>
            <span className="h-5 w-px bg-[#e1e4e9]" />
            <span className="text-sm text-[#9aa1ac]">+1</span>
            <span className="text-sm text-text-primary">(555) 040-3283</span>
          </div>
        </ContactField>
      </div>
      <div className="flex gap-4">
        <ContactField label="Street address">
          <ReadOnlyValue>410 Terry Ave N</ReadOnlyValue>
        </ContactField>
        <ContactField label="City">
          <ReadOnlyValue>Seattle</ReadOnlyValue>
        </ContactField>
      </div>
      <div className="flex gap-4">
        <ContactField label="State">
          <ReadOnlyValue>Washington</ReadOnlyValue>
        </ContactField>
        <ContactField label="Zip code">
          <ReadOnlyValue>98109</ReadOnlyValue>
        </ContactField>
        <ContactField label="Country">
          <ReadOnlyValue>United States</ReadOnlyValue>
        </ContactField>
      </div>
    </div>
  )
}

export function AwsContactInfoContent({ showAddress = false }: { showAddress?: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-text-primary">Contact information</p>
          <p className="text-sm text-[#6b7280]">This information is used for communication about bills, payments and account updates</p>
        </div>
        <Button variant="primary" icon={<img src={plusIcon} alt="" className="size-4 brightness-0 invert" />} onClick={() => navigate('/bills/vendor/add-new-contact-details-empty')}>
          Add new contact
        </Button>
      </div>
      <ContactCard title="Primary contact" />
      <ContactCard title="Secondary contact" />
      {showAddress && (
        <div className="flex flex-col gap-5 rounded-xl bg-surface-2 p-4">
          <p className="text-sm font-medium text-text-primary">Vendor address</p>
          <div className="flex gap-4">
            <ContactField label="Street address">
              <ReadOnlyValue>410 Terry Ave N</ReadOnlyValue>
            </ContactField>
            <ContactField label="City">
              <ReadOnlyValue>Seattle</ReadOnlyValue>
            </ContactField>
          </div>
          <div className="flex gap-4">
            <ContactField label="State">
              <ReadOnlyValue>Washington</ReadOnlyValue>
            </ContactField>
            <ContactField label="Zip code">
              <ReadOnlyValue>98109</ReadOnlyValue>
            </ContactField>
            <ContactField label="Country">
              <ReadOnlyValue>United States</ReadOnlyValue>
            </ContactField>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Notes tab content
// ---------------------------------------------------------------------------

export function AwsNotesTabContent() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(AWS_NOTES)
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-text-primary">Notes ({notes.length})</p>
        <Button variant="primary" icon={<img src={plusIcon} alt="" className="size-4 brightness-0 invert" />} onClick={() => navigate('/bills/vendor/add-note-modal')}>
          Add note
        </Button>
      </div>
      {notes.map((note) => (
        <div key={`${note.author}-${note.date}`} className="flex items-start justify-between gap-4 rounded-xl bg-surface-2 p-4">
          <div className="flex w-[220px] shrink-0 flex-col gap-1">
            <p className="text-sm font-medium text-text-primary">{note.author}</p>
            <p className="text-xs text-text-quaternary">{note.date}</p>
          </div>
          <p className="flex-1 text-sm text-text-primary">{note.text}</p>
          {note.deletable && (
            <HdsButton
              variant="destructive-secondary"
              size="sm"
              shape="pill"
              iconOnly
              aria-label="Delete note"
              onClick={() => setNotes((n) => n.filter((x) => x !== note))}
            >
              <img src={trashIcon} alt="" className="h-[14.3px] w-[13.3px]" />
            </HdsButton>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right-side sliding panel shell (used by the add-contact & confirmation flows)
// ---------------------------------------------------------------------------

export function SlideOverPanel({ children, onClose, className = '' }: { children: ReactNode; onClose?: () => void; className?: string }) {
  return (
    <div className="fixed inset-0 flex justify-end bg-[rgba(10,13,18,0.5)]">
      <div className={`m-6 flex h-[calc(100%-48px)] w-[465px] flex-col overflow-y-auto rounded-2xl bg-white p-6 ${className}`}>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close" className="mb-2 self-end rounded-md transition-opacity hover:opacity-70">
            <img src={cancelSquare} alt="" className="size-6" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

// Address suggestions for the "Address" field (Figma shows a chevron — an address lookup).
const ADDRESS_SUGGESTIONS: SelectOption[] = [
  { value: '410 Terry Ave N, Seattle, WA 98109', label: '410 Terry Ave N, Seattle, WA 98109', description: 'Amazon HQ · Primary address on file' },
  { value: '440 Terry Ave N, Seattle, WA 98109', label: '440 Terry Ave N, Seattle, WA 98109', description: 'Seattle, Washington, United States' },
  { value: '2121 7th Ave, Seattle, WA 98121', label: '2121 7th Ave, Seattle, WA 98121', description: 'Seattle, Washington, United States' },
  { value: '1200 12th Ave S, Seattle, WA 98144', label: '1200 12th Ave S, Seattle, WA 98144', description: 'Seattle, Washington, United States' },
  { value: '410 Terry Ave N, Suite 200, Seattle, WA 98109', label: '410 Terry Ave N, Suite 200, Seattle, WA 98109', description: 'Seattle, Washington, United States' },
  { value: '12900 Worldgate Dr, Herndon, VA 20170', label: '12900 Worldgate Dr, Herndon, VA 20170', description: 'Herndon, Virginia, United States' },
]

/** "Add new contact details" form (Figma 45033:230641 / 45033:230823) — HDS input, phone and address lookup. */
export function ContactDetailsForm({ initial }: { initial: { email: string; phone: string; address: string } }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initial.email)
  const [iso, setIso] = useState('US')
  const [phone, setPhone] = useState(initial.phone)
  const [address, setAddress] = useState(initial.address)
  const canSubmit = email.trim() !== '' && phone.trim() !== '' && address.trim() !== ''
  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <HdsInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
        <KitPhoneInput label="Phone" iso={iso} onIsoChange={setIso} number={phone} onChange={setPhone} placeholder="(000) 000-0000" />
        <KitCombobox label="Address" value={address} onChange={(v) => setAddress(v)} options={ADDRESS_SUGGESTIONS} placeholder="Enter address" />
      </div>
      <HdsButton variant="primary" fullWidth className="mt-auto" disabled={!canSubmit} onClick={() => canSubmit && navigate('/bills/vendor/contact-added-confirmation')}>
        Add contact detail
      </HdsButton>
    </>
  )
}

export function CenterModal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(10,13,18,0.5)]">
      <div className={`flex w-[657px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)] ${className}`}>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Northwind Design Ltd — bill approval / bill detail shared shell
//
// Note: these five screens are titled "Vendor profile — Northwind Design Ltd"
// in the design, but the actual Figma content for each is a single BILL's
// detail/approval page (3-step stepper: Vendor info -> Bill details ->
// Approval), not a vendor-level profile with tabs. Implemented faithfully to
// the Figma content per screen.
// ---------------------------------------------------------------------------

export type NorthwindBadgeStatus = 'pending' | 'rejected' | 'paid' | 'draft'

const NORTHWIND_BADGE: Record<NorthwindBadgeStatus, { status: 'pending' | 'rejected' | 'paid' | 'draft'; label: string }> = {
  pending: { status: 'pending', label: 'Pending approval' },
  rejected: { status: 'rejected', label: 'Cancelled' },
  paid: { status: 'paid', label: 'Paid' },
  draft: { status: 'draft', label: 'Draft' },
}

export function NorthwindBreadcrumb() {
  return (
    <Link to="/bills" className="flex w-fit items-center gap-2">
      <img src={chevronLeft} alt="" className="h-[9px] w-[5px]" />
      <span className="text-sm font-semibold text-text-primary">Bills</span>
    </Link>
  )
}

export function NorthwindStepper({ step }: { step: 1 | 3 }) {
  const steps = [
    { n: 1, label: 'Vendor info' },
    { n: 2, label: 'Bill details' },
    { n: 3, label: 'Approval' },
  ]
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const isActive = s.n === step
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-5 items-center justify-center rounded-lg text-[10px] font-semibold tracking-[0.05px] ${ isActive ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#cbd0d8] bg-surface text-[#4b5563]' }`}
              >
                {s.n}
              </div>
              <span className={`text-[13px] ${isActive ? 'font-semibold text-text-primary' : 'font-medium text-[#4b5563]'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="mx-3 h-px w-20 bg-[#edeff2]" />}
          </div>
        )
      })}
    </div>
  )
}

export function NorthwindHeader({
  status,
  statusLabel,
  actions,
}: {
  status: NorthwindBadgeStatus
  statusLabel?: string
  actions?: ReactNode
}) {
  const badge = NORTHWIND_BADGE[status]
  return (
    <div className="flex w-full items-start gap-4">
      <div className="flex flex-1 flex-col gap-3">
        <p className="font-heading text-[22px] font-semibold text-[#0c2129]">Northwind Design Ltd</p>
        <Badge status={badge.status} label={statusLabel ?? badge.label} />
        <p className="text-[13px] text-[#6b7280]">Created 24 Jul 2026 by Marcus Reid</p>
      </div>
      {actions && <div className="flex shrink-0 items-start gap-2">{actions}</div>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e3e8eb] bg-white p-[18px] shadow-[0px_1px_1px_rgba(10,46,61,0.05)]">
      <p className="border-b border-transparent pb-2 text-base font-semibold text-text-primary">{title}</p>
      {children}
    </div>
  )
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className="text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

export function ApprovalDetailsCard() {
  return (
    <Card title="Approval details">
      <div className="flex flex-col">
        <DefinitionRow label="Bill amount" value="£9,200.00" />
        <DefinitionRow label="Payee (Merchant/vendor)" value="Northwind Design Ltd" />
        <DefinitionRow label="Due date" value="14 Aug 2026" />
        <DefinitionRow label="Payment method" value="International wire (GBP)" />
        <DefinitionRow label="Recipient bank" value="HSBC Bank" />
        <DefinitionRow label="Account number" value="••••4471" />
        <DefinitionRow label="SWIFT code" value="HBUKGB4B" />
      </div>
    </Card>
  )
}

export function ApprovalWorkflowCard() {
  return (
    <Card title="Approval workflow">
      <div className="relative flex flex-col gap-3.5">
        <div className="absolute left-[6px] top-[11px] h-[88px] w-px bg-[#e3e8eb]" />
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-[13px] shrink-0 items-center justify-center">
            <span className="size-[11px] rounded-md border-[2.5px] border-[#12883e] bg-white" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-text-primary">Finance manager</p>
            <p className="text-[11px] text-[#4d5761]">Any finance manager</p>
          </div>
          <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">28 Jul 2026</p>
          <Badge status="approved" label="Approved" />
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-[13px] shrink-0 items-center justify-center">
            <span className="size-[11px] rounded-md border-[2.5px] border-[#9da4ae] bg-white" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-[#9aa1ac]">Admin</p>
            <p className="text-[11px] text-[#9da4ae]">Required for bills above £5,000</p>
          </div>
          <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">Pending</p>
        </div>
      </div>
    </Card>
  )
}

export type BillActivityItem = {
  title: string
  description: string
  date?: string
  tone: 'done' | 'pending' | 'cancelled'
}

export function BillActivityCard({ items }: { items: BillActivityItem[] }) {
  return (
    <Card title="Bill activity">
      <div className="relative flex flex-col gap-[13px]">
        <div className="absolute left-[6px] top-[11px] h-[calc(100%-24px)] w-px bg-[#e3e8eb]" />
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-[13px] shrink-0 items-center justify-center">
              <span
                className={`size-[11px] rounded-md border-[2.5px] bg-white ${ item.tone === 'done' ? 'border-[#12883e]' : item.tone === 'cancelled' ? 'border-[#dc2626]' : 'border-[#9aa1ac]' }`}
              />
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className={`text-[13px] font-medium ${item.tone === 'pending' ? 'text-[#9aa1ac]' : item.tone === 'cancelled' ? 'text-[#b72020]' : 'text-text-primary'}`}>
                {item.title}
              </p>
              <p className={`text-[11px] ${item.tone === 'pending' ? 'text-[#9da4ae]' : item.tone === 'cancelled' ? 'text-[#b72020]' : 'text-[#6b7280]'}`}>
                {item.description}
              </p>
            </div>
            {item.date && <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">{item.date}</p>}
          </div>
        ))}
      </div>
    </Card>
  )
}

export function InvoicePreviewPanel() {
  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-1.5 rounded-xl bg-white px-4 py-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-text-primary">Invoice uploaded</p>
          <p className="text-[11px] text-[#4b5563]">NW-2481.pdf</p>
        </div>
        {/* HDS secondary icon button (pill, sm) — rendered as a link so it downloads the invoice. */}
        <a
          href={invoiceThumbnail}
          download="NW-2481.png"
          aria-label="Download invoice"
          className="inline-flex size-9 items-center justify-center rounded-full bg-[#eaf2f9] text-[#004b87] transition-colors hover:bg-[#d1e3f3] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#004b87]/70"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v8m0 0-3-3m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-[#f3f4f6]">
        <img src={invoiceThumbnail} alt="Invoice NW-2481" className="w-full object-cover" />
      </div>
    </div>
  )
}

export function NorthwindFooter({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-center gap-3 bg-white px-[137px] py-3.5">{children}</div>
}

// ---------------------------------------------------------------------------
// Northwind Design Ltd — status variant switcher
//
// This one bill only ever shows up with a single status in the Bills tables,
// so the other four status variants have no natural row to click. Prototype
// affordance: a small "view other states" strip, shown on all five screens,
// so every status stays reachable from any of the others.
// ---------------------------------------------------------------------------

const NORTHWIND_STATUS_LINKS: { key: string; label: string; to: string }[] = [
  { key: 'pending-approval', label: 'Pending approval', to: '/bills/vendor/northwind-design-ltd-pending-approval' },
  { key: 'overdue', label: 'Overdue', to: '/bills/vendor/northwind-design-ltd-overdue' },
  { key: 'paid', label: 'Paid', to: '/bills/vendor/northwind-design-ltd-paid' },
  { key: 'cancelled', label: 'Cancelled', to: '/bills/vendor/northwind-design-ltd-cancelled' },
  { key: 'draft', label: 'Draft', to: '/bills/vendor/northwind-design-ltd-vendor-info-draft' },
]

export function NorthwindStatusSwitcher({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-text-quaternary">
      <span>Prototype tip — view other states:</span>
      {NORTHWIND_STATUS_LINKS.filter((s) => s.key !== active).map((s) => (
        <Link key={s.key} to={s.to} className="font-semibold text-[#004b87] underline underline-offset-2 hover:text-[#003a6b]">
          {s.label}
        </Link>
      ))}
    </div>
  )
}

export { contactAddedIllustration, cancelSquare }
