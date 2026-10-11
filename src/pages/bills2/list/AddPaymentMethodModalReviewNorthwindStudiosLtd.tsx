import { useNavigate } from 'react-router-dom'
import { useGoBack } from '../../../lib/navHistory'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton } from '../../../components/ui/hds'
import {
  BillsPageBackdrop,
  ModalBackdrop,
  PanelShell,
  BackLink,
  DetailRow,
  ReviewCard,
} from './paymentMethodShared'

export default function AddPaymentMethodModalReviewNorthwindStudiosLtd() {
  const navigate = useNavigate()
  const close = () => navigate('/bills')
  const edit = () => navigate('/bills/list/add-payment-method-modal-filled-amazon-web-services')
  // Back returns to whichever step led here (the filled form in the normal flow).
  const back = useGoBack('/bills/list/add-payment-method-modal-filled-amazon-web-services')
  const submit = () => navigate('/bills/list/add-payment-method-modal-success')

  return (
    <AppShell>
      <div className="relative h-full w-full">
        <BillsPageBackdrop />
        <ModalBackdrop onClose={close} />
        <PanelShell>
          <BackLink onClick={back} />
          <p className="mb-4 font-heading text-2xl font-semibold text-text-primary">Review</p>
          <div className="flex w-full flex-1 flex-col gap-4">
            <ReviewCard title="Account information" onEdit={edit}>
              <DetailRow label="Account name" value="Amazon Web Services, Inc." />
              <DetailRow label="Account type" value="Checking" />
              <DetailRow label="Account number" value="•••• 4471" />
              <DetailRow label="Bank name" value="JPMorgan Chase Bank" />
              <DetailRow label="Routing number" value="123243424" />
              <DetailRow label="SWIFT/BIC" value="TESTU3DCCS" />
            </ReviewCard>
            <ReviewCard title="Billing address" onEdit={edit}>
              <DetailRow label="Street address" value="131 Wall Street" />
              <DetailRow label="City" value="New York City" />
              <DetailRow label="Zip code" value="10001" />
              <DetailRow label="Country" value="United States of America" />
            </ReviewCard>
          </div>
          <HdsButton variant="primary" fullWidth className="mt-4" onClick={submit}>
            Add payment method
          </HdsButton>
        </PanelShell>
      </div>
    </AppShell>
  )
}
