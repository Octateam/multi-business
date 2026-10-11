/**
 * Where each bill opens. Every detail route takes the bill as `?bill=<id>` so the shared bill view, payment
 * information sheet, delete modal and edit form show THAT bill's data (vendor, amount, dates, line items).
 */

type BillRef = { id: string; status: string; vendor?: string }

export const BILL_VIEW_VENDOR_INFO = '/bills/review/northwind-design-ltd-vendor-info'
export const BILL_VIEW_BILL_DETAILS = '/bills/review/northwind-design-ltd-bill-details'
export const REVIEW_QUEUE_PATH = '/bills/review/queue-new-vendor-details-form'
/** Approver view of ONE bill — the review screen without the queue (Figma 48121:459876, single selection). */
export const REVIEW_BILL_PATH = '/bills/review/bill'

/** Step 3 (Approval) has a design per status; statuses without their own frame use the generic approval screen. */
export function approvalRoute(status: string) {
  switch (status) {
    case 'Payment failed':
      return '/bills/review/northwind-design-ltd-payment-failed'
    case 'Needs action':
      return '/bills/review/northwind-design-ltd-approval-requested-information'
    default:
      return '/bills/review/northwind-design-ltd-payment-pending'
  }
}

/** A step of the "View bill" stepper (Vendor info → Bill details → Approval) for `bill`. */
export function billViewPath(step: 1 | 2 | 3, bill: BillRef) {
  const base = step === 1 ? BILL_VIEW_VENDOR_INFO : step === 2 ? BILL_VIEW_BILL_DETAILS : approvalRoute(bill.status)
  return `${base}?bill=${encodeURIComponent(bill.id)}`
}

/** Approver single-bill review, optionally on a given step. */
export const reviewBillPath = (id: string, step?: 1 | 2 | 3) =>
  `${REVIEW_BILL_PATH}?bill=${encodeURIComponent(id)}${step && step > 1 ? `&step=${step}` : ''}`

/**
 * Opening a bill (row click, "View bill"):
 *  - Requester — the bill view (Figma 48121:464618). Drafts open on Vendor info; every other status opens on
 *    the Approval step, where that status's activity and actions live.
 *  - Approver — the single-bill review (no queue).
 */
export const billEntryPath = (bill: BillRef, role: 'requester' | 'approver' = 'requester') =>
  role === 'approver' ? reviewBillPath(bill.id) : bill.status === 'Draft' ? billViewPath(1, bill) : billViewPath(3, bill)

/** "Review" from the selection bar: one bill opens on its own, two or more open the review queue. */
export const reviewSelectionPath = (ids: string[]) => (ids.length > 1 ? reviewQueuePath(ids[0]) : reviewBillPath(ids[0]))

export function paymentInfoPath(bill: BillRef) {
  const variant = bill.status === 'Paid' ? 'paid' : bill.status === 'Payment failed' ? 'payment-failed' : 'pending'
  return `/bills/list/payment-information-${variant}?bill=${encodeURIComponent(bill.id)}`
}

export const deleteBillPath = (id: string) => `/bills/list/delete-bill-confirmation-modal?bill=${encodeURIComponent(id)}`
export const editBillPath = (id: string) => `/bills/misc/edit-bill-northwind-design-ltd-nw-2481?bill=${encodeURIComponent(id)}`
export const reviewQueuePath = (id?: string) => (id ? `${REVIEW_QUEUE_PATH}?bill=${encodeURIComponent(id)}` : REVIEW_QUEUE_PATH)
export const confirmPaymentPath = (id: string) => `/bills/review/confirm-bill-payment-one-time?bill=${encodeURIComponent(id)}`
export const cancelBillPath = (id: string) => `/bills/review/cancel-bill-confirmation-reason-required?bill=${encodeURIComponent(id)}`
export const provideDetailsPath = (id: string) => `/bills/review/northwind-design-ltd-provide-further-details-empty?bill=${encodeURIComponent(id)}`

// Vendors with a dedicated profile screen. Northwind's profile has a frame per bill status.
const NORTHWIND_VENDOR_PROFILE_ROUTE: Record<string, string> = {
  Overdue: '/bills/vendor/northwind-design-ltd-overdue',
  'Pending approval': '/bills/vendor/northwind-design-ltd-pending-approval',
  Paid: '/bills/vendor/northwind-design-ltd-paid',
  Cancelled: '/bills/vendor/northwind-design-ltd-cancelled',
  Draft: '/bills/vendor/northwind-design-ltd-vendor-info-draft',
}

export function vendorProfilePath(bill: BillRef): string | null {
  if (bill.vendor === 'Northwind Design Ltd') return NORTHWIND_VENDOR_PROFILE_ROUTE[bill.status] ?? '/bills/vendor/northwind-design-ltd-overdue'
  if (bill.vendor === 'Amazon Web Services') return '/bills/list/vendor-profile-drawer-amazon-web-services'
  return null
}
