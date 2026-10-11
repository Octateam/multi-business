import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton, HdsTextarea } from '../../../components/ui/hds'
import { BillsBackLink, VendorHeader, Card, FieldRow, TimelineRow } from './shared'
import { longDate } from '../list/billRecords'
import { BillInvoiceCard, BillViewStepper, STATUS_BADGE, useBillView } from './billViewShell'

export default function NorthwindDesignLtdProvideFurtherDetailsEmpty() {
  const navigate = useNavigate()
  const bill = useBillView('Needs action')
  const qs = `?bill=${encodeURIComponent(bill.id)}`
  const [response, setResponse] = useState('')
  const isValid = response.trim() !== ''

  return (
    <AppShell>
      <div className="relative w-full">
        {/* Dimmed backdrop — same bill state as the "Approval, requested information" screen */}
        <div className="pointer-events-none flex w-full flex-col gap-6 pb-[90px] pt-7 opacity-40">
          <BillsBackLink />
          <VendorHeader
            vendorName={bill.vendor}
            status={STATUS_BADGE[bill.status] ?? 'info-needed'}
            statusLabel={bill.status}
            createdBy={bill.createdBy ?? 'John Doe'}
            createdDate={bill.createdDate}
          />
          <BillViewStepper active={3} bill={bill} />
          <div className="flex w-full items-start gap-4">
            <div className="flex flex-1 flex-col gap-4">
              <Card title="Approval details">
                <FieldRow label="Bill amount" value={bill.amount} />
                <FieldRow label="Payee (Merchant/vendor)" value={bill.vendor} />
                <FieldRow label="Due date" value={longDate(bill.dueDate) || '—'} last />
              </Card>
              <Card title="Requested information">
                <TimelineRow
                  done
                  title="Information requested"
                  subtitle="Thomas Bennett: “The receipt amount doesn’t match the amount submitted.”"
                  date="28 Jul 2026"
                  isLast
                />
              </Card>
            </div>
            <BillInvoiceCard filename={bill.invoiceFile} />
          </div>
        </div>

        {/* Scrim */}
        <div className="fixed inset-0 z-10 bg-[rgba(10,13,18,0.4)]" onClick={() => navigate(-1)} aria-hidden="true" />

        {/* Right-side "Provide further details" drawer */}
        <div className="fixed bottom-10 right-10 top-10 z-20 flex w-[465px] max-w-[90vw] flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
              Provide further details
            </p>
            <p className="text-sm text-[#555354]">Add the requested details to continue approval process.</p>
          </div>

          <div className="flex flex-col gap-2 border-b border-[#e5e7eb] pb-3">
            <p className="text-sm font-medium text-text-primary">Requested information</p>
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <p className="text-sm text-[#384250]">
                The invoice amount doesn’t match the amount submitted. Please provide the correct amount and upload
                an updated invoice.
              </p>
            </div>
          </div>

          <HdsTextarea
            id="response"
            label="Your response"
            rows={5}
            maxChars={120}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Add the requested details or explain the update you’ve made"
          />

          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-[#e5e7eb]" />
            <p className="text-sm font-medium text-text-primary">Or</p>
            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-disabled px-4 py-6 text-center">
            <span className="text-sm font-medium text-[#004b87]">Click to upload</span>
            <span className="text-xs text-text-quaternary">or drag and drop an updated invoice (PNG, JPG, PDF)</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) navigate(`/bills/review/northwind-design-ltd-provide-further-details-file-uploaded${qs}`)
              }}
            />
          </label>

          <div className="flex flex-col gap-4">
            <HdsButton variant="primary" fullWidth disabled={!isValid} onClick={() => navigate(`/bills/review/northwind-design-ltd-provide-further-details-file-uploaded${qs}`)}>
              Submit information
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={() => navigate(-1)}>
              Cancel
            </HdsButton>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
