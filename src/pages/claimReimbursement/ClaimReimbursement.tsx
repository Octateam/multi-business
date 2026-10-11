import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import arrowLeft from '../../assets/icons/claimbills-arrow-left.svg'
import { ManualEntryShell } from './shared'
import { useGoBack } from '../../lib/navHistory'

function DefRow({ label, value, underline }: { label: string; value: string; underline?: boolean }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className={`text-right text-[13px] font-medium text-[#0c2129] ${underline ? 'underline' : ''}`}>{value}</p>
    </div>
  )
}

// Result of the "upload a receipt" path from ManualEntryStart.tsx — we extract the details (data
// is hardcoded here, there's no real OCR in this prototype) and land the user on this review
// screen before they submit. The manual-entry path instead goes to ManualEntryForm.tsx.
export default function ClaimReimbursement() {
  const navigate = useNavigate()
  const goBack = useGoBack('/claim-reimbursement')

  return (
    <AppShell>
      <ManualEntryShell width={465 + 48}>
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col items-start gap-2.5">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-xs font-medium text-[#555354]"
              >
                <img src={arrowLeft} alt="" className="size-3" />
                Back
              </button>
              <div className="flex flex-col gap-2">
                <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
                  Ready to submit?
                </p>
                <p className="text-sm text-[#555354]">Make sure all information below is accurate.</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Expense details</p>
              <div className="flex w-full flex-col">
                <DefRow label="Payee (Merchant/vendor)" value="Northwind Design Ltd" />
                <DefRow label="Date paid" value="Jan 6, 2025" />
                <DefRow label="Due date" value="Jun 21, 2025" />
                <DefRow label="Amount" value="$4,500.00" />
                <DefRow label="Tax" value="$14.40" />
                <DefRow label="Category" value="Professional services" />
                <DefRow label="Description" value="Hosted the last company workshop with personal funds" />
                <DefRow label="Invoice (optional)" value="Invoice.pdf" underline />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Beneficiary details</p>
              <div className="flex w-full flex-col">
                <DefRow label="Account name" value="Priya Raman" />
                <DefRow label="Account number" value="1234567890" />
                <DefRow label="Account type" value="Checking" />
                <DefRow label="Bank name" value="Chase Bank" />
                <DefRow label="Routing number" value="021000021" />
                <DefRow label="Currency" value="USD" />
                <DefRow label="SWIFT/BIC" value="CHASUS33" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-4">
            <HdsButton fullWidth onClick={() => navigate('/requests', { state: { reimbursementSubmitted: true } })}>
              Submit request
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={() => navigate('/requests')}>
              Save as draft
            </HdsButton>
          </div>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
