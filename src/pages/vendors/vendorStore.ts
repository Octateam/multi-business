import { useSyncExternalStore } from 'react'
import { VENDOR_ROWS, type VendorRow, type VendorStatus, type VendorType } from './shared'

// Vendor list state shared across route remounts: archive / deactivate / restore / reactivate and newly added
// vendors stay put while the user moves between the list, the vendor page and the add flows.

type Notice = { title: string; body: string }
type State = { rows: VendorRow[]; notice: Notice | null }

// Initialised lazily: shared.tsx imports this module, so VENDOR_ROWS isn't ready at module-evaluation time.
let current: State | null = null
const get = () => (current ??= { rows: VENDOR_ROWS, notice: null })
const listeners = new Set<() => void>()
const emit = (next: State) => {
  current = next
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useVendorStore = () => useSyncExternalStore(subscribe, get, get)

export const setVendorStatus = (id: string, status: VendorStatus) =>
  emit({ ...get(), rows: get().rows.map((r) => (r.id === id ? { ...r, status } : r)) })

const nextCode = () => {
  const max = Math.max(...get().rows.map((r) => Number(r.vendorCode.replace(/\D/g, '')) || 0))
  return `VND-${String(max + 1).padStart(5, '0')}`
}

const now = () => {
  const d = new Date()
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
  return { date, time }
}

export const addVendors = (vendors: { name: string; email: string; category: string; type: VendorType }[]) => {
  const { date, time } = now()
  const added: VendorRow[] = []
  for (const v of vendors) {
    const code = nextCode()
    const row: VendorRow = { id: code, vendorCode: code, name: v.name, email: v.email, category: v.category, type: v.type, payments: 0, dateCreated: date, dateCreatedTime: time, status: 'Pending' }
    current = { ...get(), rows: [row, ...get().rows] }
    added.push(row)
  }
  emit({ ...get() })
  return added
}

export const notifyVendor = (title: string, body: string) => emit({ ...get(), notice: { title, body } })
export const clearVendorNotice = () => emit({ ...get(), notice: null })
