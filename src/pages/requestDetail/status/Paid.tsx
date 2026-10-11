import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 37463:456 — Paid.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function Paid() {
  return <RequestDetailView fallbackId="REQ-2054" />
}
