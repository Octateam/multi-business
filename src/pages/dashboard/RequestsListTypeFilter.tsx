import AppShell from '../../components/layout/AppShell'
import { RequestsScreen } from './Dashboard'

// Figma 42563:376054 — Requests list after rejecting a reimbursement (error toast).
export default function RequestsListTypeFilter() {
  return (
    <AppShell>
      <RequestsScreen initialToast={{ tone: 'error', title: 'Reimbursement rejected', message: 'Priya Raman has been notified of the decision.' }} />
    </AppShell>
  )
}
