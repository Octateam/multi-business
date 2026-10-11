import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Badge, { type BadgeStatus } from '../../../components/ui/Badge'
import { Chevron, HdsActionMenu, HdsButton, HdsInput, HdsSearch, HdsSwitch, HdsTextarea, HdsToggleSegment, inputRowClass } from '../../../components/ui/hds'
import { Drawer, useToast } from '../../accounts/ui'
import { useGoBack } from '../../../lib/navHistory'
import { useVendorStore } from '../../vendors/vendorStore'
import { FLAGS, Flag, KitPhoneInput, KitSelect } from '../hdsKit'
import {
  ACCOUNT_TYPE_OPTIONS,
  BackLink,
  CATEGORY_OPTIONS,
  COUNTRY_OPTIONS,
  DetailRow,
  DisplayInputField,
  DisplaySelectField,
  ModalHeader,
  ReviewCard,
  US_STATE_OPTIONS,
  isFilled,
} from '../list/paymentMethodShared'
import { AWS_NOTES, AwsBillsTabContent, contactAddedIllustration } from './shared'
import chevronLeft from '../../../assets/icons/vendorprof-chevron-left.svg'
import editPencil from '../../../assets/icons/vendorprof-edit-pencil.svg'
import editTrailing from '../../../assets/icons/vendorprof-edit-trailing.svg'
import plusIcon from '../../../assets/icons/vendorprof-plus.svg'
import kebabIcon from '../../../assets/icons/vendorprof-kebab.svg'
import flagUs from '../../../assets/icons/vendorprof-flag-us.svg'
import trashIcon from '../../../assets/icons/vendorprof-trash.svg'
import cancelSquare from '../../../assets/icons/vendorprof-cancel-square.svg'
import penIcon from '../../../assets/icons/billrow-pen.svg'
import deleteIcon from '../../../assets/icons/billrow-delete.svg'
import invoiceIcon from '../../../assets/icons/vendordetail-invoice-01.svg'
import closeX from '../../../assets/icons/list3-close-x.svg'
import deleteCircleIcon from '../../../assets/icons/list3-delete-circle-icon.svg'
import awsLogo from '../../../assets/img/vendorprof-aws-logo.png'

/**
 * Vendor details — Figma XWbFOsBSyeBTrk7EpLB5Kq, section 48069:440036 ("Vendor details and actions").
 * One interactive page: header + tabs (Bills / Payment details / Contact information / Notes) and every
 * drawer/modal in the flow, driven by local state. POV is Harriet Underwood (the signed-in user): she can
 * only delete notes she wrote (Figma note 48069:435805).
 */

export const CURRENT_USER = 'Harriet Underwood'

// ---------------------------------------------------------------------------
// Vendors this page knows about. `aws` is the design's vendor; the VND-* ids mirror the Vendor list rows
// so the list can link each row to /vendors/detail?id=<id>.
// ---------------------------------------------------------------------------

type VendorStatus = 'Active' | 'Pending' | 'Archived' | 'Deactivated'
export type VendorRecord = {
  id: string
  name: string
  description: string
  type: 'Business' | 'Individual'
  category: string
  taxId: string
  added: string
  updated: string
  status: VendorStatus
  logo?: string
  /** No bills / notes on file — renders the empty states. */
  empty?: boolean
}

export const VENDOR_DETAILS: VendorRecord[] = [
  { id: 'aws', name: 'Amazon Web Services', description: 'Cloud infrastructure and services', type: 'Business', category: 'Technology', taxId: '12-3456789', added: 'Jan 10, 2026', updated: 'Aug 15, 2026', status: 'Active', logo: awsLogo },
  { id: 'VND-00432', name: 'Northwind Design Ltd', description: 'Brand and product design studio', type: 'Business', category: 'Professional Services', taxId: '12-4471882', added: 'Jan 6, 2025', updated: 'Aug 15, 2026', status: 'Active' },
  { id: 'VND-00431', name: 'Meridian Legal Partners', description: 'Corporate legal counsel', type: 'Business', category: 'Software', taxId: '98-1204410', added: 'Jan 6, 2025', updated: 'Aug 2, 2026', status: 'Active' },
  { id: 'VND-00430', name: 'Acme Print Co', description: 'Print and signage supplier', type: 'Business', category: 'Equipment', taxId: '45-7781203', added: 'Jan 6, 2025', updated: 'Jul 21, 2026', status: 'Deactivated' },
  { id: 'VND-00429', name: 'Michael Novak', description: 'Independent contractor', type: 'Individual', category: 'Contractor', taxId: '31-5520918', added: 'Jan 6, 2025', updated: 'Jul 9, 2026', status: 'Active' },
  { id: 'VND-00428', name: 'Northwide Design Ltd', description: 'Marketing and campaign design', type: 'Business', category: 'Marketing', taxId: '62-1188430', added: 'Jan 6, 2025', updated: 'Jun 30, 2026', status: 'Pending', empty: true },
  { id: 'VND-00427', name: 'Alice Mitchell', description: 'Freight and logistics', type: 'Individual', category: 'Logistics', taxId: '27-9034516', added: 'Jan 6, 2025', updated: 'Jun 12, 2026', status: 'Archived', empty: true },
  { id: 'VND-00426', name: 'Figma', description: 'Collaborative design software', type: 'Business', category: 'Marketing', taxId: '84-2216093', added: 'Jan 6, 2025', updated: 'May 28, 2026', status: 'Pending', empty: true },
]

const STATUS_BADGE: Record<VendorStatus, BadgeStatus> = { Active: 'approved', Pending: 'pending', Archived: 'draft', Deactivated: 'rejected' }

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

