import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 42563:369947 — Payment failed (Retry payment).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function PaymentFailed() {
  return <RequestDetailView fallbackId="REQ-2055" />
}
