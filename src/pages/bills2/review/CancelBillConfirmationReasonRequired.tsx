import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import CancelBillModal from './CancelBillModal'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  BillDetailsCards,
  CenteredModalBackdrop,
} from './reviewBillShell'

export default function CancelBillConfirmationReasonRequired() {
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
          <CancelBillModal
            onClose={() => navigate('/bills/review/bill-details-recurring-active')}
            onConfirm={() => navigate('/bills')}
          />
        </CenteredModalBackdrop>
      </div>
    </AppShell>
  )
}
