import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 41715:339991 — Needs action, approver view (information provided: Request information / Review & approve).
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function InfoNeededApprover() {
  return <RequestDetailView fallbackId="REQ-2052" />
}
