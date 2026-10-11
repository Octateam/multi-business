import AppShell from '../../../components/layout/AppShell'
import { ConfirmBillPaymentCard, DrawerShell, ReviewBillBackdrop } from './paymentFlowShared'

export default function ConfirmBillPaymentRecurringMonthly() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Pay balance" />
        <DrawerShell>
          <ConfirmBillPaymentCard billType="recurring-monthly" />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
