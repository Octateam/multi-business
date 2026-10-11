import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  BillDetailsCards,
} from './reviewBillShell'

export default function BillDetailsRecurringPaused() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader
          actions={
            <>
              <HdsButton variant="destructive-secondary" onClick={() => navigate('/bills/review/cancel-bill-confirmation-reason-required')}>
                Cancel
              </HdsButton>
              <HdsButton variant="primary" onClick={() => navigate('/bills/review/bill-details-recurring-active')}>
                Resume
              </HdsButton>
            </>
          }
        />
        <ReviewBillBody
          middle={
            <>
              <ReviewBillStepper active="bill-details" />
              <BillDetailsCards recurring />
            </>
          }
        />
        <ReviewBillFooter />
      </div>
    </AppShell>
  )
}
