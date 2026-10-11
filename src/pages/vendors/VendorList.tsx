import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsPageHeader, VendorsDirectory } from './shared'
import { addVendors } from './vendorStore'
import { AddVendorDrawer } from './AddVendorFlow'
import { VendorFlowToast } from './vendorFormKit'

type Toast = { tone: 'success' | 'error'; title: string; body: string }

// Figma 46505:351947 / 48069:405669 — Vendor list. "Add vendor" opens the chooser (manual entry 48069:424772 or CSV 48069:424941).
export default function VendorList() {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const imported = (count: number) => {
    setAdding(false)
    setToast({ tone: 'success', title: 'Vendors submitted for approval', body: `${count} ${count === 1 ? 'vendor has' : 'vendors have'} been sent for review.` })
  }

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader
          subtitle="Everyone your business pays, across 60+ countries and currencies."
          onAddVendor={() => {
            setToast(null)
            setAdding(true)
          }}
        />

        <VendorsDirectory searchDemoTo={(q) => navigate('/vendors/empty-search', { state: { query: q } })} />

        <p className="text-xs text-[#9aa1ac]">
          Simulate an error:{' '}
          <button type="button" onClick={() => navigate('/vendors/add?fail=1')} className="font-semibold text-[#004b87] underline">
            submission failed
          </button>
          {' · '}
          <button type="button" onClick={() => navigate('/vendors/approval-failed')} className="font-semibold text-[#004b87] underline">
            approval failed
          </button>
          {' · '}
          <button type="button" onClick={() => navigate('/vendors/rejected')} className="font-semibold text-[#004b87] underline">
            rejected
          </button>
        </p>
      </main>

      {adding && (
        <AddVendorDrawer
          onClose={() => setAdding(false)}
          onDone={(v) => {
            addVendors([v])
            setAdding(false)
            setToast({ tone: 'success', title: 'Vendor submitted for approval', body: 'The vendor has been sent for review.' })
          }}
          onImported={imported}
        />
      )}
      {toast && <VendorFlowToast {...toast} onClose={() => setToast(null)} />}
    </AppShell>
  )
}
