import { useSyncExternalStore } from 'react'

/**
 * Who is using the Bills module: the Requester (raises bills, follows them through approval and payment)
 * or the Approver (reviews, approves and pays). Picked with the toggle on the Bills page and remembered
 * per browser, so it survives reloads and route changes.
 */
export type BillRole = 'requester' | 'approver'

const KEY = 'hinstantt-bill-role'
const read = (): BillRole => {
  try {
    return localStorage.getItem(KEY) === 'approver' ? 'approver' : 'requester'
  } catch {
    return 'requester'
  }
}

let role: BillRole = read()
const listeners = new Set<() => void>()

export const getBillRole = () => role
export function setBillRole(next: BillRole) {
  role = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* storage unavailable — keep it for this session */
  }
  listeners.forEach((l) => l())
}

export const useBillRole = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    getBillRole,
    getBillRole,
  )
