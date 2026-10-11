import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { BillViewBody, BillViewFooter, BillViewHeader, BillViewLayout, BillViewStepper, billViewPath, useBillView } from './billViewShell'
import { VendorInfoCards } from './billViewContent'

// Step 1 of the "view bill" stepper — chrome from 45033:222571, content (Vendor info / Payment details)
// from 45033:219739, filled with the bill named by `?bill=` (Northwind NW-2481 when none is given).
export default function NorthwindDesignLtdVendorInfo() {
  const navigate = useNavigate()
  const bill = useBillView()

  return (
    <AppShell>
      <BillViewLayout footer={<BillViewFooter onNext={() => navigate(billViewPath(2, bill))} />}>
        <BillViewHeader bill={bill} />
        <BillViewStepper active={1} bill={bill} />
        <BillViewBody invoiceFile={bill.invoiceFile}>
          <VendorInfoCards bill={bill} contact />
        </BillViewBody>
      </BillViewLayout>
    </AppShell>
  )
}
