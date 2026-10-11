import { useMemo, useSyncExternalStore } from 'react'
import { useAddedBills } from '../addBill/billDraft'
import { VENDORS } from '../hdsKit'
import { DASHBOARD_BILLS, type BillRow, type BillsColumn } from './shared'

/**
 * One source of truth for every bill the Bills module shows.
 *
 *  - `DASHBOARD_BILLS` (list/shared) are the sample rows from Figma 41310:643438 / 45033:223926.
 *  - `BILL_DETAILS` below carries the per-bill detail (vendor, payment details, bill details, line items)
 *    the bill view stepper and the review queue render, keyed by row id.
 *  - Bills created in this session (New bill → Submit / Save as draft) come from the add-bill store and get
 *    their detail synthesised from the row.
 *  - A tiny module store (useSyncExternalStore — pages remount on every route change) remembers what the
 *    user did to bills this session: status changes (approve / reject / cancel / retry), deletions, and the
 *    bills picked for the multi-bill review queue.
 */

/* ------------------------------------------------------------------ */
/*  Statuses + tabs                                                     */
/* ------------------------------------------------------------------ */

export type BillStatus =
  | 'Overdue'
  | 'Needs action'
  | 'Pending approval'
  | 'Payment failed'
  | 'Payment pending'
  | 'Paid'
  | 'Cancelled'
  | 'Draft'

export type BillsTabKey = 'queue' | 'priority' | 'pending' | 'upcoming' | 'closed'
export type { BillsColumn }

/**
 * Tab → statuses, from the five tab frames: Queue 41310:643438 (everything still open, drafts included),
 * Priority 43881:163889 (Overdue / Payment failed / Needs action), Pending 43881:164505 (Pending approval /
 * Payment pending / Overdue — unpaid and waiting), Upcoming 43881:165141 (Pending approval / Payment
 * pending — scheduled, not yet late) and Closed 43881:165743 (Paid / Cancelled).
 * Columns: every tab uses Created by + Due date except Upcoming, which uses Pay on + Due by.
 */
export const BILL_TABS: { key: BillsTabKey; label: string; statuses: BillStatus[]; columns: BillsColumn[] }[] = [
  {
    key: 'queue',
    label: 'Queue',
    statuses: ['Overdue', 'Needs action', 'Pending approval', 'Payment failed', 'Payment pending', 'Draft'],
    columns: ['createdBy', 'dueDate'],
  },
  { key: 'priority', label: 'Priority', statuses: ['Overdue', 'Payment failed', 'Needs action'], columns: ['createdBy', 'dueDate'] },
  { key: 'pending', label: 'Pending', statuses: ['Pending approval', 'Payment pending', 'Overdue'], columns: ['createdBy', 'dueDate'] },
  { key: 'upcoming', label: 'Upcoming', statuses: ['Pending approval', 'Payment pending'], columns: ['payOn', 'dueBy'] },
  { key: 'closed', label: 'Closed', statuses: ['Paid', 'Cancelled'], columns: ['createdBy', 'dueDate'] },
]

export const isTabKey = (v: string | null): v is BillsTabKey => !!v && BILL_TABS.some((t) => t.key === v)
export const rowsForTab = (rows: BillRow[], tab: BillsTabKey) => {
  const statuses = BILL_TABS.find((t) => t.key === tab)!.statuses as string[]
  return rows.filter((r) => statuses.includes(r.status))
}

/** Statuses an approver can still act on in the review queue. */
export const APPROVABLE_STATUSES: string[] = ['Pending approval', 'Overdue', 'Needs action']

/* ------------------------------------------------------------------ */
/*  Bill detail                                                         */
/* ------------------------------------------------------------------ */

export type LineItem = { item: string; qty: number; unit: number }

export type BillDetail = {
  currency: string
  billType: 'One time' | 'Recurring'
  /** DD/MM/YYYY — what the edit form stores. */
  billDate: string
  dueDate: string
  description: string
  items: LineItem[]
  discount: number
  tax: number
  createdDate: string
  invoiceFile: string
  vendorInfo: {
    type: 'Business' | 'Individual'
    name: string
    firstName?: string
    lastName?: string
    category: string
    /** Not yet in the vendor list — the review queue asks the approver to complete + approve the vendor. */
    isNew?: boolean
  }
  payment: {
    country: string
    method: string
    accountName: string
    bank: string
    /** Sort code / routing number / SWIFT etc. as [label, value]. */
    codes: [string, string][]
    accountNumber: string
    accountType: string
    address: string
    city: string
    state?: string
    postalCode: string
    taxId: string
  }
  contact: { email: string; phone: string; address: string }
}

