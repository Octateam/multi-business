import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 43694:383871 / 42563:372084 — approved reimbursement, Payment pending (approver view: Make payment).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function Approved() {
  return <RequestDetailView fallbackId="REQ-2056" />
}
