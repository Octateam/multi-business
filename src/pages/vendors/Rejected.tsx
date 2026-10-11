import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsPageHeader, VendorsDirectory, VendorsToast } from './shared'

// Figma node 45078:153714 — "Vendor List — vendor rejected" (populated table, error toast visible)
export default function Rejected() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(true)

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        {showToast && (
          <VendorsToast
            title="Vendor rejected"
            message="The vendor was not approved and won't be added to your approved vendor list."
            onClose={() => setShowToast(false)}
          />
        )}

        <VendorsPageHeader
          subtitle="Manage the people and businesses you pay, their payout details and spending history."
          onAddVendor={() => navigate('/vendors/add-country-dropdown')}
          onImport={() => navigate('/vendors/import')}
        />

        <VendorsDirectory
          searchDemoTo={(q) => navigate('/vendors/empty-search', { state: { query: q } })}
        />
      </main>
    </AppShell>
  )
}
