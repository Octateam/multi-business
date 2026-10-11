import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { VendorsPageHeader, VendorsDirectory, ArchiveConfirmModal } from './shared'

// Figma node 45681:264246 — "Vendor List — Archive vendor confirmation" (modal over populated table)
export default function ArchiveConfirm() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader
          subtitle="Manage the people and businesses you pay, their payout details and spending history."
          onAddVendor={() => navigate('/vendors/add-country-dropdown')}
          onImport={() => navigate('/vendors/import')}
        />

        <VendorsDirectory searchDemoTo={(q) => navigate('/vendors/empty-search', { state: { query: q } })} />

        <ArchiveConfirmModal onCancel={() => navigate('/vendors')} onArchive={() => navigate('/vendors')} />
      </main>
    </AppShell>
  )
}
