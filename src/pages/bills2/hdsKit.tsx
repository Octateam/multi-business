/*
 * Local HDS kit for the Bills / Vendors screens.
 * Built on the shared HDS primitives (components/ui/hds.tsx, Figma file 5sbjyGVqYhZPnWSTIFdCXK) and the
 * same tokens. Adds what the primitives don't cover for these flows:
 *   - KitSelect      HdsSelect + `defaultOpen` (for the "…dropdown open" state screens), footer, menu hint
 *   - MenuSelect     dark HDS menu behind any bespoke trigger (pagination, filters, chips, unit prefixes)
 *   - KitCombobox    type-to-search input with the HDS menu (vendor search) + "add new" footer
 *   - KitAmountInput amount input with a unit/currency prefix menu
 *   - KitPhoneInput  dial-code menu + number
 *   - KitDateInput   HDS Date picker (input row + calendar popover, Figma 798:25)
 * plus realistic Hinstantt option sets used where Figma didn't specify menu contents.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Chevron, DropdownMenu, FieldShell, HdsDatePicker, inputRowClass, type SelectOption } from '../../components/ui/hds'

import flagUS from '../../assets/flags/us.svg'
import flagGB from '../../assets/flags/gb.svg'
import flagEU from '../../assets/flags/european_union.svg'
import flagNG from '../../assets/flags/ng.svg'
import flagCA from '../../assets/flags/ca.svg'
import flagKE from '../../assets/flags/ke.svg'
import flagGH from '../../assets/flags/gh.svg'
import flagIN from '../../assets/flags/in.svg'
import flagZA from '../../assets/flags/za.svg'
import flagAE from '../../assets/flags/ae.svg'
import flagSG from '../../assets/flags/sg.svg'
import flagAU from '../../assets/flags/au.svg'
import flagCH from '../../assets/flags/ch.svg'
import flagJP from '../../assets/flags/jp.svg'
import flagNZ from '../../assets/flags/nz.svg'
import flagSE from '../../assets/flags/se.svg'
import flagDK from '../../assets/flags/dk.svg'
import flagNO from '../../assets/flags/no.svg'
import flagPL from '../../assets/flags/pl.svg'
import flagMX from '../../assets/flags/mx.svg'
import flagBR from '../../assets/flags/br.svg'
import flagEG from '../../assets/flags/eg.svg'
import flagRW from '../../assets/flags/rw.svg'
import flagUG from '../../assets/flags/ug.svg'
import flagTZ from '../../assets/flags/tz.svg'
import flagCN from '../../assets/flags/cn.svg'
import flagHK from '../../assets/flags/hk.svg'
import flagFR from '../../assets/icons/vendors-flag-france.svg'
import flagDE from '../../assets/icons/vendors-flag-germany.svg'

export type { SelectOption }

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Closes on outside mousedown / Escape — same contract as the HDS primitives. */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  const cb = useRef(onClose)
  cb.current = onClose
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cb.current()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && cb.current()
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  return ref
}

export const Flag = ({ src, className = 'size-4' }: { src: string; className?: string }) => (
  <img src={src} alt="" className={cx('shrink-0 rounded-full object-cover', className)} />
)

export const toOptions = (labels: string[]): SelectOption[] => labels.map((l) => ({ value: l, label: l }))

export const CalendarGlyph = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={cx('shrink-0', className)} aria-hidden="true">
    <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Option sets (realistic Hinstantt data)                             */
/* ------------------------------------------------------------------ */

export const FLAGS = { US: flagUS, GB: flagGB, EU: flagEU, NG: flagNG, CA: flagCA, KE: flagKE, GH: flagGH, IN: flagIN, ZA: flagZA, AE: flagAE, SG: flagSG, AU: flagAU, CH: flagCH, JP: flagJP, FR: flagFR, DE: flagDE }

const cur = (code: string, name: string, flag: string, symbol: string): SelectOption & { symbol: string } => ({
  value: code,
  label: `${code} - ${name}`,
  icon: <Flag src={flag} />,
  meta: symbol,
  symbol,
})

