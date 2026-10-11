import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import { BackLink, ManualEntryShell } from './shared'
import { useGoBack } from '../../lib/navHistory'

function DefRow({ label, value, underline }: { label: string; value: string; underline?: boolean }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#4d5761]">{label}</p>
      <p className={`text-right text-[13px] font-medium text-[#0c2129] ${underline ? 'underline' : ''}`}>{value}</p>
    </div>
  )
}

// "Ready to submit?" — Figma node 47401:537088, the last screen of the Pay-a-vendor manual
// entry section. Reached from ManualEntryForm's Review button (or the upload path).
export default function PayVendor() {
  const navigate = useNavigate()
  // Reached from the manual-entry form or straight from the upload path — Back returns to whichever it was.
  const goBack = useGoBack('/pay-vendor/manual-entry')

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex h-full w-full flex-col justify-between gap-8">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col items-start gap-2.5">
              <BackLink onClick={goBack} />
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
                <DefRow label="Requested by" value="Priya Raman" />
                <DefRow label="Vendor info" value="Northwind Design Ltd" />
                <DefRow label="Amount" value="$4,500.00" />
                <DefRow label="Category" value="Professional services" />
                <DefRow label="Description" value="Hosted the last company workshop with personal funds" />
                <DefRow label="Invoice (optional)" value="Invoice.pdf" underline />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4">
              <p className="text-sm font-semibold text-text-primary">Vendor details</p>
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

          <div className="flex w-full flex-col gap-4">
            <HdsButton fullWidth onClick={() => navigate('/requests', { state: { vendorPaymentSubmitted: true } })}>
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
