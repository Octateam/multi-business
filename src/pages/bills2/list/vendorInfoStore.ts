import { useSyncExternalStore } from 'react'

/** Which bill's vendor the "Vendor information" sheet is showing (null = closed). Kept tiny so menu actions can open it. */
let openBillId: string | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const openVendorInfo = (billId: string) => {
  openBillId = billId
  emit()
}
export const closeVendorInfo = () => {
  openBillId = null
  emit()
}
export const useOpenVendorInfo = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => openBillId,
    () => openBillId,
  )