export const CURRENCIES = [
  cur('USD', 'US Dollar', flagUS, '$'),
  cur('GBP', 'British Pound', flagGB, '£'),
  cur('EUR', 'Euro', flagEU, '€'),
  cur('NGN', 'Nigerian Naira', flagNG, '₦'),
  cur('CAD', 'Canadian Dollar', flagCA, 'C$'),
  cur('KES', 'Kenyan Shilling', flagKE, 'KSh'),
  cur('GHS', 'Ghanaian Cedi', flagGH, 'GH₵'),
  cur('INR', 'Indian Rupee', flagIN, '₹'),
  cur('ZAR', 'South African Rand', flagZA, 'R'),
  cur('AED', 'UAE Dirham', flagAE, 'AED'),
  cur('SGD', 'Singapore Dollar', flagSG, 'S$'),
  cur('AUD', 'Australian Dollar', flagAU, 'A$'),
  cur('CHF', 'Swiss Franc', flagCH, 'CHF'),
  cur('JPY', 'Japanese Yen', flagJP, '¥'),
]
export const CURRENCY_OPTIONS: SelectOption[] = CURRENCIES
/** Short-code variant ("USD") for compact triggers. */
export const CURRENCY_CODE_OPTIONS: SelectOption[] = CURRENCIES.map((c) => ({ value: c.value, label: c.value, icon: c.icon, description: c.label.split(' - ')[1] }))
export const currencySymbol = (code: string) => CURRENCIES.find((c) => c.value === code)?.symbol ?? '$'
/** Accepts "GBP", "GBP - British Pound" etc. */
export const currencyCode = (labelOrCode: string) => labelOrCode.slice(0, 3).toUpperCase()

const ctry = (name: string, flag: string, dial: string, iso: string): SelectOption & { dial: string; iso: string } => ({
  value: name,
  label: name,
  icon: <Flag src={flag} />,
  dial,
  iso,
})
export const COUNTRIES = [
  ctry('United States', flagUS, '+1', 'US'),
  ctry('United Kingdom', flagGB, '+44', 'GB'),
  ctry('Canada', flagCA, '+1', 'CA'),
  ctry('Nigeria', flagNG, '+234', 'NG'),
  ctry('Kenya', flagKE, '+254', 'KE'),
  ctry('Ghana', flagGH, '+233', 'GH'),
  ctry('South Africa', flagZA, '+27', 'ZA'),
  ctry('Rwanda', flagRW, '+250', 'RW'),
  ctry('Uganda', flagUG, '+256', 'UG'),
  ctry('Tanzania', flagTZ, '+255', 'TZ'),
  ctry('Egypt', flagEG, '+20', 'EG'),
  ctry('France', flagFR, '+33', 'FR'),
  ctry('Germany', flagDE, '+49', 'DE'),
  ctry('Netherlands', flagEU, '+31', 'NL'),
  ctry('Ireland', flagEU, '+353', 'IE'),
  ctry('Sweden', flagSE, '+46', 'SE'),
  ctry('Denmark', flagDK, '+45', 'DK'),
  ctry('Norway', flagNO, '+47', 'NO'),
  ctry('Poland', flagPL, '+48', 'PL'),
  ctry('Switzerland', flagCH, '+41', 'CH'),
  ctry('India', flagIN, '+91', 'IN'),
  ctry('United Arab Emirates', flagAE, '+971', 'AE'),
  ctry('Singapore', flagSG, '+65', 'SG'),
  ctry('Hong Kong', flagHK, '+852', 'HK'),
  ctry('China', flagCN, '+86', 'CN'),
  ctry('Japan', flagJP, '+81', 'JP'),
  ctry('Australia', flagAU, '+61', 'AU'),
  ctry('New Zealand', flagNZ, '+64', 'NZ'),
  ctry('Mexico', flagMX, '+52', 'MX'),
  ctry('Brazil', flagBR, '+55', 'BR'),
]
export const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES
export const DIAL_CODE_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({ value: c.iso, label: c.iso, icon: c.icon, meta: c.dial, description: c.label }))
export const dialFor = (iso: string) => COUNTRIES.find((c) => c.iso === iso)?.dial ?? '+1'

