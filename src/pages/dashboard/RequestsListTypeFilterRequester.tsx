import AppShell from '../../components/layout/AppShell'
import { RequestsScreen } from './Dashboard'

// Figma 42563:368496 — Requests list with the Type column menu open (Reimbursement / Vendor payment).
export default function RequestsListTypeFilterRequester() {
  return (
    <AppShell>
      <RequestsScreen typeMenuOpen />
    </AppShell>
  )
}
