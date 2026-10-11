import RequestDetailView from '../../components/requests/detail/RequestDetailView'

// Figma 43802:156311 — Pending approval (approver view) with the Reject request modal open.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function RequestInfoModal1() {
  return <RequestDetailView fallbackId="REQ-2058" initialModal="reject" />
}
