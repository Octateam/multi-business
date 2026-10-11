import AppShell from '../../../components/layout/AppShell'
import { ReviewBillBackdrop } from './paymentFlowShared'

export default function VendorInfoTabRecurringBillMakePayment() {
  return (
    <AppShell>
      <ReviewBillBackdrop ctaLabel="Pay balance" ctaTo="/bills/review/pay-remaining-balance-drawer" />
    </AppShell>
  )
}
