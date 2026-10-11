import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import {
  NorthwindBreadcrumb,
  NorthwindStepper,
  NorthwindHeader,
  ApprovalDetailsCard,
  ApprovalWorkflowCard,
  BillActivityCard,
  InvoicePreviewPanel,
  NorthwindFooter,
  NorthwindStatusSwitcher,
  type BillActivityItem,
} from './shared'

const activity: BillActivityItem[] = [
  { title: 'Submitted by', description: 'Priya Raman', date: '28 Jul 2026', tone: 'done' },
  { title: 'Document processed', description: 'Receipt details extracted', date: '28 Jul 2026', tone: 'done' },
  { title: 'Pending approval', description: 'Waiting for approval from a finance manager.', date: '31 Jul 2026', tone: 'done' },
  { title: 'Payment Cancelled', description: '"This was a personal meal, not a client expense."', date: '31 Jul 2026', tone: 'cancelled' },
]

export default function NorthwindDesignLtdCancelled() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6 pb-[90px] pt-7">
        <NorthwindBreadcrumb />
        <NorthwindHeader status="rejected" />
        <NorthwindStepper step={3} />
        <div className="flex w-full items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl bg-white p-8">
            <ApprovalDetailsCard />
            <ApprovalWorkflowCard />
            <BillActivityCard items={activity} />
          </div>
          <InvoicePreviewPanel />
        </div>
      </div>
      <NorthwindFooter>
        <Button variant="secondary" onClick={() => navigate('/bills')}>
          Previous
        </Button>
        <NorthwindStatusSwitcher active="cancelled" />
      </NorthwindFooter>
    </AppShell>
  )
}
