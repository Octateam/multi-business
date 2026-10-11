import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HdsBadge, HdsButton, HdsTextarea } from '../../../components/ui/hds'
import { Drawer } from '../../accounts/ui'
import { FLAGS } from '../hdsKit'
import { useVendorStore } from '../../vendors/vendorStore'
import { toRecord, useAllBills, type BillRecord } from './billRecords'
import { billEntryPath } from './billRoutes'
import { useBillRole } from './billRole'
import { StatusPill } from './shared'
import { closeVendorInfo, useOpenVendorInfo } from './vendorInfoStore'
import iconCloseSquare from '../../../assets/icons/list1-close-square.svg'
import iconInfo from '../../../assets/icons/vendorsheet-info-circle.svg'
import iconEdit from '../../../assets/icons/vendorsheet-edit.svg'

// ---------------------------------------------------------------------------
// "Vendor information" side sheet — Figma 45033:224707. Opened from a bill's ⋯ → "View vendor info" on the
// Bills tables, over the page (no navigation). Filled from the bill's vendor: overview, payment accounts,
// contact, every bill linked to that vendor (click to open it) and notes (add / delete your own).
// ---------------------------------------------------------------------------

/* ---- vendor data ---- */

type Account = { currency: string; flag?: string; accountName: string; accountNumber: string; bank: string; method: string; isDefault?: boolean }
type Note = { id: string; author: string; date: string; text: string; own?: boolean }

const CURRENCY_FLAG: Record<string, string> = { USD: FLAGS.US, GBP: FLAGS.GB, EUR: FLAGS.EU, NGN: FLAGS.NG, CAD: FLAGS.CA, KES: FLAGS.KE, GHS: FLAGS.GH, INR: FLAGS.IN, ZAR: FLAGS.ZA }

/** Vendors with more on file than a single bill carries (the Figma sample is AWS). */
const EXTRA: Record<string, { description: string; category?: string; taxId?: string; added?: string; updated?: string; accounts?: Account[]; contactAddress?: string[]; email?: string; phone?: string; notes?: Note[] }> = {
  'Amazon Web Services': {
    description: 'Cloud infrastructure and services',
    category: 'Technology',
    taxId: '12-3456789',
    added: 'Jan 10, 2026',
    updated: 'Aug 15, 2026',
    email: 'aws-billing@amazon.com',
    phone: '+1 (206) 266-4064',
    contactAddress: ['410 Terry Ave N', 'Seattle, WA 98109', 'United States'],
    accounts: [
      { currency: 'USD', flag: FLAGS.US, accountName: 'Amazon Web Services, Inc.', accountNumber: '•••• 1234', bank: 'JPMorgan Chase Bank', method: 'ACH (bank transfer)', isDefault: true },
      { currency: 'GBP', flag: FLAGS.GB, accountName: 'Amazon Web Services Ltd', accountNumber: '•••• 5678', bank: 'Barclays Bank', method: 'SWIFT (bank transfer)' },
    ],
    notes: [
      { id: 'n1', author: 'John Doe', date: 'Aug 16, 2026 · 4:00 PM', text: 'Primary cloud provider for infrastructure and hosting services.', own: true },
      { id: 'n2', author: 'Theo Olsen', date: 'Aug 15, 2026 · 2:15 PM', text: 'Reach out to AWS Billing for invoice discrepancies.' },
    ],
  },
}

const mask = (n: string) => {
  const digits = n.replace(/\D/g, '')
  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : n
}
const methodLabel = (m: string) => (/^(ach|swift)$/i.test(m) ? `${m.toUpperCase()} (bank transfer)` : m)
const shortDate = (d: string) => {
  const t = Date.parse(d)
  return Number.isNaN(t) ? d : new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Notes survive closing and reopening the sheet for the session.
const notesByVendor = new Map<string, Note[]>()

/* ---- pieces ---- */

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full items-start gap-4 text-[13px] leading-5">
      <p className="w-[148px] shrink-0 text-[#6b7280]">{label}</p>
      <div className="min-w-0 flex-1 font-medium text-[#1a1d23]">{children}</div>
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-[#1a1d23]">{title}</p>
        {action}
      </div>
      {children}
    </section>
  )
}

