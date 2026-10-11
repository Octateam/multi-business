import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Chevron, DropdownMenu, FieldShell, HdsButton, HdsInput, HdsSwitch, inputRowClass } from '../../components/ui/hds'
import { Drawer } from '../accounts/ui'
import { ACCOUNT_TYPE_OPTIONS, BANK_OPTIONS, KitPhoneInput, KitSelect, dialFor, toOptions, type SelectOption } from '../bills2/hdsKit'
import { VENDOR_COUNTRY_OPTIONS, cityOptionsFor, stateOptionsFor, type VendorType } from './shared'

import iconBack from '../../assets/icons/vendors-icon-back-arrow.svg'
import iconToastCheck from '../../assets/icons/list1-toast-success-check.svg'
import iconToastError from '../../assets/icons/vendors-icon-alert-error.svg'
import iconToastClose from '../../assets/icons/vendors-icon-toast-close.svg'

// Shared building blocks for the Add vendor (manual entry, Figma 48069:424772) and Import vendors
// (CSV, Figma 48069:424941) drawers: the vendor draft model, validation, the payment / contact
// field groups, the drawer shell and the result toast.

/* ---------------------------------------------------------------------- */
/*  Model                                                                  */
/* ---------------------------------------------------------------------- */

export type VendorDraft = {
  type: VendorType
  firstName: string
  lastName: string
  businessName: string
  category: string
  country: string
  // Bank rail (US / UK / EU …)
  accountName: string
  accountType: string
  accountNumber: string
  bankName: string
  routingNumber: string
  swift: string
  street: string
  city: string
  state: string
  zip: string
  // Local bank rail (Nigeria …) + mobile money rail (Kenya …)
  bankCode: string
  bankAddress: string
  mobileOperator: string
  mobileNumber: string
  hasTaxId: boolean
  taxId: string
  // Contact
  email: string
  phoneIso: string
  phone: string
  address: string
  manualAddress: boolean
  cStreet: string
  cCountry: string
  cState: string
  cCity: string
  cPostal: string
}

export type DraftKey = keyof VendorDraft
export type DraftErrors = Partial<Record<DraftKey, string>>

export const EMPTY_DRAFT: VendorDraft = {
  type: 'Individual',
  firstName: '',
  lastName: '',
  businessName: '',
  category: '',
  country: '',
  accountName: '',
  accountType: '',
  accountNumber: '',
  bankName: '',
  routingNumber: '',
  swift: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  bankCode: '',
  bankAddress: '',
  mobileOperator: '',
  mobileNumber: '',
  hasTaxId: true,
  taxId: '',
  email: '',
  phoneIso: 'US',
  phone: '',
  address: '',
  manualAddress: false,
  cStreet: '',
  cCountry: '',
  cState: '',
  cCity: '',
  cPostal: '',
}

/** Figma 48069:414061 category menu. */
export const FORM_CATEGORY_OPTIONS: SelectOption[] = toOptions([
  'Software',
  'Travel',
  'Meal and entertainment',
  'Professional services',
  'Marketing',
  'Utilities',
  'Contractor',
  'Logistics',
  'Equipment',
])

/** Alphabetical, like the Figma country menu (Canada, France, Germany, Ghana, India, Kenya …). */
export const FORM_COUNTRY_OPTIONS: SelectOption[] = [...VENDOR_COUNTRY_OPTIONS].sort((a, b) => a.label.localeCompare(b.label))

export type PaymentRail = 'bank' | 'local' | 'mobile'
const LOCAL_BANK_COUNTRIES = ['Nigeria', 'Ghana', 'South Africa', 'Egypt']
const MOBILE_MONEY_COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda']

/** Which payout fields a country needs: US-style bank account, local bank (NUBAN etc.) or mobile money. */
export const railFor = (country: string): PaymentRail | null =>
  !country ? null : MOBILE_MONEY_COUNTRIES.includes(country) ? 'mobile' : LOCAL_BANK_COUNTRIES.includes(country) ? 'local' : 'bank'