export const VENDORS: (SelectOption & { country: string; currency: string; bank: string })[] = [
  { value: 'Northwind Design Ltd', label: 'Northwind Design Ltd', description: 'VND-00432 · United Kingdom · Active', country: 'United Kingdom', currency: 'GBP', bank: 'Chase Bank •••• 7890' },
  { value: 'Northwide Design Ltd', label: 'Northwide Design Ltd', description: 'VND-00518 · United Kingdom · Active', country: 'United Kingdom', currency: 'GBP', bank: 'Barclays •••• 2214' },
  { value: 'North Star Logistics', label: 'North Star Logistics', description: "VND-00390 · United Kingdom · Pending approval — can't be paid yet", disabled: true, country: 'United Kingdom', currency: 'GBP', bank: 'HSBC •••• 0912' },
  { value: 'Ridgeline Cloud Inc', label: 'Ridgeline Cloud Inc', description: 'VND-00418 · United States · Active', country: 'United States', currency: 'USD', bank: 'Silicon Valley Bank •••• 3301' },
  { value: 'Kairo Logistics BV', label: 'Kairo Logistics BV', description: 'VND-00407 · Netherlands · Active', country: 'Netherlands', currency: 'EUR', bank: 'ING •••• 5520' },
  { value: 'Meridian Legal Partners', label: 'Meridian Legal Partners', description: 'VND-00431 · Singapore · Active', country: 'Singapore', currency: 'SGD', bank: 'DBS •••• 1184' },
  { value: 'Amazon Web Services', label: 'Amazon Web Services', description: 'VND-00376 · United States · Active', country: 'United States', currency: 'USD', bank: 'JPMorgan Chase •••• 4471' },
  { value: 'Acme Print Co', label: 'Acme Print Co', description: 'VND-00430 · United States · Active', country: 'United States', currency: 'USD', bank: 'Chase Bank •••• 4471' },
  { value: 'Northwind Studios Ltd', label: 'Northwind Studios Ltd', description: 'VND-00445 · United Kingdom · Active', country: 'United Kingdom', currency: 'GBP', bank: 'Lloyds •••• 6630' },
  { value: 'Figma', label: 'Figma', description: 'VND-00426 · United States · Active', country: 'United States', currency: 'USD', bank: 'Wells Fargo •••• 8820' },
]
export const VENDOR_OPTIONS: SelectOption[] = VENDORS

/** Saved payout methods for a vendor (Payment details select). */
export const vendorPaymentOptions = (vendor?: string): SelectOption[] => {
  const v = VENDORS.find((x) => x.value === vendor)
  const primary = v?.bank ?? 'Chase Bank •••• 7890'
  return [
    { value: primary, label: primary, description: `Default · ${v?.currency ?? 'USD'} account`, meta: 'Default' },
    { value: 'Wise Business •••• 0458', label: 'Wise Business •••• 0458', description: 'Multi-currency account' },
    { value: 'Revolut Business •••• 9137', label: 'Revolut Business •••• 9137', description: 'EUR account' },
  ]
}

export const EXPENSE_CATEGORY_OPTIONS: SelectOption[] = toOptions([
  'Professional services',
  'Software & subscriptions',
  'Cloud & hosting',
  'Marketing & advertising',
  'Contractors',
  'Legal & compliance',
  'Office & facilities',
  'Rent & utilities',
  'Travel & entertainment',
  'Equipment & hardware',
  'Logistics & shipping',
  'Insurance',
])

/** Vendor category (vendor profile / Add vendor). */
export const VENDOR_CATEGORY_OPTIONS: SelectOption[] = toOptions([
  'Professional Services',
  'Software',
  'Contractor',
  'Marketing',
  'Logistics',
  'Equipment',
  'Legal',
  'Cloud & hosting',
  'Office supplies',
  'Utilities',
])

