import type { BadgeStatus } from '../components/ui/Badge'
import type { BadgeColor } from '../components/ui/hds'

export type RequestType = 'Reimbursement' | 'Vendor payment'

/**
 * Every state a request can be in (Figma "Requests" section 37453:197545 + the Filter panel's Status
 * list, node 41617:132341). One key drives the list badge, the detail page, its header actions and
 * the activity timeline, so a row always opens the right detail screen.
 */
export type RequestStatus =
  | 'pending-approval'
  | 'pending'
  | 'needs-action'
  | 'payment-pending'
  | 'payment-failed'
  | 'paid'
  | 'rejected'
  | 'cancelled'

/** Whose eyes the detail page is seen through — the designs show different actions for each. */
export type ViewerRole = 'requester' | 'approver'

// HDS Badge colours, exactly as on the Requests table design (Figma 37453:198095): pending approval amber ·
// needs action + payment pending light blue (navy) · paid green · cancelled + payment failed red · rejected grey.
export const STATUS_META: Record<RequestStatus, { label: string; color: BadgeColor; token: BadgeStatus }> = {
  'pending-approval': { label: 'Pending approval', color: 'amber', token: 'pending' },
  pending: { label: 'Pending', color: 'amber', token: 'pending' },
  'needs-action': { label: 'Needs action', color: 'navy', token: 'info-needed' },
  'payment-pending': { label: 'Payment pending', color: 'navy', token: 'info' },
  'payment-failed': { label: 'Payment failed', color: 'red', token: 'payment-failed' },
  paid: { label: 'Paid', color: 'green', token: 'paid' },
  rejected: { label: 'Rejected', color: 'grey', token: 'cancelled' },
  cancelled: { label: 'Cancelled', color: 'red', token: 'rejected' },
}

export const TYPE_COLOR: Record<RequestType, BadgeColor> = {
  Reimbursement: 'navy',
  'Vendor payment': 'grey',
}

/** "Pending" tab = still moving; "Closed" tab = finished one way or another. */
export const OPEN_STATUSES: RequestStatus[] = ['pending-approval', 'pending', 'needs-action', 'payment-pending', 'payment-failed']
export const CLOSED_STATUSES: RequestStatus[] = ['paid', 'rejected', 'cancelled']

export type RequestRow = {
  id: string
  payee: string
  refId: string
  type: RequestType
  typeStatus: BadgeStatus
  requestedBy: string
  requestedByIsSelf?: boolean
  amount: string
  /** Numeric amount in the request currency — used by the Min/Max amount filter. */
  amountValue: number
  requestDate: string
  requestTime: string
  dueDate: string | null
  dueNote: string | null
  dueNoteTone: 'error' | 'warning' | 'muted'
  overdue?: boolean
  status: string
  statusToken: BadgeStatus
  statusKey: RequestStatus
  viewerRole: ViewerRole
}

type Seed = Omit<RequestRow, 'status' | 'statusToken' | 'typeStatus' | 'refId'>

function row(seed: Seed): RequestRow {
  return {
    ...seed,
    refId: seed.id,
    typeStatus: seed.type === 'Reimbursement' ? 'info-needed' : 'draft',
    status: STATUS_META[seed.statusKey].label,
    statusToken: STATUS_META[seed.statusKey].token,
  }
}

