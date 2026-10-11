import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import {
  BillsPageHeader,
  BillsStatCards,
  FilterDrawer,
} from './shared'
import { BillsWorkspace } from './BillsWorkspace'

// Figma node 45033:207021 — "Bills list — Filter panel (date picker open, filters selected)"
export default function FilterPanelDatePickerOpenFiltersSelected() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <div className="fixed inset-0 z-10 bg-black/30" onClick={() => navigate('/bills')} />

        <BillsPageHeader subtitle="Review, approve, and pay what you owe vendors — one-off or recurring." />
        <BillsStatCards />
        <BillsWorkspace />

        <FilterDrawer
          onClose={() => navigate('/bills')}
          onApply={() => navigate('/bills/list/filter-panel-filters-applied')}
          scheduleChecked={['Monthly']}
          statusChecked={['Paid']}
          dueFrom="12/04/2026"
          dueTo="3/06/2026"
          showDatePicker
        />
      </main>
    </AppShell>
  )
}
