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

export default function BillDetailsRecurringActive() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader
          actions={
            <>
              <HdsButton variant="destructive-secondary" onClick={() => navigate('/bills/review/cancel-bill-confirmation-reason-required')}>
                Cancel bill
              </HdsButton>
              <HdsButton variant="secondary" onClick={() => navigate('/bills/review/pause-recurring-bill-confirmation')}>
                Pause bill
              </HdsButton>
              <HdsButton variant="primary" onClick={() => navigate('/bills/review/confirm-bill-payment-recurring-monthly')}>
                Make payment
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
