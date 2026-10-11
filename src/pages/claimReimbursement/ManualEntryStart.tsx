import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import uploadIcon from '../../assets/icons/claim-manual-upload.svg'
import { ManualEntryShell } from './shared'
import { useGoBack } from '../../lib/navHistory'

// Figma node 42557:355694 ("sweep function" under "Claim a reimbursement — filled", x=1961,
// y=4556) — the entry point both Submit-expense paths (Requests page and Expenses overview)
// land on when "Claim a reimbursement" is picked.
export default function ManualEntryStart() {
  const navigate = useNavigate()
  // Reached from Requests, Expenses overview or the top-bar actions — Back returns to whichever it was.
  const goBack = useGoBack('/requests')

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1 text-xs font-medium text-[#555354]"
          >
            <svg viewBox="0 0 12 12" fill="none" className="size-3" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 3L4.5 6L7.5 9" stroke="#141B34" strokeWidth="0.77" strokeMiterlimit="16" />
            </svg>
            Back
          </button>

          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
                Claim a reimbursement
              </h1>
              <p className="text-sm text-[#555354]">
                Upload a receipt to fill in the details, or enter them manually
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/claim-reimbursement/review')}
                className="flex w-full flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-[#cbd0d8] bg-surface-2 px-6 py-7 hover:border-[#9aa1ac]"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
                  <img src={uploadIcon} alt="" className="size-4" />
                </span>
                <span className="text-sm font-medium text-text-primary">Click to upload or drag and drop</span>
                <span className="text-[11px] text-[#6b7280]">
                  We'll extract the details for you · PDF, JPG, PNG up to 10MB
                </span>
              </button>

              <HdsButton variant="link" onClick={() => navigate('/claim-reimbursement/manual-entry')}>
                Enter details manually
              </HdsButton>
            </div>
          </div>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
