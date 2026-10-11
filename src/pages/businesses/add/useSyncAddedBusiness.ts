import { useCallback } from 'react'
import { useBusinessContext } from '../../../context/BusinessContext'
import type { BusinessStatus } from '../../../data/businesses'
import { draftDisplayName, getDraft, initialsOf } from './newBusinessDraft'

/** Pushes the draft's latest name/email/type onto the business entry that InitialInfo added to
 * BusinessContext (so the switcher and Manage businesses show edits), optionally changing its
 * status (e.g. 'verification-pending' once KYB is submitted). No-op on deep links with no entry. */
export function useSyncAddedBusiness() {
  const { addedBusinesses, upsertBusiness } = useBusinessContext()
  return useCallback(
    (status?: BusinessStatus) => {
      const d = getDraft()
      const existing = addedBusinesses.find((b) => b.id === d.businessId)
      if (!existing) return
      const name = draftDisplayName(d)
      upsertBusiness({
        ...existing,
        name,
        initials: initialsOf(name),
        email: d.email.trim() || existing.email,
        type: d.type || existing.type,
        status: status ?? existing.status,
      })
    },
    [addedBusinesses, upsertBusiness],
  )
}
