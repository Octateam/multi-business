import { useState } from 'react'
import { useLastAddedBill } from '../addBill/billDraft'
import { BillsToast } from './shared'
import { BillsListPage } from './BillsWorkspace'

// Figma node 45033:205286 — "Bills list — bill submitted (success toast)". The new bill is "Pending
// approval", so it lands in Queue (and Pending / Upcoming).
export default function BillSubmittedSuccessToast() {
  const last = useLastAddedBill()
  const [showToast, setShowToast] = useState(true)
  return (
    <BillsListPage
      subtitle="Review, approve, and pay what’s owed to your vendors — one-off or recurring."
      overlay={
        showToast && (
          <BillsToast
            variant="success"
            title="Bill submitted"
            message={last ? `Your ${last.amount} bill from ${last.vendor} has been submitted for approval.` : 'Your bill has been submitted for approval.'}
            onClose={() => setShowToast(false)}
          />
        )
      }
    />
  )
}
