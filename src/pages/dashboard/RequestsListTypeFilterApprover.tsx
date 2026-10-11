import AppShell from '../../components/layout/AppShell'
import { RequestsScreen } from './Dashboard'

// Figma 42967:150236 — Requests list with the Submit expense drawer open.
export default function RequestsListTypeFilterApprover() {
  return (
    <AppShell>
      <RequestsScreen submitOpen />
    </AppShell>
  )
}
