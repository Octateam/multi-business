import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import ConfirmBillPaymentModal from './ConfirmBillPaymentModal'
import {
  ReviewBillHeader,
  ReviewBillStepper,
  ReviewBillBody,
  ReviewBillFooter,
  VendorPaymentContactCards,
  ModalBackdrop,
} from './reviewBillShell'
import Button from '../../../components/ui/Button'

export default function ConfirmBillPaymentPayPartOfBillAmountEntered() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('£4,500.00')

  return (
    <AppShell>
      <div className="relative flex min-h-full flex-col bg-surface-2">
        <ReviewBillHeader
          actions={
            <Button variant="primary" onClick={() => navigate('/bills/review/pay-remaining-balance')}>
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
          <ConfirmBillPaymentModal
            payAmountOption="part"
            partAmountValue={amount}
            onPartAmountChange={setAmount}
            onSelectOption={(option) =>
              navigate(
                option === 'full'
                  ? '/bills/review/confirm-bill-payment-pay-full-amount'
                  : '/bills/review/confirm-bill-payment-pay-part-of-bill-empty',
              )
            }
            onApprove={() => navigate('/bills/review/pay-remaining-balance')}
            onReject={() => navigate('/bills')}
            onClose={() => navigate('/bills')}
          />
        </ModalBackdrop>
      </div>
    </AppShell>
  )
}
