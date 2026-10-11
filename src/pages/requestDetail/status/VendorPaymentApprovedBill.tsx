import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 37512:19023 — Vendor payment approved and turned into a bill (Payment pending: View bill).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function VendorPaymentApprovedBill() {
  return <RequestDetailView fallbackId="REQ-2062" />
}
