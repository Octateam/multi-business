import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import { VendorsPageHeader, VendorsDirectory, VendorsToast } from './shared'

// Figma node 46505:351947 — same node as /vendors, but here the "Vendor submission failed" toast is visible on load.
export default function SubmissionFailed() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(true)

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        {showToast && (
          <VendorsToast
            title="Vendor submission failed"
            message="We couldn't submit this vendor for approval. Please try again."
            onClose={() => setShowToast(false)}
            action={
              <HdsButton variant="destructive-link" size="sm" className="!text-sm" onClick={() => navigate('/vendors/add-country-dropdown')}>
                Try again
              </HdsButton>
            }
          />
        )}

        <VendorsPageHeader
          subtitle="Everyone your business pays, across 60+ countries and currencies."
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