const US_ACH = (accountName: string, bank: string, accountNumber: string, address: string, city: string, state: string, postalCode: string) => ({
  country: 'United States of America',
  method: 'ACH',
  accountName,
  bank,
  codes: [['Routing number', '021000021']] as [string, string][],
  accountNumber,
  accountType: 'Checking',
  address,
  city,
  state,
  postalCode,
  taxId: 'US-84-1234567',
})

export const BILL_DETAILS: Record<string, BillDetail> = {
  'nw-2481': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '14/07/2026',
    dueDate: '14/08/2026',
    description: 'Brand identity refresh (phase 2) and design system documentation',
    items: [
      { item: 'Brand identity refresh — phase 2', qty: 1, unit: 7600 },
      { item: 'Design system documentation', qty: 1, unit: 1600 },
    ],
    discount: 0,
    tax: 0,
    createdDate: '24 Jul 2026',
    invoiceFile: 'NW-2481.pdf',
    vendorInfo: { type: 'Business', name: 'Northwind Design Ltd', category: 'Professional services' },
    payment: {
      country: 'United Kingdom',
      method: 'International wire (USD)',
      accountName: 'Northwind Design Ltd',
      bank: 'HSBC Bank',
      codes: [
        ['Sort code', '20-00-00'],
        ['SWIFT code', 'HBUKGB4B'],
      ],
      accountNumber: '••••4471',
      accountType: 'Business current',
      address: '44 Rivington Street',
      city: 'London',
      postalCode: 'EC2A 3QP',
      taxId: 'GB123456789',
    },
    contact: { email: 'accounts@northwind.design', phone: '+44 20 7946 0321', address: '44 Rivington Street, London EC2A 3QP' },
  },
  'ml-4419': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '22/08/2026',
    dueDate: '29/08/2026',
    description: 'Contract review and supplier agreement redlines (weekly retainer)',
    items: [{ item: 'Contract review — senior associate', qty: 12, unit: 400 }],
    discount: 0,
    tax: 0,
    createdDate: '22 Aug 2026',
    invoiceFile: 'ML-4419.pdf',
    vendorInfo: { type: 'Business', name: 'Meridian Legal Partners', category: 'Legal services', isNew: true },
    payment: US_ACH('Meridian Legal Partners LLP', 'Chase Bank', '4350437854', '200 Park Avenue', 'New York City', 'New York', '10166'),
    contact: { email: 'billing@meridianlegal.com', phone: '+1(555) 310-2290', address: '200 Park Avenue, New York, NY 10166' },
  },
  'ap-2201': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '20/06/2026',
    dueDate: '04/07/2026',
    description: 'Q3 campaign brochures and event banner stands',
    items: [
      { item: 'Brochure print run (A4, 5,000 copies)', qty: 5000, unit: 1.6 },
      { item: 'Roll-up banner stands', qty: 4, unit: 622 },
    ],
    discount: 0,
    tax: 0,
    createdDate: '20 Jun 2026',
    invoiceFile: 'ACME-0092.pdf',
    vendorInfo: { type: 'Individual', name: 'Acme Print Co', firstName: 'Joleen', lastName: 'Freeman', category: 'Printing', isNew: true },
    payment: US_ACH('Acme Print Co', 'Chase Bank', '1234567890', 'No. 131 Wall Street, NY', 'New York City', 'New York', '10001'),
    contact: { email: 'joleen.freeman@example.com', phone: '+1(555) 040-3283', address: '15 Maplewood Drive, Austin, TX 78704' },
  },
  'ub-5521': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '03/07/2026',
    dueDate: '05/08/2026',
    description: 'Client-visit rides for the sales team',
    items: [{ item: 'Business rides — July', qty: 1, unit: 340 }],
    discount: 0,
    tax: 0,
    createdDate: '3 Jul 2026',
    invoiceFile: 'UB-5521.pdf',
    vendorInfo: { type: 'Business', name: 'Uber for Business', category: 'Travel' },
    payment: US_ACH('Uber Technologies Inc.', 'Bank of America', '7781230044', '1515 3rd Street', 'San Francisco', 'California', '94158'),
    contact: { email: 'business-billing@uber.com', phone: '+1(555) 800-5932', address: '1515 3rd Street, San Francisco, CA 94158' },
  },
  'nd-1187': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '01/07/2026',
    dueDate: '05/08/2026',
    description: 'Annual studio lease and facilities service charge',
    items: [
      { item: 'Studio lease — annual', qty: 1, unit: 4500 },
      { item: 'Facilities service charge', qty: 1, unit: 630 },
    ],
    discount: 0,
    tax: 0,
    createdDate: '1 Jul 2026',
    invoiceFile: 'ND-1187.pdf',
    vendorInfo: { type: 'Business', name: 'Northwide Design Ltd', category: 'Rent & facilities' },
    payment: {
      country: 'United Kingdom',
      method: 'International wire (USD)',
      accountName: 'Northwide Design Ltd',
      bank: 'Barclays',
      codes: [
        ['Sort code', '20-32-06'],
        ['SWIFT code', 'BARCGB22'],
      ],
      accountNumber: '••••2214',
      accountType: 'Business current',
      address: '18 Hoxton Square',
      city: 'London',
      postalCode: 'N1 6NT',
      taxId: 'GB987654321',
    },
    contact: { email: 'finance@northwide.co.uk', phone: '+44 20 7946 0874', address: '18 Hoxton Square, London N1 6NT' },
  },
  'dl-9012': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '24/06/2026',
    dueDate: '01/07/2026',
    description: 'Team lunches for the quarterly offsite',
    items: [{ item: 'Catering — team offsite', qty: 1, unit: 186 }],
    discount: 0,
    tax: 0,
    createdDate: '24 Jun 2026',
    invoiceFile: 'DL-9012.pdf',
    vendorInfo: { type: 'Business', name: 'Deliveroo', category: 'Utilities' },
    payment: US_ACH('Deliveroo for Work', 'Wells Fargo', '9930018822', '1 Market Street', 'San Francisco', 'California', '94105'),
    contact: { email: 'work@deliveroo.com', phone: '+1(555) 210-7788', address: '1 Market Street, San Francisco, CA 94105' },
  },
  'fg-3390': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '05/06/2026',
    dueDate: '12/06/2026',
    description: 'Figma Organization seats for the design team',
    items: [{ item: 'Figma Organization — editor seat', qty: 20, unit: 250 }],
    discount: 0,
    tax: 0,
    createdDate: '5 Jun 2026',
    invoiceFile: 'FG-3390.pdf',
    vendorInfo: { type: 'Business', name: 'Figma', category: 'Software' },
    payment: US_ACH('Figma Inc.', 'Silicon Valley Bank', '3300194471', '760 Market Street', 'San Francisco', 'California', '94102'),
    contact: { email: 'billing@figma.com', phone: '+1(555) 415-8890', address: '760 Market Street, San Francisco, CA 94102' },
  },
  'aws-8834': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '01/08/2026',
    dueDate: '15/08/2026',
    description: 'EC2, S3 and CloudFront usage — July',
    items: [
      { item: 'EC2 compute', qty: 1, unit: 1820 },
      { item: 'S3 storage + CloudFront', qty: 1, unit: 680 },
    ],
    discount: 0,
    tax: 0,
    createdDate: '1 Aug 2026',
    invoiceFile: 'AWS-8834.pdf',
    vendorInfo: { type: 'Business', name: 'Amazon Web Services', category: 'Cloud infrastructure' },
    payment: US_ACH('Amazon Web Services, Inc.', 'JPMorgan Chase Bank', '•••• 1234', '410 Terry Ave N', 'Seattle', 'Washington', '98109'),
    contact: { email: 'aws-receivables@amazon.com', phone: '+1(555) 266-4064', address: '410 Terry Ave N, Seattle, WA 98109' },
  },
  'st-0412': {
    currency: 'USD - US Dollar',
    billType: 'One time',
    billDate: '18/08/2026',
    dueDate: '30/08/2026',
    description: 'Office supplies restock',
    items: [
      { item: 'Printer paper (10 boxes)', qty: 10, unit: 42.5 },
      { item: 'Desk organisers', qty: 6, unit: 31.24 },
    ],
    discount: 0,
    tax: 0,
    createdDate: '18 Aug 2026',
    invoiceFile: 'ST-0412.pdf',
    vendorInfo: { type: 'Business', name: 'Staples', category: 'Office supplies' },
    payment: US_ACH('Staples Inc.', 'Citibank', '5512009843', '500 Staples Drive', 'Framingham', 'Massachusetts', '01702'),
    contact: { email: 'ar@staples.com', phone: '+1(555) 378-2753', address: '500 Staples Drive, Framingham, MA 01702' },
  },
  'ns-7710': {
    currency: 'USD - US Dollar',
    billType: 'Recurring',
    billDate: '10/07/2026',
    dueDate: '20/07/2026',
    description: 'Analytics platform subscription',
    items: [{ item: 'Northstar Analytics — team plan', qty: 1, unit: 4800 }],
    discount: 0,
    tax: 0,
    createdDate: '10 Jul 2026',
    invoiceFile: 'NS-7710.pdf',
    vendorInfo: { type: 'Business', name: 'Northstar Labs', category: 'Software' },
    payment: US_ACH('Northstar Labs Inc.', 'Chase Bank', '6612004471', '88 Colin P Kelly Jr Street', 'San Francisco', 'California', '94107'),
    contact: { email: 'billing@northstarlabs.io', phone: '+1(555) 902-1180', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107' },
  },
}