const LOCAL_BANKS: Record<string, string[]> = {
  Nigeria: ['Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Kuda', 'Moniepoint'],
  Ghana: ['GCB Bank', 'Ecobank Ghana', 'Stanbic Bank Ghana', 'Fidelity Bank Ghana'],
  'South Africa': ['Standard Bank', 'FNB', 'Absa', 'Nedbank', 'Capitec'],
  Egypt: ['National Bank of Egypt', 'Banque Misr', 'CIB'],
}
const MOBILE_OPERATORS: Record<string, string[]> = {
  Kenya: ['M-Pesa', 'Airtel money', 'T-Kash'],
  Uganda: ['MTN MoMo', 'Airtel money'],
  Tanzania: ['M-Pesa', 'Tigo Pesa', 'Airtel money'],
  Rwanda: ['MTN MoMo', 'Airtel money'],
}
const COUNTRY_ISO: Record<string, string> = { Kenya: 'KE', Uganda: 'UG', Tanzania: 'TZ', Rwanda: 'RW' }

export const routingLabel = (country: string) =>
  country === 'United Kingdom' ? 'Sort code' : country === 'United States of America' || country === 'Canada' ? 'Routing number' : 'Bank code'
export const zipLabel = (country: string) => (country === 'United States of America' ? 'Zip code' : 'Postal code')

export const vendorDisplayName = (d: VendorDraft) =>
  d.type === 'Business' ? d.businessName.trim() : [d.firstName.trim(), d.lastName.trim()].filter(Boolean).join(' ')

const digits = (s: string) => s.replace(/\D/g, '')
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())

/** Account-name lookup shown under the account / phone number once it's long enough to resolve. */
export const resolvedAccountName = (d: VendorDraft) => {
  const rail = railFor(d.country)
  const enough = rail === 'local' ? digits(d.accountNumber).length >= 10 : rail === 'mobile' ? digits(d.mobileNumber).length >= 9 : false
  return enough ? vendorDisplayName(d) || 'Account holder' : ''
}

/** Required fields still empty / invalid, in form order. */
export function missingFields(d: VendorDraft): { key: DraftKey; label: string; message: string }[] {
  const out: { key: DraftKey; label: string; message: string }[] = []
  const need = (key: DraftKey, label: string, ok?: boolean) => {
    const v = d[key]
    const filled = ok ?? (typeof v === 'string' ? v.trim() !== '' : true)
    if (!filled) out.push({ key, label, message: `Provide ${label.charAt(0).toLowerCase()}${label.slice(1)}` })
  }
  if (d.type === 'Business') need('businessName', 'Business name')
  else {
    need('firstName', 'First name')
    need('lastName', 'Last name')
  }
  need('category', 'Category')
  need('country', 'Country')
  const rail = railFor(d.country)
  if (rail === 'bank') {
    need('accountName', 'Account name')
    need('accountType', 'Account type')
    need('accountNumber', 'Account number')
    need('bankName', 'Bank name')
    need('routingNumber', routingLabel(d.country))
    need('street', 'Street address')
    need('city', 'City')
    need('state', 'State')
    need('zip', zipLabel(d.country))
  } else if (rail === 'local') {
    need('bankName', 'Bank name')
    need('accountNumber', 'Account number')
  } else if (rail === 'mobile') {
    need('mobileOperator', 'Mobile operator')
    need('mobileNumber', 'Phone number')
  }
  if (!d.email.trim()) need('email', 'Email')
  else if (!isEmail(d.email)) out.push({ key: 'email', label: 'Valid email', message: 'Enter a valid email address' })
  return out
}

export const errorsFor = (d: VendorDraft): DraftErrors => Object.fromEntries(missingFields(d).map((m) => [m.key, m.message]))

/** "Still needed: First name, Category +2 more" — the progressive-validation hint under a disabled CTA. */
export const missingHint = (labels: string[]) =>
  labels.length === 0 ? '' : `Still needed: ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? ` +${labels.length - 3} more` : ''}`

export const maskAccount = (n: string) => (n ? `•••• ${digits(n).slice(-4) || n.slice(-4)}` : '')

export const contactAddress = (d: VendorDraft) =>
  d.manualAddress ? [d.cStreet, d.cCity, [d.cState, d.cPostal].filter(Boolean).join(' '), d.cCountry].filter((s) => s.trim()).join(', ') : d.address

/* ---------------------------------------------------------------------- */
/*  Drawer shell                                                           */
/* ---------------------------------------------------------------------- */

