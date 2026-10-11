import RequestDetailView from '../../components/requests/detail/RequestDetailView'

// Figma 37453:204318 — Pending approval (approver view) with the Request more information modal open.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function RequestInfoModal2() {
  return <RequestDetailView fallbackId="REQ-2058" initialModal="request-info" />
}
