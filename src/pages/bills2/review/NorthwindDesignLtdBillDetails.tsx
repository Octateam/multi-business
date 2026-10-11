import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { BillViewBody, BillViewFooter, BillViewHeader, BillViewLayout, BillViewStepper, billViewPath, useBillView } from './billViewShell'
import { BillDetailsContent } from './billViewContent'

// Step 2 of the "view bill" stepper — Figma 45033:222571, filled with the bill named by `?bill=`.
export default function NorthwindDesignLtdBillDetails() {
  const navigate = useNavigate()
  const bill = useBillView()

  return (
    <AppShell>
      <BillViewLayout
        footer={<BillViewFooter onPrevious={() => navigate(billViewPath(1, bill))} onNext={() => navigate(billViewPath(3, bill))} />}
      >
        <BillViewHeader bill={bill} />
        <BillViewStepper active={2} bill={bill} />
        <BillViewBody invoiceFile={bill.invoiceFile}>
          <BillDetailsContent bill={bill} />
        </BillViewBody>
      </BillViewLayout>
    </AppShell>
  )
}
