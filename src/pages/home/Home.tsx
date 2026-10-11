import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import QuickActionsHeader from '../../components/home/QuickActionsHeader'
import BalanceChart from '../../components/home/BalanceChart'
import RecentTransactions from '../../components/home/RecentTransactions'
import AccountsPanel from '../../components/home/AccountsPanel'
import BusinessNotActiveModal, { needsKyb } from '../../components/business/BusinessNotActiveModal'
import { useBusinessContext } from '../../context/BusinessContext'
import flagUsd from '../../assets/icons/home-flag-usd.svg'
import flagEur from '../../assets/icons/home-flag-eur.svg'
import flagGbp from '../../assets/icons/home-flag-gbp.svg'

export default function Home() {
  const { currentBusiness } = useBusinessContext()
  // A business that still needs KYB (48029:228418): zero balances, empty panels, and every action
  // asks the user to complete KYB first (48029:228653).
  const inactive = needsKyb(currentBusiness.status)
  const [kybPrompt, setKybPrompt] = useState(false)
  const promptKyb = () => setKybPrompt(true)

  return (
    <AppShell>
      <main className="flex w-full flex-col items-start gap-9 pb-10 pt-10">
        <QuickActionsHeader onAction={inactive ? promptKyb : undefined} />
        <div className="flex w-full flex-col gap-9">
          <BalanceChart flagIcons={{ usd: flagUsd, eur: flagEur, gbp: flagGbp }} empty={inactive} />
          <div className="flex w-full items-stretch gap-6">
            <RecentTransactions empty={inactive} />
            <AccountsPanel empty={inactive} onSetupProfile={promptKyb} />
          </div>
        </div>
      </main>
      {kybPrompt && <BusinessNotActiveModal businessName={currentBusiness.name} onClose={() => setKybPrompt(false)} />}
    </AppShell>
  )
}
