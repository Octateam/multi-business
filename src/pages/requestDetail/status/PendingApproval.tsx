import RequestDetailView from '../../../components/requests/detail/RequestDetailView'

// Figma 45476:511964 / 42563:372477 — Pending approval, approver view (overdue): Request information / Review & approve.
// Data-driven: opens the request in ?id= (in whatever state it is now), else this route's sample request.
export default function PendingApproval() {
  return <RequestDetailView fallbackId="REQ-2058" />
}
