import AppShell from '../../../components/layout/AppShell'
import PaymentInformationSideSheet from './paymentInformationShared'

export default function PaymentInformationPending() {
  return (
    <AppShell>
      <PaymentInformationSideSheet status="pending" />
    </AppShell>
  )
}
