import RequestDetailView from '../../components/requests/detail/RequestDetailView'

// Figma 42563:369574 — Pending approval (requester view: Cancel / Edit request), cancel-request modal open.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function RequestDetail() {
  return <RequestDetailView fallbackId="REQ-2053" initialModal="cancel" />
}
