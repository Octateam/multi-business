import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 37463:669 — Rejected.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function Rejected() {
  return <RequestDetailView fallbackId="REQ-2057" />
}
