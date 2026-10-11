import AppShell from '../../../components/layout/AppShell'
import { DrawerShell, OtpPanel, ReviewBillBackdrop } from './paymentFlowShared'

export default function EnterOtpIncorrectCodeDisabled() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Make payment" />
        <DrawerShell>
          <OtpPanel initialMode="incorrect-disabled" />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