const Box = ({ children, gap = 'gap-2' }: { children: React.ReactNode; gap?: string }) => (
  <div className={`flex w-full flex-col ${gap} rounded-xl border border-[#e3e8ef] bg-white p-4`}>{children}</div>
)

function EditChip({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-full bg-[#eaf2f9] px-3.5 py-1.5 text-[13px] font-semibold text-[#004b87] transition-colors hover:bg-[#dbe9f5]">
      Edit
      <img src={iconEdit} alt="" className="size-[14px]" />
    </button>
  )
}

function LinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <HdsButton variant="link" size="sm" className="!text-sm" onClick={onClick}>
      {children}
    </HdsButton>
  )
}

/* ---- sheet ---- */

/** Mount once on a page whose bill menus offer "View vendor info". */
export function VendorInfoSheetHost() {
  const billId = useOpenVendorInfo()
  const all = useAllBills()
  const row = billId ? all.find((r) => r.id === billId) : undefined
  return <Drawer open={!!row} onClose={closeVendorInfo} width={480}>{row && <VendorInfoContent bill={toRecord(row)} />}</Drawer>
}

function VendorInfoContent({ bill }: { bill: BillRecord }) {
  const navigate = useNavigate()
  const role = useBillRole()
  const all = useAllBills()
  const vendors = useVendorStore().rows
  const extra = EXTRA[bill.vendor]
  const listed = vendors.find((v) => v.name === bill.vendor)
  // Vendor page for the edit / add / view-all links (AWS has its own profile; other vendors match the vendor list).
  const vendorId = bill.vendor === 'Amazon Web Services' ? 'aws' : listed?.id
  const go = (to: string) => {
    closeVendorInfo()
    navigate(to)
  }
  const vendorLink = (q: string) => (vendorId ? () => go(`/vendors/detail?id=${vendorId}${q}`) : undefined)

  const v = bill.vendorInfo
  const status = listed?.status ?? 'Active'
  const code = bill.currency.slice(0, 3)
  const accounts: Account[] = extra?.accounts ?? [
    { currency: code, flag: CURRENCY_FLAG[code], accountName: bill.payment.accountName, accountNumber: mask(bill.payment.accountNumber), bank: bill.payment.bank, method: methodLabel(bill.payment.method), isDefault: true },
  ]
  const linked = all.filter((r) => r.vendor === bill.vendor)
  const [notes, setNotes] = useState<Note[]>(() => notesByVendor.get(bill.vendor) ?? extra?.notes ?? [])
  const [draft, setDraft] = useState<string | null>(null)
  const saveNotes = (next: Note[]) => {
    notesByVendor.set(bill.vendor, next)
    setNotes(next)
  }
  const address = extra?.contactAddress ?? [bill.contact.address].filter((a) => a && a !== '—')

  return (
    <div className="flex min-h-full flex-col gap-6 p-6" data-vendor-sheet>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
          Vendor information
        </h2>
        <button type="button" onClick={closeVendorInfo} aria-label="Close vendor information">
          <img src={iconCloseSquare} alt="" className="size-6" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <p className="text-xl font-semibold leading-7 text-[#1a1d23]">{bill.vendor}</p>
            <StatusPill label={status} />
          </div>
          <p className="text-[13px] leading-5 text-[#6b7280]">{extra?.description ?? `${v.type} · ${v.category}`}</p>
        </div>

        <Section title="Overview" action={vendorLink('&edit=1') && <EditChip onClick={vendorLink('&edit=1')!} />}>
          <Box gap="gap-4">
            <Detail label="Vendor name">{v.name}</Detail>
            <Detail label="Vendor type">{v.type}</Detail>
            <Detail label="Category">{extra?.category ?? v.category}</Detail>
            <Detail label="Tax ID">{extra?.taxId ?? bill.payment.taxId}</Detail>
            <Detail label="Date added">{extra?.added ?? (listed ? listed.dateCreated : shortDate(bill.createdDate))}</Detail>
            <Detail label="Last updated">{extra?.updated ?? shortDate(bill.createdDate)}</Detail>
          </Box>
        </Section>

        <Section title="Payment details" action={vendorLink('&tab=payment') && <LinkButton onClick={vendorLink('&tab=payment')!}>Add payment method</LinkButton>}>
          {accounts.map((a) => (
            <Box key={a.currency + a.accountNumber}>
              <div className="flex items-center gap-2">
                {a.flag && <img src={a.flag} alt="" className="size-5 rounded-full object-cover" />}
                <p className="flex-1 text-base font-semibold text-[#1a1d23]">{a.currency} account</p>
                {a.isDefault && (
                  <HdsBadge color="navy" size="sm">
                    Default
                  </HdsBadge>
                )}
                <img src={iconInfo} alt="" title={`Payments to ${bill.vendor} in ${a.currency} go to this account`} className="size-5 p-[1px]" />
              </div>
              <Detail label="Account name">{a.accountName}</Detail>
              <Detail label="Account number">{a.accountNumber}</Detail>
              <Detail label="Bank name">{a.bank}</Detail>
              <Detail label="Payment method">{a.method}</Detail>
            </Box>
          ))}
        </Section>

        <Section title="Contact information" action={vendorLink('&tab=contact') && <EditChip onClick={vendorLink('&tab=contact')!} />}>
          <Box>
            <Detail label="Email">{extra?.email ?? bill.contact.email}</Detail>
            <Detail label="Phone">{extra?.phone ?? bill.contact.phone}</Detail>
            <Detail label="Address">
              {address.length ? address.map((line) => <p key={line}>{line}</p>) : '—'}
            </Detail>
          </Box>
        </Section>

        <Section title="Linked bills" action={vendorLink('&tab=bills') && <LinkButton onClick={vendorLink('&tab=bills')!}>View all</LinkButton>}>
          {linked.slice(0, 3).map((b) => (
            <button key={b.id} type="button" onClick={() => go(billEntryPath(b, role))} className="w-full text-left transition-opacity hover:opacity-80">
              <Box>
                <div className="flex items-start gap-4 text-[13px] font-medium leading-5 text-[#1a1d23]">
                  <p className="min-w-0 flex-1">{b.bill}</p>
                  <p className="whitespace-nowrap">{b.amount}</p>
                  <StatusPill label={b.status} />
                </div>
                <p className="whitespace-pre text-[13px] leading-5 text-[#6b7280]">{`${b.invoice.replace(/^invoice /, '')}  ·  ${b.dueDate ?? ''}`}</p>
              </Box>
            </button>
          ))}
          {linked.length === 0 && <p className="text-[13px] text-[#6b7280]">No bills linked to this vendor yet.</p>}
        </Section>

        <Section title="Notes" action={draft === null && <LinkButton onClick={() => setDraft('')}>Add note</LinkButton>}>
          {draft !== null && (
            <Box gap="gap-3">
              <HdsTextarea label="New note" value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxChars={240} placeholder="Add a note for your team about this vendor" />
              <div className="flex justify-end gap-2">
                <HdsButton variant="secondary" size="sm" onClick={() => setDraft(null)}>
                  Cancel
                </HdsButton>
                <HdsButton
                  variant="primary"
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => {
                    const now = new Date()
                    const date = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                    saveNotes([{ id: `n${now.getTime()}`, author: 'John Doe', date, text: draft.trim(), own: true }, ...notes])
                    setDraft(null)
                  }}
                >
                  Save note
                </HdsButton>
              </div>
            </Box>
          )}
          {notes.map((n) => (
            <Box key={n.id}>
              <div className="flex items-center gap-3">
                <p className="flex-1 text-base font-semibold text-[#1a1d23]">{n.own ? `${n.author} (you)` : n.author}</p>
                {n.own && <LinkButton onClick={() => saveNotes(notes.filter((x) => x.id !== n.id))}>Delete</LinkButton>}
              </div>
              <p className="text-[13px] leading-5 text-[#6b7280]">{n.date}</p>
              <p className="text-[13px] font-medium leading-5 text-[#1a1d23]">{n.text}</p>
            </Box>
          ))}
          {notes.length === 0 && draft === null && <p className="text-[13px] text-[#6b7280]">No notes yet.</p>}
        </Section>
      </div>
    </div>
  )
}
