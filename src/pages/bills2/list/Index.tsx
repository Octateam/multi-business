import { useNavigate } from 'react-router-dom'
import { HdsButton } from '../../../components/ui/hds'
import { BillsListPage } from './BillsWorkspace'

// Figma node 43881:165141 — "Bills list" with the Upcoming tab active (Pay on / Due by columns, no
// pagination footer). Same live workspace as the dashboard, opened on Upcoming.
export default function Index() {
  const navigate = useNavigate()
  return (
    <BillsListPage
      defaultTab="upcoming"
      pagination={false}
      footer={
        <p className="text-xs text-[#9aa1ac]">
          Want the full dashboard with due-date insights?{' '}
          <HdsButton variant="link" size="sm" className="!text-xs" onClick={() => navigate('/bills')}>
            Open Bills dashboard
          </HdsButton>
        </p>
      }
    />
  )
}
