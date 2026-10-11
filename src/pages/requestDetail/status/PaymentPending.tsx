import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 42563:372084 — Payment pending (approver view: Make payment → Approve & pay drawer → OTP → success).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function PaymentPending() {
  return <RequestDetailView fallbackId="REQ-2056" />
}
