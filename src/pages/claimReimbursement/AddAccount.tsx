import { useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsSelect, type SelectOption } from '../../components/ui/hds'
import closeSquareIcon from '../../assets/icons/claim-manual-close-square.svg'
import flagUsIcon from '../../assets/icons/claim-manual-flag-us.svg'
import flagGbIcon from '../../assets/icons/accounts-dd-flag-gb.svg'
import flagNgIcon from '../../assets/icons/accounts-dd-flag-ng.svg'
import flagCaIcon from '../../assets/icons/vendors-flag-canada.svg'
import flagDeIcon from '../../assets/icons/vendors-flag-germany.svg'
import flagFrIcon from '../../assets/icons/vendors-flag-france.svg'
import flagSgIcon from '../../assets/icons/accounts-flag-sg.svg'
import flagInIcon from '../../assets/icons/vendors-flag-india.svg'
import flagKeIcon from '../../assets/icons/vendors-flag-kenya.svg'
import flagGhIcon from '../../assets/icons/vendors-flag-ghana.svg'
import { ManualEntryShell } from './shared'
import { FlagImg } from './CurrencyAmountField'

export type AccountForm = {
  country: string
  currency: string
  accountName: string
  accountType: string
  accountNumber: string
  bankName: string
  routingNumber: string
  swiftBic: string
  address: string
}

// Payout countries a beneficiary account can be added in, with the account currency each implies.
const COUNTRIES = [
  { value: 'US', label: 'United States of America', currency: 'USD', flag: flagUsIcon },
  { value: 'GB', label: 'United Kingdom', currency: 'GBP', flag: flagGbIcon },
  { value: 'NG', label: 'Nigeria', currency: 'NGN', flag: flagNgIcon },
  { value: 'DE', label: 'Germany', currency: 'EUR', flag: flagDeIcon },
  { value: 'FR', label: 'France', currency: 'EUR', flag: flagFrIcon },
  { value: 'CA', label: 'Canada', currency: 'CAD', flag: flagCaIcon },
  { value: 'SG', label: 'Singapore', currency: 'SGD', flag: flagSgIcon },
  { value: 'IN', label: 'India', currency: 'INR', flag: flagInIcon },
  { value: 'KE', label: 'Kenya', currency: 'KES', flag: flagKeIcon },
  { value: 'GH', label: 'Ghana', currency: 'GHS', flag: flagGhIcon },
]
const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.value,
  label: c.label,
  icon: <FlagImg src={c.flag} />,
  meta: c.currency,
}))

const ACCOUNT_TYPES: SelectOption[] = [
  { value: 'Checking', label: 'Checking' },
  { value: 'Savings', label: 'Savings' },
  { value: 'Business checking', label: 'Business checking' },
  { value: 'Business savings', label: 'Business savings' },
]

const INITIAL: AccountForm = {
  country: 'United States of America',
  currency: 'USD',
  accountName: '',
  accountType: 'Checking',
  accountNumber: '',
  bankName: '',
  routingNumber: '',
  swiftBic: '',
  address: '',
}

// Figma node 45766:410887 ("sweep function", "Add new account") — Country defaults to the US
// example shown in Figma and is a working HDS select (this prototype doesn't implement the
// per-country dynamic field set the product spec describes); the rest of the fields are real inputs so the entered account
// carries through to the Review step and back into the claim form.
export default function AddAccount() {
  const navigate = useNavigate()
  const location = useLocation() as { pathname: string; state?: { account?: AccountForm; fromForm?: boolean } | null }
  // Restores what was entered when the user comes Back from Review.
  const [form, setForm] = useState<AccountForm>(location.state?.account ?? INITIAL)
  const fromForm = Boolean(location.state?.fromForm)

  const set = (key: keyof AccountForm) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }))
  const bind = (key: keyof AccountForm) => ({
    value: form[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) => set(key)(event.target.value),
  })
  const countryCode = COUNTRIES.find((c) => c.label === form.country)?.value ?? 'US'

  const canContinue =
    form.accountName.trim() &&
    form.accountNumber.trim() &&
    form.bankName.trim() &&
    form.routingNumber.trim() &&
    form.swiftBic.trim()

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full items-center justify-between">
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
                Add new account
              </h1>
              <button type="button" onClick={() => navigate(-1)} aria-label="Close">
                <img src={closeSquareIcon} alt="" className="size-6" />
              </button>
            </div>

            <HdsSelect
              label="Country"
              options={COUNTRY_OPTIONS}
              value={countryCode}
              searchPlaceholder="Search country"
              onChange={(code) => {
                const picked = COUNTRIES.find((c) => c.value === code)
                if (picked) setForm((prev) => ({ ...prev, country: picked.label, currency: picked.currency }))
              }}
            />

            <HdsInput label="Account name" {...bind('accountName')} placeholder="Enter account name" />

            <HdsSelect label="Account type" options={ACCOUNT_TYPES} value={form.accountType} onChange={set('accountType')} />

            <div className="grid w-full grid-cols-2 gap-4">
              <HdsInput label="Account number" {...bind('accountNumber')} placeholder="Enter account number" />
              <HdsInput label="Bank name" {...bind('bankName')} placeholder="Enter bank name" />
              <HdsInput label="Routing number" {...bind('routingNumber')} placeholder="Enter routing number" />
              <HdsInput label="SWIFT/BIC" {...bind('swiftBic')} placeholder="Enter SWIFT/BIC" />
            </div>

            <HdsInput label="Address" optional {...bind('address')} placeholder="Enter bank address" />
          </div>

          <HdsButton
            fullWidth
            className="mt-8"
            disabled={!canContinue}
            onClick={() => {
              navigate(location.pathname, { replace: true, state: { account: form, fromForm } })
              navigate('/claim-reimbursement/manual-entry/add-account/review', {
                state: { account: form, fromForm },
              })
            }}
          >
            Review details
          </HdsButton>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
