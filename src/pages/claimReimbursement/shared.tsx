import type { ReactNode } from 'react'
import { RequestsScreen } from '../dashboard/Dashboard'

// Right-anchored drawer inset 40px from the top, bottom and right viewport edges — every step
// of the manual-entry flow renders its content inside this same shell.
// The flow sits on top of the Requests screen it was started from: the real screen stays behind,
// dimmed by the same dark overlay the Submit-expense drawer uses.
export function ManualEntryShell({ children, width = 513 }: { children: ReactNode; width?: number }) {
  return (
    <div className="relative w-full">
      <div aria-hidden="true" inert className="pointer-events-none select-none">
        <RequestsScreen />
      </div>
      <div className="fixed inset-0 z-30 bg-[#111927]/50" />
      <div
        className="fixed bottom-10 right-10 top-10 z-40 flex max-w-[calc(100vw-80px)] flex-col overflow-y-auto rounded-2xl bg-white px-6 py-8 shadow-2xl"
        style={{ width }}
      >
        {children}
      </div>
    </div>
  )
}

// Hand-off for an account added from the claim form: Add account review returns the user to the very
// form entry they left (history -2, so Back from the form still leads to where the claim started) and
// the form picks the new account up from here.
let pendingNewAccount: string | null = null
export const setPendingNewAccount = (account: string | null) => {
  pendingNewAccount = account
}
export const peekPendingNewAccount = () => pendingNewAccount

export function BackLink({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs font-medium text-[#555354]">
      <svg viewBox="0 0 12 12" fill="none" className="size-3" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 3L4.5 6L7.5 9" stroke="#141B34" strokeWidth="0.77" strokeMiterlimit="16" />
      </svg>
      {label}
    </button>
  )
}
