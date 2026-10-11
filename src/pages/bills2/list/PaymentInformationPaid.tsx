import AppShell from '../../../components/layout/AppShell'
import PaymentInformationSideSheet from './paymentInformationShared'

export default function PaymentInformationPaid() {
  return (
    <AppShell>
      <PaymentInformationSideSheet status="paid" />
    </AppShell>
  )
}
