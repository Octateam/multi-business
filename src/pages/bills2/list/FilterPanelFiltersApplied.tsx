import { useNavigate } from 'react-router-dom'
import { HdsButton } from '../../../components/ui/hds'
import type { BillRow } from './shared'
import { BillsListPage } from './BillsWorkspace'

// Figma node 45078:157220 — "Bills list — Filter panel (filters applied)"
// The drawer is closed; the list is narrowed to the rows matching the applied filters
// (Schedule = Quarterly, Status = Pending approval in the design) and the Filter button carries a badge.
const APPLIED = (r: BillRow) => r.frequency === 'Quarterly' && r.status === 'Pending approval'

export default function FilterPanelFiltersApplied() {
  const navigate = useNavigate()
  return (
    <BillsListPage
      subtitle="Review, approve, and pay one-off or recurring vendor bills"
      workspace={{
        filter: APPLIED,
        filterCount: 2,
        pagination: false,
        onFilterClick: () => navigate('/bills/list/filter-panel-date-picker-open-filters-selected'),
        filterActions: (
          <HdsButton variant="link" size="sm" onClick={() => navigate('/bills')}>
            Clear filters
          </HdsButton>
        ),
      }}
    />
  )
}
