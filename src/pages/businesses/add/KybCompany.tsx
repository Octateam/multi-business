import { useNavigate } from 'react-router-dom'
import { FieldInput, FieldSelect } from '../shared'
import { FieldShell, HdsDatePicker, parseHdsDate } from '../../../components/ui/hds'
import {
  KybPageShell,
  SectionLabel,
  UploadBox,
  KybCheckbox,
  SuccessAlert,
  PhoneField,
  BUSINESS_CATEGORIES,
  BUSINESS_TYPES,
  COUNTRY_OPTIONS,
  PROOF_OF_ADDRESS_TYPES,
} from './kybShared'
import { draftDisplayName, updateDraft, useNewBusinessDraft, type NewBusinessDraft } from './newBusinessDraft'
import { useSyncAddedBusiness } from './useSyncAddedBusiness'

// Step 2 — "Company" (Figma node 46940:433218, filed under the misleading
// name "Manage 01 — Manage businesses (default)" in the source file —
// verified by screenshot to actually be the 4-step KYB "Company" form).
// Full page (not a modal): back link, "Finish setting up {business}"
// header, stepper, and the Company details/Information/Registration/Address
// sections.
//
// Values live in the module-level draft store (./newBusinessDraft) so the
// Business details/information entered on "Tell us about your new business"
// arrive prefilled (still editable), and everything survives going back and
// forth between steps.
export default function KybCompany() {
  const navigate = useNavigate()
  const d = useNewBusinessDraft()
  const syncBusiness = useSyncAddedBusiness()
  const set =
    <K extends keyof NewBusinessDraft>(key: K) =>
    (value: NewBusinessDraft[K]) =>
      updateDraft({ [key]: value } as Partial<NewBusinessDraft>)

  // Demo-only uniqueness check: the design shows an inline error example on
  // this exact value ("RC 1234567" -> "This RC number is already
  // registered"). We implement the error state on the field but only surface
  // it when the value actually matches that demo "already taken" number.
  const registrationError =
    d.registrationNumber.trim().toUpperCase() === 'RC 1234567' ? 'This RC number is already registered' : undefined

  const isValid =
    [
      d.legalName,
      d.tradingName,
      d.email,
      d.phone,
      d.category,
      d.type,
      d.registrationNumber,
      d.dateOfIncorporation,
      d.countryOfIncorporation,
      d.countryOfOperation,
      d.tin,
      d.website,
      d.registeredAddress,
      d.proofType,
    ].every((value) => value.trim() !== '') &&
    !!parseHdsDate(d.dateOfIncorporation) &&
    !registrationError &&
    d.certificateUploaded &&
    d.articlesUploaded &&
    d.proofUploaded

  const leave = (path: string) => {
    syncBusiness()
    navigate(path)
  }

  return (
    <KybPageShell
      businessName={draftDisplayName(d)}
      currentStep="company"
      onSaveExit={() => leave('/businesses')}
      onContinue={() => leave('/businesses/add/ownership')}
      continueDisabled={!isValid}
    >
      <div className="flex flex-col gap-5 border-b border-[#edeff2] pb-7">
        <SectionLabel>Business details</SectionLabel>
        {/* Row 1: Legal name | Trading name · Row 2: Business email | Phone number */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FieldInput label="Legal business name" value={d.legalName} onChange={set('legalName')} placeholder="e.g. Novu Bistro Ltd" />
          <FieldInput label="Trading name" value={d.tradingName} onChange={set('tradingName')} placeholder="e.g. Novu Bistro" />
          <FieldInput
            label="Business email"
            type="email"
            value={d.email}
            onChange={set('email')}
            placeholder="e.g. hello@novubistro.com"
          />
          <PhoneField value={d.phone} onChange={set('phone')} country={d.phoneCountry} onCountryChange={set('phoneCountry')} />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-b border-[#edeff2] pb-7">
        <SectionLabel>Business information</SectionLabel>
        <div className="flex flex-wrap gap-5">
          <FieldSelect
            label="Business category"
            value={d.category}
            onChange={set('category')}
            options={BUSINESS_CATEGORIES}
            placeholder="Select a category"
            searchPlaceholder="Search categories"
            half
          />
          <FieldSelect label="Business type" value={d.type} onChange={set('type')} options={BUSINESS_TYPES} placeholder="Select a type" half />
        </div>
      </div>

      <div className="flex flex-col gap-5 border-b border-[#edeff2] pb-7">
        <SectionLabel>Business registration</SectionLabel>
        <div className="flex flex-wrap gap-5">
          <FieldShell
            label="Certificate of incorporation"
            helper="Does this look right? We’ve pre-filled the fields below."
            className="min-w-[240px] flex-1"
          >
            <UploadBox fileName="certificate-of-incorporation.pdf" uploaded={d.certificateUploaded} onUploadedChange={set('certificateUploaded')} />
          </FieldShell>
          <FieldInput
            label="Registration number"
            value={d.registrationNumber}
            onChange={set('registrationNumber')}
            placeholder="e.g. RC 1234567"
            error={registrationError}
            half
          />
        </div>
        <div className="flex flex-wrap gap-5">
          <HdsDatePicker
            label="Date of incorporation"
            value={d.dateOfIncorporation}
            onChange={set('dateOfIncorporation')}
            max={new Date()}
            className="min-w-[240px] flex-1"
          />
          <FieldSelect
            label="Country of incorporation"
            value={d.countryOfIncorporation}
            onChange={set('countryOfIncorporation')}
            options={COUNTRY_OPTIONS}
            placeholder="Select a country"
            searchPlaceholder="Search countries"
            half
          />
        </div>
        <div className="flex flex-wrap gap-5">
          <FieldShell label="Articles of Association (By Laws)" className="min-w-[240px] flex-1">
            <UploadBox fileName="articles-of-association.jpeg" uploaded={d.articlesUploaded} onUploadedChange={set('articlesUploaded')} />
          </FieldShell>
          <FieldSelect
            label="Country of operation"
            value={d.countryOfOperation}
            onChange={set('countryOfOperation')}
            options={COUNTRY_OPTIONS}
            placeholder="Select a country"
            searchPlaceholder="Search countries"
            half
          />
        </div>
        <div className="flex flex-wrap gap-5">
          <FieldInput label="Tax Identification Number (TIN)" value={d.tin} onChange={set('tin')} half placeholder="e.g. 12345678-0001" />
          <FieldInput label="Company website / online presence" value={d.website} onChange={set('website')} half placeholder="https://" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <SectionLabel>Business address</SectionLabel>
        <FieldInput
          label="Registered address"
          value={d.registeredAddress}
          onChange={set('registeredAddress')}
          placeholder="e.g. 12 Marina Street, Lagos, 101233"
        />
        <KybCheckbox
          checked={d.sameAddress}
          onChange={set('sameAddress')}
          label="My operational address is the same as my registered address."
        />
        <div className="flex flex-wrap gap-5">
          <FieldSelect
            label="Proof of address type"
            value={d.proofType}
            onChange={set('proofType')}
            options={PROOF_OF_ADDRESS_TYPES}
            placeholder="Select a document type"
            half
          />
          <FieldShell label="Upload proof of address" className="min-w-[240px] flex-1">
            <UploadBox fileName="utility-bill-march-2026.pdf" uploaded={d.proofUploaded} onUploadedChange={set('proofUploaded')} />
          </FieldShell>
        </div>
        <SuccessAlert>Address verified</SuccessAlert>
      </div>
    </KybPageShell>
  )
}
