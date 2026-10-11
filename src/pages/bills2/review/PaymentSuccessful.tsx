import AppShell from '../../../components/layout/AppShell'
import { DrawerShell, PaymentOutcomePanel, ReviewBillBackdrop } from './paymentFlowShared'

export default function PaymentSuccessful() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Make payment" />
        <DrawerShell>
          <PaymentOutcomePanel variant="success" />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
