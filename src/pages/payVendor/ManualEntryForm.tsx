import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import {
  Chevron,
  DropdownMenu,
  HdsButton,
  HdsSearch,
  HdsSelect,
  HdsTextarea,
  inputRowClass,
  type SelectOption,
} from '../../components/ui/hds'
import flagUsCircle from '../../assets/icons/pay-vendor-flag-us-circle.svg'
import flagEuCircle from '../../assets/icons/pay-vendor-flag-eu-circle.svg'
import uploadIcon from '../../assets/icons/claim-manual-upload.svg'
import fileIcon from '../../assets/icons/claim-manual-file.svg'
import cancelIcon from '../../assets/icons/claim-manual-cancel.svg'
import { BackLink, ManualEntryShell } from './shared'
import { useGoBack } from '../../lib/navHistory'
import { CurrencyAmountField } from '../claimReimbursement/CurrencyAmountField'

type Vendor = { name: string; meta: string; disabled?: boolean }
type Destination = { id: string; name: string; detail: string; flag: string; currency: string }
type PayVendorDraft = {
  customVendors: Vendor[]
  vendor: Vendor | null
  destinationId: string | null
  amount: string
  currency: string
  category: string | null
  description: string
  invoiceUploaded: boolean
}

// Vendor directory and the default "Popular vendors" subset are both taken from Figma
// (nodes 47401:532928 and 47401:533975); the search results for "Nort" there include
// Northwind Design Ltd and the pending North Star Logistics, so both live in the directory too.
const VENDOR_DIRECTORY: Vendor[] = [
  { name: 'Northwind Design Ltd', meta: 'VND-00432 · United Kingdom · Active' },
  { name: 'Northdina Agency', meta: 'VND-00518 · United Kingdom · Active' },
  {
    name: 'North Star Logistics',
    meta: "VND-00390 · United Kingdom · Pending approval — can't be paid yet",
    disabled: true,
  },
  { name: 'Meridian Forte', meta: 'VND-00510 · United States · Active' },
  { name: 'Acme Industries', meta: 'VND-00518 · United Kingdom · Active' },
  { name: 'Near Star Logistics', meta: 'VND-00518 · United Kingdom · Active' },
]

const POPULAR_VENDOR_NAMES = ['Northdina Agency', 'Meridian Forte', 'Acme Industries', 'Near Star Logistics']

// Designed destinations (Figma) — the vendor's saved bank accounts. The account holder name follows
// the picked vendor (Northwind Design Ltd in the design).
const DESTINATIONS: Omit<Destination, 'name'>[] = [
  { id: 'wells', detail: 'Wells Fargo · ****8327', flag: flagUsCircle, currency: 'USD' },
  { id: 'chase', detail: 'Chase Bank · ****5413', flag: flagEuCircle, currency: 'EUR' },
]

// Full category list from the Figma "User Flow" annotation beside the category dropdown
// (node 47401:537178).
const CATEGORIES = [
  'Software',
  'Professional services',
  'Contractors',
  'Marketing',
  'Travel',
  'Meals & entertainment',
  'Rent & facilities',
  'Utilities',
  'Equipment',
  'Logistics',
  'Office supplies',
  'Insurance',
  'Legal',
  'Accounting',
  'Banking & fees',
  'Training & development',
  'Communications',
  'Subscriptions',
  'Repairs & maintenance',
  'Taxes & government fees',
]

const CATEGORY_OPTIONS: SelectOption[] = CATEGORIES.map((c) => ({ value: c, label: c }))

function FieldLabel({ children }: { children: string }) {
  return <p className="text-sm font-medium text-[#111927]">{children}</p>
}

