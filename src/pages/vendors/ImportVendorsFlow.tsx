import { useRef, useState, type DragEvent } from 'react'
import { Chevron, HdsAlert, HdsBadge } from '../../components/ui/hds'
import { KitSelect, VENDOR_TYPE_OPTIONS } from '../bills2/hdsKit'
import type { VendorType } from './shared'
import {
  BackHeader,
  CategoryField,
  ContactFields,
  CountryField,
  DrawerBody,
  EMPTY_DRAFT,
  FORM_CATEGORY_OPTIONS,
  FORM_COUNTRY_OPTIONS,
  FlowDrawer,
  FormSection,
  NameFields,
  PaymentFields,
  SubmitFooter,
  errorsFor,
  missingFields,
  useClosingDrawer,
  vendorDisplayName,
  type DraftKey,
  type VendorDraft,
} from './vendorFormKit'

import iconTemplateDoc from '../../assets/icons/importvendors-template-doc.svg'
import iconDownload from '../../assets/icons/importvendors-download.svg'
import iconUpload from '../../assets/icons/importvendors-upload.svg'
import iconFileDoc from '../../assets/icons/vendors-icon-file-doc.svg'
import iconRemoveUpload from '../../assets/icons/vendors-icon-remove-upload.svg'
import iconTrash from '../../assets/icons/vendors-icon-trash.svg'

// Add vendor — import CSV. Figma 48069:424941:
// 48069:427079 empty (template + upload box) → 48069:427428 parsed rows → 48069:427823 row expanded →
// 48069:428238 vendor details open → 48069:429082 all sections open → 48069:428658 "Row needs your attention".

/* ---------------------------------------------------------------------- */
/*  CSV template / parsing                                                 */
/* ---------------------------------------------------------------------- */

const COLUMNS = [
  'type',
  'first_name',
  'last_name',
  'business_name',
  'category',
  'email',
  'phone',
  'address',
  'country',
  'account_name',
  'account_type',
  'account_number',
  'bank_name',
  'routing_number',
  'swift_bic',
  'street_address',
  'city',
  'state',
  'zip_code',
  'mobile_operator',
  'mobile_number',
  'tax_id',
] as const

const TEMPLATE_ROWS = [
  ['Individual', 'Joleen', 'Freeman', '', 'Software', 'account@northwind.com', '(555) 040-3283', '15 Maplewood Drive, Austin, TX 78704', 'United States of America', 'Joleen Freeman', 'Checking', '4350437854', 'Chase Bank', '123243424', 'TESTUS33XXX', 'No, 131 Wall Street, NY', 'New York City', 'New York', '10001', '', '', 'GB123456789'],
  ['Business', '', '', 'Meridian Legal Partners', 'Professional services', 'facturen@kairo.nl', '', '', 'Nigeria', '', '', '0123243424', 'Access Bank', '', '', '', '', '', '', '', '', ''],
]

