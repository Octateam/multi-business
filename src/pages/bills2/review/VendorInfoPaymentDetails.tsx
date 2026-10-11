import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import { Card, DefinitionRow, ReviewFooter, ReviewHeader, ReviewQueuePanel, ReviewStepper, type QueueItem } from './shared'

const QUEUE_ITEMS: QueueItem[] = [
  { name: 'Joleen Freeman', amount: '$10,488.00', badges: [{ label: 'Pending approval', status: 'pending' }] },
  { name: 'Northwind Design Ltd', amount: '$9,200.00', badges: [{ label: 'Payment failed', status: 'payment-failed' }] },
  { name: 'Meridian Legal Partners', amount: '$4,800.00', badges: [{ label: 'Overdue', status: 'rejected' }] },
  { name: 'Northstar Labs', amount: '$4,800.00', badges: [{ label: 'Payment pending', status: 'pending' }] },
  {
    name: 'Frank Bishop',
    amount: '$4,800.00',
    badges: [
      { label: 'Paid', status: 'paid' },
      { label: 'Monthly · cycle 7', status: 'neutral' },
    ],
  },
  { name: 'Deliveroo', amount: '$4,800.00', badges: [{ label: 'Cancelled', status: 'cancelled' }] },
  { name: 'Amazon web services', amount: '$800.00', badges: [{ label: 'Paid', status: 'paid' }] },
]

export default function VendorInfoPaymentDetails() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader subtitle="Look over the details and take action" />
        <ReviewStepper active={1} />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <ReviewQueuePanel items={QUEUE_ITEMS} />

          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Card title="Vendor info">
              <DefinitionRow term="Vendor type" description="Individual" />
              <DefinitionRow term="First name" description="Joleen" />
              <DefinitionRow term="Last name" description="Freeman" />
              <DefinitionRow term="Category" description="Software" />
            </Card>

            <Card title="Payment details">
              <DefinitionRow term="Country" description="United States of America" />
              <DefinitionRow term="Payment method" description="ACH" />
              <DefinitionRow term="Account name" description="Northwind Studios Ltd" />
              <DefinitionRow term="Bank name" description="Chase bank" />
              <DefinitionRow term="Routing number" description="021000021" />
              <DefinitionRow term="Account number" description="1234567890" />
              <DefinitionRow term="Account type" description="Checking" />
              <DefinitionRow term="Address line 1" description="No, 131 Wall Street, NY" />
              <DefinitionRow term="State" description="New York" />
              <DefinitionRow term="City" description="New York City" />
              <DefinitionRow term="Postal code" description="10001" />
              <DefinitionRow term="Tax identification number" description="GB123456789" />
            </Card>

            <Card title="Contact details">
              <DefinitionRow term="Email" description="account@northwind.com" />
              <DefinitionRow term="Phone" description="+1(555) 040-3283" />
              <DefinitionRow term="Address" description="15 Maplewood Drive, Austin, TX 78704" />
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4" />
        </div>
        <ReviewFooter>
          <Button variant="secondary" onClick={() => navigate('/bills')}>
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/bills/review/bill-details-approval-queue-editable')}
          >
            Next
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