// Outside-click / Escape dismissal for the vendor picker (same behaviour as HDS menus).
function useDismiss(open: boolean, onClose: () => void) {
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

// Figma section 47401:520141 ("Submit expense - Pay a Vendor manual entry"). One stateful
// screen covers every frame in that section: vendor search/select, payment-destination select
// (which reveals the rest of the form once chosen), category select, invoice upload, and the
// Continue → Review button that unlocks once the required fields are filled.
export default function ManualEntryForm() {
  const navigate = useNavigate()
  const location = useLocation() as { pathname: string; state?: { draft?: PayVendorDraft } | null }
  const goBack = useGoBack('/pay-vendor')
  // Fields are kept on this history entry before Review opens, so Back from Review restores them.
  const draft = location.state?.draft

  const [customVendors, setCustomVendors] = useState<Vendor[]>(draft?.customVendors ?? [])
  const [vendor, setVendor] = useState<Vendor | null>(draft?.vendor ?? null)
  const [vendorMenuOpen, setVendorMenuOpen] = useState(false)
  const [vendorQuery, setVendorQuery] = useState('')

  const [destinationId, setDestinationId] = useState<string | null>(draft?.destinationId ?? null)

  const [amount, setAmount] = useState(draft?.amount ?? '')
  const [currency, setCurrency] = useState(draft?.currency ?? 'USD')
  const [category, setCategory] = useState<string | null>(draft?.category ?? null)
  const [description, setDescription] = useState(draft?.description ?? '')
  const [invoiceUploaded, setInvoiceUploaded] = useState(draft?.invoiceUploaded ?? false)
  const openReview = () => {
    const current: PayVendorDraft = { customVendors, vendor, destinationId, amount, currency, category, description, invoiceUploaded }
    navigate(location.pathname, { replace: true, state: { draft: current } })
    navigate('/pay-vendor/review')
  }

  const allVendors = useMemo(() => [...customVendors, ...VENDOR_DIRECTORY], [customVendors])
  const trimmedQuery = vendorQuery.trim()
  const searchResults = trimmedQuery
    ? allVendors.filter((v) => v.name.toLowerCase().includes(trimmedQuery.toLowerCase()))
    : []
  const exactMatch = allVendors.some((v) => v.name.toLowerCase() === trimmedQuery.toLowerCase())
  const popularVendors = POPULAR_VENDOR_NAMES.map((name) => allVendors.find((v) => v.name === name)!).filter(Boolean)

  const closeVendorMenu = useCallback(() => {
    setVendorMenuOpen(false)
    setVendorQuery('')
  }, [])
  const vendorRef = useDismiss(vendorMenuOpen, closeVendorMenu)

  const destinationOptions: SelectOption[] = DESTINATIONS.map((d) => ({
    value: d.id,
    label: vendor?.name ?? 'Northwind Design Ltd',
    description: d.detail,
    icon: <img src={d.flag} alt="" className="size-5" />,
  }))
  const destination: Destination | null = (() => {
    const d = DESTINATIONS.find((x) => x.id === destinationId)
    return d ? { ...d, name: vendor?.name ?? 'Northwind Design Ltd' } : null
  })()

  const vendorOptions: SelectOption[] = searchResults.map((v) => ({
    value: v.name,
    label: v.name,
    description: v.meta,
    disabled: v.disabled,
  }))

  const pickVendor = (picked: Vendor) => {
    if (picked.disabled) return
    setVendor(picked)
    setVendorMenuOpen(false)
    setVendorQuery('')
  }

  const addNewVendor = () => {
    const created: Vendor = { name: trimmedQuery, meta: 'New vendor · Pending details' }
    setCustomVendors((prev) => [created, ...prev])
    pickVendor(created)
  }

  const amountNumber = Number(amount.replace(/,/g, ''))
  const formComplete = Boolean(vendor && destination && amountNumber > 0 && category && description.trim())

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex h-full w-full flex-col justify-between gap-8">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <BackLink onClick={goBack} />
              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Pay a vendor</h1>
                <p className="text-sm text-[#555354]">
                  {destination
                    ? 'Provide vendor info, payment details & supporting information'
                    : 'Select the vendor and payment destination for this expense.'}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              {/* Vendor info */}
              <div ref={vendorRef} className="relative flex w-full flex-col gap-2">
                <FieldLabel>Vendor info</FieldLabel>
                {vendorMenuOpen ? (
                  <HdsSearch
                    autoFocus
                    value={vendorQuery}
                    onChange={setVendorQuery}
                    placeholder="Search for vendor"
                    className="w-full"
                  />
                ) : (
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    onClick={() => setVendorMenuOpen(true)}
                    className={`${inputRowClass()} min-h-11 py-2.5 text-left`}
                  >
                    {vendor ? (
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium text-[#111927]">{vendor.name}</span>
                        <span className="truncate text-[11px] text-[#6b7280]">{vendor.meta}</span>
                      </span>
                    ) : (
                      <span className="flex-1 text-sm text-[#9aa1ac]">Search for vendor</span>
                    )}
                    <Chevron className="text-[#6b7280]" />
                  </button>
                )}

                {vendorMenuOpen &&
                  (trimmedQuery ? (
                    <div className="absolute left-0 top-full z-40 mt-1.5 w-full">
                      <DropdownMenu
                        options={vendorOptions}
                        value={vendor?.name ?? null}
                        maxHeight={260}
                        emptyTitle="No vendors found"
                        emptyHint="Add them as a new vendor below"
                        onSelect={(name) => {
                          const picked = allVendors.find((v) => v.name === name)
                          if (picked) pickVendor(picked)
                        }}
                        footer={
                          !exactMatch ? (
                            <button
                              type="button"
                              onClick={addNewVendor}
                              className="flex min-h-10 w-full items-center rounded-[10px] px-3.5 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-[#4b5563]"
                            >
                              +&nbsp;&nbsp;Add “{trimmedQuery}” as a new vendor
                            </button>
                          ) : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex w-full flex-col gap-4">
                      <FieldLabel>Popular vendors</FieldLabel>
                      {popularVendors.map((popular) => (
                        <button
                          key={popular.name}
                          type="button"
                          onClick={() => pickVendor(popular)}
                          className={`flex w-full flex-col items-start gap-0.5 rounded-lg border bg-[#f5f6f8] px-3.5 py-2.5 text-left transition-colors hover:bg-[#edeff2] ${ vendor?.name === popular.name ? 'border-[#004b87]' : 'border-[#edeff2] hover:border-[#e1e4e9]' }`}
                        >
                          <span className="text-sm font-medium text-[#111927]">{popular.name}</span>
                          <span className="text-[11px] text-[#6b7280]">{popular.meta}</span>
                        </button>
                      ))}
                    </div>
                  ))}
              </div>

              {/* Payment destination — hidden while the vendor picker is open, matching Figma */}
              {!vendorMenuOpen && (
                <HdsSelect
                  label="Payment destination"
                  placeholder="Select payment destination"
                  options={destinationOptions}
                  value={destinationId}
                  disabled={!vendor}
                  menuMode="inline"
                  onChange={(id) => {
                    setDestinationId(id)
                    const picked = DESTINATIONS.find((d) => d.id === id)
                    if (picked) setCurrency(picked.currency)
                  }}
                  renderValue={(option) => (
                    <span className="flex flex-col leading-tight">
                      <span className="truncate text-sm font-medium text-[#111927]">{option.label}</span>
                      <span className="truncate text-[11px] text-[#6b7280]">{option.description}</span>
                    </span>
                  )}
                />
              )}

              {/* Remaining fields appear once a payment destination is chosen */}
              {destination && !vendorMenuOpen && (
                <>
                  <CurrencyAmountField
                    label="Amount"
                    currency={currency}
                    onCurrencyChange={setCurrency}
                    amount={amount}
                    onAmountChange={setAmount}
                  />

                  <HdsSelect
                    label="Category"
                    placeholder="Select category"
                    options={CATEGORY_OPTIONS}
                    value={category}
                    onChange={setCategory}
                    searchPlaceholder="Search categories"
                  />

                  <HdsTextarea
                    label="Description"
                    value={description}
                    maxChars={120}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="e.g. Additional advisory hours on the Singapore entity setup"
                  />

                  <div className="flex w-full flex-col gap-1.5">
                    <p className="text-sm font-medium text-[#111927]">
                      Invoice <span className="font-normal text-[#6b7280]">(optional)</span>
                    </p>
                    {invoiceUploaded ? (
                      <div className="flex w-full items-center gap-3 rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#cbd0d8]">
                          <img src={fileIcon} alt="" className="h-[14.5px] w-[11.8px]" />
                        </span>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <p className="text-sm font-medium text-text-primary">Invoice.pdf</p>
                          <p className="text-[11px] text-[#6b7280]">1.2 MB · Uploaded</p>
                        </div>
                        <HdsButton variant="link">View</HdsButton>
                        <button
                          type="button"
                          aria-label="Remove invoice"
                          onClick={() => setInvoiceUploaded(false)}
                          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2"
                        >
                          <img src={cancelIcon} alt="" className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInvoiceUploaded(true)}
                        className="flex w-full flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-[#cbd0d8] bg-surface-2 px-6 py-7 hover:border-[#9aa1ac]"
                      >
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
                          <img src={uploadIcon} alt="" className="size-4" />
                        </span>
                        <span className="text-sm font-medium text-text-primary">Click to upload or drag and drop</span>
                        <span className="text-[11px] text-[#6b7280]">PDF, JPG, PNG up to 10MB</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <HdsButton fullWidth disabled={!formComplete} onClick={openReview}>
            {formComplete ? 'Review' : 'Continue'}
          </HdsButton>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
