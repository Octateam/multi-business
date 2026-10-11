import { ApproverReview } from './QueueNewVendorDetailsForm'

// Approver view of ONE bill (row click, "Review bill", or a single selected bill) — the review screen
// without the review queue; Figma 48121:459876 with the requester-style top area (48121:464618).
export default function ReviewSingleBill() {
  return <ApproverReview single />
}
