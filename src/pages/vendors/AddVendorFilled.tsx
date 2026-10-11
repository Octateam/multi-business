import { useState } from 'react'
import { useGoBack } from '../../lib/navHistory'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import { ACCOUNT_TYPE_OPTIONS, BANK_OPTIONS, VENDOR_CATEGORY_OPTIONS } from '../bills2/hdsKit'
import {
  VendorsPageHeader,
  VendorsDirectory,
  DrawerOverlay,
  DrawerHeader,
  DrawerSubmitButton,
  ToggleSegment,
  FieldInput,
  FieldSelect,
  SectionHeading,
  TaxIdToggle,
  PhoneField,
  VENDOR_COUNTRY_OPTIONS,
  stateOptionsFor,
  cityOptionsFor,
  type VendorType,
} from './shared'

// Figma node 44939:348930 — "Add vendor" drawer fully filled out (payment details, contact details, tax ID)
export default function AddVendorFilled() {
  const navigate = useNavigate()
  const goBack = useGoBack('/vendors/add-country-dropdown')
  const location = useLocation()
  const pickedCountry = (location.state as { country?: string } | null)?.country
  const initialCountry = !pickedCountry || pickedCountry === 'United States' ? 'United States of America' : pickedCountry

  const [vendorType, setVendorType] = useState<VendorType>('Individual')
  const [businessName, setBusinessName] = useState('Northwind Studio Ltd')
  const [category, setCategory] = useState('Software')
  const [hasTaxId, setHasTaxId] = useState(true)
  const [phoneIso, setPhoneIso] = useState('US')
  const [form, setForm] = useState({
    firstName: 'Joleen',
    lastName: 'Freeman',
    country: initialCountry,
    accountName: 'Northwind Studio Ltd',
    accountType: 'Checking',
    accountNumber: '4350437854',
    bankName: 'Chase Bank',
    routingNumber: '123243424',
    swift: 'TESTUS33XXX',
    street: 'No, 131 Wall Street, NY',
    city: 'New York City',
    state: initialCountry === 'United States of America' ? 'New York' : '',
    zip: '10001',
    taxId: 'GB123456789',
    email: 'account@northwind.com',
    phone: '(555) 040-3283',
  })
  const [contact, setContact] = useState({ street: '', country: '', state: '', city: '', postal: '' })
  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }))
  const setC = (key: keyof typeof contact) => (v: string) => setContact((c) => ({ ...c, [key]: v }))

  const OPTIONAL: (keyof typeof form)[] = ['swift', 'taxId']
  // Business vendors are named by business name instead of first/last name.
  const NOT_APPLICABLE: (keyof typeof form)[] = vendorType === 'Business' ? ['firstName', 'lastName'] : []
  const isValid =
    (Object.keys(form) as (keyof typeof form)[]).every((k) => OPTIONAL.includes(k) || NOT_APPLICABLE.includes(k) || form[k].trim() !== '') &&
    (vendorType === 'Individual' || businessName.trim() !== '')

  const enterAutomatically = () =>
    setContact({ street: form.street, country: form.country, state: form.state, city: form.city, postal: form.zip })

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader
          subtitle="Manage the people and businesses you pay, their payout details and spending history."
          onAddVendor={() => {}}
          onImport={() => navigate('/vendors/import')}
        />

        <VendorsDirectory searchDemoTo={(q) => navigate('/vendors/empty-search', { state: { query: q } })} />

        <DrawerOverlay>
          <div className="flex flex-col gap-6">
            <DrawerHeader title="Add vendor" onBack={goBack} />

            <div className="flex flex-col gap-4">
              <ToggleSegment active={vendorType} onChange={setVendorType} />
              {vendorType === 'Individual' ? (
                <div className="flex items-start gap-4">
                  <FieldInput label="First name" value={form.firstName} placeholder="Enter first name" onChange={set('firstName')} half />
                  <FieldInput label="Last name" value={form.lastName} placeholder="Enter last name" onChange={set('lastName')} half />
                </div>
              ) : (
                <FieldInput label="Business name" value={businessName} placeholder="Enter registered business name" onChange={setBusinessName} />
              )}
              <FieldSelect label="Category" value={category} options={VENDOR_CATEGORY_OPTIONS} onChange={setCategory} helper="Pre-fills on every bill." />

              <div className="flex flex-col gap-4">
                <SectionHeading label="Payment details" />
                <FieldSelect
                  label="Country"
                  value={form.country}
                  options={VENDOR_COUNTRY_OPTIONS}
                  searchPlaceholder="Search country"
                  helper="Where the vendor's account is held"
                  onChange={(c) => setForm((f) => ({ ...f, country: c, state: c === f.country ? f.state : '' }))}
                />
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-[calc(50%-8px)]">
                    <FieldInput label="Account name" value={form.accountName} placeholder="Name on the account" onChange={set('accountName')} />
                  </div>
                  <div className="w-[calc(50%-8px)]">
                    <FieldSelect label="Account type" value={form.accountType} options={ACCOUNT_TYPE_OPTIONS} onChange={set('accountType')} />
                  </div>
                  <div className="w-[calc(50%-8px)]">
                    <FieldInput label="Account number" value={form.accountNumber} placeholder="Enter account number" onChange={set('accountNumber')} />
                  </div>
                  <div className="w-[calc(50%-8px)]">
                    <FieldSelect label="Bank name" value={form.bankName} options={BANK_OPTIONS} searchPlaceholder="Search bank" onChange={set('bankName')} />
                  </div>
                  <div className="w-[calc(50%-8px)]">
                    <FieldInput label="Routing number" value={form.routingNumber} placeholder="9 digits" onChange={set('routingNumber')} />
                  </div>
                  <div className="w-[calc(50%-8px)]">
                    <FieldInput label="SWIFT/BIC (optional)" value={form.swift} placeholder="e.g. CHASUS33" onChange={set('swift')} />
                  </div>
                </div>
                <FieldInput label="Street address" value={form.street} placeholder="Enter address" onChange={set('street')} />
                <div className="flex items-start gap-4">
                  <FieldInput label="City" value={form.city} placeholder="Enter city" onChange={set('city')} half />
                  <FieldSelect label="State" value={form.state} options={stateOptionsFor(form.country)} searchPlaceholder="Search state" onChange={set('state')} half />
                </div>
                <FieldInput label="Zip code" value={form.zip} placeholder="Enter zip code" onChange={set('zip')} />
                <TaxIdToggle on={hasTaxId} onChange={setHasTaxId} />
                {hasTaxId && <FieldInput label="Tax identification number" value={form.taxId} placeholder="e.g. 12-3456789" onChange={set('taxId')} helper="Optional" />}
              </div>

              <div className="flex flex-col gap-4">
                <SectionHeading label="Contact details" />
                <FieldInput label="Email" type="email" value={form.email} placeholder="name@company.com" onChange={set('email')} />
                <PhoneField iso={phoneIso} onIsoChange={setPhoneIso} number={form.phone} onChange={set('phone')} />
                <FieldInput label="Street Address" value={contact.street} placeholder="Enter address" onChange={setC('street')} />
                <div className="flex items-start gap-4">
                  <FieldSelect
                    label="Country"
                    placeholder="Select…"
                    value={contact.country || null}
                    options={VENDOR_COUNTRY_OPTIONS}
                    searchPlaceholder="Search country"
                    onChange={(c) => setContact((x) => ({ ...x, country: c, state: '', city: '' }))}
                    half
                  />
                  <FieldSelect
                    label="State"
                    placeholder="Select..."
                    value={contact.state || null}
                    options={stateOptionsFor(contact.country)}
                    searchPlaceholder="Search state"
                    onChange={(s) => setContact((x) => ({ ...x, state: s, city: '' }))}
                    half
                  />
                </div>
                <div className="flex items-start gap-4">
                  <FieldSelect label="City" placeholder="Select…" value={contact.city || null} options={cityOptionsFor(contact.state)} searchPlaceholder="Search city" onChange={setC('city')} half />
                  <FieldInput label="Postal code" value={contact.postal} placeholder="Enter value" onChange={setC('postal')} half />
                </div>
                <HdsButton variant="link" size="sm" className="w-fit !text-sm" onClick={enterAutomatically}>
                  Enter automatically
                </HdsButton>
              </div>
            </div>

            <DrawerSubmitButton label="Review" enabled={isValid} onClick={() => navigate('/vendors')} />
          </div>
        </DrawerOverlay>
      </main>
    </AppShell>
  )
}
