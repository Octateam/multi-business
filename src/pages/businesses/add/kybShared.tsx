import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import { useSidebarContext } from '../../../context/SidebarContext'
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '../../../components/layout/sidebarDimensions'
import {
  Chevron,
  DropdownMenu,
  FieldShell,
  HdsButton,
  HdsCheckbox,
  HdsToggleSegment,
  inputRowClass,
  type SelectOption,
} from '../../../components/ui/hds'
import caretLeft from '../../../assets/icons/kyb-caret-left.svg'
import stepperTick from '../../../assets/icons/kyb-stepper-tick.svg'
import stepperCircleActive from '../../../assets/icons/kyb-stepper-circle-active.svg'
import stepperCircleInactive from '../../../assets/icons/kyb-stepper-circle-inactive.svg'
import uploadDocIcon from '../../../assets/icons/kyb-upload-doc-icon.svg'
import chipRemoveCircle from '../../../assets/icons/kyb-chip-remove-circle.svg'
import addPlus from '../../../assets/icons/kyb-add-plus.svg'
import alertSuccessCheck from '../../../assets/icons/kyb-alert-success-check.svg'

/**
 * Shared building blocks for the "Add a new business" -> KYB onboarding flow
 * (node 46940:241060 "Tell us about your new business" through node
 * 46940:245553 "Review"). These 5 screens form one connected wizard, so the
 * page chrome (header, stepper, footer) and a handful of dense form controls
 * (file upload, currency/service chips, PEP toggle) live here once rather
 * than being re-built per step. Plain text inputs and selects reuse
 * FieldInput/FieldSelect from ../shared (already established by the
 * "Link an existing business" flow) instead of re-inventing them.
 */

export const BUSINESS_CATEGORIES = [
  'Food & Beverage',
  'Retail & E-commerce',
  'Marketplace/platform',
  'Professional Services',
  'Technology',
  'Logistics & Transportation',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Real Estate & Construction',
  'Media & Entertainment',
  'Education',
  'Agriculture',
  'Other',
]

// HDS's own "Business type" select options, plus Non-profit (kept from the original flow).
export const BUSINESS_TYPES = [
  'Private limited company',
  'Public limited company',
  'Limited liability company (LLC)',
  'Partnership',
  'Sole proprietorship',
  'Cooperative',
  'Non-profit',
]

/** ISO alpha-2 -> regional-indicator emoji flag. */
export const flagEmoji = (iso: string) =>
  String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

export type Country = { iso: string; name: string; dial: string }

// Hinstantt operating markets first (Africa / US / UK / EU), then other common corridors.
export const COUNTRY_LIST: Country[] = [
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'KE', name: 'Kenya', dial: '+254' },
  { iso: 'ZA', name: 'South Africa', dial: '+27' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'RW', name: 'Rwanda', dial: '+250' },
  { iso: 'UG', name: 'Uganda', dial: '+256' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225' },
  { iso: 'SN', name: 'Senegal', dial: '+221' },
  { iso: 'MA', name: 'Morocco', dial: '+212' },
  { iso: 'CM', name: 'Cameroon', dial: '+237' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'IE', name: 'Ireland', dial: '+353' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'CN', name: 'China', dial: '+86' },
]

export const COUNTRIES = COUNTRY_LIST.map((c) => c.name)

/** Country select options with flags (searchable automatically — more than 8). */
export const COUNTRY_OPTIONS: SelectOption[] = COUNTRY_LIST.map((c) => ({
  value: c.name,
  label: c.name,
  icon: <span className="text-base leading-none">{flagEmoji(c.iso)}</span>,
}))

export const PROOF_OF_ADDRESS_TYPES = ['Utility bill', 'Bank statement', 'Tenancy agreement', 'Tax document']

export const DESIGNATIONS = ['CEO', 'CFO', 'COO', 'Director', 'Founder', 'Company Secretary', 'Other']

export const SOURCE_OF_FUNDS = ['Business revenue', 'Owner investment', 'Venture capital', 'Loan/Credit facility', 'Other']

export const EXPECTED_VOLUMES = ['Under $10k', '$10k to $100k', '$100k to $500k', '$500k to $1M', 'Over $1M']

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR']

export const SERVICE_OPTIONS = [
  'Multi-currency accounts',
  'Stablecoin wallets',
  'Payments (Local and Global)',
  'Onramp & Offramp',
  'Collections (Payment Links, Cards and Invoices)',
  'Expense management',
  'Corporate Cards (Physical & Virtual)',
]

