import AppShell from '../../../components/layout/AppShell'
import { ConfirmBillPaymentCard, DrawerShell, ReviewBillBackdrop } from './paymentFlowShared'

export default function ConfirmBillPaymentOneTime() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Make payment" />
        <DrawerShell>
          <ConfirmBillPaymentCard billType="one-time" />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
