import { useState, type ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { HdsButton, HdsCheckbox, HdsInput, type SelectOption } from '../../../components/ui/hds'
import { FLAGS, Flag, KitSelect } from '../hdsKit'
import cancelSquare from '../../../assets/icons/list2-cancel-square.svg'
import editPencil from '../../../assets/icons/list2-edit-pencil.svg'
import arrowLeftBack from '../../../assets/icons/list2-arrow-left-back.svg'
import flagCountrySelect from '../../../assets/icons/list2-flag-country-select.svg'

/**
 * Shared building blocks for the "Add/Edit payment method" modal flow
 * (Bills list screens, Figma node 45033:224836 → 45033:228208).
 *
 * This is a DIFFERENT module from `shared.tsx` (the bills-table shell a
 * sibling agent owns) — only the 9 payment-method screens in this folder
 * import from here.
 */

/** Faint page context rendered behind the modal/drawer, matching the Figma
 * frame's dashboard background without reproducing the full Bills table
 * (out of scope for these 9 screens — see AppShell usage notes). */
export function BillsPageBackdrop() {
  return (
    <div className="flex h-full w-full flex-col gap-6 py-8">
      <div className="flex w-full items-center justify-between">
        <div>
          <p className="font-heading text-[32px] font-semibold text-text-primary">Bills</p>
          <p className="mt-1 text-sm text-text-quaternary">Review, approve, and pay what you owe vendors — one-off or recurring.</p>
        </div>
        <Button variant="primary" size="md">
          Add a bill
        </Button>
      </div>
      <div className="grid w-full grid-cols-4 gap-4">
        {[
          {
            label: 'Due soon',
            amount: '$31,600.00',
            note: '3 bills due within 7 days',
          },
          { label: 'Overdue', amount: '$8,730.00', note: '1 overdue bill' },
          {
            label: 'Pending approval',
            amount: '$13,360.00',
            note: '1 bill awaiting approval',
          },
          {
            label: 'Payment issues',
            amount: '$6,530.00',
            note: '1 payment needs attention',
          },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-white p-4">
            <p className="text-sm text-text-quaternary">{tile.label}</p>
            <p className="mt-2 font-heading text-[28px] font-semibold text-text-primary">{tile.amount}</p>
            <p className="mt-2 text-sm text-text-quaternary">{tile.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Fixed, dimmed backdrop behind the panel — clicking it closes the panel. */
export function ModalBackdrop({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" onClick={onClose} />
}

/** The white rounded side panel, pinned to the right edge of the viewport
 * (matches the existing QuickViewDrawer convention used elsewhere in this
 * app for Figma side-sheet / "sweep function" panels). */
export function PanelShell({ children }: { children: ReactNode }) {
  return <div className="fixed bottom-10 right-10 top-10 z-50 flex w-[513px] flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">{children}</div>
}

export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="mb-6 flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-between">
        <p className="font-heading text-2xl font-semibold text-text-primary">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]"
        >
          <img src={cancelSquare} alt="" className="size-6" />
        </button>
      </div>
      {subtitle && <p className="text-sm text-text-quaternary">{subtitle}</p>}
    </div>
  )
}

export function BackLink({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 flex w-fit items-center gap-1 rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]"
    >
      <img src={arrowLeftBack} alt="" className="h-3 w-3" />
      <span className="text-xs font-medium text-text-quaternary">{label}</span>
    </button>
  )
}

export function EditChip({ label = 'Edit', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <HdsButton variant="secondary" size="sm" shape="pill" onClick={onClick} trailingIcon={<img src={editPencil} alt="" className="size-4" />}>
      {label}
    </HdsButton>
  )
}

/** Kept for existing call sites — HdsButton already applies the HDS disabled state. */
export const DISABLED_BTN = ''
export const inputCls = 'min-w-0 flex-1 bg-transparent text-sm text-[#111927] outline-none placeholder:text-[#9aa1ac]'

export const isFilled = (...values: (string | undefined)[]) => values.every((v) => !!v && v.trim() !== '')

export function useFormFields<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState(initial)
  const bind = (key: keyof T) => ({
    value: values[key],
    onChange: (v: string) => setValues((f) => ({ ...f, [key]: v })),
  })
  return { values, bind }
}

export function DisplayInputField({
  label,
  value,
  placeholder,
  helper,
  className = '',
  onChange,
  type,
  inputMode,
}: {
  label: string
  value?: string
  placeholder?: string
  helper?: string
  className?: string
  onChange?: (v: string) => void
  type?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel'
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <HdsInput
        label={label}
        value={value ?? ''}
        placeholder={placeholder}
        helper={helper}
        type={type}
        inputMode={inputMode}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

// Flags for the payment-method country list.
const COUNTRY_FLAG: Record<string, string> = {
  'United States of America': FLAGS.US,
  'United Kingdom': FLAGS.GB,
  Canada: FLAGS.CA,
  Germany: FLAGS.DE,
}

export function DisplaySelectField({
  label,
  value,
  placeholder,
  helper,
  flag,
  className = '',
  options,
  onChange,
  defaultOpen,
  searchable,
  searchPlaceholder,
}: {
  label: string
  value?: string
  placeholder?: string
  helper?: string
  flag?: boolean
  className?: string
  options?: string[]
  onChange?: (v: string) => void
  /** Start with the menu open (state screens such as the country selector). */
  defaultOpen?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}) {
  const list = options ?? (value ? [value] : [])
  const selectOptions: SelectOption[] = list.map((o) => ({
    value: o,
    label: o,
    icon: flag ? <Flag src={COUNTRY_FLAG[o] ?? flagCountrySelect} /> : undefined,
  }))
  return (
    <KitSelect
      className={className}
      label={label}
      placeholder={placeholder}
      helper={helper}
      options={selectOptions}
      value={value ?? null}
      onChange={(v) => onChange?.(v)}
      defaultOpen={defaultOpen}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      leadingIcon={flag && !value ? <Flag src={flagCountrySelect} /> : undefined}
    />
  )
}

// Country list — as shown in the Figma country selector.
export const COUNTRY_OPTIONS = ['United States of America', 'United Kingdom', 'Canada', 'Germany']
export const ACCOUNT_TYPE_OPTIONS = ['Checking', 'Savings', 'Business checking', 'Business savings']
export const CATEGORY_OPTIONS = [
  'Technology',
  'Software',
  'Cloud & hosting',
  'Professional services',
  'Marketing',
  'Logistics',
  'Legal',
  'Equipment',
  'Office supplies',
  'Utilities',
]
export const US_STATE_OPTIONS = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]
/** Vendor addresses on file (Edit contact details). */
export const VENDOR_ADDRESS_OPTIONS = [
  '410 Terry Ave N, Seattle, WA 98109',
  '440 Terry Ave N, Seattle, WA 98109',
  '2121 7th Ave, Seattle, WA 98121',
  '1 Principal Place, London EC2A 2FA, United Kingdom',
]

export function TaxIdCheckbox({ checked: initial = true, label, onChange }: { checked?: boolean; label: string; onChange?: (v: boolean) => void }) {
  const [checked, setChecked] = useState(initial)
  const toggle = () => {
    setChecked((c) => !c)
    onChange?.(!checked)
  }
  return (
    <div className="flex cursor-pointer select-none items-center gap-2.5" onClick={toggle}>
      <HdsCheckbox size="md" checked={checked} onChange={toggle} />
      <p className="text-xs text-[#4b5563]">{label}</p>
    </div>
  )
}

/** Definition-list row used on the Review step and the Vendor drawer. */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="shrink-0 text-[13px] text-[#6b7280]">{label}</p>
      <p className="text-right text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

export function ReviewCard({
  title,
  onEdit,
  editLabel = 'Continue',
  children,
}: {
  title: string
  onEdit?: () => void
  editLabel?: string
  children: ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-lg border border-[#e3e8eb] p-[15px]">
      <div className="flex w-full items-center justify-between">
        <p className="text-xs font-semibold text-[#0c2129]">{title}</p>
        <EditChip label={editLabel} onClick={onEdit} />
      </div>
      <div className="flex w-full flex-col">{children}</div>
    </div>
  )
}
