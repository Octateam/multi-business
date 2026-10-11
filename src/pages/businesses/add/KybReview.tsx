import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import { KybPageShell, ReviewRow, ReviewSectionHeader, KybCheckbox } from './kybShared'
import { draftDisplayName, useNewBusinessDraft } from './newBusinessDraft'
import { useSyncAddedBusiness } from './useSyncAddedBusiness'

// Step 5 — "Review" (Figma node 46940:245553, filed under the misleading
// name "Manage 01 — Manage businesses (default)" — verified by screenshot
// to actually be the final read-only summary + declarations step of the
// KYB stepper). Rows show what the user entered on the previous steps (from
// the draft store); a field left empty — e.g. on a deep link straight to this
// route — falls back to the design's illustrative sample value.
const or = (value: string, sample: string) => (value.trim() ? value.trim() : sample)

export default function KybReview() {
  const navigate = useNavigate()
  const d = useNewBusinessDraft()
  const syncBusiness = useSyncAddedBusiness()
  const businessName = draftDisplayName(d)

  const [expanded, setExpanded] = useState({ company: true, ownership: true, profile: true })
  const [declarations, setDeclarations] = useState({
    accurate: false,
    authorized: false,
    ownersDisclosed: false,
    terms: false,
  })

  const allDeclared = Object.values(declarations).every(Boolean)
  const toggleSection = (key: keyof typeof expanded) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const ownerName = d.firstName.trim() || d.lastName.trim() ? `${d.firstName.trim()} ${d.lastName.trim()}`.trim() : 'Amelia Ortiz'
  const ownerPercent = Number(d.ownershipPercent) || 60
  const ownerIsUbo = ownerPercent >= 25

  const submit = () => {
    syncBusiness('verification-pending')
    navigate('/businesses', { state: { submittedBusinessName: businessName } })
  }

  return (
    <KybPageShell
      businessName={businessName}
      currentStep="review"
      onSaveExit={() => {
        syncBusiness()
        navigate('/businesses')
      }}
      onContinue={submit}
      continueLabel="Submit application"
      continueDisabled={!allDeclared}
    >
      <div className="flex flex-col gap-4 border-b border-[#edeff2] pb-7">
        <ReviewSectionHeader
          title="1. Company details"
          expanded={expanded.company}
          onToggle={() => toggleSection('company')}
          onEdit={() => navigate('/businesses/add/company')}
        />
        {expanded.company && (
          <div className="flex flex-col gap-2.5">
            <ReviewRow label="Legal name" value={or(d.legalName, businessName)} />
            <ReviewRow label="Trading name" value={or(d.tradingName, or(d.legalName, businessName))} />
            <ReviewRow label="Business email" value={or(d.email, 'hello@novubistro.com')} />
            <ReviewRow label="Business type" value={or(d.type, 'Private limited company')} />
            <ReviewRow label="Registration number" value={or(d.registrationNumber, 'RC 1234567')} />
            <ReviewRow label="Country of incorporation" value={or(d.countryOfIncorporation, 'Nigeria')} />
            <ReviewRow label="Certificate of incorporation" value={d.certificateUploaded ? 'Uploaded' : 'Missing'} />
            <ReviewRow label="Registered address" value={or(d.registeredAddress, '12 Marina Street, Lagos, 101233')} />
            <ReviewRow label="Address verification status" value="Verified" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-b border-[#edeff2] pb-7">
        <ReviewSectionHeader
          title="2. Ownership"
          expanded={expanded.ownership}
          onToggle={() => toggleSection('ownership')}
          onEdit={() => navigate('/businesses/add/ownership')}
        />
        {expanded.ownership && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex w-[264px] shrink-0 items-center justify-between gap-2">
                <p className="text-[13px] text-[#6b7280]">Owner 1</p>
                <Badge status="approved" label={ownerIsUbo ? 'Ultimate Beneficial Owner (UBO)' : 'Shareholder'} />
              </div>
              <p className="text-[13px] font-medium text-[#111927]">
                {ownerName}, {ownerPercent}%{d.designation ? ` · ${d.designation}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-b border-[#edeff2] pb-7">
        <ReviewSectionHeader
          title="3. Business & financial profile"
          expanded={expanded.profile}
          onToggle={() => toggleSection('profile')}
          onEdit={() => navigate('/businesses/add/business-profile')}
        />
        {expanded.profile && (
          <div className="flex flex-col gap-2.5">
            <ReviewRow label="Business category" value={or(d.profileCategory, 'Marketplace/platform')} />
            <ReviewRow label="Business description" value={or(d.description, 'Marketplace paying vendors across Africa')} />
            <ReviewRow label="Top transaction currencies" value={d.currencies.length ? d.currencies.join(', ') : '—'} />
            <ReviewRow label="Source of funds" value={or(d.sourceOfFunds, 'Business revenue')} />
            <ReviewRow label="Expected monthly volume" value={or(d.expectedVolume, '$100k to $500k')} />
            <ReviewRow label="Services needed" value={d.services.length ? d.services.join(', ') : '—'} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <p className="font-heading text-lg font-medium text-[#111927]">Declarations and terms</p>
        <KybCheckbox
          checked={declarations.accurate}
          onChange={(v) => setDeclarations((x) => ({ ...x, accurate: v }))}
          label="I certify the information provided is true, accurate, and complete."
        />
        <KybCheckbox
          checked={declarations.authorized}
          onChange={(v) => setDeclarations((x) => ({ ...x, authorized: v }))}
          label={`I am authorized to open and operate this account on behalf of ${businessName}.`}
        />
        <KybCheckbox
          checked={declarations.ownersDisclosed}
          onChange={(v) => setDeclarations((x) => ({ ...x, ownersDisclosed: v }))}
          label="I confirm all owners (25%+) and directors have been disclosed."
        />
        <KybCheckbox
          checked={declarations.terms}
          onChange={(v) => setDeclarations((x) => ({ ...x, terms: v }))}
          label={
            <>
              I have read and agree to the{' '}
              <a href="#terms" onClick={(e) => e.stopPropagation()} className="font-medium text-[#004b87] hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.stopPropagation()} className="font-medium text-[#004b87] hover:underline">
                Privacy Policy
              </a>
            </>
          }
        />
        {!allDeclared && <p className="text-[11px] text-[#6b7280]">All 4 declarations must be checked before you can submit.</p>}
      </div>
    </KybPageShell>
  )
}