export const VENDOR_TYPE_OPTIONS: SelectOption[] = toOptions(['Business', 'Individual'])

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'ACH', label: 'ACH', description: 'US domestic · 1–3 business days', meta: 'USD' },
  { value: 'Wire', label: 'Wire', description: 'US domestic & international · same day', meta: 'USD' },
  { value: 'SEPA', label: 'SEPA', description: 'Eurozone · 1 business day', meta: 'EUR' },
  { value: 'Faster Payments', label: 'Faster Payments', description: 'UK · within 2 hours', meta: 'GBP' },
  { value: 'SWIFT', label: 'SWIFT', description: 'International · 2–5 business days' },
  { value: 'Local transfer', label: 'Local transfer', description: 'Local rails in NG, KE, GH, ZA · same day' },
]

export const PAY_FROM_ACCOUNT_OPTIONS: SelectOption[] = [
  { value: 'Operating ••4367', label: 'Operating ••4367', icon: <Flag src={flagUS} />, meta: '$248,120.40', description: 'USD · Main operating account' },
  { value: 'Euro payouts ••9021', label: 'Euro payouts ••9021', icon: <Flag src={flagEU} />, meta: '€86,402.15', description: 'EUR · Vendor payouts' },
  { value: 'GBP Treasury ••1180', label: 'GBP Treasury ••1180', icon: <Flag src={flagGB} />, meta: '£54,980.00', description: 'GBP · Treasury' },
  { value: 'Payroll ••5532', label: 'Payroll ••5532', icon: <Flag src={flagUS} />, meta: '$61,300.00', description: 'USD · Payroll' },
  { value: 'Naira collections ••2290', label: 'Naira collections ••2290', icon: <Flag src={flagNG} />, meta: '₦18,450,000', description: 'NGN · Collections' },
]

export const APPROVER_OPTIONS: SelectOption[] = [
  { value: 'Ava Olsson', label: 'Ava Olsson', description: 'Finance manager · ava@hinstantt.com' },
  { value: 'James Whitfield', label: 'James Whitfield', description: 'Admin · james@hinstantt.com' },
  { value: 'Priya Raman', label: 'Priya Raman', description: 'Controller · priya@hinstantt.com' },
  { value: 'Tobias Baker', label: 'Tobias Baker', description: 'CFO · tobias@hinstantt.com' },
  { value: 'Sofia Martins', label: 'Sofia Martins', description: 'Finance manager · sofia@hinstantt.com' },
  { value: 'Daniel Meyer', label: 'Daniel Meyer', description: 'Accounts payable · daniel@hinstantt.com' },
  { value: 'Chloe Bennett', label: 'Chloe Bennett', description: 'Operations lead · chloe@hinstantt.com' },
]

export const ROLE_OPTIONS: SelectOption[] = toOptions(['Any finance manager', 'Any admin', 'Controller', 'CFO', 'Specific team member'])

export const ACCOUNT_TYPE_OPTIONS: SelectOption[] = toOptions(['Checking', 'Savings', 'Business current', 'Business savings'])

export const BANK_OPTIONS: SelectOption[] = toOptions([
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Silicon Valley Bank',
  'Barclays',
  'HSBC',
  'Lloyds',
  'NatWest',
  'Monzo Business',
  'ING',
  'Deutsche Bank',
  'BNP Paribas',
  'Access Bank',
  'GTBank',
  'Zenith Bank',
  'Equity Bank',
  'Standard Bank',
  'DBS',
])

export const DUE_TERM_OPTIONS: SelectOption[] = toOptions(['Due on receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60'])

export const PAGE_SIZE_OPTIONS: SelectOption[] = ['10', '20', '50', '100'].map((n) => ({ value: n, label: `Show ${n} items` }))

/* ------------------------------------------------------------------ */
/*  KitSelect — HdsSelect with defaultOpen / footer / hint             */
/* ------------------------------------------------------------------ */

