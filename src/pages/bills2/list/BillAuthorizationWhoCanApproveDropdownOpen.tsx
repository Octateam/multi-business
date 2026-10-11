import AppShell from '../../../components/layout/AppShell'
import BillAuthorizationSideSheet from './billAuthorizationShared'

export default function BillAuthorizationWhoCanApproveDropdownOpen() {
  return (
    <AppShell>
      <BillAuthorizationSideSheet step="who-can-approve" />
    </AppShell>
  )
}