/** Extra currencies offered by "Add currency" (beyond the design's 7 chips). */
export const MORE_CURRENCIES: SelectOption[] = [
  { value: 'CAD', label: 'Canadian dollar', meta: 'CAD' },
  { value: 'AUD', label: 'Australian dollar', meta: 'AUD' },
  { value: 'AED', label: 'UAE dirham', meta: 'AED' },
  { value: 'CNY', label: 'Chinese yuan', meta: 'CNY' },
  { value: 'INR', label: 'Indian rupee', meta: 'INR' },
  { value: 'EGP', label: 'Egyptian pound', meta: 'EGP' },
  { value: 'XOF', label: 'West African CFA franc', meta: 'XOF' },
  { value: 'XAF', label: 'Central African CFA franc', meta: 'XAF' },
  { value: 'UGX', label: 'Ugandan shilling', meta: 'UGX' },
  { value: 'TZS', label: 'Tanzanian shilling', meta: 'TZS' },
  { value: 'RWF', label: 'Rwandan franc', meta: 'RWF' },
  { value: 'MAD', label: 'Moroccan dirham', meta: 'MAD' },
  { value: 'USDC', label: 'USD Coin (stablecoin)', meta: 'USDC' },
  { value: 'USDT', label: 'Tether (stablecoin)', meta: 'USDT' },
]

export type StepKey = 'company' | 'ownership' | 'business-profile' | 'review'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'company', label: 'Company' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'business-profile', label: 'Business' },
  { key: 'review', label: 'Review' },
]

/** 4-step "Company — Ownership — Business — Review" progress pill (node
 * 46940:433328 "Stepper" and its done/current variants seen on later steps). */