/** HDS drawer (16px radius, 40px inset, dark overlay; Esc / overlay closes) with a slide-out before `onClose`. */
export function useClosingDrawer(onClose: () => void) {
  const [open, setOpen] = useState(true)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const close = useCallback(() => {
    // Esc while a dropdown menu is open only closes the menu.
    if (document.querySelector('aside[role="dialog"] [role="listbox"]')) return
    setOpen(false)
    timer.current = window.setTimeout(onClose, 280)
  }, [onClose])
  return { open, close }
}

export function FlowDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Drawer open={open} onClose={onClose} width={513}>
      {children}
    </Drawer>
  )
}

/** Scrollable drawer body with a sticky footer (primary CTA + hint). */
export function DrawerBody({ children, footer, scrollKey }: { children: ReactNode; footer?: ReactNode; scrollKey?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.parentElement?.scrollTo({ top: 0 })
  }, [scrollKey])
  return (
    <div ref={ref} className="flex min-h-full flex-col px-6 pt-8">
      <div className="flex flex-1 flex-col gap-6 pb-6">{children}</div>
      {footer && <div className="sticky bottom-0 z-10 -mx-6 flex flex-col gap-2 bg-white px-6 pb-6 pt-3">{footer}</div>}
    </div>
  )
}

export function BackHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="flex w-fit items-center gap-1 text-xs font-medium text-[#555354] hover:text-[#111927]">
        <img src={iconBack} alt="" className="size-3" />
        Back
      </button>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#222121]">{title}</h2>
        {subtitle && <p className="text-sm leading-5 text-[#555354]">{subtitle}</p>}
      </div>
    </div>
  )
}

export function SubmitFooter({ label, enabled, loading, hint, onClick }: { label: string; enabled: boolean; loading?: boolean; hint?: string; onClick: () => void }) {
  return (
    <>
      <HdsButton variant="primary" size="md" fullWidth disabled={!enabled} loading={loading} onClick={onClick}>
        {label}
      </HdsButton>
      {!enabled && hint && <p className="text-center text-xs leading-4 text-[#6b7280]">{hint}</p>}
    </>
  )
}

/* ---------------------------------------------------------------------- */
/*  Collapsible section header (Payment details / Contact details …)      */
/* ---------------------------------------------------------------------- */

