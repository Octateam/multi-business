import { useNavigate } from 'react-router-dom'
import { FieldInput, FieldSelect } from '../shared'
import {
  KybPageShell,
  Chip,
  AddPillButton,
  BUSINESS_CATEGORIES,
  SOURCE_OF_FUNDS,
  EXPECTED_VOLUMES,
  CURRENCY_OPTIONS,
  MORE_CURRENCIES,
  SERVICE_OPTIONS,
} from './kybShared'
import { draftDisplayName, updateDraft, useNewBusinessDraft, type NewBusinessDraft } from './newBusinessDraft'
import { useSyncAddedBusiness } from './useSyncAddedBusiness'

// Step 4 — "Business & financial profile" (Figma node 46940:245380, filed
// under the misleading name "Manage 01 — Manage businesses (default)" —
// verified by screenshot to actually be the currency/services multi-select
// step of the KYB stepper). Category is prefilled from "Tell us about your
// new business".
export default function KybBusinessProfile() {
  const navigate = useNavigate()
  const d = useNewBusinessDraft()
  const syncBusiness = useSyncAddedBusiness()
  const set =
    <K extends keyof NewBusinessDraft>(key: K) =>
    (value: NewBusinessDraft[K]) =>
      updateDraft({ [key]: value } as Partial<NewBusinessDraft>)

  const toggleCurrency = (currency: string) =>
    updateDraft({
      currencies: d.currencies.includes(currency) ? d.currencies.filter((c) => c !== currency) : [...d.currencies, currency],
    })

  const addCurrency = (currency: string) =>
    updateDraft({
      extraCurrencies: d.extraCurrencies.includes(currency) ? d.extraCurrencies : [...d.extraCurrencies, currency],
      currencies: d.currencies.includes(currency) ? d.currencies : [...d.currencies, currency],
    })

  const toggleService = (service: string) =>
    updateDraft({
      services: d.services.includes(service) ? d.services.filter((s) => s !== service) : [...d.services, service],
    })

  const currencyChips = [...CURRENCY_OPTIONS, ...d.extraCurrencies]
  const addableCurrencies = MORE_CURRENCIES.filter((c) => !d.extraCurrencies.includes(c.value))

  const isValid =
    d.profileCategory !== '' &&
    d.description.trim() !== '' &&
    d.currencies.length > 0 &&
    d.sourceOfFunds !== '' &&
    d.sourceOfFundsDetail.trim() !== '' &&
    d.expectedVolume !== '' &&
    d.services.length > 0

  const leave = (path: string) => {
    syncBusiness()
    navigate(path)
  }

  return (
    <KybPageShell
      businessName={draftDisplayName(d)}
      currentStep="business-profile"
      onSaveExit={() => leave('/businesses')}
      onContinue={() => leave('/businesses/add/review')}
      continueDisabled={!isValid}
    >
      <div className="flex flex-wrap gap-6">
        <FieldSelect
          label="Select your business category?"
          value={d.profileCategory}
          onChange={set('profileCategory')}
          options={BUSINESS_CATEGORIES}
          placeholder="Select a category"
          searchPlaceholder="Search categories"
          half
        />
        <FieldInput
          label="A short description of your business"
          value={d.description}
          onChange={set('description')}
          half
          placeholder="e.g. Marketplace paying vendors across Africa"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[#111927]">
          Which currencies do you transact in most frequently? <span>*</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {currencyChips.map((currency) => (
            <Chip
              key={currency}
              label={currency}
              selected={d.currencies.includes(currency)}
              onToggle={() => toggleCurrency(currency)}
              removable
              unselectedBg="surface-2"
            />
          ))}
          <AddPillButton label="Add currency" options={addableCurrencies} onPick={addCurrency} searchPlaceholder="Search currencies" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <FieldSelect
          label="Primary source of funds"
          value={d.sourceOfFunds}
          onChange={set('sourceOfFunds')}
          options={SOURCE_OF_FUNDS}
          placeholder="Select a source"
          half
        />
        <FieldInput
          label="Please specify your source of funds"
          value={d.sourceOfFundsDetail}
          onChange={set('sourceOfFundsDetail')}
          half
          placeholder="e.g. Venture capital bridge financing"
        />
        <FieldSelect
          label="Expected monthly volume"
          value={d.expectedVolume}
          onChange={set('expectedVolume')}
          options={EXPECTED_VOLUMES}
          placeholder="Select a range"
          half
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[#111927]">
          Which services do you need? <span>*</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <Chip key={service} label={service} selected={d.services.includes(service)} onToggle={() => toggleService(service)} />
          ))}
        </div>
      </div>
    </KybPageShell>
  )
}
