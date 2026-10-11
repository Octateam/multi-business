import BillApprovalStep from './BillApprovalStep'

// Step 3 (Approval) for a bill an approver asked questions about — Figma 45033:223087
// (Requested information timeline + "Provide further details").
export default function NorthwindDesignLtdApprovalRequestedInformation() {
  return <BillApprovalStep routeStatus="Needs action" />
}
