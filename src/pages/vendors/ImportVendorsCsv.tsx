import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsDirectory, VendorsPageHeader } from './shared'
import { AddVendorDrawer } from './AddVendorFlow'
import { ImportVendorsDrawer } from './ImportVendorsFlow'
import { VendorFlowToast } from './vendorFormKit'

// Figma 48069:424941 — Add vendor › Import from CSV, opened over the vendor list. Closing returns to /vendors.
export default function ImportVendorsCsv() {
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState<'add' | 'import' | null>('import')
  const [toast, setToast] = useState<string | null>(null)
  const done = (count: number) => {
    setDrawer(null)
    setToast(`${count} ${count === 1 ? 'vendor has' : 'vendors have'} been sent for review.`)
  }

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader subtitle="Everyone your business pays, across 60+ countries and currencies." onAddVendor={() => (setToast(null), setDrawer('add'))} onImport={() => (setToast(null), setDrawer('import'))} />
        <VendorsDirectory />
      </main>

      {drawer === 'import' && <ImportVendorsDrawer onClose={() => navigate('/vendors')} onBack={() => setDrawer('add')} onDone={done} />}
      {drawer === 'add' && (
        <AddVendorDrawer
          onClose={() => navigate('/vendors')}
          onDone={() => {
            setDrawer(null)
            setToast('The vendor has been sent for review.')
          }}
          onImported={done}
        />
      )}
      {toast && <VendorFlowToast tone="success" title={toast.startsWith('The vendor') ? 'Vendor submitted for approval' : 'Vendors submitted for approval'} body={toast} onClose={() => setToast(null)} />}
    </AppShell>
  )
}
