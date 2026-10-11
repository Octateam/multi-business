import BillApprovalStep from './BillApprovalStep'

// Step 3 (Approval) — Figma 45033:222831. Also the approval step for Paid (`?status=paid`), Pending
// approval, Overdue, Cancelled and Draft bills, which have no approval frame of their own.
export default function NorthwindDesignLtdPaymentPending() {
  return <BillApprovalStep routeStatus="Payment pending" />
}