export function FormSection({
  title,
  open = true,
  onToggle,
  size = 'md',
  children,
}: {
  title: string
  open?: boolean
  onToggle?: () => void
  size?: 'md' | 'lg'
  children?: ReactNode
}) {
  const heading = <span className={`${size === 'lg' ? 'text-base' : 'text-base'} font-semibold leading-6 text-[#111927]`}>{title}</span>
  return (
    <div className="flex w-full flex-col gap-4">
      {onToggle ? (
        <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5 text-left">
          {heading}
          {/* Figma: chevron points down while the section is expanded, up when collapsed. */}
          <Chevron open={!open} className="text-[#6b7280]" />
        </button>
      ) : (
        <div className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5">{heading}</div>
      )}
      {open && children}
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Field helpers                                                          */
/* ---------------------------------------------------------------------- */

type Setter = (patch: Partial<VendorDraft>) => void

function Text({
  label,
  value,
  onChange,
  placeholder = 'Enter value',
  helper,
  error,
  onBlur,
  type,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  helper?: ReactNode
  error?: string
  onBlur?: () => void
  type?: string
  inputMode?: 'numeric' | 'tel' | 'email' | 'text'
}) {
  return (
    <HdsInput
      label={label}
      value={value}
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      helper={helper}
      error={error}
      containerClassName="min-w-0"
    />
  )
}

function Pick({
  label,
  value,
  options,
  onChange,
  helper,
  error,
  inline,
  searchPlaceholder,
  placeholder = 'Select...',
  searchable,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (v: string) => void
  helper?: ReactNode
  error?: string
  inline?: boolean
  searchPlaceholder?: string
  placeholder?: string
  searchable?: boolean
}) {
  return (
    <KitSelect
      searchable={searchable}
      label={label}
      value={value || null}
      options={options}
      placeholder={placeholder}
      helper={helper}
      error={error}
      menuMode={inline ? 'inline' : 'overlay'}
      searchPlaceholder={searchPlaceholder}
      className="min-w-0"
      onChange={onChange}
    />
  )
}

const Pair = ({ children }: { children: ReactNode }) => <div className="grid w-full grid-cols-2 items-start gap-4">{children}</div>

/* ---------------------------------------------------------------------- */
/*  Vendor details (names + category)                                      */
/* ---------------------------------------------------------------------- */

export function NameFields({ draft, set, errors = {} }: { draft: VendorDraft; set: Setter; errors?: DraftErrors }) {
  return draft.type === 'Business' ? (
    <Text label="Business name" value={draft.businessName} onChange={(v) => set({ businessName: v })} error={errors.businessName} />
  ) : (
    <Pair>
      <Text label="First name" value={draft.firstName} onChange={(v) => set({ firstName: v })} error={errors.firstName} />
      <Text label="Last name" value={draft.lastName} onChange={(v) => set({ lastName: v })} error={errors.lastName} />
    </Pair>
  )
}

export function CategoryField({ draft, set, errors = {} }: { draft: VendorDraft; set: Setter; errors?: DraftErrors }) {
  return <Pick label="Category" value={draft.category} options={FORM_CATEGORY_OPTIONS} onChange={(v) => set({ category: v })} helper="Pre-fills on every bill." error={errors.category} inline searchable={false} />
}

/* ---------------------------------------------------------------------- */
/*  Payment details                                                        */
/* ---------------------------------------------------------------------- */

export function CountryField({ draft, set, errors = {} }: { draft: VendorDraft; set: Setter; errors?: DraftErrors }) {
  return (
    <Pick
      label="Country"
      value={draft.country}
      options={FORM_COUNTRY_OPTIONS}
      searchPlaceholder="Search country"
      helper="Where the vendor's account is held"
      error={errors.country}
      inline
      onChange={(c) => {
        if (c === draft.country) return
        // A new country means a different payout rail — clear the rail-specific fields.
        set({ country: c, bankName: '', state: '', city: '', mobileOperator: '', routingNumber: '', bankCode: '' })
      }}
    />
  )
}

export function PaymentFields({ draft, set, errors = {} }: { draft: VendorDraft; set: Setter; errors?: DraftErrors }) {
  const rail = railFor(draft.country)
  const resolved = resolvedAccountName(draft)
  const taxBlock = (
    <>
      <HdsSwitch label="This vendor has a tax ID" checked={draft.hasTaxId} onChange={(v) => set({ hasTaxId: v })} className="!py-1" />
      {draft.hasTaxId && <Text label="Tax identification number" value={draft.taxId} placeholder="Enter tax id" onChange={(v) => set({ taxId: v })} helper="Optional" />}
    </>
  )

  if (rail === 'bank') {
    const states = stateOptionsFor(draft.country)
    return (
      <>
        <Pair>
          <Text label="Account name" value={draft.accountName} placeholder="Enter account name" onChange={(v) => set({ accountName: v })} error={errors.accountName} />
          <Pick label="Account type" value={draft.accountType} options={ACCOUNT_TYPE_OPTIONS} onChange={(v) => set({ accountType: v })} error={errors.accountType} />
        </Pair>
        <Pair>
          <Text label="Account number" value={draft.accountNumber} placeholder="Enter account number" inputMode="numeric" onChange={(v) => set({ accountNumber: v })} error={errors.accountNumber} />
          <Pick label="Bank name" value={draft.bankName} options={BANK_OPTIONS} searchPlaceholder="Search bank" onChange={(v) => set({ bankName: v })} error={errors.bankName} />
        </Pair>
        <Pair>
          <Text
            label={routingLabel(draft.country)}
            value={draft.routingNumber}
            placeholder={`Enter ${routingLabel(draft.country).toLowerCase()}`}
            inputMode="numeric"
            onChange={(v) => set({ routingNumber: v })}
            error={errors.routingNumber}
          />
          <Text label="SWIFT/BIC (optional)" value={draft.swift} placeholder="Enter SWIFT/BIC" onChange={(v) => set({ swift: v.toUpperCase() })} />
        </Pair>
        <Text label="Street address" value={draft.street} placeholder="Enter street address" onChange={(v) => set({ street: v })} error={errors.street} />
        <Pair>
          <Pick label="City" value={draft.city} options={cityOptionsFor(draft.state)} searchPlaceholder="Search city" onChange={(v) => set({ city: v })} error={errors.city} />
          <Pick
            label="State"
            value={draft.state}
            options={states}
            searchPlaceholder="Search state"
            error={errors.state}
            onChange={(s) => set({ state: s, city: cityOptionsFor(s).some((c) => c.value === draft.city) ? draft.city : '' })}
          />
        </Pair>
        <Text label={zipLabel(draft.country)} value={draft.zip} placeholder={`Enter ${zipLabel(draft.country)}`} onChange={(v) => set({ zip: v })} error={errors.zip} />
        {taxBlock}
      </>
    )
  }

  if (rail === 'local' || rail === 'mobile') {
    const banks = toOptions(LOCAL_BANKS[draft.country] ?? LOCAL_BANKS.Nigeria)
    const operators = toOptions(MOBILE_OPERATORS[draft.country] ?? MOBILE_OPERATORS.Kenya)
    const dial = dialFor(COUNTRY_ISO[draft.country] ?? 'KE')
    return (
      <>
        {rail === 'local' ? (
          <Pair>
            <Pick label="Bank name" value={draft.bankName} options={banks} onChange={(v) => set({ bankName: v })} error={errors.bankName} />
            <Text
              label="Account number"
              value={draft.accountNumber}
              placeholder="Enter account number"
              inputMode="numeric"
              onChange={(v) => set({ accountNumber: digits(v).slice(0, 10) })}
              helper={resolved || undefined}
              error={errors.accountNumber}
            />
          </Pair>
        ) : (
          <Pair>
            <Pick label="Mobile operator" value={draft.mobileOperator} options={operators} onChange={(v) => set({ mobileOperator: v })} error={errors.mobileOperator} />
            <Text
              label="Phone number"
              value={draft.mobileNumber}
              placeholder={`${dial}…`}
              inputMode="tel"
              onChange={(v) => set({ mobileNumber: v.replace(/[^\d+ ]/g, '') })}
              helper={resolved || undefined}
              error={errors.mobileNumber}
            />
          </Pair>
        )}
        <Pair>
          <Text label="Bank code (optional)" value={draft.bankCode} placeholder="Enter bank code" onChange={(v) => set({ bankCode: v })} />
          <Text label="SWIFT/BIC (optional)" value={draft.swift} placeholder="Enter SWIFT/BIC code" onChange={(v) => set({ swift: v.toUpperCase() })} />
        </Pair>
        <Text label="Bank address (optional)" value={draft.bankAddress} placeholder="Enter bank address" onChange={(v) => set({ bankAddress: v })} />
        {taxBlock}
      </>
    )
  }
  return null
}

/* ---------------------------------------------------------------------- */
/*  Contact details                                                        */
/* ---------------------------------------------------------------------- */

const STREETS = [
  'Maplewood Drive, Austin, TX 78704',
  'Madison Avenue, Denver, CO 80206',
  'Magnolia Street, Atlanta, GA 30308',
  'Market Lane, Portland, OR 97205',
  'Maple Avenue, Charlotte, NC 28203',
  'Marina Street, Los Angeles, CA 90012',
  'Wall Street, New York, NY 10005',
  'Lexington Avenue, New York, NY 10022',
  'Oak Street, Chicago, IL 60611',
  'Pine Street, Seattle, WA 98101',
  'Harbor Road, Boston, MA 02110',
  'Sunset Boulevard, Los Angeles, CA 90028',
]

/** Address suggestions for what's typed: "15 Ma" → "15 Maplewood Drive, …", "15 Madison Avenue, …" … */
export const addressSuggestions = (q: string) => {
  const m = q.trim().match(/^(\d+[a-z]?)\s*(.*)$/i)
  const num = m ? m[1] : ''
  const rest = (m ? m[2] : q.trim()).toLowerCase()
  if (!num && rest.length < 2) return []
  const starts = STREETS.filter((s) => s.toLowerCase().startsWith(rest))
  const contains = STREETS.filter((s) => !starts.includes(s) && s.toLowerCase().includes(rest))
  return [...starts, ...contains].slice(0, 5).map((s) => (num ? `${num} ${s}` : s))
}

function AddressAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const suggestions = addressSuggestions(value).filter((s) => s !== value)
  const show = open && value.trim().length >= 2 && suggestions.length > 0
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', down)
    return () => document.removeEventListener('mousedown', down)
  }, [open])
  const picked = !!value && addressSuggestions(value).includes(value)
  return (
    <div ref={ref} className="relative w-full">
      <FieldShell label="Address" htmlFor="vendor-contact-address">
        <div className={`${inputRowClass({ focus: show })} h-11`}>
          <input
            id="vendor-contact-address"
            value={value}
            autoComplete="off"
            placeholder="15 Marina Street, Los Angeles, California 101233"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            onKeyDown={(e) => e.key === 'Escape' && show && (e.stopPropagation(), setOpen(false))}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
          />
          {picked && <Chevron className="text-[#6b7280]" />}
        </div>
        {show && (
          <DropdownMenu
            options={suggestions.map((s) => ({ value: s, label: s }))}
            value={null}
            onSelect={(v) => {
              onChange(v)
              setOpen(false)
            }}
          />
        )}
      </FieldShell>
    </div>
  )
}

