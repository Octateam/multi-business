import { useNavigate } from 'react-router-dom'
import { FieldInput, FieldSelect } from '../shared'
import Badge from '../../../components/ui/Badge'
import { HdsBadge, HdsButton } from '../../../components/ui/hds'
import addPlusIcon from '../../../assets/icons/kyb-add-plus.svg'
import { KybPageShell, UploadBox, KybCheckbox, YesNoToggle, DESIGNATIONS } from './kybShared'
import { draftDisplayName, updateDraft, useNewBusinessDraft, type NewBusinessDraft } from './newBusinessDraft'
import { useSyncAddedBusiness } from './useSyncAddedBusiness'

// Step 3 — "Ownership" (Figma node 46940:245205, filed under the misleading
// name "Manage 01 — Manage businesses (default)" — verified by screenshot
// to actually be the Shareholder/UBO section of the KYB stepper).
export default function KybOwnership() {
  const navigate = useNavigate()
  const d = useNewBusinessDraft()
  const syncBusiness = useSyncAddedBusiness()
  const set =
    <K extends keyof NewBusinessDraft>(key: K) =>
    (value: NewBusinessDraft[K]) =>
      updateDraft({ [key]: value } as Partial<NewBusinessDraft>)

  const percentNum = Number(d.ownershipPercent) || 0
  const isUbo = percentNum >= 25
  const roleLabel = isUbo ? 'Ultimate Beneficial Owner (UBO)' : 'Shareholder'
  const percentError = d.ownershipPercent !== '' && (percentNum <= 0 || percentNum > 100) ? 'Enter a percentage between 1 and 100' : undefined

  const isValid =
    d.firstName.trim() !== '' &&
    d.lastName.trim() !== '' &&
    percentNum > 0 &&
    percentNum <= 100 &&
    d.designation !== '' &&
    (!d.isSelf || d.verified) &&
    d.structureUploaded

  const leave = (path: string) => {
    syncBusiness()
    navigate(path)
  }

  return (
    <KybPageShell
      businessName={draftDisplayName(d)}
      currentStep="ownership"
      onSaveExit={() => leave('/businesses')}
      onContinue={() => leave('/businesses/add/business-profile')}
      continueDisabled={!isValid}
    >
      <div className="flex flex-col gap-[18px] border-b border-[#edeff2] pb-7">
        <div className="flex w-full items-center justify-between">
          <p className="text-base font-semibold text-[#111927]">Shareholder/ UBO 1</p>
          <Badge status="approved" label={roleLabel} />
        </div>

        <div className="flex flex-wrap gap-[18px]">
          <FieldInput label="First name" value={d.firstName} onChange={set('firstName')} half placeholder="e.g. Amelia" />
          <FieldInput label="Last name" value={d.lastName} onChange={set('lastName')} half placeholder="e.g. Smith" />
        </div>

        <div className="flex flex-wrap items-start gap-[18px]">
          <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
            <FieldInput
              label="Ownership %"
              type="number"
              inputMode="decimal"
              value={d.ownershipPercent}
              onChange={set('ownershipPercent')}
              placeholder="e.g. 60"
              suffix="%"
              error={percentError}
            />
            {isUbo && !percentError && (
              <div className="pt-1.5">
                <Badge status="approved" label="This person is classified as a UBO (25% or more)" />
              </div>
            )}
          </div>
          <FieldSelect
            label="Designation"
            value={d.designation}
            onChange={set('designation')}
            options={DESIGNATIONS}
            placeholder="Select a designation"
            half
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#111927]">Politically Exposed Person (PEP)?</p>
          <YesNoToggle value={d.pep} onChange={set('pep')} />
        </div>

        <div className="flex w-full items-center justify-between">
          <KybCheckbox checked={d.isDirector} onChange={set('isDirector')} label="This person is a director of this company." />
          <HdsButton variant="primary-link" size="sm" leadingIcon={<img src={addPlusIcon} alt="" className="h-[11.67px] w-[11.67px]" />}>
            Add a director
          </HdsButton>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edeff2] pt-3">
          <KybCheckbox checked={d.isSelf} onChange={set('isSelf')} label="I am the person named above" />
          {d.isSelf && (
            <div className="flex w-full items-center gap-3">
              <p className="flex-1 text-[13px] text-[#6b7280]">Identity verification via Sumsub</p>
              {d.verified ? (
                <HdsBadge color="green" size="lg" dot>
                  Verified
                </HdsBadge>
              ) : (
                <HdsButton variant="primary" size="sm" shape="pill" onClick={() => updateDraft({ verified: true })}>
                  Verify identity
                </HdsButton>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[#111927]">
          Ownership structure/ organizational chart <span>*</span>
        </p>
        <div className="max-w-[475px]">
          <UploadBox fileName="ownership-structure.pdf" uploaded={d.structureUploaded} onUploadedChange={set('structureUploaded')} />
        </div>
      </div>
    </KybPageShell>
  )
}
