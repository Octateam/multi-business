import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import type { BillStatus } from '../list/billRecords'
import { BillViewBody, BillViewFooter, BillViewHeader, BillViewLayout, BillViewStepper, billViewPath, useBillView } from './billViewShell'
import { ApprovalContent } from './billViewContent'

/**
 * Step 3 (Approval) of the "view bill" stepper. One component behind the per-status approval routes
 * (payment pending / paid 45033:222831, payment failed 45033:222325, requested information 45033:223087);
 * the cards, timeline and header actions follow the bill's actual status. `routeStatus` is what the
 * route's own frame shows when it's opened without `?bill=`.
 */
export default function BillApprovalStep({ routeStatus }: { routeStatus: BillStatus }) {
  const navigate = useNavigate()
  const bill = useBillView(routeStatus)

  return (
    <AppShell>
      <BillViewLayout footer={<BillViewFooter onPrevious={() => navigate(billViewPath(2, bill))} />}>
        <BillViewHeader bill={bill} />
        <BillViewStepper active={3} bill={bill} />
        <BillViewBody invoiceFile={bill.invoiceFile}>
          <ApprovalContent bill={bill} />
        </BillViewBody>
      </BillViewLayout>
    </AppShell>
  )
}