export function ContactFields({
  draft,
  set,
  errors = {},
  onEmailBlur,
}: {
  draft: VendorDraft
  set: Setter
  errors?: DraftErrors
  onEmailBlur?: () => void
}) {
  return (
    <>
      <Text label="Email" type="email" inputMode="email" value={draft.email} onChange={(v) => set({ email: v })} onBlur={onEmailBlur} error={errors.email} />
      <KitPhoneInput label="Phone" iso={draft.phoneIso} onIsoChange={(iso) => set({ phoneIso: iso })} number={draft.phone} onChange={(v) => set({ phone: v })} placeholder="(000) 000-0000" />
      {draft.manualAddress ? (
        <>
          <Text label="Street Address" value={draft.cStreet} placeholder="Enter address" onChange={(v) => set({ cStreet: v })} />
          <Pair>
            <Pick label="Country" value={draft.cCountry} options={FORM_COUNTRY_OPTIONS} searchPlaceholder="Search country" onChange={(c) => set({ cCountry: c, cState: '', cCity: '' })} />
            <Pick label="State" value={draft.cState} options={stateOptionsFor(draft.cCountry)} searchPlaceholder="Search state" onChange={(s) => set({ cState: s, cCity: '' })} />
          </Pair>
          <Pair>
            <Pick label="City" value={draft.cCity} options={cityOptionsFor(draft.cState)} searchPlaceholder="Search city" onChange={(c) => set({ cCity: c })} />
            <Text label="Postal code" value={draft.cPostal} onChange={(v) => set({ cPostal: v })} />
          </Pair>
          <HdsButton variant="link" size="sm" className="w-fit !text-sm" onClick={() => set({ manualAddress: false, address: contactAddress(draft) || draft.address })}>
            Enter automatically
          </HdsButton>
        </>
      ) : (
        <>
          <AddressAutocomplete value={draft.address} onChange={(v) => set({ address: v })} />
          <HdsButton variant="link" size="sm" className="w-fit !text-sm" onClick={() => set({ manualAddress: true })}>
            Enter manually
          </HdsButton>
        </>
      )}
    </>
  )
}

