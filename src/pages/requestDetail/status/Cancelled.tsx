import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 41684:336063 — Cancelled.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function Cancelled() {
  return <RequestDetailView fallbackId="REQ-2051" />
}
