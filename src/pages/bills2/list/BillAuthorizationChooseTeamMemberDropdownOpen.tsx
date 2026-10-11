import AppShell from '../../../components/layout/AppShell'
import BillAuthorizationSideSheet from './billAuthorizationShared'

export default function BillAuthorizationChooseTeamMemberDropdownOpen() {
  return (
    <AppShell>
      <BillAuthorizationSideSheet step="choose-team-member" />
    </AppShell>
  )
}