const SAMPLE_ROWS: Record<string, string>[] = [
  { name: 'Joleen Freeman', type: 'Individual', first_name: '', last_name: 'Freeman', category: 'Software', email: 'account@northwind.com', phone: '(555) 040-3283', address: '15 Maplewood Drive, Austin, TX 78704', country: 'United States of America', account_name: 'Northwind Studio Ltd', account_type: 'Checking', account_number: '4350437854', bank_name: 'Chase Bank', routing_number: '123243424', swift_bic: 'TESTUS33XXX', street_address: 'No, 131 Wall Street, NY', city: 'New York City', state: 'New York', zip_code: '10001', tax_id: 'GB123456789' },
  { type: 'Business', business_name: 'Northwind Design Ltd', category: 'Professional services', email: 'billing@ridgeline.io', country: 'United States of America', account_name: 'Northwind Design Ltd', account_type: 'Checking', account_number: '9921004471', bank_name: 'Wells Fargo', routing_number: '121000248', street_address: '15 Market Lane', city: 'Austin', state: 'Texas', zip_code: '78704' },
  { type: 'Business', business_name: 'Meridian Legal Partners', category: 'Professional services', email: 'facturen@kairo.nl', country: 'Nigeria', account_number: '0123243424', bank_name: 'Access Bank' },
  { type: 'Business', business_name: 'Acme Print Co', category: 'Equipment', email: 'accounts@meridian.sg', country: 'Kenya', mobile_operator: 'M-Pesa', mobile_number: '+254712345678' },
  { name: 'Alice Mitchell', type: 'Individual', first_name: '', last_name: 'Micheal', category: 'Logistics', email: 'facturen@kairo.nl', country: 'Nigeria', account_number: '2234567890', bank_name: 'GTBank' },
  { type: 'Business', business_name: 'Figma', category: 'Marketing', email: 'accounts@meridian.sg', country: 'United States of America', account_name: 'Figma Inc', account_type: 'Business current', account_number: '7781203398', bank_name: 'Silicon Valley Bank', routing_number: '121140399', street_address: '760 Market Street', city: 'San Francisco', state: 'California', zip_code: '94102' },
]

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const toCsv = (header: readonly string[], rows: string[][]) => [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n'

export function downloadVendorTemplate() {
  const blob = new Blob([toCsv(COLUMNS, TEMPLATE_ROWS)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'hinstantt-vendor-template.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

const ALIASES: Record<string, string> = {
  vendor_type: 'type',
  firstname: 'first_name',
  lastname: 'last_name',
  company: 'business_name',
  company_name: 'business_name',
  vendor_name: 'name',
  full_name: 'name',
  email_address: 'email',
  phone_number: 'phone',
  bank: 'bank_name',
  swift: 'swift_bic',
  bic: 'swift_bic',
  sort_code: 'routing_number',
  routing: 'routing_number',
  street: 'street_address',
  zip: 'zip_code',
  postal_code: 'zip_code',
  postcode: 'zip_code',
  tax_identification_number: 'tax_id',
}
const normKey = (h: string) => {
  const k = h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return ALIASES[k] ?? k
}
const matchOption = (v: string, options: { value: string }[]) => options.find((o) => o.value.toLowerCase() === v.trim().toLowerCase())?.value ?? v.trim()
const normCountry = (v: string) => {
  const t = v.trim().toLowerCase()
  if (['us', 'usa', 'united states', 'united states of america'].includes(t)) return 'United States of America'
  if (['uk', 'gb', 'great britain'].includes(t)) return 'United Kingdom'
  return matchOption(v, FORM_COUNTRY_OPTIONS)
}

export type ImportRow = { id: string; label: string; draft: VendorDraft }

export function recordToRow(rec: Record<string, string>, i: number): ImportRow {
  const g = (k: string) => (rec[k] ?? '').trim()
  let first = g('first_name')
  let last = g('last_name')
  const business = g('business_name')
  const rawType = g('type').toLowerCase()
  const type: VendorType = rawType.startsWith('ind') ? 'Individual' : rawType.startsWith('bus') ? 'Business' : business ? 'Business' : first || last ? 'Individual' : 'Business'
  const name = g('name')
  if (type === 'Individual' && !first && !last && name) [first, last] = [name.split(/\s+/)[0], name.split(/\s+/).slice(1).join(' ')]
  const draft: VendorDraft = {
    ...EMPTY_DRAFT,
    type,
    firstName: first,
    lastName: last,
    businessName: business || (type === 'Business' ? name : ''),
    category: g('category') ? matchOption(g('category'), FORM_CATEGORY_OPTIONS) : '',
    country: g('country') ? normCountry(g('country')) : '',
    accountName: g('account_name'),
    accountType: g('account_type'),
    accountNumber: g('account_number'),
    bankName: g('bank_name'),
    routingNumber: g('routing_number'),
    swift: g('swift_bic').toUpperCase(),
    street: g('street_address'),
    city: g('city'),
    state: g('state'),
    zip: g('zip_code'),
    mobileOperator: g('mobile_operator'),
    mobileNumber: g('mobile_number'),
    hasTaxId: !!g('tax_id'),
    taxId: g('tax_id'),
    email: g('email'),
    phone: g('phone'),
    address: g('address'),
  }
  return { id: `row-${i}-${Math.random().toString(36).slice(2, 7)}`, label: name || vendorDisplayName(draft) || `Row ${i + 1}`, draft }
}

export function rowsFromCsv(text: string): ImportRow[] {
  const [header, ...body] = parseCsv(text)
  if (!header) return []
  const keys = header.map(normKey)
  const known = keys.filter((k) => (COLUMNS as readonly string[]).includes(k) || k === 'name')
  if (known.length < 2) return []
  return body.map((cells, i) => recordToRow(Object.fromEntries(keys.map((k, j) => [k, cells[j] ?? ''])), i))
}

const SAMPLE_CSV = () => {
  const header = ['name', ...COLUMNS]
  return toCsv(header, SAMPLE_ROWS.map((r) => header.map((h) => r[h] ?? '')))
}

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

/* ---------------------------------------------------------------------- */
/*  Drawer + panel                                                         */
/* ---------------------------------------------------------------------- */

export function ImportVendorsDrawer({ onClose, onDone, onBack }: { onClose: () => void; onDone: (count: number) => void; onBack?: () => void }) {
  const { open, close } = useClosingDrawer(onClose)
  return (
    <FlowDrawer open={open} onClose={close}>
      <ImportVendorsPanel onBack={onBack ?? close} onDone={(count) => setTimeout(() => onDone(count), 0)} />
    </FlowDrawer>
  )
}

type Sections = { vendor: boolean; payment: boolean; contact: boolean }
type UiState = { open: boolean; sections: Sections }

export function ImportVendorsPanel({ onBack, onDone }: { onBack: () => void; onDone: (count: number) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'ready'>('idle')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [ui, setUi] = useState<Record<string, UiState>>({})
  const [submitting, setSubmitting] = useState(false)
  const loadToken = useRef(0)

  const load = (name: string, size: number, text: string) => {
    const token = ++loadToken.current
    setError('')
    setFile({ name, size })
    setStatus('uploading')
    setRows([])
    window.setTimeout(() => {
      if (token !== loadToken.current) return
      const parsed = rowsFromCsv(text)
      if (parsed.length === 0) {
        setFile(null)
        setStatus('idle')
        setError("We couldn't find any vendors in this file. Use the template's column headers and try again.")
        return
      }
      // Open the first row that needs attention on the section holding its first problem (Figma 48069:428658).
      const nextUi: Record<string, UiState> = {}
      let opened = false
      for (const r of parsed) {
        const miss = missingFields(r.draft)
        const shouldOpen = !opened && miss.length > 0
        if (shouldOpen) opened = true
        nextUi[r.id] = { open: shouldOpen, sections: shouldOpen ? sectionsFor(miss.map((m) => m.key)) : { vendor: false, payment: false, contact: false } }
      }
      setRows(parsed)
      setUi(nextUi)
      setStatus('ready')
    }, 700)
  }

  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') return setError('Upload a CSV or XLSX file.')
    if (f.size > 10 * 1024 * 1024) return setError('This file is larger than 10MB.')
    if (ext !== 'csv') return setError('Excel files can’t be read in this prototype — save the sheet as CSV (File › Save as › CSV) and upload that.')
    f.text().then((t) => load(f.name, f.size, t))
  }

  const loadSample = () => {
    const text = SAMPLE_CSV()
    load('vendor_list.csv', 1.2 * 1024 * 1024, text)
  }

  const removeFile = () => {
    loadToken.current++
    setFile(null)
    setStatus('idle')
    setRows([])
    setUi({})
    if (input.current) input.current.value = ''
  }

  const updateRow = (id: string, patch: Partial<VendorDraft>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, draft: { ...r.draft, ...patch } } : r)))
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id))
  // Expanding a row that needs attention opens the sections holding its problems.
  const toggleRow = (id: string) =>
    setUi((u) => {
      const cur = u[id] ?? { open: false, sections: { vendor: false, payment: false, contact: false } }
      const row = rows.find((r) => r.id === id)
      const anyOpen = cur.sections.vendor || cur.sections.payment || cur.sections.contact
      const sections = !cur.open && !anyOpen && row ? sectionsFor(missingFields(row.draft).map((m) => m.key)) : cur.sections
      return { ...u, [id]: { open: !cur.open, sections } }
    })
  const toggleSection = (id: string, key: keyof Sections) => setUi((u) => ({ ...u, [id]: { ...u[id], sections: { ...u[id].sections, [key]: !u[id].sections[key] } } }))

  const invalidCount = rows.filter((r) => missingFields(r.draft).length > 0).length
  const canSubmit = status === 'ready' && rows.length > 0 && invalidCount === 0
  const hint =
    status !== 'ready'
      ? ''
      : rows.length === 0
        ? 'Every row was removed — upload another file to continue'
        : invalidCount > 0
          ? `${invalidCount} ${invalidCount === 1 ? 'row needs' : 'rows need'} your attention`
          : ''

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      onDone(rows.length)
    }, 900)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onFiles(e.dataTransfer.files)
  }

  return (
    <DrawerBody
      scrollKey="import"
      footer={file ? <SubmitFooter label="Submit for approval" enabled={canSubmit} loading={submitting} hint={hint} onClick={submit} /> : undefined}
    >
      <BackHeader title="Import vendors" subtitle="Upload a CSV or Excel file to create several vendors at once." onBack={onBack} />
      <input ref={input} type="file" accept=".csv,.xlsx,.xls,text/csv" className="hidden" onChange={(e) => onFiles(e.target.files)} />

      {!file ? (
        <div className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3 rounded-[10px] bg-[#f5f6f8] py-4 pl-4 pr-3.5">
            <span className="relative size-[18px] shrink-0">
              <span className="absolute inset-[5.21%_13.54%]">
                <img src={iconTemplateDoc} alt="" className="absolute inset-0 block size-full max-w-none" />
              </span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-sm font-semibold leading-5 text-[#111927]">Use our template</p>
              <p className="text-[13px] leading-5 text-[#6b7280]">All fields are required.</p>
              <button type="button" onClick={downloadVendorTemplate} className="flex h-6 w-fit items-center gap-2 text-sm font-semibold leading-5 text-[#004b87] hover:underline">
                <span className="relative size-4">
                  <span className="absolute inset-[14.58%_12.5%]">
                    <img src={iconDownload} alt="" className="absolute inset-0 block size-full max-w-none" />
                  </span>
                </span>
                Download template
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex h-[152px] w-full flex-col items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-dashed px-6 py-7 transition-colors ${
              dragging ? 'border-[#004b87] bg-[#eaf2f9]' : 'border-[#cbd0d8] bg-[#f5f6f8] hover:border-[#004b87]'
            }`}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
              <span className="relative size-4">
                <span className="absolute inset-[8.33%_8.33%_8.32%_8.33%]">
                  <img src={iconUpload} alt="" className="absolute inset-0 block size-full max-w-none" />
                </span>
              </span>
            </span>
            <span className="text-sm font-medium leading-5 text-[#111927]">Click to upload or drag and drop</span>
            <span className="text-[11px] leading-4 text-[#6b7280]">CSV or XLSX, up to 10MB</span>
          </button>

          {error && (
            <HdsAlert tone="red" title="We couldn't use that file">
              {error}
            </HdsAlert>
          )}

          <p className="text-xs leading-4 text-[#6b7280]">
            No file to hand?{' '}
            <button type="button" onClick={loadSample} className="font-semibold text-[#004b87] hover:underline">
              Try a sample file
            </button>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium leading-5 text-[#111927]">Upload CSV</p>
            <div className="flex w-full items-center gap-3 rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edeff2]">
                <img src={iconFileDoc} alt="" className="h-[14.33px] w-[11.67px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-medium text-[#212121]">{file.name}</p>
                <p className="text-[11px] text-[#6b7280]">
                  {formatSize(file.size)} · {status === 'uploading' ? 'Uploading…' : 'Uploaded'}
                </p>
                {status === 'uploading' && (
                  <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#edeff2]">
                    <span className="block h-full w-1/2 animate-[importBar_0.9s_ease-in-out_infinite] rounded-full bg-[#004b87]" />
                  </span>
                )}
              </div>
              <button type="button" aria-label="Remove file" onClick={removeFile} className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#edeff2]">
                <img src={iconRemoveUpload} alt="" className="size-[7.75px]" />
              </button>
            </div>
          </div>

          {status === 'ready' && (
            <div className="flex flex-col gap-4">
              {rows.map((r) => (
                <ImportRowCard
                  key={r.id}
                  row={r}
                  ui={ui[r.id] ?? { open: false, sections: { vendor: false, payment: false, contact: false } }}
                  onToggle={() => toggleRow(r.id)}
                  onToggleSection={(k) => toggleSection(r.id, k)}
                  onChange={(p) => updateRow(r.id, p)}
                  onRemove={() => removeRow(r.id)}
                />
              ))}
              {rows.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#cbd0d8] p-4 text-center text-sm text-[#6b7280]">No vendors left to import. Remove the file to upload another.</p>
              )}
            </div>
          )}
        </div>
      )}
      <style>{'@keyframes importBar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}'}</style>
    </DrawerBody>
  )
}

const VENDOR_KEYS: DraftKey[] = ['type', 'firstName', 'lastName', 'businessName', 'category']
const CONTACT_KEYS: DraftKey[] = ['email', 'phone', 'address']
const sectionsFor = (keys: DraftKey[]): Sections => ({
  vendor: keys.some((k) => VENDOR_KEYS.includes(k)),
  contact: keys.some((k) => CONTACT_KEYS.includes(k)),
  payment: keys.some((k) => !VENDOR_KEYS.includes(k) && !CONTACT_KEYS.includes(k)),
})

/* ---------------------------------------------------------------------- */
/*  Parsed row — Figma 48069:427428 (collapsed) … 48069:428658 (attention) */
/* ---------------------------------------------------------------------- */

function ImportRowCard({
  row,
  ui,
  onToggle,
  onToggleSection,
  onChange,
  onRemove,
}: {
  row: ImportRow
  ui: UiState
  onToggle: () => void
  onToggleSection: (k: keyof Sections) => void
  onChange: (p: Partial<VendorDraft>) => void
  onRemove: () => void
}) {
  const { draft } = row
  const errors = errorsFor(draft)
  const invalid = Object.keys(errors).length > 0
  const sectionHasError = sectionsFor(Object.keys(errors) as DraftKey[])
  const live = vendorDisplayName(draft)
  const title = draft.type === 'Individual' && !draft.firstName.trim() ? row.label : live || row.label
  return (
    <div className="flex w-full flex-col gap-2">
      <div className={`flex w-full flex-col rounded-xl border bg-white ${invalid ? 'border-[#d92836]' : 'border-[#cbd0d8]'}`}>
        <div className="flex h-[46px] w-full items-center justify-between gap-3 px-4">
          <p className="min-w-0 truncate text-sm font-medium leading-5 text-[#222121]">{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <HdsBadge color={draft.type === 'Business' ? 'amber' : 'navy'} size="sm">
              {draft.type}
            </HdsBadge>
            <button type="button" aria-label={`Remove ${title}`} onClick={onRemove} className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[#fde8ea]">
              <img src={iconTrash} alt="" className="h-[17.92px] w-[16.25px]" />
            </button>
            <button
              type="button"
              aria-label={ui.open ? `Collapse ${title}` : `Expand ${title}`}
              aria-expanded={ui.open}
              onClick={onToggle}
              className="flex size-7 items-center justify-center rounded-lg text-[#111927] transition-colors hover:bg-[#edeff2]"
            >
              <Chevron open={!ui.open} />
            </button>
          </div>
        </div>
        {ui.open && (
          <div className="flex w-full flex-col gap-4 border-t border-[#cbd0d8] px-4 pb-4 pt-4">
            <FormSection title="Vendor details" open={ui.sections.vendor} onToggle={() => onToggleSection('vendor')}>
              <KitSelect label="Vendor type" value={draft.type} options={VENDOR_TYPE_OPTIONS.slice().reverse()} onChange={(v) => onChange({ type: v as VendorType })} />
              <NameFields draft={draft} set={onChange} errors={errors} />
              <CategoryField draft={draft} set={onChange} errors={errors} />
            </FormSection>
            <FormSection title="Payment details" open={ui.sections.payment} onToggle={() => onToggleSection('payment')}>
              <CountryField draft={draft} set={onChange} errors={errors} />
              <PaymentFields draft={draft} set={onChange} errors={errors} />
            </FormSection>
            <FormSection title="Contact details" open={ui.sections.contact} onToggle={() => onToggleSection('contact')}>
              <ContactFields draft={draft} set={onChange} errors={errors} />
            </FormSection>
            {invalid && !ui.sections.vendor && !ui.sections.payment && !ui.sections.contact && (
              <p className="text-xs text-[#b4232e]">
                Missing: {[sectionHasError.vendor && 'Vendor details', sectionHasError.payment && 'Payment details', sectionHasError.contact && 'Contact details'].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
      {invalid && <p className="text-sm leading-5 text-[#b4232e]">Row needs your attention</p>}
    </div>
  )
}
