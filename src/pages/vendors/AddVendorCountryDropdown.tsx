import { useState } from 'react'
import { useGoBack } from '../../lib/navHistory'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VENDOR_CATEGORY_OPTIONS } from '../bills2/hdsKit'
import {
  VendorsPageHeader,
  VendorsDirectory,
  DrawerOverlay,
  DrawerHeader,
  DrawerSubmitButton,
  ToggleSegment,
  FieldInput,
  FieldSelect,
  ADD_VENDOR_COUNTRY_OPTIONS,
  type VendorType,
} from './shared'

// Figma node 44939:343968 — "Add vendor" drawer, Individual/Business toggle, country-select dropdown open
export default function AddVendorCountryDropdown() {
  const navigate = useNavigate()
  const goBack = useGoBack('/vendors')
  const [vendorType, setVendorType] = useState<VendorType>('Individual')
  const [firstName, setFirstName] = useState('Joleen')
  const [lastName, setLastName] = useState('Freeman')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('Software')
  const [country, setCountry] = useState<string | null>('Kenya')

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
                <div className="flex gap-4">
                  <FieldInput label="First name" value={firstName} placeholder="Enter first name" onChange={setFirstName} half />
                  <FieldInput label="Last name" value={lastName} placeholder="Enter last name" onChange={setLastName} half />
                </div>
              ) : (
                <FieldInput label="Business name" value={businessName} placeholder="Enter registered business name" onChange={setBusinessName} />
              )}
              <FieldSelect label="Category" value={category} options={VENDOR_CATEGORY_OPTIONS} onChange={setCategory} helper="Pre-fills on every bill." />

              <div className="flex flex-col gap-4">
                <p className="border-b border-[#eff2f4] pb-2.5 text-base font-semibold text-text-primary">Payment details</p>
                {/* Designed "dropdown open" state: menu starts open, still closes on outside click / Esc. */}
                <FieldSelect
                  label="Country"
                  placeholder="Select country"
                  value={country}
                  options={ADD_VENDOR_COUNTRY_OPTIONS}
                  searchPlaceholder="Search country"
                  defaultOpen
                  menuMode="inline"
                  onChange={(c) => {
                    setCountry(c)
                    navigate('/vendors/add-filled', { state: { country: c } })
                  }}
                />
              </div>
            </div>

            <DrawerSubmitButton label="Review" enabled={false} />
          </div>
        </DrawerOverlay>
      </main>
    </AppShell>
  )
}
