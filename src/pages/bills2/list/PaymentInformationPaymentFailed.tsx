import AppShell from '../../../components/layout/AppShell'
import PaymentInformationSideSheet from './paymentInformationShared'

export default function PaymentInformationPaymentFailed() {
  return (
    <AppShell>
      <PaymentInformationSideSheet status="payment-failed" />
    </AppShell>
  )
}