// Canonical "Requests" table dataset shared across the Dashboard, filter, type-filter and quick-view
// screens. The first seven rows are Figma node 42563:368496 verbatim; the rest add one request for
// every remaining state / viewer combination the Requests section designs, so each detail screen
// is reachable from the list.
export const requestRows: RequestRow[] = [
  row({ id: 'REQ-2051', payee: 'Lisboa Trattoria', type: 'Reimbursement', requestedBy: 'Priya Raman', amount: '€120.00', amountValue: 120, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: '2 days overdue', dueNoteTone: 'error', statusKey: 'cancelled', viewerRole: 'approver' }),
  row({ id: 'REQ-2052', payee: 'Meridian Legal Partners', type: 'Vendor payment', requestedBy: 'Dana Avery', amount: '$4,800.00', amountValue: 4800, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: 'Today', dueNoteTone: 'error', statusKey: 'needs-action', viewerRole: 'approver' }),
  row({ id: 'REQ-2053', payee: 'Figma', type: 'Reimbursement', requestedBy: 'Emily Xin', requestedByIsSelf: true, amount: '$45.00', amountValue: 45, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: 'Due tomorrow', dueNoteTone: 'warning', statusKey: 'pending-approval', viewerRole: 'requester' }),
  row({ id: 'REQ-2054', payee: 'Haclyon Studio', type: 'Reimbursement', requestedBy: 'Sarah Owens', amount: '$5,000.00', amountValue: 5000, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: 'Due in 2 days', dueNoteTone: 'muted', statusKey: 'paid', viewerRole: 'approver' }),
  row({ id: 'REQ-2055', payee: 'Uber', type: 'Vendor payment', requestedBy: 'Tyler Bates', amount: '£400.00', amountValue: 400, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: 'Due in 14 days', dueNoteTone: 'muted', statusKey: 'payment-failed', viewerRole: 'approver' }),
  row({ id: 'REQ-2056', payee: 'Northwind Design Ltd', type: 'Reimbursement', requestedBy: 'Grace Jameson', amount: '€120.00', amountValue: 120, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: null, dueNote: null, dueNoteTone: 'muted', statusKey: 'payment-pending', viewerRole: 'approver' }),
  row({ id: 'REQ-2057', payee: 'Deliveroo', type: 'Reimbursement', requestedBy: 'Emily Xin', requestedByIsSelf: true, amount: '£34.00', amountValue: 34, requestDate: 'Jan 6, 2025', requestTime: '2:14pm', dueDate: 'Jan 6, 2025', dueNote: 'Due in 33 days', dueNoteTone: 'muted', statusKey: 'rejected', viewerRole: 'requester' }),
  row({ id: 'REQ-2058', payee: 'Lisboa Trattoria', type: 'Reimbursement', requestedBy: 'Priya Raman', amount: '€120.00', amountValue: 120, requestDate: 'Jan 5, 2025', requestTime: '9:40am', dueDate: 'Jan 4, 2025', dueNote: '2 days overdue', dueNoteTone: 'error', overdue: true, statusKey: 'pending-approval', viewerRole: 'approver' }),
  row({ id: 'REQ-2059', payee: 'Notion Labs', type: 'Reimbursement', requestedBy: 'Emily Xin', requestedByIsSelf: true, amount: '$96.00', amountValue: 96, requestDate: 'Jan 5, 2025', requestTime: '11:02am', dueDate: 'Jan 9, 2025', dueNote: 'Due in 3 days', dueNoteTone: 'muted', statusKey: 'needs-action', viewerRole: 'requester' }),
  row({ id: 'REQ-2060', payee: 'WeWork', type: 'Reimbursement', requestedBy: 'Emily Xin', requestedByIsSelf: true, amount: '$350.00', amountValue: 350, requestDate: 'Jan 4, 2025', requestTime: '4:25pm', dueDate: 'Jan 10, 2025', dueNote: 'Due in 4 days', dueNoteTone: 'muted', statusKey: 'pending', viewerRole: 'requester' }),
  row({ id: 'REQ-2061', payee: 'Brightline Logistics', type: 'Vendor payment', requestedBy: 'Dana Avery', amount: '$2,350.00', amountValue: 2350, requestDate: 'Jan 4, 2025', requestTime: '10:18am', dueDate: 'Jan 7, 2025', dueNote: 'Due tomorrow', dueNoteTone: 'warning', statusKey: 'pending-approval', viewerRole: 'approver' }),
  row({ id: 'REQ-2062', payee: 'Kestrel Cloud Services', type: 'Vendor payment', requestedBy: 'Dana Avery', amount: '$1,920.00', amountValue: 1920, requestDate: 'Jan 3, 2025', requestTime: '3:51pm', dueDate: 'Jan 12, 2025', dueNote: 'Due in 6 days', dueNoteTone: 'muted', statusKey: 'payment-pending', viewerRole: 'approver' }),
]

export const statTiles = [
  { label: 'Pending approvals', value: '4' },
  { label: 'Overdue', value: '2' },
  { label: 'Payment failed', value: '1' },
  { label: 'Needs action', value: '5' },
]

export const emptyStatTiles = [
  { label: 'Pending approvals', value: '0' },
  { label: 'Overdue', value: '0' },
  { label: 'Payment failed', value: '0' },
  { label: 'Needs action', value: '0' },
]

export type ExpenseCategory = {
  label: string
  amount: string
  color: string
  iconKey: 'laptop' | 'travel' | 'meals' | 'services' | 'others'
}

export const expenseCategories: ExpenseCategory[] = [
  { label: 'Software', amount: '$4,580.00', color: '#111927', iconKey: 'laptop' },
  { label: 'Travel', amount: '$3,200.00', color: '#004b87', iconKey: 'travel' },
  { label: 'Meals', amount: '$2,898.00', color: '#3989ad', iconKey: 'meals' },
  { label: 'Professional services', amount: '$4,580.00', color: '#82adc2', iconKey: 'services' },
  { label: 'Others', amount: '$4,580.00', color: '#c1d3de', iconKey: 'others' },
]

export const emptyExpenseCategories: ExpenseCategory[] = expenseCategories.map((category) => ({
  ...category,
  amount: '$0.00',
}))
