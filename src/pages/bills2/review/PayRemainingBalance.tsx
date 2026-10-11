import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import PayRemainingBalanceModal from './PayRemainingBalanceModal'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  VendorPaymentContactCards,
  ModalBackdrop,
} from './reviewBillShell'
import Button from '../../../components/ui/Button'

export default function PayRemainingBalance() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="relative flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader
          actions={
            <Button variant="primary" onClick={() => navigate('/bills/review/enter-otp-empty')}>
              Make payment
            </Button>
          }
        />
        <ReviewBillBody
          middle={
            <>
              <ReviewBillStepper active="vendor-info" />
              <VendorPaymentContactCards />
            </>
          }
        />
        <ReviewBillFooter />

        <ModalBackdrop>
          <PayRemainingBalanceModal
            onPay={() => navigate('/bills/review/enter-otp-empty')}
            onClose={() => navigate('/bills')}
          />
        </ModalBackdrop>
      </div>
    </AppShell>
  )
}
