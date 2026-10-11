import { useSyncExternalStore } from 'react'
import { requestRows, STATUS_META, type RequestRow, type RequestStatus, type ViewerRole } from './requests'
import { requestDetails, type RequestDetail, type RequestInfoMessage } from './requestDetails'

/**
 * Prototype state for requests: the seed data plus whatever the user has done in this tab
 * (approved, rejected, cancelled, paid, asked for info…). The Requests list and every detail screen
 * read through here, so acting on a request on its detail page changes its row in the list too.
 * Kept in sessionStorage so a refresh keeps the demo state, while a new tab starts fresh.
 */
export type TimelineEvent = { label: string; sublabel?: string; date: string; tone: 'success' | 'error' | 'muted'; document?: string }

export type RequestOverride = {
  status?: RequestStatus
  viewerRole?: ViewerRole
  overdue?: boolean
  billId?: string
  closeReason?: string
  closedOn?: string
  approvedBy?: string
  approvedOn?: string
  paidOn?: string
  paidFrom?: string
  failure?: RequestDetail['failure'] | null
  requestedInfo?: RequestInfoMessage[]
  infoProvided?: RequestDetail['infoProvided'] | null
  edits?: Partial<Pick<RequestDetail, 'payee' | 'amount' | 'tax' | 'category' | 'description' | 'datePaid' | 'dueDate'>>
  events?: TimelineEvent[]
}

const STORAGE_KEY = 'hinstantt-request-state-v1'

function load(): Record<string, RequestOverride> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, RequestOverride>) : {}
  } catch {
    return {}
  }
}

let overrides: Record<string, RequestOverride> = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Storage blocked: the state still lives for this session in memory.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => overrides

export function updateRequest(id: string, patch: RequestOverride) {
  const prev = overrides[id] ?? {}
  overrides = {
    ...overrides,
    [id]: {
      ...prev,
      ...patch,
      edits: patch.edits ? { ...prev.edits, ...patch.edits } : prev.edits,
      events: patch.events ? [...(prev.events ?? []), ...patch.events] : prev.events,
    },
  }
  emit()
}

export function resetRequests() {
  overrides = {}
  emit()
}

export const TODAY = '6 Jan 2026'

function mergeRow(row: RequestRow, o: RequestOverride | undefined): RequestRow {
  if (!o) return row
  const statusKey = o.status ?? row.statusKey
  return {
    ...row,
    payee: o.edits?.payee ?? row.payee,
    amount: o.edits?.amount ?? row.amount,
    statusKey,
    status: STATUS_META[statusKey].label,
    statusToken: STATUS_META[statusKey].token,
    viewerRole: o.viewerRole ?? row.viewerRole,
    overdue: o.overdue ?? row.overdue,
  }
}

export function useRequestRows(): RequestRow[] {
  const state = useSyncExternalStore(subscribe, getSnapshot)
  return requestRows.map((row) => mergeRow(row, state[row.id]))
}

export type ResolvedRequest = { row: RequestRow; detail: RequestDetail; override: RequestOverride }

export function useRequest(id: string | null | undefined): ResolvedRequest | null {
  const state = useSyncExternalStore(subscribe, getSnapshot)
  const baseRow = requestRows.find((r) => r.id === id)
  const baseDetail = id ? requestDetails[id] : undefined
  if (!baseRow || !baseDetail) return null
  const o = state[baseRow.id] ?? {}
  const detail: RequestDetail = {
    ...baseDetail,
    ...o.edits,
    billId: o.billId ?? baseDetail.billId,
    closeReason: o.closeReason ?? baseDetail.closeReason,
    closedOn: o.closedOn ?? baseDetail.closedOn,
    approvedBy: o.approvedBy ?? baseDetail.approvedBy,
    approvedOn: o.approvedOn ?? baseDetail.approvedOn,
    paidOn: o.paidOn ?? baseDetail.paidOn,
    failure: o.failure === null ? undefined : (o.failure ?? baseDetail.failure),
    requestedInfo: o.requestedInfo ?? baseDetail.requestedInfo,
    infoProvided: o.infoProvided === null ? undefined : (o.infoProvided ?? baseDetail.infoProvided),
  }
  return { row: mergeRow(baseRow, o), detail, override: o }
}

/** Detail route for a request — state-specific path (matching the Figma frames) plus its id. */
export function detailPathFor(row: Pick<RequestRow, 'id' | 'statusKey' | 'viewerRole' | 'type'>): string {
  const vendor = row.type === 'Vendor payment'
  const path = (() => {
    switch (row.statusKey) {
      case 'pending-approval':
        if (row.viewerRole === 'requester') return '/request/detail'
        return vendor ? '/request/vendor-payment' : '/request/pending-approval'
      case 'pending':
        return '/request/pending'
      case 'needs-action':
        return row.viewerRole === 'requester' ? '/request/info-needed-requester' : '/request/info-needed-approver'
      case 'payment-pending':
        return vendor ? '/request/vendor-payment-approved-bill' : '/request/payment-pending'
      case 'payment-failed':
        return '/request/payment-failed'
      case 'paid':
        return '/request/paid'
      case 'rejected':
        return '/request/rejected'
      case 'cancelled':
        return '/request/cancelled'
    }
  })()
  return `${path}?id=${row.id}`
}
