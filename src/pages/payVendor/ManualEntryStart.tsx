import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import uploadIcon from '../../assets/icons/claim-manual-upload.svg'
import { BackLink, ManualEntryShell } from './shared'
import { useGoBack } from '../../lib/navHistory'

// Figma node 47401:535000 ("sweep function" under "Pay a vendor — manual entry, blank fields",
// x=2216, y=831) — the entry point both Submit-expense paths land on when "Pay a vendor" is
// picked. Mirrors claimReimbursement/ManualEntryStart.tsx's structure for the equivalent step.
export default function ManualEntryStart() {
  const navigate = useNavigate()
  // Reached from Requests, Expenses overview or the top-bar actions — Back returns to whichever it was.
  const goBack = useGoBack('/requests')

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex w-full flex-col gap-2.5">
          <BackLink onClick={goBack} />

          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
                Pay a vendor
              </h1>
              <p className="text-sm text-[#555354]">
                Upload an invoice to fill in the details, or enter them manually
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/pay-vendor/review')}
                className="flex w-full flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-[#cbd0d8] bg-surface-2 px-6 py-7 hover:border-[#9aa1ac]"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
                  <img src={uploadIcon} alt="" className="size-4" />
                </span>
                <span className="text-sm font-medium text-text-primary">Click to upload or drag and drop</span>
                <span className="text-[11px] text-[#6b7280]">
                  We'll extract the details for you · PDF, JPG, PNG up to 5MB
                </span>
              </button>

              <HdsButton variant="link" onClick={() => navigate('/pay-vendor/manual-entry')}>
                Enter details manually
              </HdsButton>
            </div>
          </div>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
