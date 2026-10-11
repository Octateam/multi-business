import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import QuickActionsHeader from '../../components/home/QuickActionsHeader'
import BalanceChart from '../../components/home/BalanceChart'
import RecentTransactions from '../../components/home/RecentTransactions'
import AccountsPanel from '../../components/home/AccountsPanel'
import flagUsd from '../../assets/icons/home-flag-usd.svg'
import flagEur from '../../assets/icons/home-flag-eur.svg'
import flagGbp from '../../assets/icons/home-flag-gbp.svg'
import infoIcon from '../../assets/icons/toast-info-circle.svg'
import closeIcon from '../../assets/icons/toast-close.svg'

// Home dashboard + "Business access approved" toast — Figma node 46940:431100 (filed under the
// misleading frame name "Approval 01 — Access approved (requester view)"; trust the node id, not
// the name, per the section's known mislabeling). The toast itself is a separate "Outcome notice"
// instance (46940:431506) floating near the top-right of the dashboard content. Dashboard chrome
// below it reuses Home.tsx's own components rather than re-fetching Figma for background context.
export default function AccessApprovedToast() {
  const [showToast, setShowToast] = useState(true)
  // Filled in by Team → Access requests (Approve access / Reject request); the Figma example is the fallback.
  const outcome = { company: 'ABC Ltd', business: 'Acme Trading Co.', role: 'Finance Manager', ...((useLocation().state as Partial<Record<'company' | 'business' | 'role', string>> | null) ?? {}) }

  return (
    <AppShell>
      <div className="relative w-full">
        {showToast && (
          <div className="absolute right-10 top-4 z-10 flex w-[400px] items-start gap-3 rounded-[10px] border-[0.5px] border-[#004b87] bg-[#eaf2f9] py-4 pl-4 pr-3.5 shadow-sm">
            <img src={infoIcon} alt="" className="h-[16.125px] w-[16.125px] shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-sm font-semibold text-[#004b87]">Business access approved</p>
              <p className="text-xs text-[#4b5563]">
                {outcome.company} now has access to {outcome.business} as a {outcome.role}.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowToast(false)}
              className="shrink-0 opacity-65 hover:opacity-100"
            >
              <img src={closeIcon} alt="" className="h-[10.33px] w-[10.33px]" />
            </button>
          </div>
        )}

        <main className="flex w-full flex-col items-start gap-9 pb-10 pt-10">
          <QuickActionsHeader />
          <div className="flex w-full flex-col gap-9">
            <BalanceChart flagIcons={{ usd: flagUsd, eur: flagEur, gbp: flagGbp }} />
            <div className="flex w-full items-stretch gap-6">
              <RecentTransactions />
              <AccountsPanel />
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  )
}
