import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 37463:882 — Needs action, requester view (Provide further details).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function InfoNeededRequester() {
  return <RequestDetailView fallbackId="REQ-2059" />
}