/* ------------------------------------------------------------------ */
/*  Money helpers                                                       */
/* ------------------------------------------------------------------ */

const symbolOf = (amount: string) => amount.match(/^[^\d-]*/)?.[0] || '$'
export const parseAmount = (amount: string) => Number(amount.replace(/[^0-9.]/g, '')) || 0
export const money = (n: number, symbol = '$') =>
  `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/** '14/08/2026' → '14 August 2026' (as typed if it doesn't parse). */
export const longDate = (v: string) => {
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  return m ? `${Number(m[1])} ${MONTHS[Number(m[2]) - 1]} ${m[3]}` : v
}
/** '14 Aug 2026' → '14/08/2026' (best effort, for bills created this session). */
const shortToSlash = (v?: string) => {
  const m = v?.match(/^(\d{1,2}) (\w{3}) (\d{4})$/)
  if (!m) return ''
  const idx = MONTHS.findIndex((x) => x.startsWith(m[2]))
  return idx < 0 ? '' : `${m[1].padStart(2, '0')}/${String(idx + 1).padStart(2, '0')}/${m[3]}`
}

/* ------------------------------------------------------------------ */
/*  Bill record (row + detail + derived totals)                         */
/* ------------------------------------------------------------------ */

export type BillRecord = BillRow &
  BillDetail & {
    symbol: string
    subtotal: number
    total: number
    reference: string
  }

function detailFor(row: BillRow): BillDetail {
  const known = BILL_DETAILS[row.id]
  if (known) return known
  // A bill created this session — synthesise the detail from what the row carries.
  const vendor = VENDORS.find((v) => v.value === row.vendor)
  const total = parseAmount(row.amount)
  return {
    currency: vendor?.currency === 'GBP' ? 'GBP - Great British Pound' : 'USD - US Dollar',
    billType: row.frequency === 'One-time' ? 'One time' : 'Recurring',
    billDate: shortToSlash(row.payOn),
    dueDate: shortToSlash(row.dueDate),
    description: `${row.bill} — ${row.vendor}`,
    items: [{ item: row.bill, qty: 1, unit: total }],
    discount: 0,
    tax: 0,
    createdDate: 'Today',
    invoiceFile: row.invoice.startsWith('invoice ') ? `${row.invoice.slice(8)}.pdf` : 'Invoice.pdf',
    vendorInfo: { type: 'Business', name: row.vendor, category: row.bill },
    payment: {
      country: vendor?.country ?? 'United States of America',
      method: 'Bank transfer',
      accountName: row.vendor,
      bank: vendor?.bank ?? '—',
      codes: [],
      accountNumber: vendor?.bank?.match(/•+ ?\d+/)?.[0] ?? '—',
      accountType: 'Business',
      address: '—',
      city: '—',
      postalCode: '—',
      taxId: '—',
    },
    contact: { email: '—', phone: '—', address: '—' },
  }
}

export function toRecord(row: BillRow): BillRecord {
  const d = detailFor(row)
  const symbol = symbolOf(row.amount)
  const subtotal = d.items.reduce((s, it) => s + it.qty * it.unit, 0)
  return {
    ...row,
    ...d,
    symbol,
    subtotal,
    total: Math.max(subtotal - d.discount + d.tax, 0),
    reference: row.invoice.replace(/^invoice /, ''),
  }
}

/* ------------------------------------------------------------------ */
/*  Session store                                                       */
/* ------------------------------------------------------------------ */

export type ReviewDecision = 'Approved' | 'Rejected' | 'Info requested' | 'Vendor rejected'

type StoreState = {
  statusOverrides: Record<string, string>
  deleted: string[]
  reviewQueue: string[]
  decisions: Record<string, ReviewDecision>
  approvedVendors: string[]
  /** Recurring bills whose future cycles are paused. */
  paused: string[]
  /** Amount paid so far on bills paid in part ("Pay part of this bill"). */
  paid: Record<string, number>
}

let state: StoreState = { statusOverrides: {}, deleted: [], reviewQueue: [], decisions: {}, approvedVendors: [], paused: [], paid: {} }
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const update = (patch: Partial<StoreState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const useStore = () => useSyncExternalStore(subscribe, () => state, () => state)

export const setBillStatus = (id: string, status: BillStatus) => update({ statusOverrides: { ...state.statusOverrides, [id]: status } })
export const deleteBill = (id: string) => update({ deleted: [...state.deleted, id] })
export const startReview = (ids: string[]) => update({ reviewQueue: ids, decisions: {} })
export const decideBill = (id: string, decision: ReviewDecision, status: BillStatus) =>
  update({ decisions: { ...state.decisions, [id]: decision }, statusOverrides: { ...state.statusOverrides, [id]: status } })
export const approveVendor = (id: string) => update({ approvedVendors: [...state.approvedVendors, id] })
export const setBillPaused = (id: string, paused: boolean) =>
  update({ paused: paused ? [...state.paused.filter((x) => x !== id), id] : state.paused.filter((x) => x !== id) })
/** Records a payment; once the bill's total is covered it becomes Paid, otherwise it stays open with a balance. */
export const recordBillPayment = (id: string, amount: number, total: number) => {
  const paid = (state.paid[id] ?? 0) + amount
  update({
    paid: { ...state.paid, [id]: paid },
    statusOverrides: { ...state.statusOverrides, [id]: paid >= total - 0.005 ? 'Paid' : 'Payment pending' },
  })
}

/** Session progress on one bill: paused (recurring) and how much has been paid towards it. */
export function useBillProgress(id: string) {
  const s = useStore()
  return { paused: s.paused.includes(id), paid: s.paid[id] ?? 0 }
}

/** Every bill (session-created first), with this session's status changes and deletions applied. */
export function useAllBills(): BillRow[] {
  const added = useAddedBills()
  const s = useStore()
  return useMemo(
    () =>
      [...added, ...DASHBOARD_BILLS]
        .filter((r) => !s.deleted.includes(r.id))
        .map((r) => (s.statusOverrides[r.id] ? { ...r, status: s.statusOverrides[r.id] } : r)),
    [added, s],
  )
}

/** Looks a bill up by id (falls back to Northwind NW-2481, the bill every legacy design route shows). */
export function useBillRecord(id: string | null | undefined): BillRecord {
  const all = useAllBills()
  return useMemo(() => toRecord(all.find((r) => r.id === id) ?? all.find((r) => r.id === 'nw-2481') ?? DASHBOARD_BILLS[0]), [all, id])
}

const DEFAULT_REVIEW_QUEUE = ['ap-2201', 'ml-4419', 'nw-2481', 'fg-3390']

/** Bills picked for the multi-bill review (falls back to the open sample bills when the route is opened directly). */
export function useReviewQueue() {
  const all = useAllBills()
  const s = useStore()
  const ids = s.reviewQueue.length ? s.reviewQueue : DEFAULT_REVIEW_QUEUE
  const records = useMemo(() => ids.map((id) => all.find((r) => r.id === id)).filter(Boolean).map((r) => toRecord(r!)), [ids, all])
  return { records, decisions: s.decisions, approvedVendors: s.approvedVendors }
}
