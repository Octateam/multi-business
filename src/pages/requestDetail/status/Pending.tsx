import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma note 43444:406894 + 37463:243 — the requester's 'pending' state: approved, waiting for payment, no designed CTAs.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function Pending() {
  return <RequestDetailView fallbackId="REQ-2060" />
}
