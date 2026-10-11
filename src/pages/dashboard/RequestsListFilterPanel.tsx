import AppShell from '../../components/layout/AppShell'
import { DESIGNED_FILTERS } from '../../components/requests/FilterDrawer'
import { RequestsScreen } from './Dashboard'

// Figma 41617:132341 — Requests list with the Filter panel open, pre-filled with the designed values (draft until Apply).
export default function RequestsListFilterPanel() {
  return (
    <AppShell>
      <RequestsScreen initialFilterDraft={DESIGNED_FILTERS} />
    </AppShell>
  )
}