type PaymentForm = {
  country: string
  accountName: string
  accountType: string
  accountNumber: string
  bankName: string
  routingNumber: string
  swift: string
  address: string
  state: string
  city: string
  zip: string
  hasTaxId: boolean
  taxId: string
}

type PaymentMethod = PaymentForm & {
  id: string
  addedBy: string
  dateAdded: { date: string; time: string }
  lastUpdate: { date: string; time: string }
}

const EMPTY_PAYMENT: PaymentForm = {
  country: '',
  accountName: '',
  accountType: 'Checking',
  accountNumber: '',
  bankName: '',
  routingNumber: '',
  swift: '',
  address: '',
  state: '',
  city: '',
  zip: '',
  hasTaxId: true,
  taxId: '',
}

const usAccount = (over: Partial<PaymentForm>): PaymentForm => ({
  ...EMPTY_PAYMENT,
  country: 'United States of America',
  accountType: 'Checking',
  routingNumber: '123243424',
  swift: 'CHASUS33',
  address: '410 Terry Ave N',
  state: 'Washington',
  city: 'Seattle',
  zip: '98109',
  hasTaxId: false,
  ...over,
})

const seedPayments = (accountName: string): PaymentMethod[] => [
  { id: 'pm-1', ...usAccount({ accountName, bankName: 'JPMorgan Chase Bank', accountNumber: '4350431234' }), addedBy: 'Fiona Ames', dateAdded: { date: '14 Aug 2026', time: '12:21pm' }, lastUpdate: { date: '14 Aug 2026', time: '12:21pm' } },
  { id: 'pm-2', ...usAccount({ accountName, bankName: 'Bank of America', accountNumber: '7720945678', swift: 'BOFAUS3N' }), addedBy: 'Luke Frank', dateAdded: { date: '29 Aug 2026', time: '12:21pm' }, lastUpdate: { date: '29 Aug 2026', time: '12:21pm' } },
  { id: 'pm-3', ...usAccount({ accountName, bankName: 'Visa', accountNumber: '4111111111114242', swift: 'VISAUS33' }), addedBy: 'Caleb Joel', dateAdded: { date: '4 Jul 2026', time: '12:21pm' }, lastUpdate: { date: '4 Jul 2026', time: '12:21pm' } },
]

const CURRENCY: Record<string, string> = { 'United States of America': 'USD', 'United Kingdom': 'GBP', Canada: 'CAD', Germany: 'EUR' }
const COUNTRY_SHORT: Record<string, string> = { 'United States of America': 'United States' }
const last4 = (n: string) => n.replace(/\D/g, '').slice(-4)
const masked = (n: string) => `•••• ${last4(n)}`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function nowStamp() {
  const d = new Date()
  const h = d.getHours() % 12 || 12
  return { date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, time: `${h}:${String(d.getMinutes()).padStart(2, '0')}${d.getHours() < 12 ? 'am' : 'pm'}` }
}
function noteStamp() {
  const d = new Date()
  const h = d.getHours() % 12 || 12
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

type Address = { label: string; street: string; city: string; state: string; zip: string; country: string }
const ADDRESSES: Address[] = [
  { label: '410 Terry Ave N, Seattle, WA 98109', street: '410 Terry Ave N', city: 'Seattle', state: 'Washington', zip: '98109', country: 'United States' },
  { label: '15 Maplewood Drive, Austin, TX 78704', street: '15 Maplewood Drive', city: 'Austin', state: 'Texas', zip: '78704', country: 'United States' },
  { label: '2121 7th Ave, Seattle, WA 98121', street: '2121 7th Ave', city: 'Seattle', state: 'Washington', zip: '98121', country: 'United States' },
  { label: '12900 Worldgate Dr, Herndon, VA 20170', street: '12900 Worldgate Dr', city: 'Herndon', state: 'Virginia', zip: '20170', country: 'United States' },
]
const ADDRESS_LABELS = ADDRESSES.map((a) => a.label)

type Contact = { id: string; title: string; email: string; iso: string; phone: string; address: Address }

const seedContacts = (): Contact[] => [
  { id: 'c-1', title: 'Primary contact', email: 'account@northwind.com', iso: 'US', phone: '(555) 040-3283', address: ADDRESSES[0] },
  { id: 'c-2', title: 'Secondary contact', email: 'account@northwind.com', iso: 'US', phone: '(555) 040-3283', address: ADDRESSES[0] },
]

type Note = { id: string; author: string; date: string; text: string }

// ---------------------------------------------------------------------------
// Overlay state
// ---------------------------------------------------------------------------

export type VendorTab = 'bills' | 'payment' | 'contact' | 'notes'
type DrawerState =
  | { kind: 'addContact'; step: 'form' | 'success'; prefill?: boolean }
  | { kind: 'editContact'; contactId: string }
  | { kind: 'addPayment' }
  | { kind: 'editPayment'; paymentId: string }
  | { kind: 'editVendor' }
export type VendorDetailsInitial = { tab?: VendorTab; drawer?: DrawerState; addNote?: boolean }

const TAB_PARAM: Record<string, VendorTab> = { bills: 'bills', payment: 'payment', 'payment-details': 'payment', contact: 'contact', 'contact-information': 'contact', notes: 'notes' }

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const PlusGlyph = () => <img src={plusIcon} alt="" className="size-4 brightness-0 invert" />

function TabButton({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className="group flex flex-col items-center gap-3">
      <span className="flex items-center gap-2">
        <span className={`text-base transition-colors ${active ? 'font-semibold text-[#111927]' : 'font-medium text-[#4b5563] group-hover:text-[#111927]'}`}>{label}</span>
        {count !== undefined && (
          <span className={`flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-[13px] font-medium ${active ? 'bg-[#111927] text-[#f5f6f8]' : 'bg-[#edeff2] text-[#4b5563]'}`}>{count}</span>
        )}
      </span>
      <span className={`h-[3px] w-full rounded-[2px] transition-colors ${active ? 'bg-[#111927]' : 'bg-transparent group-hover:bg-[#e1e4e9]'}`} />
    </button>
  )
}

function EmptyState({ title, body, action, onAction, bodyWidth = 322 }: { title: string; body: string; action: string; onAction: () => void; bodyWidth?: number }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-0">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center rounded-full bg-[#f2f2f2] p-[18px]">
          <span className="flex size-[30px] items-center justify-center">
            <img src={invoiceIcon} alt="" className="h-[26.875px] w-[21.875px]" />
          </span>
        </div>
        <div className="flex w-[440px] flex-col items-center gap-1 text-center">
          <p className="font-heading text-xl font-medium leading-7 tracking-[-0.2px] text-black">{title}</p>
          <p className="text-sm leading-5 text-[#555354]" style={{ maxWidth: bodyWidth }}>{body}</p>
        </div>
      </div>
      <HdsButton variant="primary" leadingIcon={<PlusGlyph />} onClick={onAction}>
        {action}
      </HdsButton>
    </div>
  )
}

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

