import { useEffect, useId, useRef, useState } from 'react'
import { Chevron, DropdownMenu, FieldShell, inputRowClass, type SelectOption } from '../../components/ui/hds'
import flagEur from '../../assets/icons/claim-manual-flag-eur.svg'
import flagUsd from '../../assets/icons/claim-manual-flag-us.svg'
import flagGbp from '../../assets/icons/accounts-dd-flag-gb.svg'
import flagNgn from '../../assets/icons/accounts-dd-flag-ng.svg'
import flagCad from '../../assets/icons/vendors-flag-canada.svg'
import flagSgd from '../../assets/icons/accounts-flag-sg.svg'
import flagInr from '../../assets/icons/vendors-flag-india.svg'
import flagKes from '../../assets/icons/vendors-flag-kenya.svg'
import flagGhs from '../../assets/icons/vendors-flag-ghana.svg'

// Currencies Hinstantt accounts can pay out / be reimbursed in. Indicative USD rates drive the
// payout-summary maths in the claim form — prototype data, not live FX.
export type Currency = { code: string; name: string; symbol: string; flag: string; usdRate: number }

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: flagUsd, usdRate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: flagEur, usdRate: 1.08 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: flagGbp, usdRate: 1.27 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: flagNgn, usdRate: 1 / 1623.45 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: flagCad, usdRate: 0.73 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: flagSgd, usdRate: 0.74 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: flagInr, usdRate: 1 / 83.2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: flagKes, usdRate: 1 / 129.5 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: flagGhs, usdRate: 1 / 15.6 },
]

export const currencyByCode = (code: string) => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]

export const FlagImg = ({ src, className = 'size-4' }: { src: string; className?: string }) => (
  <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
)

const CURRENCY_OPTIONS: SelectOption[] = CURRENCIES.map((c) => ({
  value: c.code,
  label: c.code,
  description: c.name,
  icon: <FlagImg src={c.flag} />,
  meta: c.symbol,
}))

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

// HDS input row with a working currency picker prefix (HDS _Dropdown Menu, searchable) followed by
// a divider and the numeric amount. `display` picks how the prefix reads: flag + code, or symbol only.
export function CurrencyAmountField({
  label,
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  display = 'code',
  placeholder = '0.00',
}: {
  label: string
  currency: string
  onCurrencyChange: (code: string) => void
  amount: string
  onAmountChange: (value: string) => void
  display?: 'code' | 'symbol'
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const id = useId()
  const current = currencyByCode(currency)

  return (
    <div ref={ref} className="relative w-full">
      <FieldShell label={label} htmlFor={id}>
        <div className={`${inputRowClass({ focus: open })} h-11`}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Currency: ${current.code}`}
            onClick={() => setOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 rounded text-sm text-[#111927] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]"
          >
            {display === 'code' ? (
              <>
                <FlagImg src={current.flag} />
                <span>{current.code}</span>
              </>
            ) : (
              <span>{current.symbol}</span>
            )}
            <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
          </button>
          <span className="h-5 w-px shrink-0 bg-[#e1e4e9]" />
          <input
            id={id}
            inputMode="decimal"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value.replace(/[^\d.,]/g, ''))}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111927] placeholder:font-normal placeholder:text-[#9aa1ac] focus:outline-none"
          />
        </div>
      </FieldShell>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-full">
          <DropdownMenu
            options={CURRENCY_OPTIONS}
            value={currency}
            searchable
            searchPlaceholder="Search currency"
            onSelect={(code) => {
              onCurrencyChange(code)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
