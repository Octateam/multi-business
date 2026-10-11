import AppShell from '../../../components/layout/AppShell'
import { DrawerShell, PaymentOutcomePanel, ReviewBillBackdrop } from './paymentFlowShared'

export default function PaymentFailed() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Make payment" />
        <DrawerShell>
          <PaymentOutcomePanel variant="failed" />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
