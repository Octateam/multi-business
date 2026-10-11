import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { BUSINESSES, type Business } from '../data/businesses'

type BusinessContextValue = {
  /** Canonical business list (src/data/businesses.ts, never mutated) followed by any business the
   * user created in this session through "Add a new business". */
  businesses: Business[]
  /** The business currently "entered" — drives the TopBar pill everywhere in the app. */
  currentBusiness: Business
  currentBusinessId: string
  /** Simulates switching workspace. Prototype-only: doesn't touch any other page's data. */
  setCurrentBusinessId: (id: string) => void
  /** Which business carries the "Default" tag. Only one Active business can hold it at a time. */
  defaultBusinessId: string
  setDefaultBusinessId: (id: string) => void
  /** Businesses added via "Add a new business" this session (also included in `businesses`). */
  addedBusinesses: Business[]
  /** Adds (or updates, matched by id) a business created through the Add-a-business flow. */
  upsertBusiness: (business: Business) => void
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

const INITIAL_DEFAULT = BUSINESSES.find((b) => b.isDefault) ?? BUSINESSES[0]

// Lifted above the router (see App.tsx) so the "current business" and "default business"
// survive route changes — react-router recreates the AppShell/TopBar tree on every
// navigation, so plain useState inside TopBar would silently reset on each click.
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusinessId, setCurrentBusinessId] = useState(INITIAL_DEFAULT.id)
  const [defaultBusinessId, setDefaultBusinessId] = useState(INITIAL_DEFAULT.id)
  const [addedBusinesses, setAddedBusinesses] = useState<Business[]>([])

  const upsertBusiness = useCallback((business: Business) => {
    setAddedBusinesses((prev) => {
      const i = prev.findIndex((b) => b.id === business.id)
      if (i === -1) return [...prev, business]
      const next = prev.slice()
      next[i] = business
      return next
    })
  }, [])

  const businesses = useMemo(() => [...BUSINESSES, ...addedBusinesses], [addedBusinesses])

  const currentBusiness = useMemo(
    () => businesses.find((b) => b.id === currentBusinessId) ?? INITIAL_DEFAULT,
    [businesses, currentBusinessId],
  )

  const value = useMemo<BusinessContextValue>(
    () => ({
      businesses,
      currentBusiness,
      currentBusinessId,
      setCurrentBusinessId,
      defaultBusinessId,
      setDefaultBusinessId,
      addedBusinesses,
      upsertBusiness,
    }),
    [businesses, currentBusiness, currentBusinessId, defaultBusinessId, addedBusinesses, upsertBusiness],
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusinessContext must be used within a BusinessProvider')
  return ctx
}
