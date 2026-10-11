import { useState } from 'react'
import { useLastAddedBill } from '../addBill/billDraft'
import { BillsToast } from './shared'
import { BillsListPage } from './BillsWorkspace'

// Figma node 45033:205677 — "Bills list — bill saved as draft (success toast)". Drafts live in Queue.
export default function BillSavedAsDraftSuccessToast() {
  const last = useLastAddedBill()
  const [showToast, setShowToast] = useState(true)
  return (
    <BillsListPage
      subtitle="Review, approve, and pay what’s owed to your vendors — one-off or recurring."
      overlay={
        showToast && (
          <BillsToast
            variant="success"
            title="Bill saved as draft"
            message={last ? `Your bill from ${last.vendor} has been saved as a draft.` : 'Your bill has been saved as a draft.'}
            onClose={() => setShowToast(false)}
          />
        )
      }
    />
  )
}
