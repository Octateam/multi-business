import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import PauseBillConfirmModal from './PauseBillConfirmModal'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  BillDetailsCards,
  CenteredModalBackdrop,
} from './reviewBillShell'

export default function PauseRecurringBillConfirmation() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="relative flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader
          actions={
            <>
              <HdsButton variant="destructive-secondary">
                Cancel bill
              </HdsButton>
              <HdsButton variant="primary">
                Pause bill
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

        <CenteredModalBackdrop>
          <PauseBillConfirmModal
            onConfirm={() => navigate('/bills/review/bill-details-recurring-paused')}
            onClose={() => navigate('/bills/review/bill-details-recurring-active')}
          />
        </CenteredModalBackdrop>
      </div>
    </AppShell>
  )
}
