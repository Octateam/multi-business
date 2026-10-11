import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import { VendorsPageHeader, VendorsSearchBar, VENDOR_ROWS, matchVendors } from './shared'
import iconEmptySearch from '../../assets/icons/vendors-icon-empty-search.svg'

// Figma node 37670:224052 — "Vendor List — no search results" (searched "Mer")
export default function EmptySearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState(() => (location.state as { query?: string } | null)?.query ?? 'Mer')

  // Editing the search: once it matches vendors again (or is cleared), go back to the populated list.
  const onQueryChange = (q: string) => {
    setQuery(q)
    if (!q.trim()) navigate('/vendors')
    else if (matchVendors(VENDOR_ROWS, q).length > 0) navigate('/vendors', { state: { query: q } })
  }

  return (
    <AppShell>
      <main className="mx-auto flex w-full flex-col gap-8 py-8">
        <VendorsPageHeader
          subtitle="Everyone your business pays, across 60+ countries and currencies."
          onAddVendor={() => navigate('/vendors/add-country-dropdown')}
          onImport={() => navigate('/vendors/import')}
        />

        <VendorsSearchBar autoFocus={!!(location.state as { query?: string } | null)?.query} query={query} onQueryChange={onQueryChange} filteredRows={[]} />

        <div className="flex flex-col items-center gap-6 py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center rounded-pill bg-[#f2f2f2] p-[18px]">
              <img src={iconEmptySearch} alt="" className="size-[30px]" />
            </div>
            <div className="flex w-[440px] flex-col items-center gap-1 text-center">
              <p className="font-heading text-xl font-medium tracking-[-0.2px] text-black">No vendors match your search</p>
              <p className="text-sm text-[#6b7280]">Check the spelling, or try searching by vendor ID or contact email.</p>
            </div>
          </div>
          <HdsButton variant="secondary" size="md" onClick={() => navigate('/vendors')}>
            Clear your search
          </HdsButton>
        </div>
      </main>
    </AppShell>
  )
}
