import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import {
  BillSummaryCard,
  Card,
  DefinitionRow,
  EditPillButton,
  ReviewFooter,
  ReviewHeader,
  ReviewQueuePanel,
  ReviewStepper,
  TimelineRow,
  UploadPreviewBox,
  type QueueItem,
} from './shared'

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

export default function ApprovalDetailsReadOnlyAwaitingApproval() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Look over the details and take action"
          actions={
            <>
              <Button
                variant="secondary"
               
                onClick={() => navigate('/bills/review/request-more-information-modal')}
              >
                Request information
              </Button>
              <Button variant="primary" disabled>
                Review &amp; approve
              </Button>
            </>
          }
        />
        <ReviewStepper active={3} />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <ReviewQueuePanel items={QUEUE_ITEMS} />

          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Card title="Approval details">
              <DefinitionRow term="Bill amount" description="£9,200.00" />
              <DefinitionRow term="Payee (Merchant/vendor)" description="Northwind Design Ltd" />
              <DefinitionRow term="Due date" description="14 Aug 2026" />
              <DefinitionRow term="Payment method" description="International wire (GBP)" />
              <DefinitionRow term="Recipient bank" description="HSBC Bank" />
              <DefinitionRow term="Account number" description="••••4471" />
              <DefinitionRow term="SWIFT code" description="HBUKGB4B" />
            </Card>

            <Card title="Approval workflow" action={<EditPillButton>Continue</EditPillButton>}>
              <TimelineRow
                done
                title="Finance manager"
                subtitle="Any finance manager"
                date="28 Jul 2026"
                badge={<Badge status="approved" label="Approved" />}
              />
              <TimelineRow title="Admin" subtitle="Required for bills above £5,000" date="Pending" isLast />
            </Card>

            <Card title="Bill activity">
              <TimelineRow done title="Submitted by" subtitle="Priya Raman" date="28 Jul 2026" />
              <TimelineRow done title="Document processed" subtitle="Invoice details extracted" date="28 Jul 2026" />
              <TimelineRow
                done
                title="Information requested"
                subtitle="Thomas Bennett: “The invoice amount does not match the requested amount. Please submit a new expense with the correct amount.”"
                date="28 Jul 2026"
              />
              <TimelineRow
                done
                title="Information provided"
                subtitle={
                  <>
                    Requested information has been provided
                    <br />
                    Supporting document: <span className="text-text-primary underline">Workshop_invoice.png</span>
                  </>
                }
                date="31 Jul 2026"
              />
              <TimelineRow title="Pending approval" subtitle="Waiting for approval from a finance manager." />
              <TimelineRow title="Approved" subtitle="John Doe" />
              <TimelineRow title="Payment initiated" subtitle="Starts once the payment is made." />
              <TimelineRow title="Paid" subtitle="Confirmed when the money reaches the account." isLast />
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <UploadPreviewBox label="Invoice uploaded" filename="NW-2481.pdf" />
            <BillSummaryCard subtotal="£ 9,200.00" discount="£ 0.00" tax="£ 0.00" total="£ 9,200.00" />
          </div>
        </div>
        <ReviewFooter>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Previous
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
