import { useSyncExternalStore } from 'react'
import type { BillRow } from '../list/shared'
import { VENDORS, currencySymbol } from '../hdsKit'

/**
 * Module-level store for the "New bill" flow (manual entry + invoice upload).
 *
 * The router remounts the page tree on every navigation, so the form's useState can't carry what the
 * user entered into the "Ready to submit?" step (a separate route). This tiny external store (read
 * with useSyncExternalStore) survives those remounts, so:
 *   - the Ready-to-submit drawer shows exactly what was entered (vendor, currency, dates, items, totals,
 *     schedule, payment details, attachment),
 *   - "Back" from the drawer returns to the form with every field intact,
 *   - Submit / Save as draft add the bill to the Bills list (Queue) with the matching toast.
 * It lives for the browser session (lost on a hard refresh), which is all a prototype needs.
 */

export type LineItem = { name: string; qty: string; price: string; amount: string }

export type RecurringFrequency = 'Monthly' | 'Weekly' | 'Quarterly' | 'Annually' | 'Custom'

export type BillDraft = {
  /** Where the bill came from — the form route "Back" returns to. */
  formRoute: string
  vendor: string
  paymentDetails: string
  category: string
  currency: string
  reference: string
  billDate: string
  dueDate: string
  discount: string
  discountUnit: string
  tax: string
  taxUnit: string
  description: string
  items: LineItem[]
  recurring: boolean
  frequency?: RecurringFrequency
  day: string
  startDate: string
  endDate: string
  cycles: string
  paymentMode: 0 | 1
  /** Uploaded invoice filename (upload path), if any. */
  attachment?: string
}

let draft: BillDraft | null = null
let added: BillRow[] = []
let lastAdded: BillRow | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const getBillDraft = () => draft
export function setBillDraft(next: BillDraft) {
  draft = next
  emit()
}
export function clearBillDraft() {
  draft = null
  emit()
}
export function useBillDraft() {
  return useSyncExternalStore(subscribe, () => draft, () => draft)
}

/** Bills created in this session (newest first) — prepended to the Bills list tables. */
export function useAddedBills() {
  return useSyncExternalStore(subscribe, () => added, () => added)
}
/** The bill the latest Submit / Save as draft created (drives the toast copy). */
export function useLastAddedBill() {
  return useSyncExternalStore(subscribe, () => lastAdded, () => lastAdded)
}

/* ------------------------------------------------------------------ */
/*  Maths + formatting                                                  */
/* ------------------------------------------------------------------ */

export const toNum = (v: string) => Number(String(v).replace(/,/g, '')) || 0
export const fmtMoney = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function billTotals(d: Pick<BillDraft, 'items' | 'discount' | 'discountUnit' | 'tax' | 'taxUnit'>) {
  const subtotal = d.items.reduce((s, it) => s + toNum(it.qty) * toNum(it.price), 0)
  const resolve = (v: string, unit: string) => (unit === 'percent' ? (subtotal * toNum(v)) / 100 : toNum(v))
  const discount = resolve(d.discount, d.discountUnit)
  const tax = resolve(d.tax, d.taxUnit)
  return { subtotal, discount, tax, total: Math.max(subtotal - discount + tax, 0) }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "21/06/2025" -> "21 Jun 2025"; anything unparseable is returned as typed. */
export function formatDate(v: string) {
  const m = v.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (!m) return v.trim()
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${Number(m[1])} ${month} ${m[3]}` : v.trim()
}

export function scheduleSummary(d: BillDraft) {
  if (!d.recurring || !d.frequency) return ''
  const parts: string[] = [d.frequency === 'Weekly' && d.day ? `Weekly on ${d.day}` : d.frequency]
  if (d.startDate) parts.push(`from ${formatDate(d.startDate)}`)
  if (d.endDate) parts.push(`until ${formatDate(d.endDate)}`)
  if (d.cycles) parts.push(`${d.cycles} cycles`)
  return parts.join(' · ')
}

/* ------------------------------------------------------------------ */
/*  Submit / save as draft -> Bills list                               */
/* ------------------------------------------------------------------ */

function toRow(d: BillDraft, status: string): BillRow {
  const vendor = VENDORS.find((v) => v.value === d.vendor)
  const { total } = billTotals(d)
  const due = formatDate(d.dueDate)
  return {
    id: `new-${Date.now()}`,
    bill: d.category || 'Uncategorised',
    invoice: d.reference ? `invoice ${d.reference}` : 'No reference',
    vendor: d.vendor || 'No vendor yet',
    vendorCode: vendor?.description?.split(' · ')[0] ?? '—',
    frequency: d.recurring && d.frequency ? d.frequency : 'One-time',
    createdBy: 'John Doe',
    amount: `${currencySymbol(d.currency)}${fmtMoney(total)}`,
    dueDate: due || '—',
    dueNote: status === 'Draft' ? 'Not submitted' : 'Just added',
    payOn: formatDate(d.billDate) || '—',
    payOnNote: status === 'Draft' ? 'Not submitted' : 'Just added',
    dueBy: due || '—',
    dueByNote: '',
    status,
  }
}

/** Adds the draft to the Bills list (status "Pending approval" or "Draft") and clears the draft. */
export function commitBill(d: BillDraft, status: 'Pending approval' | 'Draft') {
  const row = toRow(d, status)
  added = [row, ...added]
  lastAdded = row
  draft = null
  emit()
  return row
}
