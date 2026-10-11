import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsDirectory, VendorsPageHeader } from './shared'
import { addVendors } from './vendorStore'
import { AddVendorDrawer } from './AddVendorFlow'
import { ImportVendorsDrawer } from './ImportVendorsFlow'
import { VendorFlowToast } from './vendorFormKit'

type Toast = { tone: 'success' | 'error'; title: string; body: string }

// Figma 48069:424772 — Add vendor (manual entry), opened over the vendor list. Closing returns to /vendors.
export default function AddVendor() {
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState<'add' | 'import' | null>('add')
  const [toast, setToast] = useState<Toast | null>(null)
  const [params] = useSearchParams()
  const [failDemo, setFailDemo] = useState(params.get('fail') === '1')

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader subtitle="Everyone your business pays, across 60+ countries and currencies." onAddVendor={() => (setToast(null), setDrawer('add'))} onImport={() => (setToast(null), setDrawer('import'))} />
        <VendorsDirectory />
        <p className="text-xs text-[#9aa1ac]">
          Simulate an error:{' '}
          <button
            type="button"
            onClick={() => {
              setFailDemo(true)
              setToast(null)
              setDrawer(null)
              setTimeout(() => setDrawer('add'), 0)
            }}
            className="font-semibold text-[#004b87] underline"
          >
            next submission fails
          </button>
        </p>
      </main>

      {drawer === 'add' && (
        <AddVendorDrawer
          failFirstSubmit={failDemo}
          onClose={() => navigate('/vendors')}
          onDone={(v) => {
            addVendors([v])
            setFailDemo(false)
            setDrawer(null)
            setToast({ tone: 'success', title: 'Vendor submitted for approval', body: 'The vendor has been sent for review.' })
          }}
          onImported={(count) => {
            setDrawer(null)
            setToast({ tone: 'success', title: 'Vendors submitted for approval', body: `${count} ${count === 1 ? 'vendor has' : 'vendors have'} been sent for review.` })
          }}
        />
      )}
      {drawer === 'import' && (
        <ImportVendorsDrawer
          onClose={() => setDrawer(null)}
          onDone={(count) => {
            setDrawer(null)
            setToast({ tone: 'success', title: 'Vendors submitted for approval', body: `${count} ${count === 1 ? 'vendor has' : 'vendors have'} been sent for review.` })
          }}
        />
      )}
      {toast && <VendorFlowToast {...toast} onClose={() => setToast(null)} />}
    </AppShell>
  )
}
