import AppShell from '../../../components/layout/AppShell'
import { ConfirmBillPaymentCard, DrawerShell, ReviewBillBackdrop } from './paymentFlowShared'

export default function ConfirmBillPaymentRecurringMonthlySourceAccountDropdownOpen() {
  return (
    <AppShell>
      <div className="relative h-full w-full">
        <ReviewBillBackdrop ctaLabel="Pay balance" />
        <DrawerShell>
          <ConfirmBillPaymentCard billType="recurring-monthly" dropdownOpen />
        </DrawerShell>
      </div>
    </AppShell>
  )
}
