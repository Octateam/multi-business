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
  { title: 'Approved', description: 'John Doe', tone: 'pending' },
  { title: 'Payment initiated', description: 'Starts once the payment is made.', tone: 'pending' },
  { title: 'Paid', description: 'Confirmed when the money reaches the account.', tone: 'pending' },
]

export default function NorthwindDesignLtdPendingApproval() {
  const navigate = useNavigate()
  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6 pb-[90px] pt-7">
        <NorthwindBreadcrumb />
        <NorthwindHeader
          status="pending"
          actions={
            <>
              <Button variant="destructive-secondary" onClick={() => navigate('/bills/vendor/northwind-design-ltd-cancelled')}>
                Cancel bill
              </Button>
              <Button variant="secondary" onClick={() => navigate('/bills/add/manual-entry-filled-one-time')}>
                Edit bill
              </Button>
            </>
          }
        />
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
        <NorthwindStatusSwitcher active="pending-approval" />
      </NorthwindFooter>
    </AppShell>
  )
}
