import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 42557:353274 — Vendor payment, pending approval (approver view) with the Approve vendor payment modal open.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function VendorPayment() {
  return <RequestDetailView fallbackId="REQ-2061" initialModal="approve-confirm" />
}