/* ---------------------------------------------------------------------- */
/*  Toast — Figma 48069:418913 (success) / 48069:418575 (failure)          */
/* ---------------------------------------------------------------------- */

export function VendorFlowToast({
  tone,
  title,
  body,
  onClose,
  onRetry,
}: {
  tone: 'success' | 'error'
  title: string
  body: string
  onClose: () => void
  onRetry?: () => void
}) {
  useEffect(() => {
    if (tone !== 'success') return
    const t = window.setTimeout(onClose, 6000)
    return () => window.clearTimeout(t)
  }, [tone, onClose])
  const ok = tone === 'success'
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={`fixed right-[80px] top-[68px] z-[60] flex w-[352px] animate-[popIn_160ms_ease-out] items-start gap-3 rounded-[10px] border py-4 pl-4 pr-3.5 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.18)] ${
        ok ? 'border-[#5fc9a5] bg-[#e6f7f1]' : 'border-[#f18d95] bg-[#fde8ea]'
      }`}
    >
      <img src={ok ? iconToastCheck : iconToastError} alt="" className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={`text-sm font-semibold leading-5 ${ok ? 'text-[#077155]' : 'text-[#b4232e]'}`}>{title}</p>
        <p className="text-xs leading-[18px] text-[#4b5563]">{body}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-1.5 w-fit text-sm font-semibold text-[#b4232e] hover:underline">
            Try again
          </button>
        )}
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 p-0.5 opacity-70 hover:opacity-100">
        <img src={iconToastClose} alt="" className="size-[10px]" />
      </button>
    </div>
  )
}