/** Read-only HDS field (label + 44px input row) used on the contact cards. */
function ReadField({ label, children, select, className = '' }: { label: string; children: ReactNode; select?: boolean; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <p className="text-sm font-medium leading-5 text-[#111927]">{label}</p>
      <div className={`${inputRowClass()} h-11 hover:!border-[#edeff2] hover:!bg-[#f5f6f8]`}>
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {select && <Chevron className="size-4 text-[#6b7280]" />}
      </div>
    </div>
  )
}

function DrawerBody({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-col p-6">{children}</div>
}

function Modal({ open, onClose, children, className = '' }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#111927]/50" />
      <div role="dialog" aria-modal="true" className={`relative animate-[popIn_160ms_ease-out] ${className}`}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

function SuccessPanel({ title, body, primary, onPrimary, onDone, onClose }: { title: string; body: string; primary: string; onPrimary: () => void; onDone: () => void; onClose: () => void }) {
  return (
    <DrawerBody>
      <div className="flex justify-end pt-6">
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md transition-opacity hover:opacity-70">
          <img src={cancelSquare} alt="" className="size-6" />
        </button>
      </div>
      <div className="mt-[100px] flex flex-col items-center gap-6 text-center">
        <img src={contactAddedIllustration} alt="" className="h-40 w-[193px]" />
        <div className="flex flex-col items-center gap-1">
          <p className="font-heading text-xl font-semibold text-[#222121]">{title}</p>
          <p className="max-w-[380px] text-base text-[#555354]">{body}</p>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <HdsButton variant="primary" fullWidth onClick={onPrimary}>
          {primary}
        </HdsButton>
        <HdsButton variant="secondary" fullWidth onClick={onDone}>
          Done
        </HdsButton>
      </div>
    </DrawerBody>
  )
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function PaymentDetailsTab({ rows, onAdd, onEdit, onDelete }: { rows: PaymentMethod[]; onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = q ? rows.filter((r) => `${r.bankName} ${r.accountNumber} ${r.accountName} ${r.addedBy}`.toLowerCase().includes(q)) : rows

  if (rows.length === 0) {
    return <EmptyState title="No payment methods yet" body="Add a bank account so you can pay this vendor." action="Add payment method" onAction={onAdd} />
  }

  const th = 'bg-[#efefef] px-2.5 py-2 text-left text-sm font-medium text-[#525866]'
  const td = 'h-[62px] border-b border-[#efefef] py-3.5 pl-3 pr-5 text-sm text-[#222121]'
  const Stamp = ({ s }: { s: { date: string; time: string } }) => (
    <div className="flex flex-col">
      <span>{s.date}</span>
      <span className="text-[11px] leading-4 text-[#9aa1ac]">{s.time}</span>
    </div>
  )
  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-12 items-center justify-between">
        <HdsSearch value={query} onChange={setQuery} placeholder="Search by acct name, acct no., added by" className="w-[336px]" />
        <HdsButton variant="primary" leadingIcon={<PlusGlyph />} onClick={onAdd}>
          Add payment method
        </HdsButton>
      </div>
      <table className="w-[1051px] max-w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`${th} w-[183px] rounded-l-lg`}>Account</th>
            <th className={`${th} w-[214px]`}>Account name</th>
            <th className={`${th} w-[92px]`}>Currency</th>
            <th className={`${th} w-[130px]`}>Country</th>
            <th className={`${th} w-[130px]`}>Added by</th>
            <th className={`${th} w-[130px]`}>Date added</th>
            <th className={`${th} w-[130px]`}>Last update</th>
            <th className={`${th} w-[42px] rounded-r-lg`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr aria-hidden="true">
            <td colSpan={8} className="h-1 p-0" />
          </tr>
          {visible.map((row) => (
            <tr key={row.id}>
              <td className={`${td} whitespace-nowrap font-medium`}>
                <p>{row.bankName}</p>
                <p>{masked(row.accountNumber)}</p>
              </td>
              <td className={td}>{row.accountName}</td>
              <td className={td}>{CURRENCY[row.country] ?? 'USD'}</td>
              <td className={td}>{COUNTRY_SHORT[row.country] ?? row.country}</td>
              <td className={td}>{row.addedBy}</td>
              <td className={td}>
                <Stamp s={row.dateAdded} />
              </td>
              <td className={td}>
                <Stamp s={row.lastUpdate} />
              </td>
              <td className="h-[62px] border-b border-[#efefef] text-center">
                <HdsActionMenu
                  theme="light"
                  width={150}
                  items={[
                    { label: 'Edit details', icon: <img src={penIcon} alt="" className="size-[9.25px]" />, onSelect: () => onEdit(row.id) },
                    { label: 'Delete details', tone: 'danger', icon: <img src={deleteIcon} alt="" className="h-[10.75px] w-[10px]" />, onSelect: () => onDelete(row.id) },
                  ]}
                  trigger={({ open, toggle }) => <KebabTrigger open={open} toggle={toggle} label={`Actions for ${row.bankName} ${masked(row.accountNumber)}`} />}
                />
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={8} className="px-2.5 py-8 text-center">
                <p className="text-sm font-medium text-[#111927]">No payment methods found</p>
                <p className="text-xs text-[#6b7280]">Try a different search term.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ContactCard({ contact, onEdit }: { contact: Contact; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4">
      <div className="flex items-start justify-between border-b border-[#e5e7eb] pb-4">
        <p className="text-sm font-semibold leading-5 text-[#111927]">{contact.title}</p>
        <HdsButton variant="secondary" size="sm" shape="pill" className="!h-8" onClick={onEdit} trailingIcon={<img src={editTrailing} alt="" className="size-[14.3px]" />}>
          Edit
        </HdsButton>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ReadField label="Email">{contact.email}</ReadField>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-sm font-medium leading-5 text-[#111927]">Phone</p>
          <div className={`${inputRowClass()} h-11 hover:!border-[#edeff2] hover:!bg-[#f5f6f8]`}>
            <span className="flex items-center gap-1">
              <img src={flagUs} alt="" className="size-4" />
              <span>{contact.iso}</span>
              <Chevron className="size-4 text-[#6b7280]" />
            </span>
            <span className="h-5 w-px bg-[#e1e4e9]" />
            <span className="flex gap-1">
              <span className="text-[#9aa1ac]">+1</span>
              <span>{contact.phone}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ReadField label="Street address" className="col-span-2">
          {contact.address.street}
        </ReadField>
        <ReadField label="City">{contact.address.city}</ReadField>
        <ReadField label="State" select>
          {contact.address.state}
        </ReadField>
        <ReadField label="Zip code">{contact.address.zip}</ReadField>
        <ReadField label="Country" select>
          {contact.address.country}
        </ReadField>
      </div>
    </div>
  )
}

function ContactTab({ contacts, onAdd, onEdit }: { contacts: Contact[]; onAdd: () => void; onEdit: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#e5e7eb] p-[19px]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-6 text-[#111927]">Contact information</p>
          <p className="text-[13px] leading-5 text-[#6b7280]">This information is used for communication about bills, payments and account updates</p>
        </div>
        <HdsButton variant="primary" leadingIcon={<PlusGlyph />} onClick={onAdd}>
          Add new contact
        </HdsButton>
      </div>
      {contacts.map((c) => (
        <ContactCard key={c.id} contact={c} onEdit={() => onEdit(c.id)} />
      ))}
    </div>
  )
}

function NotesTab({ notes, onAdd, onDelete }: { notes: Note[]; onAdd: () => void; onDelete: (id: string) => void }) {
  if (notes.length === 0) {
    return <EmptyState title="No notes yet" body="Any notes added for this vendor will appear here" action="Add note" onAction={onAdd} />
  }
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e5e7eb] p-5">
      <div className="flex items-start justify-between">
        <p className="pt-1 text-base font-semibold leading-6 text-[#111927]">Notes ({notes.length})</p>
        <HdsButton variant="primary" leadingIcon={<PlusGlyph />} onClick={onAdd}>
          Add note
        </HdsButton>
      </div>
      {notes.map((note) => (
        <div key={note.id} className="flex min-h-[86px] items-start gap-[33px] rounded-xl border border-[#e3e8ef] bg-white p-4">
          <div className="flex w-[220px] shrink-0 flex-col gap-4">
            <p className="text-sm font-semibold leading-5 text-[#111927]">{note.author}</p>
            <p className="text-[11px] leading-4 text-[#6c737f]">{note.date}</p>
          </div>
          <p className="min-w-0 flex-1 break-words text-sm leading-5 text-[#111927]">{note.text}</p>
          {note.author === CURRENT_USER ? (
            <button
              type="button"
              aria-label="Delete note"
              onClick={() => onDelete(note.id)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#fde8ea] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#b4232e]/40"
            >
              <img src={trashIcon} alt="" className="h-[14.3px] w-[13.3px]" />
            </button>
          ) : (
            <span className="size-9 shrink-0" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drawers
// ---------------------------------------------------------------------------

function ContactForm({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: {
  title: string
  submitLabel: string
  initial: { email: string; iso: string; phone: string; address: string }
  onClose: () => void
  onSubmit: (v: { email: string; iso: string; phone: string; address: Address }) => void
}) {
  const [email, setEmail] = useState(initial.email)
  const [iso, setIso] = useState(initial.iso)
  const [phone, setPhone] = useState(initial.phone)
  const [address, setAddress] = useState(initial.address)
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const phoneOk = phone.replace(/\D/g, '').length >= 7
  const valid = emailOk && phoneOk && address !== ''
  const missing = !email.trim() ? 'an email' : !emailOk ? 'a valid email' : !phoneOk ? 'a phone number' : !address ? 'an address' : ''
  return (
    <DrawerBody>
      <ModalHeader title={title} onClose={onClose} />
      <div className="flex flex-1 flex-col gap-4">
        <HdsInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
        <KitPhoneInput label="Phone" iso={iso} onIsoChange={setIso} number={phone} onChange={setPhone} placeholder="(000) 000-0000" />
        <DisplaySelectField label="Address" placeholder="Select…" value={address} onChange={setAddress} options={ADDRESS_LABELS} />
      </div>
      {!valid && missing && (email || phone || address) && <p className="mb-2 mt-4 text-center text-xs text-[#6b7280]">Add {missing} to continue</p>}
      <HdsButton
        variant="primary"
        fullWidth
        className="mt-4"
        disabled={!valid}
        onClick={() => onSubmit({ email: email.trim(), iso, phone, address: ADDRESSES.find((a) => a.label === address) ?? ADDRESSES[0] })}
      >
        {submitLabel}
      </HdsButton>
    </DrawerBody>
  )
}

function PaymentFields({ v, set }: { v: PaymentForm; set: <K extends keyof PaymentForm>(k: K, val: PaymentForm[K]) => void }) {
  const bind = (k: Exclude<keyof PaymentForm, 'hasTaxId'>) => ({ value: v[k] as string, onChange: (val: string) => set(k, val) })
  return (
    <>
      <DisplayInputField label="Account name" {...bind('accountName')} placeholder="Enter account name" />
      <DisplaySelectField label="Account type" {...bind('accountType')} options={ACCOUNT_TYPE_OPTIONS} />
      <div className="flex w-full gap-4">
        <DisplayInputField className="flex-1" label="Account number" {...bind('accountNumber')} inputMode="numeric" placeholder="Enter account number" />
        <DisplayInputField className="flex-1" label="Bank name" {...bind('bankName')} placeholder="Enter bank name" />
      </div>
      <div className="flex w-full gap-4">
        <DisplayInputField className="flex-1" label="Routing number" {...bind('routingNumber')} inputMode="numeric" placeholder="Enter routing number" />
        <DisplayInputField className="flex-1" label="SWIFT/BIC" {...bind('swift')} placeholder="Enter SWIFT/BIC" />
      </div>
      <DisplayInputField label="Address line 1" {...bind('address')} placeholder="Enter address" />
      <DisplaySelectField label="State" placeholder="Select…" {...bind('state')} options={US_STATE_OPTIONS} />
      <div className="flex w-full gap-4">
        <DisplayInputField className="flex-1" label="City" {...bind('city')} placeholder="Enter city" />
        <DisplayInputField className="flex-1" label="Zip code" {...bind('zip')} placeholder="Enter Zip code" />
      </div>
    </>
  )
}

const COUNTRY_FLAG_SRC: Record<string, string> = { 'United States of America': FLAGS.US, 'United Kingdom': FLAGS.GB, Canada: FLAGS.CA, Germany: FLAGS.DE }
/** Country options for the empty Add-payment step — no placeholder flag until a country is picked (Figma 48069:433002). */
const COUNTRY_SELECT_OPTIONS = COUNTRY_OPTIONS.map((c) => ({ value: c, label: c, icon: <Flag src={COUNTRY_FLAG_SRC[c]} /> }))

const paymentValid = (v: PaymentForm) => isFilled(v.country, v.accountName, v.accountType, v.accountNumber, v.bankName, v.routingNumber, v.swift, v.address, v.state, v.city, v.zip)
const paymentMissing = (v: PaymentForm) => {
  const labels: [keyof PaymentForm, string][] = [
    ['accountName', 'account name'],
    ['accountNumber', 'account number'],
    ['bankName', 'bank name'],
    ['routingNumber', 'routing number'],
    ['swift', 'SWIFT/BIC'],
    ['address', 'address'],
    ['state', 'state'],
    ['city', 'city'],
    ['zip', 'zip code'],
  ]
  const missing = labels.filter(([k]) => !String(v[k]).trim()).map(([, l]) => l)
  return missing.length === 0 ? '' : missing.length === 1 ? `Add the ${missing[0]} to continue` : `${missing.length} fields left to fill`
}

function usePaymentForm(initial: PaymentForm) {
  const [v, setV] = useState(initial)
  const set = useCallback(<K extends keyof PaymentForm>(k: K, val: PaymentForm[K]) => setV((f) => ({ ...f, [k]: val })), [])
  return { v, set, setV }
}

function AddPaymentMethodFlow({ onClose, onSubmit }: { onClose: () => void; onSubmit: (v: PaymentForm) => void }) {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form')
  const { v, set, setV } = usePaymentForm(EMPTY_PAYMENT)
  const valid = paymentValid(v)
  const touched = isFilled(v.accountName) || isFilled(v.accountNumber) || isFilled(v.bankName)

  if (step === 'success') {
    return (
      <SuccessPanel
        title="Payment method added"
        body="The bank account has been added to this vendor. You can now use it for payments."
        primary="Add another payment method"
        onPrimary={() => {
          setV(EMPTY_PAYMENT)
          setStep('form')
        }}
        onDone={onClose}
        onClose={onClose}
      />
    )
  }

  if (step === 'review') {
    return (
      <DrawerBody>
        <BackLink onClick={() => setStep('form')} />
        <p className="mb-6 font-heading text-2xl font-semibold text-[#111927]">Review</p>
        <div className="flex flex-col gap-4">
          <ReviewCard title="Account information" editLabel="Edit" onEdit={() => setStep('form')}>
            <DetailRow label="Account name" value={v.accountName} />
            <DetailRow label="Account type" value={v.accountType} />
            <DetailRow label="Account number" value={masked(v.accountNumber)} />
            <DetailRow label="Bank name" value={v.bankName} />
            <DetailRow label="Routing number" value={v.routingNumber} />
            <DetailRow label="SWIFT/BIC" value={v.swift} />
          </ReviewCard>
          <ReviewCard title="Billing address" editLabel="Edit" onEdit={() => setStep('form')}>
            <DetailRow label="Street address" value={v.address} />
            <DetailRow label="City" value={v.city} />
            <DetailRow label="Zip code" value={v.zip} />
            <DetailRow label="Country" value={v.country} />
          </ReviewCard>
        </div>
        <HdsButton
          variant="primary"
          fullWidth
          className="mt-[146px]"
          onClick={() => {
            onSubmit(v)
            setStep('success')
          }}
        >
          Add payment method
        </HdsButton>
      </DrawerBody>
    )
  }

  return (
    <DrawerBody>
      <ModalHeader title="Add payment method" onClose={onClose} />
      <div className="flex flex-1 flex-col gap-4">
        <KitSelect
          label="Country"
          placeholder="Select…"
          value={v.country || null}
          onChange={(c) => set('country', c)}
          options={COUNTRY_SELECT_OPTIONS}
          helper={v.country ? "Where the vendor's account is held" : undefined}
        />
        {v.country && (
          <>
            <PaymentFields v={v} set={set} />
            <HdsSwitch label="This vendor has a tax ID" checked={v.hasTaxId} onChange={(c) => set('hasTaxId', c)} />
            {v.hasTaxId && <DisplayInputField label="Tax identification number" value={v.taxId} onChange={(t) => set('taxId', t)} placeholder="Enter tax ID" helper="Optional" />}
          </>
        )}
      </div>
      {v.country && !valid && touched && <p className="mt-4 text-center text-xs text-[#6b7280]">{paymentMissing(v)}</p>}
      <HdsButton variant="primary" fullWidth className="mt-4" disabled={!valid} onClick={() => setStep('review')}>
        Review details
      </HdsButton>
    </DrawerBody>
  )
}

function EditPaymentMethodForm({ method, onClose, onSave, onDelete }: { method: PaymentMethod; onClose: () => void; onSave: (v: PaymentForm) => void; onDelete: () => void }) {
  const { v, set } = usePaymentForm(method)
  const valid = paymentValid(v)
  return (
    <DrawerBody>
      <ModalHeader title="Edit payment method" subtitle="Update the details for this payment method." onClose={onClose} />
      <div className="flex flex-col gap-4">
        <DisplaySelectField label="Country" value={v.country} onChange={(c) => set('country', c)} options={COUNTRY_OPTIONS} flag helper="Where the vendor's account is held" />
        <PaymentFields v={v} set={set} />
      </div>
      {!valid && <p className="mt-4 text-center text-xs text-[#6b7280]">{paymentMissing(v)}</p>}
      <div className="mt-6 flex flex-col gap-4">
        <HdsButton variant="primary" fullWidth disabled={!valid} onClick={() => onSave(v)}>
          Save changes
        </HdsButton>
        <HdsButton variant="destructive-secondary" fullWidth onClick={onDelete}>
          Delete payment method
        </HdsButton>
      </div>
    </DrawerBody>
  )
}

function EditVendorForm({ vendor, onClose, onSave }: { vendor: VendorRecord; onClose: () => void; onSave: (v: Partial<VendorRecord>) => void }) {
  const [type, setType] = useState<VendorRecord['type']>(vendor.type)
  const [name, setName] = useState(vendor.name)
  const [description, setDescription] = useState(vendor.description)
  const [category, setCategory] = useState(vendor.category)
  const [taxId, setTaxId] = useState(vendor.taxId)
  const options = CATEGORY_OPTIONS.includes(vendor.category) ? CATEGORY_OPTIONS : [vendor.category, ...CATEGORY_OPTIONS]
  const valid = isFilled(name, category)
  return (
    <DrawerBody>
      <ModalHeader title="Edit vendor" subtitle="Update this vendor's profile details." onClose={onClose} />
      <div className="flex flex-1 flex-col gap-4">
        <HdsToggleSegment
          className="flex w-full [&>button]:flex-1"
          options={[
            { value: 'Individual', label: 'Individual' },
            { value: 'Business', label: 'Business' },
          ]}
          value={type}
          onChange={setType}
        />
        <HdsInput label={type === 'Business' ? 'Business name' : 'Full name'} value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'Business' ? 'Enter business name' : 'Enter full name'} />
        <HdsInput label="Description" optional value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this vendor provide?" />
        <DisplaySelectField label="Category" value={category} onChange={setCategory} options={options} helper="Pre-fills on every bill." />
        <HdsInput label="Tax identification number" optional value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Enter tax ID" />
      </div>
      <HdsButton variant="primary" fullWidth className="mt-4" disabled={!valid} onClick={() => onSave({ type, name: name.trim(), description: description.trim(), category, taxId: taxId.trim() })}>
        Save changes
      </HdsButton>
    </DrawerBody>
  )
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------

const NOTE_MAX = 120

function AddNoteModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (text: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => {
    if (open) setNote('')
  }, [open])
  return (
    <Modal open={open} onClose={onClose} className="flex w-[657px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <div className="flex flex-col gap-1.5 px-[22px] pb-3.5 pt-5">
        <p className="text-lg font-semibold leading-7 text-[#111927]">Add note</p>
        <p className="text-sm text-[#4b5563]">Add an internal note information you want to keep with this vendor.</p>
      </div>
      <div className="px-[22px] pb-5 pt-2">
        <HdsTextarea
          label="Note"
          value={note}
          maxChars={NOTE_MAX}
          rows={6}
          autoFocus
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Preferred payment terms, contact updates, or internal context"
          className="min-h-[121px]"
        />
      </div>
      <div className="flex items-center justify-end gap-2.5 border-t border-[#eff2f4] px-[22px] py-3.5">
        <HdsButton variant="secondary" shape="pill" onClick={onClose}>
          Cancel
        </HdsButton>
        <HdsButton variant="primary" shape="pill" disabled={note.trim().length === 0} onClick={() => onAdd(note.trim())}>
          Add note
        </HdsButton>
      </div>
    </Modal>
  )
}

function DeletePaymentModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onCancel} className="flex w-[483px] flex-col overflow-hidden rounded-[31px] shadow-2xl">
      <div className="relative h-[330px] w-full shrink-0" style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(180,35,46) 30%, rgb(255,255,255) 100%)' }}>
        <button type="button" aria-label="Close" onClick={onCancel} className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <img src={closeX} alt="" className="size-8" />
        </button>
        <div className="absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
          <img src={deleteCircleIcon} alt="" className="size-[29px]" />
        </div>
      </div>
      <div className="flex flex-col gap-8 bg-white p-8">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#111927]">Delete payment method?</p>
          <p className="text-base text-[#4b5563]">This vendor payment method will no longer be available for future payment</p>
        </div>
        <div className="flex gap-2">
          <HdsButton variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
            Cancel
          </HdsButton>
          <HdsButton variant="primary" size="lg" className="flex-1" onClick={onConfirm}>
            Delete
          </HdsButton>
        </div>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function VendorDetailsView({ vendorId, initial = {}, forceEmpty }: { vendorId?: string | null; initial?: VendorDetailsInitial; forceEmpty?: boolean }) {
  const navigate = useNavigate()
  const back = useGoBack('/vendors')
  // Status (and vendors added from the list) come from the shared vendor store, so list actions show up here.
  const listRow = useVendorStore().rows.find((r) => r.id === vendorId)
  const base: VendorRecord =
    VENDOR_DETAILS.find((v) => v.id === vendorId) ??
    (listRow
      ? { id: listRow.id, name: listRow.name, description: listRow.category, type: listRow.type, category: listRow.category, taxId: '—', added: listRow.dateCreated, updated: listRow.dateCreated, status: listRow.status, empty: true }
      : VENDOR_DETAILS[0])
  const empty = forceEmpty || !!base.empty

  const [vendor, setVendor] = useState(base)
  const [tab, setTab] = useState<VendorTab>(initial.tab ?? 'bills')
  const [payments, setPayments] = useState(() => seedPayments(base.id === 'aws' ? 'Amazon Web Services, Inc.' : base.name))
  const [contacts, setContacts] = useState(seedContacts)
  const [notes, setNotes] = useState<Note[]>(() => (empty ? [] : AWS_NOTES.map((n, i) => ({ id: `n-${i}`, author: n.author, date: n.date, text: n.text }))))
  const [drawer, setDrawer] = useState<DrawerState | null>(initial.drawer ?? null)
  const [drawerOpen, setDrawerOpen] = useState(!!initial.drawer)
  const [drawerKey, setDrawerKey] = useState(0)
  const [noteOpen, setNoteOpen] = useState(!!initial.addNote)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, showToast] = useToast()
  const contactSeq = useRef(3)

  const openDrawer = (d: DrawerState) => {
    setDrawer(d)
    setDrawerKey((k) => k + 1)
    setDrawerOpen(true)
  }
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const addPayment = (v: PaymentForm) => {
    const stamp = nowStamp()
    setPayments((p) => [...p, { ...v, id: `pm-${Date.now()}`, addedBy: CURRENT_USER, dateAdded: stamp, lastUpdate: stamp }])
  }
  const confirmDelete = () => {
    setPayments((p) => p.filter((x) => x.id !== deleteId))
    setDeleteId(null)
    showToast('Payment method deleted')
  }

  const editingContact = drawer?.kind === 'editContact' ? contacts.find((c) => c.id === drawer.contactId) : undefined
  const editingPayment = drawer?.kind === 'editPayment' ? payments.find((p) => p.id === drawer.paymentId) : undefined

  let drawerContent: ReactNode = null
  if (drawer?.kind === 'addContact') {
    drawerContent =
      drawer.step === 'success' ? (
        <SuccessPanel
          title="Contact added"
          body="The vendor’s contact details have been saved successfully."
          primary="Add another contact"
          onPrimary={() => openDrawer({ kind: 'addContact', step: 'form' })}
          onDone={closeDrawer}
          onClose={closeDrawer}
        />
      ) : (
        <ContactForm
          title="Add new contact details"
          submitLabel="Add contact detail"
          initial={drawer.prefill ? { email: 'account@northwind.com', iso: 'US', phone: '(555) 040-3283', address: ADDRESSES[1].label } : { email: '', iso: 'US', phone: '', address: '' }}
          onClose={closeDrawer}
          onSubmit={(c) => {
            const n = contactSeq.current++
            setContacts((list) => [...list, { id: `c-${n}`, title: `Additional contact${list.length > 2 ? ` ${list.length - 1}` : ''}`, ...c }])
            setDrawer({ kind: 'addContact', step: 'success' })
          }}
        />
      )
  } else if (drawer?.kind === 'editContact' && editingContact) {
    drawerContent = (
      <ContactForm
        title="Edit contact details"
        submitLabel="Save changes"
        initial={{ email: editingContact.email, iso: editingContact.iso, phone: editingContact.phone, address: editingContact.address.label }}
        onClose={closeDrawer}
        onSubmit={(c) => {
          setContacts((list) => list.map((x) => (x.id === editingContact.id ? { ...x, ...c } : x)))
          closeDrawer()
          showToast('Contact details updated')
        }}
      />
    )
  } else if (drawer?.kind === 'addPayment') {
    drawerContent = <AddPaymentMethodFlow onClose={closeDrawer} onSubmit={addPayment} />
  } else if (drawer?.kind === 'editPayment' && editingPayment) {
    drawerContent = (
      <EditPaymentMethodForm
        method={editingPayment}
        onClose={closeDrawer}
        onSave={(v) => {
          setPayments((list) => list.map((x) => (x.id === editingPayment.id ? { ...x, ...v, lastUpdate: nowStamp() } : x)))
          closeDrawer()
          showToast('Payment method updated')
        }}
        onDelete={() => {
          closeDrawer()
          setDeleteId(editingPayment.id)
        }}
      />
    )
  } else if (drawer?.kind === 'editVendor') {
    drawerContent = (
      <EditVendorForm
        vendor={vendor}
        onClose={closeDrawer}
        onSave={(patch) => {
          const d = new Date()
          setVendor((v) => ({ ...v, ...patch, updated: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }))
          closeDrawer()
          showToast('Vendor details saved')
        }}
      />
    )
  }

  const initials = vendor.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6 pb-10 pt-[41px]">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <button type="button" onClick={back} className="flex items-center gap-2 rounded-full">
            <span className="flex size-4 items-center justify-center">
              <img src={chevronLeft} alt="" className="h-[9px] w-[5px]" />
            </span>
            <span className="text-sm font-semibold text-[#111927]">Vendors</span>
          </button>
          <HdsButton variant="secondary" size="sm" className="!px-4 !text-sm" onClick={() => openDrawer({ kind: 'editVendor' })} leadingIcon={<img src={editPencil} alt="" className="size-[12.7px]" />}>
            Edit vendor
          </HdsButton>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black">
            {vendor.logo ? (
              // Figma crops the supplied reference image: 1120.8×754.8 placed at (-205.2, -98.4) inside the 72px tile.
              <img src={vendor.logo} alt={vendor.name} className="absolute left-[-205.2px] top-[-98.4px] h-[754.8px] w-[1120.8px] max-w-none object-cover" />
            ) : (
              <span className="font-heading text-2xl font-semibold text-white">{initials}</span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="truncate font-heading text-[28px] font-semibold leading-9 tracking-[-0.42px] text-[#111927]">{vendor.name}</h1>
                <Badge status={STATUS_BADGE[listRow?.status ?? vendor.status]} label={listRow?.status ?? vendor.status} />
              </div>
              <p className="text-[13px] leading-5 text-[#6b7280]">{vendor.description || vendor.category}</p>
            </div>
            <div className="flex items-start gap-2 whitespace-nowrap text-[13px] leading-5">
              <div className="flex flex-col gap-2 border-r-[0.5px] border-[#d2d6db] pr-2">
                <p className="font-medium text-[#384250]">{vendor.type}</p>
                <p className="text-[#6b7280]">{vendor.category}</p>
              </div>
              <div className="flex flex-col gap-2 border-r-[0.5px] border-[#d2d6db] pr-2">
                <p className="font-medium text-[#384250]">Added</p>
                <p className="text-[#6b7280]">{vendor.added}</p>
              </div>
              <div className="flex flex-col gap-2 pr-2">
                <p className="font-medium text-[#384250]">Updated</p>
                <p className="text-[#6b7280]">{vendor.updated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div role="tablist" className="flex items-end gap-8 border-b border-[#edeff2]">
          <TabButton active={tab === 'bills'} label="Bills" onClick={() => setTab('bills')} />
          <TabButton active={tab === 'payment'} label="Payment details" count={payments.length} onClick={() => setTab('payment')} />
          <TabButton active={tab === 'contact'} label="Contact information" onClick={() => setTab('contact')} />
          <TabButton active={tab === 'notes'} label="Notes" onClick={() => setTab('notes')} />
        </div>

        <div role="tabpanel">
          {tab === 'bills' &&
            (empty ? (
              <EmptyState title="No bills yet" body="Create a bill to start tracking what’s due and awaiting payment." action="Add bill" bodyWidth={232} onAction={() => navigate('/bills/add/manual-entry-empty')} />
            ) : (
              <AwsBillsTabContent />
            ))}
          {tab === 'payment' && (
            <PaymentDetailsTab rows={payments} onAdd={() => openDrawer({ kind: 'addPayment' })} onEdit={(id) => openDrawer({ kind: 'editPayment', paymentId: id })} onDelete={setDeleteId} />
          )}
          {tab === 'contact' && <ContactTab contacts={contacts} onAdd={() => openDrawer({ kind: 'addContact', step: 'form' })} onEdit={(id) => openDrawer({ kind: 'editContact', contactId: id })} />}
          {tab === 'notes' && (
            <NotesTab
              notes={notes}
              onAdd={() => setNoteOpen(true)}
              onDelete={(id) => {
                setNotes((n) => n.filter((x) => x.id !== id))
                showToast('Note deleted')
              }}
            />
          )}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <div key={drawerKey} className="h-full">
          {drawerContent}
        </div>
      </Drawer>
      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onAdd={(text) => {
          setNotes((n) => [{ id: `n-${Date.now()}`, author: CURRENT_USER, date: noteStamp(), text }, ...n])
          setNoteOpen(false)
          showToast('Note added')
        }}
      />
      <DeletePaymentModal open={deleteId !== null} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
      {toast}
    </div>
  )
}

/** Wrapper for the per-state routes: renders the unified page in a given initial state. */
export function VendorDetailsScreen({ initial }: { initial: VendorDetailsInitial }) {
  return (
    <AppShell>
      <VendorDetailsView vendorId="aws" initial={initial} />
    </AppShell>
  )
}

/** Canonical route: /vendors/detail?id=<vendorId>&tab=<bills|payment|contact|notes>&empty=1&edit=1 (edit opens the Edit vendor drawer) */
export default function VendorDetails() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const tab = TAB_PARAM[params.get('tab') ?? ''] ?? 'bills'
  const forceEmpty = params.get('empty') === '1'
  const edit = params.get('edit') === '1'
  const initial = useMemo<VendorDetailsInitial>(() => ({ tab, drawer: edit ? { kind: 'editVendor' } : undefined }), [tab, edit])
  return (
    <AppShell>
      <VendorDetailsView key={`${id}-${forceEmpty}-${edit}`} vendorId={id} initial={initial} forceEmpty={forceEmpty} />
    </AppShell>
  )
}
