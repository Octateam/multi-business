import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import { ApprovalWorkflowPreview, Card, DefinitionRow, ReviewHeader, ReviewQueuePanel } from './shared'

export default function QueueVendorInfoReadOnly() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          title="Imported bills"
          subtitle="Review the imported bill before it enters your approval queue"
          actions={
            <>
              <Button variant="secondary" onClick={() => navigate('/bills')}>
                Skip for now
              </Button>
              <Button variant="primary" onClick={() => navigate('/bills')}>
                Confirm &amp; add to queue
              </Button>
            </>
          }
        />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Card title="Vendor">
              <DefinitionRow term="Payee (Merchant/vendor)" description="Northwind Design Ltd" />
              <DefinitionRow term="Category" description="Design services" />
              <DefinitionRow term="Vendor type" description="Business" />
            </Card>

            <Card title="Bill details">
              <DefinitionRow term="Reference (invoice number)" description="NW-2481" />
              <DefinitionRow term="Currency" description="GBP - Great British Pound" />
              <DefinitionRow term="Bill date" description="14 September 2026" />
              <DefinitionRow term="Due date" description="14 October 2026" />
            </Card>

            <Card title="Bill breakdown">
              <div className="flex flex-col">
                <div className="flex gap-2 border-b border-[#e5e7eb] pb-2 text-xs font-medium text-text-quaternary">
                  <p className="flex-[2]">Item</p>
                  <p className="flex-1 text-right">Qty</p>
                  <p className="flex-1 text-right">Unit price</p>
                  <p className="flex-1 text-right">Amount</p>
                </div>
                <div className="flex gap-2 border-b border-[#f3f4f6] py-3 text-sm">
                  <p className="flex-[2] text-text-primary">Brand identity refresh — phase 2</p>
                  <p className="flex-1 text-right text-text-quaternary">1</p>
                  <p className="flex-1 text-right text-text-quaternary">£7,600.00</p>
                  <p className="flex-1 text-right font-medium text-text-primary">£7,600.00</p>
                </div>
                <div className="flex justify-between pt-3">
                  <p className="text-sm font-semibold text-text-primary">Total</p>
                  <p className="text-sm font-semibold text-text-primary">£7,600.00</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex w-[236px] shrink-0 flex-col gap-4">
            <ApprovalWorkflowPreview />
          </div>

          <ReviewQueuePanel
            heading="Bills list"
            count={6}
            total="$46,220.00"
            items={[
              { name: 'Northwind Design Ltd', badges: [{ label: 'Imported', status: 'info' }] },
              { name: 'Acme Print Co', badges: [{ label: 'New vendor', status: 'info' }] },
              { name: 'Amazon Web Services', badges: [{ label: 'Recurring', status: 'neutral' }] },
            ]}
          />
        </div>
      </div>
    </AppShell>
  )
}
