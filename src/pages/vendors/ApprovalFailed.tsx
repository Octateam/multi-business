import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsPageHeader, VendorsDirectory, VendorsToast } from './shared'

// Figma node 45078:153145 — "Vendor List — vendor approval failed" (populated table, error toast visible)
export default function ApprovalFailed() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(true)

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        {showToast && (
          <VendorsToast
            title="Vendor approval failed"
            message="We couldn't approve this vendor. Please try again."
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