export function KybStepper({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center" data-testid="kyb-stepper">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          {i > 0 && (
            <div className={`mx-2.5 h-[1.5px] w-8 shrink-0 ${i <= currentIndex ? 'bg-text-primary' : 'bg-border-disabled'}`} />
          )}
          {i < currentIndex ? (
            <div className="flex items-center gap-2 rounded-pill py-1.5 pl-2.5 pr-3.5">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-text-primary">
                <img src={stepperTick} alt="" className="h-[7.58px] w-[9.04px]" />
              </span>
              <span className="whitespace-nowrap text-[13px] text-text-primary">{step.label}</span>
            </div>
          ) : i === currentIndex ? (
            <div className="flex items-center gap-2 rounded-pill bg-brand/10 py-1.5 pl-2.5 pr-3.5">
              <img src={stepperCircleActive} alt="" className="size-[26px] shrink-0" />
              <span className="whitespace-nowrap text-sm font-semibold text-text-primary">{step.label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-pill py-1.5 pl-2.5 pr-3.5">
              <img src={stepperCircleInactive} alt="" className="size-[26px] shrink-0" />
              <span className="whitespace-nowrap text-[13px] text-text-quaternary">{step.label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Full-page shell shared by all 4 KYB steps (node 46940:433322 "Page" +
 * node 46940:433405 "Footer"): back link, "Finish setting up {business}"
 * header, stepper, scrollable form body, fixed Save & exit / Continue
 * footer. The initial "Tell us about your new business" modal (step 1)
 * does not use this shell — it's a dialog over Home, not a full page. */
export function KybPageShell({
  businessName,
  currentStep,
  onSaveExit,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  children,
}: {
  businessName: string
  currentStep: StepKey
  onSaveExit: () => void
  onContinue: () => void
  continueLabel?: string
  continueDisabled?: boolean
  children: ReactNode
}) {
  const navigate = useNavigate()
  const { collapsed } = useSidebarContext()
  return (
    <AppShell>
      {/* Bottom padding keeps the last fields clear of the fixed footer. */}
      <div className="flex min-h-full w-full flex-col pb-24">
        <div className="flex w-full flex-1 flex-col items-start pb-16 pt-8">
          <button
            type="button"
            onClick={() => navigate('/businesses')}
            className="mb-8 flex items-center gap-3 text-text-quaternary transition-colors hover:text-text-primary"
          >
            <img src={caretLeft} alt="" className="h-4 w-4" />
            <span className="text-sm">Go back to business</span>
          </button>

          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-text-primary">
                Finish setting up {businessName}
              </h1>
              <p className="text-sm text-text-quaternary">
                Enter the business details to create and add it to your profile. You can complete the remaining steps
                later
              </p>
            </div>

            <KybStepper current={currentStep} />

            <div className="flex w-full flex-col gap-6">{children}</div>
          </div>
        </div>

        {/* Fixed to the bottom of the screen, from the sidebar's edge to the right edge. The buttons sit in a
            1071px column with 91px margins so they line up with the content above. */}
        <div
          className="fixed bottom-0 right-0 z-20 border-t border-border-disabled bg-surface transition-[left] duration-200"
          style={{ left: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        >
          <div className="mx-auto box-content flex w-[1071px] items-center justify-between px-[91px] py-5">
            <Button variant="secondary" size="lg" onClick={onSaveExit}>
              Save &amp; exit
            </Button>
            <Button variant="primary" size="lg" onClick={onContinue} disabled={continueDisabled}>
              {continueLabel}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-wide text-text-quaternary">{children}</p>
}

export function SectionDivider() {
  return <div className="w-full border-b border-border-disabled" />
}

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, onClose])
  return ref
}

/** HDS phone input: Input row with a country-code picker (flag + ISO + chevron) that opens the dark
 * HDS dropdown menu with search. Controlled `country` (ISO code) is optional — defaults to US. */
export function PhoneField({
  value,
  onChange,
  country: controlledCountry,
  onCountryChange,
  label = 'Phone number',
  half,
}: {
  value: string
  onChange: (value: string) => void
  country?: string
  onCountryChange?: (iso: string) => void
  label?: string
  half?: boolean
}) {
  const [localCountry, setLocalCountry] = useState('US')
  const iso = controlledCountry ?? localCountry
  const country = COUNTRY_LIST.find((c) => c.iso === iso) ?? COUNTRY_LIST[1]
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(open, () => setOpen(false))
  const options: SelectOption[] = COUNTRY_LIST.map((c) => ({
    value: c.iso,
    label: c.name,
    meta: c.dial,
    icon: <span className="text-base leading-none">{flagEmoji(c.iso)}</span>,
  }))

  return (
    <FieldShell label={label} className={half ? 'min-w-[240px] flex-1' : 'w-full'}>
      <div ref={ref} className="relative">
        <div className={`${inputRowClass({ focus: open })} h-11`}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country code: ${country.name} ${country.dial}`}
            onClick={() => setOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1 text-sm text-[#111927]"
          >
            <span className="text-base leading-none">{flagEmoji(country.iso)}</span>
            <span>{country.iso}</span>
            <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
          </button>
          <span className="h-5 w-px shrink-0 bg-[#e1e4e9]" />
          <span className="shrink-0 text-sm text-[#6b7280]">{country.dial}</span>
          <input
            type="tel"
            inputMode="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={country.iso === 'US' || country.iso === 'CA' ? '(555) 000-0000' : '800 000 0000'}
            aria-label={label}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
          />
        </div>
        {open && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[300px]">
            <DropdownMenu
              options={options}
              value={country.iso}
              searchable
              searchPlaceholder="Search country or code"
              onSelect={(v) => {
                setLocalCountry(v)
                onCountryChange?.(v)
                setOpen(false)
              }}
            />
          </div>
        )}
      </div>
    </FieldShell>
  )
}

/** File upload field (node 46940:433366 "Upload Box"). Demo-interactive:
 * starts "Uploaded" with a sample filename (matching the design's pre-filled
 * state); the remove button clears it back to a dashed placeholder whose HDS
 * "Upload file" button re-fills it with the same demo file. */
export function UploadBox({
  fileName,
  fileSize = '1.2 MB',
  uploaded: controlledUploaded,
  onUploadedChange,
}: {
  fileName: string
  fileSize?: string
  uploaded?: boolean
  onUploadedChange?: (uploaded: boolean) => void
}) {
  const [localUploaded, setLocalUploaded] = useState(true)
  const uploaded = controlledUploaded ?? localUploaded
  const setUploaded = (value: boolean) => {
    setLocalUploaded(value)
    onUploadedChange?.(value)
  }

  if (!uploaded) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#cbd0d8] bg-[#f5f6f8] px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <img src={uploadDocIcon} alt="" className="h-[14.33px] w-[11.67px]" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-medium text-[#111927]">Drop a file or browse</p>
          <p className="text-[11px] text-[#6b7280]">PDF, JPG or PNG · up to 10 MB</p>
        </div>
        <HdsButton variant="secondary" size="sm" onClick={() => setUploaded(true)}>
          Upload file
        </HdsButton>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-[#e1e4e9] bg-white px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edeff2]">
        <img src={uploadDocIcon} alt="" className="h-[14.33px] w-[11.67px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-[#111927]">{fileName}</p>
        <p className="text-[11px] text-[#6b7280]">{fileSize} · Uploaded</p>
      </div>
      <HdsButton variant="ghost" size="sm" shape="pill" iconOnly onClick={() => setUploaded(false)} aria-label="Remove file">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
          <path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </HdsButton>
    </div>
  )
}

/** HDS Checkbox (md) with a regular-weight 14px sentence label — used for the address and
 * declaration checkboxes, whose long copy reads better unbolded than HdsCheckbox's own label. */
export function KybCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: ReactNode
}) {
  return (
    <div className="flex cursor-pointer items-start gap-2.5 text-sm text-[#111927]" onClick={() => onChange(!checked)}>
      <span className="pt-0.5">
        <HdsCheckbox checked={checked} onChange={onChange} size="md" />
      </span>
      <span className="select-none">{label}</span>
    </div>
  )
}

/** Yes/No HDS Toggle Segment (node 46940:245354 — Politically Exposed Person (PEP)? question). */
export function YesNoToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <HdsToggleSegment
      options={[
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' },
      ]}
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
    />
  )
}

/** Multi-select pill used for currencies and services needed (node
 * 46940:245522 "Chip"), on HDS tokens: selected bg-inverted #111927 / white,
 * unselected bg-secondary #f5f6f8 (currencies) or bg-tertiary #e1e4e9
 * (services) with text-secondary #4b5563. */
export function Chip({
  label,
  selected,
  onToggle,
  removable,
  unselectedBg = 'surface-3',
}: {
  label: string
  selected: boolean
  onToggle: () => void
  removable?: boolean
  unselectedBg?: 'surface-2' | 'surface-3'
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87] ${ selected ? 'bg-[#111927] text-white hover:bg-[#003a68]' : unselectedBg === 'surface-2' ? 'bg-[#f5f6f8] text-[#4b5563] hover:bg-[#edeff2]' : 'bg-[#e1e4e9] text-[#4b5563] hover:bg-[#cbd0d8]' }`}
    >
      {label}
      {selected && removable && <img src={chipRemoveCircle} alt="" className="size-[14.33px]" />}
    </button>
  )
}

/** Dashed "+ Add …" pill. With `options`, it opens the dark HDS dropdown (searchable) and calls
 * `onPick` with the chosen value — used for "Add currency". */
export function AddPillButton({
  label,
  onClick,
  options,
  onPick,
  searchPlaceholder = 'Search',
}: {
  label: string
  onClick?: () => void
  options?: SelectOption[]
  onPick?: (value: string) => void
  searchPlaceholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup={options ? 'listbox' : undefined}
        aria-expanded={options ? open : undefined}
        onClick={() => (options ? setOpen((o) => !o) : onClick?.())}
        className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-dashed bg-[#f5f6f8] px-3.5 text-sm font-semibold text-[#111927] transition-colors hover:bg-[#edeff2] ${ open ? 'border-[#004b87]' : 'border-[#cbd0d8]' }`}
      >
        <img src={addPlus} alt="" className="h-[11.67px] w-[11.67px]" />
        {label}
      </button>
      {open && options && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[280px]">
          <DropdownMenu
            options={options}
            searchable={options.length > 8}
            searchPlaceholder={searchPlaceholder}
            emptyTitle={options.length === 0 ? 'All currencies added' : undefined}
            emptyHint={options.length === 0 ? 'Remove a currency to pick another' : undefined}
            onSelect={(v) => {
              onPick?.(v)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

/** Success alert banner (node 46940:433401 "Alert" — "Address verified"). */
export function SuccessAlert({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg border-[0.5px] border-status-approved-text/40 bg-status-approved-bg px-4 py-4">
      <img src={alertSuccessCheck} alt="" className="h-[16.13px] w-[16.13px]" />
      <p className="text-sm font-semibold text-status-approved-text">{children}</p>
    </div>
  )
}

/** Read-only key/value row used on the Review step's 3 summary sections
 * (node 46940:245692 "Frame" — e.g. "Legal name" / "Acme Trading..."). */
export function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-4 text-[13px]">
      <p className="w-[220px] shrink-0 text-text-quaternary">{label}</p>
      <p className="flex-1 font-medium text-text-primary">{value}</p>
    </div>
  )
}

export function ReviewSectionHeader({
  title,
  onEdit,
  expanded,
  onToggle,
}: {
  title: string
  onEdit: () => void
  expanded?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="flex w-full items-center justify-between border-b border-[#e1e4e9] pb-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex flex-1 items-center gap-2 text-left text-base font-medium text-[#111927]"
      >
        {title}
        {onToggle && <Chevron open={expanded} className="text-[#6b7280]" />}
      </button>
      <HdsButton variant="link" size="sm" onClick={onEdit}>
        Edit
      </HdsButton>
    </div>
  )
}
