import AppShell from '../../../components/layout/AppShell'
import { DrawerShell, PayRemainingBalanceCard, ReviewBillBackdrop } from './paymentFlowShared'

export default function PayRemainingBalanceDrawer() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Pay balance" />
        <DrawerShell>
          <PayRemainingBalanceCard />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
