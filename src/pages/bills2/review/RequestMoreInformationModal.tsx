import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsTextarea } from '../../../components/ui/hds'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import {
  BillSummaryCard,
  Card,
  DefinitionRow,
  EditPillButton,
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
]

export default function RequestMoreInformationModal() {
  const navigate = useNavigate()
  const [details, setDetails] = useState('')

  return (
    <AppShell>
      <div className="relative flex h-full w-full flex-col">
        {/* Dimmed backdrop — Approval details (read-only, awaiting approval) */}
        <div className="pointer-events-none flex h-full w-full flex-col opacity-40">
          <ReviewHeader subtitle="Look over the details and take action" />
          <ReviewStepper active={3} />
          <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
            <ReviewQueuePanel items={QUEUE_ITEMS} />

            <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
              <Card title="Approval details">
                <DefinitionRow term="Bill amount" description="£9,200.00" />
                <DefinitionRow term="Payee (Merchant/vendor)" description="Northwind Design Ltd" />
                <DefinitionRow term="Due date" description="14 Aug 2026" />
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
            </div>

            <div className="flex w-[272px] shrink-0 flex-col gap-4">
              <UploadPreviewBox label="Invoice uploaded" filename="NW-2481.pdf" />
              <BillSummaryCard subtotal="£ 9,200.00" discount="£ 0.00" tax="£ 0.00" total="£ 9,200.00" />
            </div>
          </div>
        </div>

        {/* Scrim + modal */}
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(10,13,18,0.5)]"
          onClick={() => navigate(-1)}
        >
          <div
            className="flex w-[657px] max-w-[90vw] flex-col gap-6 rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <p className="font-heading text-lg font-semibold text-text-primary">Request more information</p>
              <p className="text-sm text-text-quaternary">
                Specify the additional details needed to continue the review
              </p>
            </div>

            <HdsTextarea
              aria-label="Information needed"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={6}
              placeholder="Describe what additional information or documents you need from the requester"
            />

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                variant="primary"
               
                disabled={!details.trim()}
                onClick={() => navigate('/bills/review/northwind-design-ltd-provide-further-details-empty')}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
