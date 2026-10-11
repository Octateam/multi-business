import { useNavigate } from 'react-router-dom'
import { HdsButton } from '../../../components/ui/hds'
import { BillsListPage } from './BillsWorkspace'

// Figma node 45033:223926 — "Bills list — Dashboard (populated)" (Queue tab, 41310:643438 for the
// selection bar). This is the primary entry point for the Bills module (Sidebar "Bills" link).
export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <BillsListPage
      defaultTab="queue"
      footer={
        <p className="text-xs text-[#9aa1ac]">
          Looking for what&apos;s scheduled next?{' '}
          <HdsButton variant="link" size="sm" className="!text-xs" onClick={() => navigate('/bills/list')}>
            Open upcoming bills
          </HdsButton>
        </p>
      }
    />
  )
}
