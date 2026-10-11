import AppShell from '../../../components/layout/AppShell'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  BillDetailsCards,
} from './reviewBillShell'

export default function BillDetailsOneTimeBill() {
  return (
    <AppShell>
      <div className="flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader />
        <ReviewBillBody
          middle={
            <>
              <ReviewBillStepper active="bill-details" />
              <BillDetailsCards recurring={false} />
            </>
          }
        />
        <ReviewBillFooter />
      </div>
    </AppShell>
  )
}
