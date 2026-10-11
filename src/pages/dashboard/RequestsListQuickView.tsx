import AppShell from '../../components/layout/AppShell'
import { RequestsScreen } from './Dashboard'

// Figma 38133:251019 — Requests list with the Quick view panel open for a request (View full request opens its detail).
export default function RequestsListQuickView() {
  return (
    <AppShell>
      <RequestsScreen quickViewId="REQ-2054" />
    </AppShell>
  )
}