export type KitSelectProps = {
  label?: ReactNode
  placeholder?: string
  options: SelectOption[]
  value: string | null | undefined
  onChange: (value: string) => void
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  optional?: boolean
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  leadingIcon?: ReactNode
  className?: string
  /** Start open — used by the "…dropdown open" state screens. Still closes on outside click / Esc. */
  defaultOpen?: boolean
  menuMode?: 'overlay' | 'inline'
  /** Helper copy rendered under the open menu (Figma "If a month is shorter…"). */
  menuHint?: ReactNode
  footer?: ReactNode
  size?: 'md' | 'sm'
  renderValue?: (o: SelectOption) => ReactNode
  /** Visual-only: show the trigger in its open/focused state. */
  triggerClassName?: string
}

export function KitSelect({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  helper,
  error,
  required,
  optional,
  disabled,
  searchable,
  searchPlaceholder,
  leadingIcon,
  className,
  defaultOpen,
  menuMode = 'overlay',
  menuHint,
  footer,
  size = 'md',
  renderValue,
  triggerClassName,
}: KitSelectProps) {
  const [open, setOpen] = useState(!!defaultOpen && !disabled)
  const ref = useDismiss(open, () => setOpen(false))
  const id = useId()
  const selected = options.find((o) => o.value === value)
  const searchOn = searchable ?? options.length > 8
  const menu = (
    <DropdownMenu
      options={options}
      value={value ?? null}
      searchable={searchOn}
      searchPlaceholder={searchPlaceholder}
      footer={footer}
      onSelect={(v) => {
        onChange(v)
        setOpen(false)
      }}
    />
  )
  return (
    <div ref={ref} className={cx('relative w-full', className)}>
      <FieldShell label={label} required={required} optional={optional} helper={!open ? helper : undefined} error={!open ? error : undefined} htmlFor={id} disabled={disabled}>
        <div className="relative">
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cx(inputRowClass({ error: !!error, disabled, focus: open }), size === 'sm' ? 'h-9' : 'h-11', 'text-left', triggerClassName)}
          >
            {(selected?.icon ?? leadingIcon) && <span className="flex shrink-0 items-center text-[#6b7280]">{selected?.icon ?? leadingIcon}</span>}
            <span className={cx('min-w-0 flex-1 truncate', selected && !disabled ? 'text-[#111927]' : 'text-[#9aa1ac]')}>
              {selected ? (renderValue ? renderValue(selected) : selected.label) : value || placeholder}
            </span>
            <Chevron open={open} className={disabled ? 'text-[#9aa1ac]' : open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
          </button>
          {open && menuMode === 'overlay' && (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40">
              {menu}
              {menuHint && <p className="mt-1.5 text-[11px] leading-4 text-[#6b7280]">{menuHint}</p>}
            </div>
          )}
        </div>
        {open && menuMode === 'inline' && (
          <>
            {menu}
            {menuHint && <p className="text-[11px] leading-4 text-[#6b7280]">{menuHint}</p>}
          </>
        )}
      </FieldShell>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MenuSelect — HDS dark menu behind a bespoke trigger                */
/* ------------------------------------------------------------------ */

export function MenuSelect({
  options,
  value,
  onChange,
  trigger,
  align = 'left',
  width,
  searchable,
  searchPlaceholder,
  defaultOpen,
  placement = 'bottom',
  className,
  footer,
}: {
  options: SelectOption[]
  value: string | null | undefined
  onChange: (v: string) => void
  trigger: (p: { open: boolean; toggle: () => void; selected?: SelectOption }) => ReactNode
  align?: 'left' | 'right'
  width?: number | string
  searchable?: boolean
  searchPlaceholder?: string
  defaultOpen?: boolean
  placement?: 'bottom' | 'top'
  className?: string
  footer?: ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const ref = useDismiss(open, () => setOpen(false))
  const selected = options.find((o) => o.value === value)
  return (
    <div ref={ref} className={cx('relative inline-flex', className)}>
      {trigger({ open, toggle: () => setOpen((o) => !o), selected })}
      {open && (
        <div
          className={cx('absolute z-40', placement === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]', align === 'right' ? 'right-0' : 'left-0')}
          style={{ width: width ?? 220 }}
        >
          <DropdownMenu
            options={options}
            value={value ?? null}
            searchable={searchable ?? options.length > 8}
            searchPlaceholder={searchPlaceholder}
            footer={footer}
            onSelect={(v) => {
              onChange(v)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  KitCombobox — type to search (vendor field)                        */
/* ------------------------------------------------------------------ */

export function KitCombobox({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search',
  error,
  helper,
  required,
  defaultOpen,
  onAddNew,
  addNewLabel = (q: string) => `Add "${q}" as a new vendor`,
  suggest = false,
  className,
}: {
  label?: ReactNode
  value: string
  onChange: (value: string, picked?: SelectOption) => void
  options: SelectOption[]
  placeholder?: string
  error?: ReactNode
  helper?: ReactNode
  required?: boolean
  defaultOpen?: boolean
  onAddNew?: (query: string) => void
  addNewLabel?: (q: string) => string
  /** Free-text field with type-ahead: suggestions appear only while typing and only when something matches. */
  suggest?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [query, setQuery] = useState(defaultOpen ? value : '')
  const ref = useDismiss(open, () => setOpen(false))
  const id = useId()
  const q = query.trim().toLowerCase()
  const filtered = q ? options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q)) : options
  const exact = options.some((o) => o.label.toLowerCase() === q)
  const showMenu = open && (!suggest || (q.length > 0 && filtered.length > 0 && !exact))
  return (
    <div ref={ref} className={cx('relative w-full', className)}>
      <FieldShell label={label} required={required} helper={!open ? helper : undefined} error={!open ? error : undefined} htmlFor={id}>
        <div className="relative">
          <div className={cx(inputRowClass({ error: !!error && !open, focus: open }), 'h-11')}>
            <input
              id={id}
              value={value}
              placeholder={placeholder}
              autoComplete="off"
              onFocus={() => !suggest && setOpen(true)}
              onClick={() => !suggest && setOpen(true)}
              onChange={(e) => {
                onChange(e.target.value)
                setQuery(e.target.value)
                setOpen(true)
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
            />
            {!suggest && (
              <button type="button" tabIndex={-1} aria-label="Toggle options" onClick={() => setOpen((o) => !o)} className="flex">
                <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
              </button>
            )}
          </div>
          {showMenu && (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40">
              <DropdownMenu
                options={filtered}
                value={value}
                footer={
                  onAddNew && q && !exact ? (
                    <button
                      type="button"
                      onClick={() => {
                        onAddNew(query.trim())
                        setOpen(false)
                      }}
                      className="flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-left text-sm font-medium text-white hover:bg-[#4b5563]"
                    >
                      <span aria-hidden="true">+</span>
                      {addNewLabel(query.trim())}
                    </button>
                  ) : undefined
                }
                onSelect={(v) => {
                  const picked = options.find((o) => o.value === v)
                  onChange(picked?.label ?? v, picked)
                  setQuery('')
                  setOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </FieldShell>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Amount / phone / date inputs                                       */
/* ------------------------------------------------------------------ */

/** Amount with a unit prefix menu (currency symbol / %). HDS input row, divider, value. */
export function KitAmountInput({
  label,
  value,
  onChange,
  units,
  unit,
  onUnitChange,
  placeholder = '0.00',
  helper,
  error,
  optional,
  required,
  disabled,
  className,
  symbol,
}: {
  /** Optional currency symbol shown before the amount (e.g. "$"). */
  symbol?: string
  label?: ReactNode
  value: string
  onChange?: (v: string) => void
  units?: SelectOption[]
  unit?: string
  onUnitChange?: (u: string) => void
  placeholder?: string
  helper?: ReactNode
  error?: ReactNode
  optional?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  const [localUnit, setLocalUnit] = useState(unit ?? units?.[0]?.value ?? '')
  const current = unit ?? localUnit
  const sel = units?.find((u) => u.value === current)
  return (
    <FieldShell label={label} helper={helper} error={error} optional={optional} required={required} htmlFor={id} disabled={disabled} className={className}>
      <div className={cx(inputRowClass({ error: !!error, disabled }), 'h-11')}>
        {units && units.length > 0 && (
          <>
            <MenuSelect
              options={units}
              value={current}
              onChange={(u) => {
                setLocalUnit(u)
                onUnitChange?.(u)
              }}
              width={200}
              trigger={({ open, toggle }) => (
                <button type="button" disabled={disabled} onClick={toggle} className="flex shrink-0 items-center gap-1 text-sm text-[#111927] disabled:text-[#9aa1ac]">
                  {sel?.icon}
                  <span>{(sel?.meta as string) ?? sel?.label ?? current}</span>
                  <Chevron open={open} className={cx('size-3.5', open ? 'text-[#004b87]' : 'text-[#6b7280]')} />
                </button>
              )}
            />
            <span className="h-5 w-px shrink-0 bg-[#e1e4e9]" />
          </>
        )}
        {symbol && <span className="shrink-0 text-sm text-[#9aa1ac]">{symbol}</span>}
        <input
          id={id}
          inputMode="decimal"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          readOnly={!onChange}
          onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.,]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none disabled:text-[#9aa1ac]"
        />
      </div>
    </FieldShell>
  )
}

export function KitPhoneInput({
  label = 'Phone',
  iso,
  onIsoChange,
  number,
  onChange,
  placeholder = '(555) 000-0000',
  className,
  optional,
}: {
  label?: ReactNode
  iso?: string
  onIsoChange?: (iso: string) => void
  number: string
  onChange?: (v: string) => void
  placeholder?: string
  className?: string
  optional?: boolean
}) {
  const id = useId()
  const [localIso, setLocalIso] = useState(iso ?? 'US')
  const current = iso ?? localIso
  const sel = DIAL_CODE_OPTIONS.find((o) => o.value === current)
  return (
    <FieldShell label={label} htmlFor={id} className={className} optional={optional}>
      <div className={cx(inputRowClass(), 'h-11')}>
        <MenuSelect
          options={DIAL_CODE_OPTIONS}
          value={current}
          searchable
          searchPlaceholder="Search country or code"
          width={260}
          onChange={(v) => {
            setLocalIso(v)
            onIsoChange?.(v)
          }}
          trigger={({ open, toggle }) => (
            <button type="button" onClick={toggle} className="flex shrink-0 items-center gap-1 text-sm text-[#111927]">
              {sel?.icon}
              <span>{current}</span>
              <Chevron open={open} className={cx('size-3.5', open ? 'text-[#004b87]' : 'text-[#6b7280]')} />
            </button>
          )}
        />
        <span className="h-5 w-px shrink-0 bg-[#e1e4e9]" />
        <span className="shrink-0 text-sm text-[#9aa1ac]">{dialFor(current)}</span>
        <input
          id={id}
          type="tel"
          value={number}
          placeholder={placeholder}
          readOnly={!onChange}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
        />
      </div>
    </FieldShell>
  )
}

/** Bill / due / schedule date field — the HDS Date picker (Figma 798:25): typed DD/MM/YYYY or picked from the calendar. */
export function KitDateInput({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  optional,
  required,
  error,
  helper,
  disabled,
  icon,
  className,
  min,
  max,
  defaultOpen,
}: {
  label?: ReactNode
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  optional?: boolean
  required?: boolean
  error?: ReactNode
  helper?: ReactNode
  disabled?: boolean
  icon?: ReactNode
  className?: string
  /** Earliest selectable date (DD/MM/YYYY), e.g. the bill date for a due date. */
  min?: string
  max?: string
  defaultOpen?: boolean
}) {
  return (
    <HdsDatePicker
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      optional={optional}
      required={required}
      error={error}
      helper={helper}
      disabled={disabled}
      icon={icon ?? <CalendarGlyph />}
      className={className}
      min={min}
      max={max}
      defaultOpen={defaultOpen}
    />
  )
}
