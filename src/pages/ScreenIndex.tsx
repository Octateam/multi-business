import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../routes'
import { HdsSearch } from '../components/ui/hds'

export function ScreenIndexList({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const routes = q ? ROUTES.filter((r) => `${r.label} ${r.group} ${r.path}`.toLowerCase().includes(q)) : ROUTES
  const groups = Array.from(new Set(routes.map((r) => r.group)))
  return (
    <div className="flex flex-col gap-8">
      <HdsSearch value={query} onChange={setQuery} placeholder="Search screens" />
      {groups.length === 0 && (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-text-primary">No results found</p>
          <p className="text-[11px] text-text-quaternary">Try a different search term</p>
        </div>
      )}
      {groups.map((group) => (
        <div key={group}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-quaternary">{group}</h2>
          <div className="flex flex-col gap-2">
            {routes.filter((r) => r.group === group).map((r) => (
              <Link
                key={r.path}
                to={r.path}
                onClick={onNavigate}
                className="rounded-lg border border-border-disabled bg-white px-4 py-3 text-sm font-medium text-text-primary hover:border-bg-inverted"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ScreenIndex() {
  return (
    <div className="min-h-screen w-full bg-surface-2 px-10 py-10">
      <h1 className="font-heading text-3xl font-medium text-text-primary">Requests — prototype screens</h1>
      <p className="mt-1 text-sm text-text-quaternary">
        {ROUTES.length} screens from the Figma "Requests" section, grouped by flow.
      </p>
      <div className="mt-8">
        <ScreenIndexList />
      </div>
    </div>
  )
}
