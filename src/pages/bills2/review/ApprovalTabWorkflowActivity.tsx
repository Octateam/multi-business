import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import AppShell from '../../../components/layout/AppShell'
import { Card, DefinitionRow, ReviewFooter, ReviewHeader, ReviewQueuePanel, ReviewStepper, UploadPreviewBox } from './shared'

const QUEUE_ITEMS = [
  { name: 'Acme Print Co', badges: [{ label: 'New vendor', status: 'info' as const }] },
  { name: 'Northwind Design Ltd', badges: [{ label: 'Awaiting approval', status: 'pending' as const }] },
  { name: 'Amazon Web Services', badges: [{ label: 'Urgent', status: 'rejected' as const }] },
  { name: 'Chase Bank Fees', badges: [{ label: 'One-time', status: 'neutral' as const }] },
]

type ActivityStatus = 'done' | 'active' | 'pending'

function ActivityItem({
  status,
  title,
  description,
  date,
}: {
  status: ActivityStatus
  title: string
  description: string
  date?: string
}) {
  const dotColor = status === 'pending' ? 'border-[#9da4ae] bg-[#9da4ae]' : 'border-[#12883e] bg-[#12883e]'
  return (
    <div className="flex w-full items-start gap-3">
      <div className="flex size-[13px] shrink-0 items-center justify-center pt-1">
        <div className={`size-[11px] rounded-md border-[2.5px] ${dotColor}`} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className={`text-sm font-medium ${status === 'pending' ? 'text-text-quaternary' : 'text-text-primary'}`}>{title}</p>
        <p className="text-xs text-text-quaternary">{description}</p>
      </div>
      {date && <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">{date}</p>}
    </div>
  )
}

export default function ApprovalTabWorkflowActivity() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Check the details and take action"
          actions={
            <>
              <Button variant="secondary">
                Request information
              </Button>
              <Button
                variant="destructive-secondary"
                onClick={() => navigate('/bills/review/reject-payment-confirmation')}
              >
                Reject
              </Button>
              <Button variant="primary" onClick={() => navigate('/bills/review/approve-payment-confirmation')}>
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

            <Card
              title="Approval workflow"
              action={
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              }
            >
              <div className="flex flex-col gap-3 border-l-2 border-[#e5e7eb] pl-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Finance manager</p>
                    <p className="text-xs text-text-quaternary">Any finance manager</p>
                  </div>
                  <Badge status="approved" label="Approved" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Admin</p>
                    <p className="text-xs text-text-quaternary">Required for bills above £5,000</p>
                  </div>
                  <Badge status="pending" label="Pending" />
                </div>
              </div>
            </Card>

            <Card title="Bill activity">
              <div className="flex flex-col gap-3">
                <ActivityItem status="done" title="Submitted by" description="Priya Raman" date="28 Jul 2026" />
                <ActivityItem status="done" title="Document processed" description="Invoice details extracted" date="28 Jul 2026" />
                <ActivityItem status="done" title="Pending approval" description="Waiting for approval from a finance manager." date="31 Jul 2026" />
                <ActivityItem status="active" title="Approved" description="John Doe" date="31 Jul 2026" />
                <ActivityItem status="pending" title="Payment initiated" description="Starts once the payment is made." />
                <ActivityItem status="pending" title="Paid" description="Confirmed when the money reaches the account." />
              </div>
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <UploadPreviewBox label="Invoice uploaded" filename="NW-2481.pdf" />
          </div>
        </div>
        <ReviewFooter>
          <Button variant="secondary">
            Close
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
