import AppShell from '../../../components/layout/AppShell'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { Alert, Card, DefinitionRow, ReviewFooter, ReviewHeader, ReviewQueuePanel, ReviewStepper, UploadPreviewBox } from './shared'

const QUEUE_ITEMS = [
  { name: 'Acme Print Co', badges: [{ label: 'New vendor', status: 'info' as const }] },
  { name: 'Northwind Design Ltd', badges: [{ label: 'Payment failed', status: 'payment-failed' as const }] },
  { name: 'Amazon Web Services', badges: [{ label: 'Urgent', status: 'rejected' as const }] },
  { name: 'Chase Bank Fees', badges: [{ label: 'One-time', status: 'neutral' as const }] },
]

export default function BillDetailsTabPaymentFailedRetry() {
  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Check the details and take action"
          actions={
            <>
              <Button variant="secondary">Cancel bill</Button>
              <Button variant="primary">Retry payment</Button>
            </>
          }
        />
        <ReviewStepper active={2} />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <ReviewQueuePanel items={QUEUE_ITEMS} />

          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Alert
              tone="error"
              title="Payment failed"
              description="The payment to Northwind Design Ltd couldn't be completed. Check the vendor's bank details and retry."
            />

            <Card title="Bill details" action={<Badge status="payment-failed" label="Payment failed" />}>
              <DefinitionRow term="Reference (invoice number)" description="NW-2481" />
              <DefinitionRow term="Currency" description="GBP - Great British Pound" />
              <DefinitionRow term="Bill type" description="One time" />
              <DefinitionRow term="Bill date" description="14 September 2026" />
              <DefinitionRow term="Due date" description="14 October 2026" />
              <DefinitionRow term="Discount (optional)" description="£1.50" />
              <DefinitionRow term="Tax (optional)" description="£1.0" />
              <DefinitionRow term="Description" description="Office printing and supplies" />
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
                <div className="flex gap-2 border-b border-[#f3f4f6] py-3 text-sm">
                  <p className="flex-[2] text-text-primary">Design system documentation</p>
                  <p className="flex-1 text-right text-text-quaternary">1</p>
                  <p className="flex-1 text-right text-text-quaternary">£1,600.00</p>
                  <p className="flex-1 text-right font-medium text-text-primary">£1,600.00</p>
                </div>
              </div>
            </Card>

            <Card title="Total">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <p className="text-text-quaternary">Subtotal</p>
                  <p className="font-medium text-text-primary">£9,200.00</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-text-quaternary">Discount</p>
                  <p className="font-medium text-text-primary">-£200.00</p>
                </div>
                <div className="flex justify-between border-b border-[#e5e7eb] pb-3 text-sm">
                  <p className="text-text-quaternary">Tax (5%)</p>
                  <p className="font-medium text-text-primary">+£460.00</p>
                </div>
                <div className="flex justify-between pt-1">
                  <p className="text-sm font-semibold text-text-primary">Amount payable to vendor</p>
                  <p className="text-sm font-semibold text-text-primary">£9,460.00</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <UploadPreviewBox label="Invoice uploaded" filename="NW-2481.pdf" />
          </div>
        </div>
        <ReviewFooter>
          <Button variant="secondary">
            Cancel
          </Button>
          <Button variant="primary">
            Save
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
