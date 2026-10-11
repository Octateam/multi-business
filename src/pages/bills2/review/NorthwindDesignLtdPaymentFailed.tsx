import BillApprovalStep from './BillApprovalStep'

// Step 3 (Approval) for a bill whose payment failed — Figma 45033:222325 (Cancel bill / Retry payment).
export default function NorthwindDesignLtdPaymentFailed() {
  return <BillApprovalStep routeStatus="Payment failed" />
}
