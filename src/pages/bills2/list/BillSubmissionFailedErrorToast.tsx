import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HdsButton } from '../../../components/ui/hds'
import { getBillDraft } from '../addBill/billDraft'
import { BillsToast } from './shared'
import { BillsListPage } from './BillsWorkspace'

// Figma node 45033:206068 — "Bills list — bill submission failed (error toast)"
export default function BillSubmissionFailedErrorToast() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(true)
  return (
    <BillsListPage
      subtitle="Review, approve, and pay what’s owed to your vendors — one-off or recurring."
      overlay={
        showToast && (
          <BillsToast
            variant="error"
            title="Something went wrong"
            message="We couldn't submit your bill. Try again in a moment."
            onClose={() => setShowToast(false)}
            action={
              <HdsButton
                variant="destructive-link"
                size="sm"
                onClick={() => navigate(getBillDraft()?.formRoute ?? '/bills/add/manual-entry-empty', { state: { resume: true } })}
              >
                Try again
              </HdsButton>
            }
          />
        )
      }
    />
  )
}
